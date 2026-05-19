import os
import sqlite3

print("Buscando bases de datos reales...")
for root, dirs, files in os.walk("/home/ubuntu/cardclub"):
    for file in files:
        if file.endswith(".db"):
            path = os.path.join(root, file)
            size = os.path.getsize(path)
            try:
                conn = sqlite3.connect(path)
                cursor = conn.cursor()
                cursor.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='products'")
                has_products = cursor.fetchone()[0] > 0
                if has_products:
                    cursor.execute("SELECT count(*) FROM products")
                    product_count = cursor.fetchone()[0]
                    print(f"ENCONTRADA: {path} (Tamaño: {size} bytes, Productos: {product_count})")
                    
                    # Intentar inyectar las columnas aquí mismo!
                    try:
                        conn.execute("ALTER TABLE products ADD COLUMN is_auction_only BOOLEAN DEFAULT 0;")
                        print("  -> Columna is_auction_only inyectada exitosamente")
                    except Exception as e:
                        print("  -> is_auction_only:", e)
                        
                    try:
                        conn.execute("ALTER TABLE products ADD COLUMN is_pos_only BOOLEAN DEFAULT 0;")
                        print("  -> Columna is_pos_only inyectada exitosamente")
                    except Exception as e:
                        print("  -> is_pos_only:", e)
                    
                    conn.commit()
                conn.close()
            except Exception as e:
                print(f"Ignorando {path}: {e}")
