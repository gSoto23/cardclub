from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import models, schemas
from database import engine, get_db
from sqlalchemy.orm import Session
from typing import List

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
    # Agregar dominios de producción aquí después
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "ok", "message": "Card Club API is running"}

# --- CATEGORIES ---
@app.get("/api/categories", response_model=List[schemas.Category], tags=["Categories"])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    categories = db.query(models.Category).offset(skip).limit(limit).all()
    return categories

@app.post("/api/categories", response_model=schemas.Category, tags=["Categories"])
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
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
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(**product.dict())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

# --- AUCTIONS ---
@app.get("/api/auctions/active", tags=["Auctions"])
def get_active_auctions(db: Session = Depends(get_db)):
    # Obtenemos las subastas activas con la info del producto
    auctions = db.query(models.Auction).filter(models.Auction.is_active == True).all()
    result = []
    for auction in auctions:
        result.append({
            "id": auction.id,
            "product_id": auction.product_id,
            "product_name": auction.product.name,
            "image_url": auction.product.image_url,
            "start_price": auction.start_price,
            "current_price": auction.current_price,
            "end_time": auction.end_time,
        })
    return result

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
