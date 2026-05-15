from database import SessionLocal
from models import Auction
from datetime import datetime, timedelta, timezone

db = SessionLocal()
# Buscar si ya existe una subasta
auction = db.query(Auction).first()
if not auction:
    # Crear una subasta para el primer producto
    new_auction = Auction(
        product_id=1,
        start_price=100.0,
        current_price=100.0,
        end_time=datetime.now(timezone.utc) + timedelta(days=1),
        is_active=True
    )
    db.add(new_auction)
    db.commit()
    print("Subasta creada con éxito")
else:
    print("Ya existe una subasta")
db.close()
