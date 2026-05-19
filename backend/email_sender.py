import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import asyncio

# --- CONFIGURACIÓN SMTP ---
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 465))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
API_BASE_URL = os.getenv("API_BASE_URL", "http://localhost:3000")

# --- PLANTILLA BASE (HTML) ---
BASE_HTML = """
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <style>
        body {{
            font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f3f4f6;
            color: #1f2937;
            margin: 0;
            padding: 0;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }}
        .container {{
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }}
        .header {{
            background-color: #3b4cca;
            padding: 24px;
            text-align: center;
        }}
        .header img {{
            max-height: 70px;
            width: auto;
            display: block;
            margin: 0 auto;
        }}
        .content {{
            padding: 40px 30px;
            line-height: 1.6;
            color: #374151;
            font-size: 16px;
        }}
        .content p {{
            color: #374151;
            margin-bottom: 16px;
        }}
        .title {{
            color: #111827;
            font-size: 22px;
            font-weight: 900;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #facc15;
            padding-bottom: 10px;
            display: inline-block;
        }}
        .highlight-box {{
            background-color: #fefce8;
            border-left: 4px solid #facc15;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
            color: #1f2937;
            font-size: 15px;
        }}
        .button {{
            display: inline-block;
            background-color: #facc15;
            color: #000000 !important;
            padding: 14px 28px;
            text-decoration: none;
            font-weight: 800;
            border-radius: 8px;
            margin-top: 25px;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-align: center;
        }}
        .footer {{
            background-color: #f9fafb;
            padding: 24px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
        }}
        .footer a {{
            color: #000000;
            text-decoration: underline;
            font-weight: bold;
        }}
    </style>
</head>
<body style="background-color: #f3f4f6; color: #1f2937; margin: 0; padding: 0;">
    <div style="background-color: #f3f4f6; padding: 20px;">
        <div class="container" style="background-color: #ffffff; color: #1f2937; margin: 0 auto; max-width: 600px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div class="header" style="background-color: #3b4cca; padding: 24px; text-align: center;">
                <img src="{api_base_url}/logo.png" alt="Card Club Logo" style="max-height: 70px; display: block; margin: 0 auto;" />
            </div>
            <div class="content" style="padding: 40px 30px; color: #374151; font-family: sans-serif; font-size: 16px; line-height: 1.6;">
                {content}
            </div>
            <div class="footer" style="background-color: #f9fafb; padding: 24px; text-align: center; font-size: 13px; color: #6b7280; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0 0 10px 0; color: #6b7280;">Este es un correo automático de Card Club Costa Rica.</p>
                <p style="margin: 0;"><a href="{api_base_url}" style="color: #000000; text-decoration: underline; font-weight: bold;">Visitar la tienda</a></p>
            </div>
        </div>
    </div>
</body>
</html>
"""

def send_email(to_email: str, subject: str, html_content: str):
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"AVISO: Correos desactivados. Faltan credenciales SMTP. Simulado para: {to_email} - {subject}")
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"Card Club <{SMTP_USER}>"
    msg["To"] = to_email

    final_html = BASE_HTML.format(content=html_content, api_base_url=API_BASE_URL)
    part = MIMEText(final_html, "html")
    msg.attach(part)

    try:
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, to_email, msg.as_string())
        else:
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_USER, to_email, msg.as_string())
    except Exception as e:
        print(f"Error enviando correo a {to_email}: {e}")

# Funciones Wrappers Asincrónicas para BackgroundTasks

async def send_purchase_email(to_email: str, user_name: str, total: float, items_count: int, payment_method: str):
    content = f"""
    <div class="title">¡Compra Confirmada! 🎉</div>
    <p>Hola {user_name},</p>
    <p>Hemos recibido tu pedido exitosamente. Estamos preparándolo para ti.</p>
    <div class="highlight-box">
        <strong>Detalle del Pedido:</strong><br>
        Artículos: {items_count}<br>
        Total: ₡{total:,.2f}<br>
        Método de Pago: {payment_method}
    </div>
    <p>Si elegiste SINPE o Transferencia, recuerda enviar el comprobante a nuestro WhatsApp si aún no lo has hecho.</p>
    """
    await asyncio.to_thread(send_email, to_email, "Confirmación de Compra - Card Club", content)

async def send_tournament_email(to_email: str, user_name: str, tournament_name: str, date_str: str, entry_fee: float):
    content = f"""
    <div class="title">¡Inscripción Exitosa! ⚔️</div>
    <p>Hola {user_name},</p>
    <p>Tu asiento está reservado. Prepárate para el combate.</p>
    <div class="highlight-box">
        <strong>Torneo:</strong> {tournament_name}<br>
        <strong>Fecha:</strong> {date_str}<br>
        <strong>Entrada:</strong> ₡{entry_fee:,.2f}
    </div>
    <p>Asegúrate de traer tu deck listo y llegar al menos 15 minutos antes de la hora de inicio.</p>
    """
    await asyncio.to_thread(send_email, to_email, f"Inscripción Confirmada: {tournament_name}", content)

async def send_outbid_email(to_email: str, user_name: str, product_name: str, new_price: float, auction_id: int):
    content = f"""
    <div class="title">¡Alguien superó tu puja! ⚠️</div>
    <p>Hola {user_name},</p>
    <p>¡Te están quitando esa carta! Alguien acaba de ofrecer <strong>₡{new_price:,.2f}</strong> por <strong>{product_name}</strong>.</p>
    <p>Aún estás a tiempo de recuperarla.</p>
    <div style="text-align: center;">
        <a href="{API_BASE_URL}/subastas" class="button">PUJAR NUEVAMENTE</a>
    </div>
    """
    await asyncio.to_thread(send_email, to_email, "¡Te han superado en la subasta!", content)

async def send_auction_won_email(to_email: str, user_name: str, product_name: str, winning_price: float):
    content = f"""
    <div class="title">¡Subasta Ganada! 🏆</div>
    <p>Hola {user_name},</p>
    <p>¡Felicidades! Eres el ganador indiscutible de la subasta por <strong>{product_name}</strong>.</p>
    <div class="highlight-box">
        <strong>Precio Ganador:</strong> ₡{winning_price:,.2f}
    </div>
    <p>Por favor, coordina el pago y entrega a través de nuestro WhatsApp oficial en las próximas 24 horas.</p>
    """
    await asyncio.to_thread(send_email, to_email, "¡Ganaste la subasta en Card Club!", content)

async def send_auction_warning_email(to_email: str, user_name: str, product_name: str, current_price: float):
    content = f"""
    <div class="title">¡Queda 1 Hora! ⏳</div>
    <p>Hola {user_name},</p>
    <p>La subasta por <strong>{product_name}</strong> está a punto de finalizar. ¡Solo queda 1 hora!</p>
    <div class="highlight-box">
        <strong>Precio Actual:</strong> ₡{current_price:,.2f}
    </div>
    <p>No dejes que te la quiten en el último minuto. Entra ahora para asegurar tu victoria.</p>
    <div style="text-align: center;">
        <a href="{API_BASE_URL}/subastas" class="button">IR A LA SUBASTA</a>
    </div>
    """
    await asyncio.to_thread(send_email, to_email, f"¡Queda 1 hora para ganar {product_name}!", content)

async def send_auction_request_email(user_email: str, user_name: str, whatsapp: str, card_name: str, expansion: str, condition: str, expected_price: float):
    # Enviar al administrador
    admin_content = f"""
    <div class="title">NUEVA SOLICITUD DE SUBASTA 📤</div>
    <p>El usuario <strong>{user_name}</strong> quiere subastar una carta.</p>
    <div class="highlight-box">
        <strong>Vendedor:</strong> {user_name}<br>
        <strong>Email:</strong> {user_email}<br>
        <strong>WhatsApp:</strong> {whatsapp}<br><br>
        <strong>Carta:</strong> {card_name}<br>
        <strong>Expansión:</strong> {expansion}<br>
        <strong>Condición:</strong> {condition}<br>
        <strong>Precio Esperado:</strong> ₡{expected_price:,.2f}
    </div>
    <p>Por favor, contacta al cliente vía WhatsApp para coordinar la evaluación física de la carta.</p>
    """
    await asyncio.to_thread(send_email, "carlos@cardclubcr.com", f"Solicitud de Subasta: {card_name}", admin_content)

    # Enviar copia al cliente
    client_content = f"""
    <div class="title">Solicitud Recibida 📦</div>
    <p>Hola {user_name},</p>
    <p>Hemos recibido tu solicitud para subastar <strong>{card_name}</strong> en Card Club.</p>
    <div class="highlight-box">
        <strong>Carta:</strong> {card_name}<br>
        <strong>Expansión:</strong> {expansion}<br>
        <strong>Condición:</strong> {condition}<br>
        <strong>Precio Esperado:</strong> ₡{expected_price:,.2f}
    </div>
    <p><em>⚠️ Recuerda: Card Club cobra un porcentaje de comisión por venta. Para que tu carta sea subastada oficialmente, primero deberá ser entregada en tienda para su evaluación, custodia y fotografiado profesional.</em></p>
    <p>Pronto te contactaremos por WhatsApp para coordinar la entrega.</p>
    """
    await asyncio.to_thread(send_email, user_email, f"Recibimos tu solicitud de subasta para {card_name}", client_content)

async def send_registration_email(to_email: str, user_name: str):
    content = f"""
    <div class="title">¡Bienvenido a Card Club! 🃏</div>
    <p>Hola {user_name},</p>
    <p>Tu cuenta ha sido creada exitosamente. Prepárate para coleccionar, competir y pujar en nuestras subastas en vivo.</p>
    <div style="text-align: center;">
        <a href="{API_BASE_URL}/perfil" class="button">IR A MI PERFIL</a>
    </div>
    """
    await asyncio.to_thread(send_email, to_email, "¡Bienvenido a la comunidad Card Club!", content)

async def send_tournament_results_email(to_email: str, user_name: str, tournament_name: str, position: int, points: int):
    content = f"""
    <div class="title">Resultados del Torneo ⚔️</div>
    <p>Hola {user_name},</p>
    <p>El torneo <strong>{tournament_name}</strong> ha finalizado. Aquí están tus resultados oficiales:</p>
    <div class="highlight-box">
        <strong>Posición:</strong> #{position}<br>
        <strong>Puntos de Ranking Obtenidos:</strong> {points}
    </div>
    <p>¡Gracias por participar! Revisa tu posición en el Ranking Global desde nuestro sitio web.</p>
    <div style="text-align: center;">
        <a href="{API_BASE_URL}/ranking" class="button">VER RANKING</a>
    </div>
    """
    await asyncio.to_thread(send_email, to_email, f"Resultados: {tournament_name}", content)

async def send_new_tournament_email(to_email: str, user_name: str, tournament_name: str, date_str: str, entry_fee: float):
    content = f"""
    <div class="title">¡Nuevo Torneo Anunciado! 🏆</div>
    <p>Hola {user_name},</p>
    <p>Acabamos de abrir inscripciones para un nuevo torneo. ¡Asegura tu cupo antes de que se llenen!</p>
    <div class="highlight-box">
        <strong>Torneo:</strong> {tournament_name}<br>
        <strong>Fecha:</strong> {date_str}<br>
        <strong>Entrada:</strong> ₡{entry_fee:,.2f}
    </div>
    <div style="text-align: center;">
        <a href="{API_BASE_URL}/torneos" class="button">INSCRIBIRSE AHORA</a>
    </div>
    """
    await asyncio.to_thread(send_email, to_email, f"¡Inscripciones Abiertas: {tournament_name}!", content)
