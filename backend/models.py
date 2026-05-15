from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="player") # admin, player

    bids = relationship("Bid", back_populates="user")

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    price = Column(Float)
    stock = Column(Integer, default=0)
    
    # Campos Específicos TCG
    game = Column(String, index=True) # Ej. Pokémon, Yu-Gi-Oh!
    expansion_set = Column(String, index=True)
    condition = Column(String) # Sealed, NM, LP, MP, HP
    language = Column(String, default="EN")
    is_foil = Column(Boolean, default=False)
    image_url = Column(String) # URL principal de la imagen

    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="products")
    auctions = relationship("Auction", back_populates="product")

class Auction(Base):
    __tablename__ = "auctions"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    start_price = Column(Float)
    current_price = Column(Float)
    end_time = Column(DateTime)
    is_active = Column(Boolean, default=True)

    product = relationship("Product", back_populates="auctions")
    bids = relationship("Bid", back_populates="auction")

class Bid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True, index=True)
    auction_id = Column(Integer, ForeignKey("auctions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    auction = relationship("Auction", back_populates="bids")
    user = relationship("User", back_populates="bids")
