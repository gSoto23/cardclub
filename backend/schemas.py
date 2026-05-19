from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- AUTHENTICATION & USERS ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None
    nickname: Optional[str] = None
    whatsapp: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str
    whatsapp: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    nickname: Optional[str] = None
    whatsapp: Optional[str] = None
    avatar_url: Optional[str] = None

class User(UserBase):
    id: int
    is_active: bool
    role: str

    class Config:
        orm_mode = True

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

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    purchase_price: Optional[float] = None
    stock: Optional[int] = None
    game: Optional[str] = None
    expansion_set: Optional[str] = None
    condition: Optional[str] = None
    language: Optional[str] = None
    is_foil: Optional[bool] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None

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

class AuctionUpdate(BaseModel):
    product_id: Optional[int] = None
    start_price: Optional[float] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    is_active: Optional[bool] = None
    current_price: Optional[float] = None

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

# --- CHAMPIONSHIPS ---
class ChampionshipBase(BaseModel):
    name: str
    is_active: bool = True

class ChampionshipCreate(ChampionshipBase):
    pass

class ChampionshipUpdate(BaseModel):
    name: Optional[str] = None
    is_active: Optional[bool] = None

class Championship(ChampionshipBase):
    id: int

    class Config:
        orm_mode = True

class AuctionRequestCreate(BaseModel):
    card_name: str
    expansion: str
    condition: str
    expected_price: float

# --- TOURNAMENTS ---
class TournamentBase(BaseModel):
    name: str
    date: datetime
    format: str
    entry_fee: float
    max_players: int
    is_virtual: bool = False
    championship_id: Optional[int] = None

class TournamentCreate(TournamentBase):
    pass

class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[datetime] = None
    format: Optional[str] = None
    entry_fee: Optional[float] = None
    max_players: Optional[int] = None
    is_active: Optional[bool] = None
    is_virtual: Optional[bool] = None
    championship_id: Optional[int] = None

class Tournament(TournamentBase):
    id: int
    is_active: bool
    registered_count: int = 3

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

# --- TOURNAMENT RESULTS & RANKING ---
class TournamentResultBase(BaseModel):
    user_id: int
    points: int
    position: Optional[int] = None

class TournamentResultCreate(TournamentResultBase):
    pass

class TournamentResult(TournamentResultBase):
    id: int
    tournament_id: int
    
    class Config:
        orm_mode = True

class RankingUserResponse(BaseModel):
    user_id: int
    email: str
    nickname: Optional[str] = None
    avatar_url: Optional[str] = None
    total_points: int

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
    origin_ref: Optional[str] = None

class SaleCreate(SaleBase):
    items: List[SaleItemCreate]
    buyer_email: Optional[str] = None

class Sale(SaleBase):
    id: int
    status: str
    sale_date: datetime
    user_email: Optional[str] = None
    items: List[SaleItem] = []

    class Config:
        orm_mode = True

# --- CONFIG ---
class SiteConfigBase(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class SiteConfigCreate(SiteConfigBase):
    pass

class SiteConfig(SiteConfigBase):
    class Config:
        orm_mode = True

class SiteConfigUpdateList(BaseModel):
    configs: List[SiteConfigBase]
