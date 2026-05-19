import sqlite3
import os
from database import SQLALCHEMY_DATABASE_URL

db_path = None
if SQLALCHEMY_DATABASE_URL.startswith("sqlite:///"):
    db_path = SQLALCHEMY_DATABASE_URL.replace("sqlite:///", "")
elif SQLALCHEMY_DATABASE_URL.startswith("sqlite://"):
    db_path = SQLALCHEMY_DATABASE_URL.replace("sqlite://", "")
else:
    db_path = "cardclub.db"

if not os.path.exists(db_path):
    # Try looking in backend if not found
    if os.path.exists("backend/" + db_path):
        db_path = "backend/" + db_path
    elif os.path.exists("../" + db_path):
        db_path = "../" + db_path

print(f"Usando base de datos en: {db_path}")

try:
    conn = sqlite3.connect(db_path)
    try:
        conn.execute("ALTER TABLE products ADD COLUMN is_auction_only BOOLEAN DEFAULT 0;")
        print("Agregado is_auction_only")
    except Exception as e:
        print("is_auction_only error:", e)
        
    try:
        conn.execute("ALTER TABLE products ADD COLUMN is_pos_only BOOLEAN DEFAULT 0;")
        print("Agregado is_pos_only")
    except Exception as e:
        print("is_pos_only error:", e)
        
    conn.commit()
    conn.close()
    print("Migracion finalizada con exito!")
except Exception as e:
    print("Error fatal al abrir la base de datos:", e)
