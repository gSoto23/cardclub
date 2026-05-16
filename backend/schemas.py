from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- AUTHENTICATION ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- CATEGORY ---
class CategoryBase(BaseModel):
    name: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    class Config:
        orm_mode = True

# --- PRODUCT ---
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    purchase_price: float = 0.0
    stock: int = 0
    game: str
    expansion_set: str
    condition: str
    language: str = "EN"
    is_foil: bool = False
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    category_id: int

class Product(ProductBase):
    id: int
    category_id: int
    category: Optional[Category] = None

    class Config:
        orm_mode = True

# --- AUCTION ---
class AuctionBase(BaseModel):
    product_id: int
    start_price: float
    start_time: datetime
    end_time: datetime

class AuctionCreate(AuctionBase):
    pass

class Auction(AuctionBase):
    id: int
    current_price: float
    is_active: bool

    class Config:
        orm_mode = True

# --- BID ---
class Bid(BaseModel):
    id: int
    auction_id: int
    user_id: int
    amount: float
    timestamp: datetime

    class Config:
        orm_mode = True

# --- TOURNAMENTS ---
class TournamentBase(BaseModel):
    name: str
    date: datetime
    format: str
    entry_fee: float
    max_players: int

class TournamentCreate(TournamentBase):
    pass

class Tournament(TournamentBase):
    id: int
    is_active: bool

    class Config:
        orm_mode = True

class TournamentRegistrationBase(BaseModel):
    tournament_id: int
    payment_method: str

class TournamentRegistrationCreate(TournamentRegistrationBase):
    pass

class TournamentRegistration(TournamentRegistrationBase):
    id: int
    user_id: int
    status: str
    timestamp: datetime
    
    # Podríamos incluir detalles anidados para facilitar el frontend
    tournament: Optional[Tournament] = None

    class Config:
        orm_mode = True

# --- SALES & POS ---
class SaleItemBase(BaseModel):
    description: str
    price: float
    quantity: int = 1
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None

class SaleItemCreate(SaleItemBase):
    pass

class SaleItem(SaleItemBase):
    id: int
    sale_id: int

    class Config:
        orm_mode = True

class SaleBase(BaseModel):
    total_amount: float
    payment_method: str
    sale_type: str
    user_id: Optional[int] = None

class SaleCreate(SaleBase):
    items: List[SaleItemCreate]

class Sale(SaleBase):
    id: int
    status: str
    sale_date: datetime
    items: List[SaleItem] = []

    class Config:
        orm_mode = True
