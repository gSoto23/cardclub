from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import models, schemas, auth
import os
import email_sender
import asyncio
import shutil
import uuid
from database import engine, get_db, SessionLocal
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime, timezone

CR_TZ = timezone(timedelta(hours=-6))

# Crear tablas en la base de datos (En producción usaríamos Alembic)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Card Club Backend API",
    description="Backend para el ecosistema digital Card Club",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(check_finished_auctions_loop())

async def check_finished_auctions_loop():
    while True:
        try:
            db = SessionLocal()
            now = datetime.now(CR_TZ).replace(tzinfo=None)
            closed_auctions = db.query(models.Auction).filter(
                models.Auction.end_time <= now,
                models.Auction.winner_notified == False
            ).all()
            for auction in closed_auctions:
                if auction.bids:
                    highest_bid = max(auction.bids, key=lambda b: b.amount)
                    winner = highest_bid.user
                    if winner:
                        await email_sender.send_auction_won_email(
                            to_email=winner.email,
                            user_name=winner.nickname or winner.full_name or "Ganador",
                            product_name=auction.product.name,
                            winning_price=highest_bid.amount
                        )
                auction.winner_notified = True
                db.commit()
            db.close()
        except Exception as e:
            print("Error in background auction checker:", e)
        finally:
            await asyncio.sleep(60)

# Configuración de CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    # Agregar dominios de producción aquí después
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directorios absolutos para archivos estáticos
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, "static")
UPLOADS_DIR = os.path.join(STATIC_DIR, "uploads")

# Servir archivos estáticos
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "ok", "message": "Card Club API is running"}

# --- UPLOADS ---
@app.post("/api/upload", tags=["Uploads"])
async def upload_image(file: UploadFile = File(...), current_user: models.User = Depends(auth.get_current_user)):
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOADS_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    base_url = os.getenv("API_BASE_URL", "")
    image_url = f"{base_url.rstrip('/')}/static/uploads/{file_name}" if base_url else f"/static/uploads/{file_name}"
    return {"image_url": image_url}

# --- AUTHENTICATION & USERS ---
@app.post("/api/register", response_model=schemas.User, tags=["Auth"])
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Verificar si el correo existe
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        nickname=user.nickname,
        whatsapp=user.whatsapp,
        avatar_url=user.avatar_url,
        role="player"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/login", response_model=schemas.Token, tags=["Auth"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/users/me", response_model=schemas.User, tags=["Users"])
def get_current_user_profile(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@app.put("/api/users/me", response_model=schemas.User, tags=["Users"])
def update_user_profile(user_update: schemas.UserUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.nickname is not None:
        current_user.nickname = user_update.nickname
    if user_update.whatsapp is not None:
        current_user.whatsapp = user_update.whatsapp
    if user_update.avatar_url is not None:
        current_user.avatar_url = user_update.avatar_url
        
    db.commit()
    db.refresh(current_user)
    return current_user

# --- CATEGORIES ---
@app.get("/api/categories", response_model=List[schemas.Category], tags=["Categories"])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories

@app.post("/api/categories", response_model=schemas.Category, tags=["Categories"])
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    db_category = models.Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# --- PRODUCTS ---
@app.get("/api/products", response_model=List[schemas.Product], tags=["Products"])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(models.Product).offset(skip).limit(limit).all()
    return products

@app.post("/api/products", response_model=schemas.Product, tags=["Products"])
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

@app.put("/api/products/{product_id}", response_model=schemas.Product, tags=["Products"])
def update_product(product_id: int, product_update: schemas.ProductUpdate, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    update_data = product_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/api/products/{product_id}", tags=["Products"])
def delete_product(product_id: int, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    db_product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
        
    try:
        db.delete(db_product)
        db.commit()
        return {"status": "ok", "message": "Producto eliminado"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="No se puede eliminar este producto porque tiene historial (Ventas/Subastas). Coloca el stock en 0 para ocultarlo.")

# --- AUCTIONS ---
@app.get("/api/auctions", response_model=List[schemas.Auction], tags=["Auctions"])
def read_all_auctions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Este endpoint retorna el modelo Auction con su ID y todo lo básico, ideal para el admin
    auctions = db.query(models.Auction).offset(skip).limit(limit).all()
    return auctions

@app.get("/api/auctions/active", tags=["Auctions"])
def get_active_auctions(db: Session = Depends(get_db)):
    now = datetime.now(CR_TZ).replace(tzinfo=None)
    # Obtenemos las subastas activas que ya iniciaron y no han cerrado
    auctions = db.query(models.Auction).filter(
        models.Auction.is_active == True,
        models.Auction.start_time <= now,
        models.Auction.end_time > now
    ).all()
    result = []
    for auction in auctions:
        result.append({
            "id": auction.id,
            "product_id": auction.product_id,
            "product_name": auction.product.name,
            "image_url": auction.product.image_url,
            "condition": auction.product.condition,
            "is_foil": auction.product.is_foil,
            "category_name": auction.product.category.name if auction.product.category else None,
            "start_price": auction.start_price,
            "current_price": auction.current_price,
            "end_time": auction.end_time,
        })
    return result

@app.get("/api/auctions/finished", tags=["Auctions"])
def get_finished_auctions(db: Session = Depends(get_db)):
    now = datetime.now(CR_TZ).replace(tzinfo=None)
    # Subastas que ya pasaron su fecha de cierre
    auctions = db.query(models.Auction).filter(models.Auction.end_time <= now).all()
    result = []
    for auction in auctions:
        winner = None
        if auction.bids:
            # Obtener la puja más alta
            highest_bid = max(auction.bids, key=lambda b: b.amount)
            winner = highest_bid.user.email if highest_bid.user else "Usuario Desconocido"
            
        result.append({
            "id": auction.id,
            "product_name": auction.product.name,
            "image_url": auction.product.image_url,
            "condition": auction.product.condition,
            "is_foil": auction.product.is_foil,
            "category_name": auction.product.category.name if auction.product.category else None,
            "final_price": auction.current_price,
            "end_time": auction.end_time,
            "winner": winner
        })
    return result

@app.post("/api/auctions/request", tags=["Auctions"])
def request_auction(
    req: schemas.AuctionRequestCreate,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(auth.get_current_user)
):
    background_tasks.add_task(
        email_sender.send_auction_request_email,
        user_email=current_user.email,
        user_name=current_user.full_name or current_user.nickname or "Usuario",
        whatsapp=current_user.whatsapp or "No registrado",
        card_name=req.card_name,
        expansion=req.expansion,
        condition=req.condition,
        expected_price=req.expected_price
    )
    return {"status": "ok", "message": "Solicitud enviada exitosamente"}

@app.post("/api/auctions", response_model=schemas.Auction, tags=["Auctions"])
def create_auction(auction: schemas.AuctionCreate, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    db_auction = models.Auction(
        product_id=auction.product_id,
        start_price=auction.start_price,
        start_time=auction.start_time,
        current_price=auction.start_price, # El precio actual inicial es el precio de salida
        end_time=auction.end_time,
        is_active=True
    )
    db.add(db_auction)
    db.commit()
    db.refresh(db_auction)
    return db_auction

@app.put("/api/auctions/{auction_id}", response_model=schemas.Auction, tags=["Auctions"])
def update_auction(auction_id: int, auction_update: schemas.AuctionUpdate, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    db_auction = db.query(models.Auction).filter(models.Auction.id == auction_id).first()
    if not db_auction:
        raise HTTPException(status_code=404, detail="Subasta no encontrada")
    
    update_data = auction_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_auction, key, value)
        
    db.commit()
    db.refresh(db_auction)
    return db_auction

@app.delete("/api/auctions/{auction_id}", tags=["Auctions"])
def delete_auction(auction_id: int, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    db_auction = db.query(models.Auction).filter(models.Auction.id == auction_id).first()
    if not db_auction:
        raise HTTPException(status_code=404, detail="Subasta no encontrada")
        
    try:
        # First delete associated bids manually to avoid foreign key issues since we don't have cascade setup
        db.query(models.Bid).filter(models.Bid.auction_id == auction_id).delete()
        db.delete(db_auction)
        db.commit()
        return {"status": "ok", "message": "Subasta eliminada"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error eliminando subasta")

# --- CHAMPIONSHIPS ---
@app.get("/api/championships", response_model=List[schemas.Championship], tags=["Championships"])
def get_championships(db: Session = Depends(get_db)):
    return db.query(models.Championship).all()

@app.post("/api/championships", response_model=schemas.Championship, tags=["Championships"])
def create_championship(championship: schemas.ChampionshipCreate, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    db_championship = models.Championship(**championship.dict())
    db.add(db_championship)
    db.commit()
    db.refresh(db_championship)
    return db_championship

@app.put("/api/championships/{championship_id}", response_model=schemas.Championship, tags=["Championships"])
def update_championship(championship_id: int, championship_update: schemas.ChampionshipUpdate, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    db_championship = db.query(models.Championship).filter(models.Championship.id == championship_id).first()
    if not db_championship:
        raise HTTPException(status_code=404, detail="Campeonato no encontrado")
    
    update_data = championship_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_championship, key, value)
        
    db.commit()
    db.refresh(db_championship)
    return db_championship

# --- TOURNAMENTS ---
@app.get("/api/tournaments", response_model=List[schemas.Tournament], tags=["Tournaments"])
def get_tournaments(db: Session = Depends(get_db)):
    return db.query(models.Tournament).filter(models.Tournament.is_active == True).all()

@app.post("/api/tournaments", response_model=schemas.Tournament, tags=["Tournaments"])
def create_tournament(tournament: schemas.TournamentCreate, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    db_tournament = models.Tournament(**tournament.dict())
    db.add(db_tournament)
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

@app.put("/api/tournaments/{tournament_id}", response_model=schemas.Tournament, tags=["Tournaments"])
def update_tournament(tournament_id: int, tournament_update: schemas.TournamentUpdate, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    db_tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    
    update_data = tournament_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tournament, key, value)
        
    db.commit()
    db.refresh(db_tournament)
    return db_tournament

@app.delete("/api/tournaments/{tournament_id}", tags=["Tournaments"])
def delete_tournament(tournament_id: int, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    db_tournament = db.query(models.Tournament).filter(models.Tournament.id == tournament_id).first()
    if not db_tournament:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
        
    try:
        # Delete registrations first
        db.query(models.TournamentRegistration).filter(models.TournamentRegistration.tournament_id == tournament_id).delete()
        db.delete(db_tournament)
        db.commit()
        return {"status": "ok", "message": "Torneo eliminado"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="No se pudo eliminar el torneo")

@app.post("/api/tournaments/{tournament_id}/register", response_model=schemas.TournamentRegistration, tags=["Tournaments"])
def register_for_tournament(tournament_id: int, payload: schemas.TournamentRegistrationCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Check if already registered
    existing = db.query(models.TournamentRegistration).filter(
        models.TournamentRegistration.tournament_id == tournament_id,
        models.TournamentRegistration.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Ya estás inscrito en este torneo")

    db_registration = models.TournamentRegistration(
        tournament_id=tournament_id,
        user_id=current_user.id,
        payment_method=payload.payment_method,
        status="Pendiente"
    )
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    
    background_tasks.add_task(
        email_sender.send_tournament_email,
        to_email=current_user.email,
        user_name=current_user.nickname or current_user.full_name or "Participante",
        tournament_name=db_registration.tournament.name,
        date_str=db_registration.tournament.date.strftime("%Y-%m-%d %H:%M"),
        entry_fee=db_registration.tournament.entry_fee
    )
    return db_registration

@app.get("/api/users/me/tournaments", tags=["Users"])
def get_my_tournaments(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    registrations = db.query(models.TournamentRegistration).filter(models.TournamentRegistration.user_id == current_user.id).all()
    result = []
    for reg in registrations:
        result.append({
            "id": reg.id,
            "tournament_name": reg.tournament.name,
            "date": reg.tournament.date,
            "format": reg.tournament.format,
            "entry_fee": reg.tournament.entry_fee,
            "payment_method": reg.payment_method,
            "status": reg.status,
            "registered_at": reg.timestamp
        })
    return result

@app.get("/api/users/me/bids/active", tags=["Users"])
def get_my_active_bids(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    now = datetime.now(CR_TZ).replace(tzinfo=None)
    # Buscar todas las pujas del usuario en subastas activas
    my_bids = db.query(models.Bid).join(models.Auction).filter(
        models.Bid.user_id == current_user.id,
        models.Auction.is_active == True,
        models.Auction.end_time > now
    ).all()
    
    # Agrupar por auction para evitar duplicados si pujó varias veces en la misma
    auction_dict = {}
    for bid in my_bids:
        auction = bid.auction
        if auction.id not in auction_dict:
            # Check highest bid
            highest_bid = max(auction.bids, key=lambda b: b.amount)
            is_winning = highest_bid.user_id == current_user.id
            
            auction_dict[auction.id] = {
                "auction_id": auction.id,
                "product_name": auction.product.name,
                "image_url": auction.product.image_url,
                "current_price": auction.current_price,
                "end_time": auction.end_time,
                "is_winning": is_winning
            }
            
    return list(auction_dict.values())

@app.get("/api/users/me/auctions/won", tags=["Users"])
def get_my_won_auctions(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    now = datetime.now(CR_TZ).replace(tzinfo=None)
    # Buscar todas las subastas finalizadas en las que el usuario haya participado
    my_bids = db.query(models.Bid).join(models.Auction).filter(
        models.Bid.user_id == current_user.id,
        models.Auction.end_time <= now
    ).all()
    
    won_auctions = {}
    for bid in my_bids:
        auction = bid.auction
        if auction.id not in won_auctions:
            highest_bid = max(auction.bids, key=lambda b: b.amount)
            # Solo la agregamos si la ganamos
            if highest_bid.user_id == current_user.id:
                won_auctions[auction.id] = {
                    "auction_id": auction.id,
                    "product_name": auction.product.name,
                    "image_url": auction.product.image_url,
                    "final_price": auction.current_price,
                    "end_time": auction.end_time
                }
                
    return list(won_auctions.values())

@app.get("/api/tournaments/{tournament_id}/registrations", tags=["Tournaments"])
def get_tournament_registrations(tournament_id: int, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    registrations = db.query(models.TournamentRegistration).filter(models.TournamentRegistration.tournament_id == tournament_id).all()
    result = []
    for reg in registrations:
        result.append({
            "id": reg.id,
            "user_id": reg.user.id,
            "user_email": reg.user.email,
            "user_whatsapp": reg.user.whatsapp,
            "payment_method": reg.payment_method,
            "status": reg.status,
            "registered_at": reg.timestamp
        })
    return result

@app.patch("/api/tournaments/registrations/{registration_id}/confirm", tags=["Tournaments"])
def confirm_registration(registration_id: int, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    reg = db.query(models.TournamentRegistration).filter(models.TournamentRegistration.id == registration_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Inscripción no encontrada")
    
    if reg.status == "Confirmado":
        return {"status": "ok", "message": "La inscripción ya estaba confirmada"}
        
    reg.status = "Confirmado"
    
    # --- AUTO-GENERAR VENTA ---
    db_sale = models.Sale(
        user_id=reg.user_id,
        total_amount=reg.tournament.entry_fee,
        payment_method=reg.payment_method,
        sale_type="Torneo",
        status="Completado"
    )
    db.add(db_sale)
    db.flush() # Para obtener db_sale.id
    
    db_item = models.SaleItem(
        sale_id=db_sale.id,
        description=f"Inscripción: {reg.tournament.name}",
        price=reg.tournament.entry_fee,
        quantity=1,
        reference_type="Torneo",
        reference_id=reg.tournament.id
    )
    db.add(db_item)
    
    db.commit()
    db.refresh(reg)
    return {"status": "ok", "message": "Inscripción confirmada y venta registrada"}

# --- SALES & POS ---
from sqlalchemy import desc, asc, func
from typing import Optional

# --- RESULTS & RANKING ---
@app.get("/api/tournaments/{tournament_id}/results", tags=["Tournaments", "Ranking"])
def get_tournament_results(tournament_id: int, db: Session = Depends(get_db)):
    results = db.query(models.TournamentResult).filter(models.TournamentResult.tournament_id == tournament_id).all()
    return results

@app.post("/api/tournaments/{tournament_id}/results", tags=["Tournaments", "Ranking"])
def save_tournament_results(tournament_id: int, results: List[schemas.TournamentResultBase], db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    db.query(models.TournamentResult).filter(models.TournamentResult.tournament_id == tournament_id).delete()
    for res in results:
        db_res = models.TournamentResult(
            tournament_id=tournament_id,
            user_id=res.user_id,
            points=res.points,
            position=res.position
        )
        db.add(db_res)
    db.commit()
    return {"status": "ok", "message": "Resultados guardados"}

@app.get("/api/ranking", response_model=List[schemas.RankingUserResponse], tags=["Ranking"])
def get_global_ranking(championship_id: Optional[int] = None, db: Session = Depends(get_db)):
    if not championship_id:
        active_champ = db.query(models.Championship).filter(models.Championship.is_active == True).first()
        if active_champ:
            championship_id = active_champ.id

    query = db.query(
        models.TournamentResult.user_id,
        func.sum(models.TournamentResult.points).label('total_points')
    ).join(models.Tournament, models.Tournament.id == models.TournamentResult.tournament_id)
    
    if championship_id:
        query = query.filter(models.Tournament.championship_id == championship_id)

    ranking_data = query.group_by(models.TournamentResult.user_id).order_by(desc('total_points')).all()
    
    response = []
    for r in ranking_data:
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        if user:
            response.append({
                "user_id": user.id,
                "email": user.email,
                "nickname": user.nickname,
                "avatar_url": user.avatar_url,
                "total_points": r.total_points
            })
    return response

@app.post("/api/sales", response_model=schemas.Sale, tags=["Sales"])
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    db_sale = models.Sale(
        user_id=sale.user_id,
        total_amount=sale.total_amount,
        payment_method=sale.payment_method,
        sale_type=sale.sale_type,
        status="Completado"
    )
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)

    for item in sale.items:
        db_item = models.SaleItem(
            sale_id=db_sale.id,
            description=item.description,
            price=item.price,
            quantity=item.quantity,
            reference_type=item.reference_type,
            reference_id=item.reference_id
        )
        db.add(db_item)
        
        # Si es un Producto (POS), descontar el stock
        if item.reference_type == "Producto" and item.reference_id:
            product = db.query(models.Product).filter(models.Product.id == item.reference_id).first()
            if product:
                product.stock = max(0, product.stock - item.quantity)
    
    db.commit()
    db.refresh(db_sale)

    background_tasks.add_task(
        email_sender.send_purchase_email,
        to_email=current_user.email,
        user_name=current_user.nickname or current_user.full_name or "Coleccionista",
        total=calculated_total,
        items_count=len(sale.items),
        payment_method=sale.payment_method
    )

    return db_sale

@app.get("/api/approvals/pending", tags=["Sales", "Tournaments"])
def get_pending_approvals(search_id: Optional[int] = None, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    sales_query = db.query(models.Sale).filter(
        models.Sale.status == "Pendiente",
        models.Sale.payment_method.in_(["SINPE", "Efectivo"])
    )
    if search_id:
        sales_query = sales_query.filter(models.Sale.id == search_id)
    pending_sales = sales_query.all()
    
    regs_query = db.query(models.TournamentRegistration).filter(
        models.TournamentRegistration.status == "Pendiente",
        models.TournamentRegistration.payment_method.in_(["SINPE", "Efectivo"])
    )
    if search_id:
        regs_query = regs_query.filter(models.TournamentRegistration.id == search_id)
    pending_regs = regs_query.all()

    sales_result = []
    for sale in pending_sales:
        user = db.query(models.User).filter(models.User.id == sale.user_id).first()
        sales_result.append({
            "id": sale.id,
            "type": "Pedido Online",
            "user_email": user.email if user else "Desconocido",
            "user_whatsapp": user.whatsapp if user else None,
            "payment_method": sale.payment_method,
            "total_amount": sale.total_amount,
            "date": sale.sale_date
        })

    regs_result = []
    for reg in pending_regs:
        regs_result.append({
            "id": reg.id,
            "type": f"Torneo: {reg.tournament.name}",
            "user_email": reg.user.email,
            "user_whatsapp": reg.user.whatsapp,
            "payment_method": reg.payment_method,
            "total_amount": reg.tournament.entry_fee,
            "date": reg.timestamp
        })

    return {
        "sales": sales_result,
        "registrations": regs_result
    }

@app.patch("/api/sales/{sale_id}/confirm", tags=["Sales"])
def confirm_sale(sale_id: int, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    sale = db.query(models.Sale).filter(models.Sale.id == sale_id).first()
    if not sale:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    
    if sale.status == "Completado":
        return {"status": "ok", "message": "La venta ya estaba completada"}
        
    sale.status = "Completado"
    db.commit()
    return {"status": "ok", "message": "Venta confirmada"}

@app.get("/api/sales", response_model=List[schemas.Sale], tags=["Sales"])
def get_sales(
    skip: int = 0, 
    limit: int = 50, 
    start_date: Optional[str] = None, 
    end_date: Optional[str] = None, 
    sort_by: str = "sale_date", 
    order: str = "desc", 
    search_id: Optional[int] = None,
    db: Session = Depends(get_db), 
    current_admin: models.User = Depends(auth.get_current_admin_user)
):
    query = db.query(models.Sale)

    if search_id:
        query = query.filter(models.Sale.id == search_id)
    if start_date:
        query = query.filter(models.Sale.sale_date >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(models.Sale.sale_date <= datetime.fromisoformat(end_date))
        
    if order == "desc":
        query = query.order_by(desc(getattr(models.Sale, sort_by)))
    else:
        query = query.order_by(asc(getattr(models.Sale, sort_by)))
        
    return query.offset(skip).limit(limit).all()

@app.post("/api/checkout", response_model=schemas.Sale, tags=["Sales"])
def process_checkout(sale: schemas.SaleCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    # Calculate real total amount and verify stock
    calculated_total = 0.0
    for item in sale.items:
        if item.reference_type == "Producto" and item.reference_id:
            product = db.query(models.Product).filter(models.Product.id == item.reference_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Producto {item.reference_id} no encontrado")
            if product.stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Stock insuficiente para {product.name}")
            # Use actual database price for security
            calculated_total += product.price * item.quantity

    db_sale = models.Sale(
        user_id=current_user.id,
        total_amount=calculated_total,
        payment_method=sale.payment_method,
        sale_type="Online",
        status="Pendiente"
    )
    db.add(db_sale)
    db.commit()
    db.refresh(db_sale)

    for item in sale.items:
        # Fetch product again to subtract stock
        product = db.query(models.Product).filter(models.Product.id == item.reference_id).first()
        db_item = models.SaleItem(
            sale_id=db_sale.id,
            description=product.name,
            price=product.price,
            quantity=item.quantity,
            reference_type="Producto",
            reference_id=product.id
        )
        db.add(db_item)
        product.stock -= item.quantity
    
    db.commit()
    db.refresh(db_sale)

    background_tasks.add_task(
        email_sender.send_purchase_email,
        to_email=current_user.email,
        user_name=current_user.nickname or current_user.full_name or "Coleccionista",
        total=calculated_total,
        items_count=len(sale.items),
        payment_method=sale.payment_method
    )

    return db_sale

# --- WEBSOCKETS PARA SUBASTAS ---
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        # Mapea auction_id a una lista de WebSockets activos
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, auction_id: int):
        await websocket.accept()
        if auction_id not in self.active_connections:
            self.active_connections[auction_id] = []
        self.active_connections[auction_id].append(websocket)

    def disconnect(self, websocket: WebSocket, auction_id: int):
        if auction_id in self.active_connections:
            self.active_connections[auction_id].remove(websocket)

    async def broadcast(self, message: str, auction_id: int):
        if auction_id in self.active_connections:
            for connection in self.active_connections[auction_id]:
                await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/api/ws/auctions/{auction_id}")
async def auction_endpoint(websocket: WebSocket, auction_id: int, db: Session = Depends(get_db)):
    await manager.connect(websocket, auction_id)
    try:
        while True:
            # Esperamos que el cliente envíe una puja en formato JSON: {"user_id": 1, "amount": 150.0}
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                new_amount = float(payload.get("amount", 0))
                user_id = int(payload.get("user_id", 0))
            except (ValueError, TypeError, json.JSONDecodeError):
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Formato de puja inválido."
                }))
                continue
            
            # Buscar la subasta con bloqueo de fila para evitar race conditions
            auction = db.query(models.Auction).filter(models.Auction.id == auction_id).with_for_update().first()
            
            if auction and auction.is_active and new_amount > auction.current_price:
                previous_bidder_id = None
                if auction.bids:
                    highest_bid = max(auction.bids, key=lambda b: b.amount)
                    previous_bidder_id = highest_bid.user_id
                # Actualizar precio
                auction.current_price = new_amount
                
                # Crear el Bid
                new_bid = models.Bid(auction_id=auction_id, user_id=user_id, amount=new_amount)
                db.add(new_bid)
                db.commit()
                
                if previous_bidder_id and previous_bidder_id != user_id:
                    previous_user = db.query(models.User).filter(models.User.id == previous_bidder_id).first()
                    if previous_user:
                        asyncio.create_task(email_sender.send_outbid_email(
                            to_email=previous_user.email,
                            user_name=previous_user.nickname or previous_user.full_name or "Coleccionista",
                            product_name=auction.product.name,
                            new_price=new_amount,
                            auction_id=auction_id
                        ))
                
                # Broadcast a todos los conectados
                await manager.broadcast(json.dumps({
                    "type": "new_bid",
                    "auction_id": auction_id,
                    "new_price": new_amount,
                    "user_id": user_id,
                    "message": f"¡Nueva puja de ${new_amount}!"
                }), auction_id)
            else:
                # Notificar error solo al emisor
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Puja inválida o subasta inactiva."
                }))
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, auction_id)

# --- CONFIG ---
@app.get("/api/config", response_model=List[schemas.SiteConfig], tags=["Config"])
def get_site_config(db: Session = Depends(get_db)):
    return db.query(models.SiteConfig).all()

@app.post("/api/config", tags=["Config"])
def update_site_config(payload: schemas.SiteConfigUpdateList, db: Session = Depends(get_db), current_admin: models.User = Depends(auth.get_current_admin_user)):
    for config_item in payload.configs:
        existing = db.query(models.SiteConfig).filter(models.SiteConfig.key == config_item.key).first()
        if existing:
            existing.value = config_item.value
            if config_item.description is not None:
                existing.description = config_item.description
        else:
            new_conf = models.SiteConfig(**config_item.dict())
            db.add(new_conf)
    db.commit()
    return {"status": "ok", "message": "Configuración actualizada"}
