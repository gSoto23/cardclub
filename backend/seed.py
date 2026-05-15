import requests

BASE_URL = "http://127.0.0.1:8000/api"

print("Creando categorías...")
categories = [
    {"name": "Singles (Cartas Sueltas)"},
    {"name": "Cajas Selladas (Booster Boxes)"},
    {"name": "Accesorios (Sleeves, Deckboxes)"}
]

cat_ids = []
for cat in categories:
    r = requests.post(f"{BASE_URL}/categories", json=cat)
    if r.status_code == 200:
        cat_ids.append(r.json()["id"])
        print(f"Categoría creada: {r.json()['name']}")
    else:
        print("Error:", r.text)

print("\nCreando productos de prueba...")
if len(cat_ids) >= 2:
    products = [
        {
            "name": "Charizard ex - Special Illustration Rare",
            "description": "Una de las cartas más buscadas de la expansión. Estado perfecto (NM).",
            "price": 120.50,
            "stock": 2,
            "game": "Pokémon TCG",
            "expansion_set": "Paldean Fates",
            "condition": "NM",
            "language": "EN",
            "is_foil": True,
            "category_id": cat_ids[0],
            "image_url": "https://images.unsplash.com/photo-1613771404721-1f92d799e49f?w=400&q=80" # Placeholder card image
        },
        {
            "name": "Blue-Eyes White Dragon (Ghost Rare)",
            "description": "Edición Ghost Rare muy difícil de conseguir.",
            "price": 250.00,
            "stock": 1,
            "game": "Yu-Gi-Oh!",
            "expansion_set": "Ghosts From the Past",
            "condition": "LP",
            "language": "EN",
            "is_foil": True,
            "category_id": cat_ids[0],
            "image_url": "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=400&q=80"
        },
        {
            "name": "Twilight Masquerade Booster Box",
            "description": "Caja sellada con 36 sobres de la última expansión.",
            "price": 110.00,
            "stock": 10,
            "game": "Pokémon TCG",
            "expansion_set": "Twilight Masquerade",
            "condition": "Sealed",
            "language": "ES",
            "is_foil": False,
            "category_id": cat_ids[1],
            "image_url": "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=400&q=80"
        }
    ]

    for p in products:
        r = requests.post(f"{BASE_URL}/products", json=p)
        if r.status_code == 200:
            print(f"Producto creado: {r.json()['name']}")
        else:
            print("Error creando producto:", r.text)

print("\n¡Base de datos sembrada con éxito!")
