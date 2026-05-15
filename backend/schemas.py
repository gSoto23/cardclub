from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

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

    class Config:
        orm_mode = True
