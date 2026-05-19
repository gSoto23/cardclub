from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Float, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone, timedelta
from database import Base

CR_TZ = timezone(timedelta(hours=-6))

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="player") # admin, player
    
    # Nuevos campos de Perfil
    full_name = Column(String, nullable=True)
    nickname = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    whatsapp = Column(String, nullable=True)

    bids = relationship("Bid", back_populates="user")
    tournaments = relationship("TournamentRegistration", back_populates="user")

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
    purchase_price = Column(Float, default=0.0)
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
    start_time = Column(DateTime)
    current_price = Column(Float)
    end_time = Column(DateTime)
    is_active = Column(Boolean, default=True)
    winner_notified = Column(Boolean, default=False)
    warning_1h_notified = Column(Boolean, default=False)

    product = relationship("Product", back_populates="auctions")
    bids = relationship("Bid", back_populates="auction")

class Bid(Base):
    __tablename__ = "bids"

    id = Column(Integer, primary_key=True, index=True)
    auction_id = Column(Integer, ForeignKey("auctions.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    amount = Column(Float)
    timestamp = Column(DateTime, default=lambda: datetime.now(CR_TZ).replace(tzinfo=None))

    auction = relationship("Auction", back_populates="bids")
    user = relationship("User", back_populates="bids")

class Championship(Base):
    __tablename__ = "championships"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    is_active = Column(Boolean, default=True)

    tournaments = relationship("Tournament", back_populates="championship")

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    championship_id = Column(Integer, ForeignKey("championships.id"), nullable=True)
    name = Column(String, index=True)
    date = Column(DateTime)
    format = Column(String) # e.g. "Standard", "Modern", "Draft"
    entry_fee = Column(Float)
    max_players = Column(Integer)
    is_active = Column(Boolean, default=True)
    is_virtual = Column(Boolean, default=False)

    championship = relationship("Championship", back_populates="tournaments")
    registrations = relationship("TournamentRegistration", back_populates="tournament")

    @property
    def registered_count(self):
        actual_count = len(self.registrations) if self.registrations else 0
        return max(3, actual_count)

class TournamentRegistration(Base):
    __tablename__ = "tournament_registrations"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    payment_method = Column(String) # "Tarjeta", "SINPE", "Efectivo"
    status = Column(String, default="Pendiente") # "Pendiente", "Confirmado"
    timestamp = Column(DateTime, default=lambda: datetime.now(CR_TZ).replace(tzinfo=None))

    tournament = relationship("Tournament", back_populates="registrations")
    user = relationship("User", back_populates="tournaments")

class TournamentResult(Base):
    __tablename__ = "tournament_results"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    points = Column(Integer, default=0)
    position = Column(Integer, nullable=True)

    tournament = relationship("Tournament")
    user = relationship("User")

class Sale(Base):
    __tablename__ = "sales"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Para ventas ligadas a usuarios
    total_amount = Column(Float)
    payment_method = Column(String) # "Efectivo", "Tarjeta", "SINPE"
    status = Column(String, default="Completado") # "Completado", "Cancelado"
    sale_type = Column(String) # "POS", "Torneo", "Subasta"
    sale_date = Column(DateTime, default=lambda: datetime.now(CR_TZ).replace(tzinfo=None))
    origin_ref = Column(String, nullable=True)

    items = relationship("SaleItem", back_populates="sale")
    user = relationship("User")

    @property
    def user_email(self):
        return self.user.email if self.user else None

class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(Integer, primary_key=True, index=True)
    sale_id = Column(Integer, ForeignKey("sales.id"))
    description = Column(String)
    price = Column(Float)
    quantity = Column(Integer, default=1)
    reference_type = Column(String, nullable=True) # "Producto", "Torneo", "Subasta"
    reference_id = Column(Integer, nullable=True)

    sale = relationship("Sale", back_populates="items")

class SiteConfig(Base):
    __tablename__ = "site_config"

    key = Column(String, primary_key=True, index=True)
    value = Column(String)
    description = Column(String, nullable=True)
