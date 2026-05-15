from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Card Club Backend API",
    description="Backend para el ecosistema digital Card Club",
    version="1.0.0"
)

# Configuración de CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    # Agregar dominios de producción aquí después
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["Health Check"])
async def health_check():
    """
    Endpoint para verificar que el servidor está corriendo correctamente.
    """
    return {"status": "ok", "message": "Card Club API is running"}
