from fastapi import FastAPI, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import models, schemas, auth
import os
import shutil
import uuid
from database import engine, get_db
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime, timezone

# Crear tablas en la base de datos (En producción usaríamos Alembic)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Card Club Backend API",
    description="Backend para el ecosistema digital Card Club",
    version="1.0.0"
)

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

# Servir archivos estáticos
os.makedirs("static/uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "ok", "message": "Card Club API is running"}

# --- UPLOADS ---
@app.post("/api/upload", tags=["Uploads"])
async def upload_image(file: UploadFile = File(...), current_admin: models.User = Depends(auth.get_current_admin_user)):
    file_extension = os.path.splitext(file.filename)[1]
    file_name = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join("static", "uploads", file_name)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    return {"image_url": f"http://127.0.0.1:8000/static/uploads/{file_name}"}

# --- AUTHENTICATION ---
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

# --- AUCTIONS ---
@app.get("/api/auctions", response_model=List[schemas.Auction], tags=["Auctions"])
def read_all_auctions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Este endpoint retorna el modelo Auction con su ID y todo lo básico, ideal para el admin
    auctions = db.query(models.Auction).offset(skip).limit(limit).all()
    return auctions

@app.get("/api/auctions/active", tags=["Auctions"])
def get_active_auctions(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc).replace(tzinfo=None)
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
    now = datetime.now(timezone.utc).replace(tzinfo=None)
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
            payload = json.loads(data)
            new_amount = float(payload.get("amount", 0))
            user_id = int(payload.get("user_id", 0))
            
            # Buscar la subasta
            auction = db.query(models.Auction).filter(models.Auction.id == auction_id).first()
            
            if auction and auction.is_active and new_amount > auction.current_price:
                # Actualizar precio
                auction.current_price = new_amount
                
                # Crear el Bid
                new_bid = models.Bid(auction_id=auction_id, user_id=user_id, amount=new_amount)
                db.add(new_bid)
                db.commit()
                
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
