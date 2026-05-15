from database import SessionLocal
from models import User

db = SessionLocal()
user = db.query(User).filter_by(id=1).first()
if not user:
    new_user = User(id=1, email="test@cardclub.com", hashed_password="mock", role="player")
    db.add(new_user)
    db.commit()
    print("User 1 created")
else:
    print("User 1 already exists")
db.close()
