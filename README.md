# ⚡ AirInbox — Generador de Correos Temporales

Aplicación web de **correos electrónicos temporales / desechables** (TempMail) construida con **FastAPI**, **React 18 (Vite + TypeScript)**, **TailwindCSS**, **PostgreSQL 16**, **aiosmtpd** y **WebSockets**.

Diseñada con un enfoque de **UX/UI extremadamente cuidado**, cero fricción para el usuario y recepción en tiempo real de correos electrónicos verdaderos.

---

## 🎨 Características de Diseño & UX
- **Cero Curva de Aprendizaje**: Al ingresar a la página se genera una dirección de correo temporal automáticamente (0 clics).
- **Enfoque Hero**: La dirección generada se resalta en tipografía monoespaciada de alto contraste con un botón prominente "Copiar correo" e indicación de checkmark animado.
- **Timer de Expiración Radial**: Contador visual intuitivo con botones de extensión rápida `+10 Minutos` y `+1 Hora`.
- **Actualización en Tiempo Real (WebSockets)**: La bandeja se actualiza en vivo al recibir un correo nuevo sin necesidad de recargar la página, emitiendo un sonido suave de notificación.
- **Soporte Código QR**: Botón modal para mostrar un código QR de la dirección de correo y escanearla instantáneamente desde dispositivos móviles.
- **Lector HTML Seguro**: Renderizado de HTML sanitizado con `DOMPurify` para evitar ataques de scripts maliciosos (XSS) y vista alternativa en texto plano.
- **Descarga de Adjuntos**: Lista de archivos adjuntos con tamaño y enlace directo de descarga.
- **Modo Oscuro / Claro**: Detección automática del sistema y selector manual.

---

## 🛠️ Stack Técnico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 (Vite + TypeScript), TailwindCSS, Lucide Icons, DOMPurify, QRCode.react |
| **Backend** | Python 3.12, FastAPI (Async), SQLAlchemy 2.0 (Async), Alembic, Pydantic v2 |
| **Servidor SMTP** | `aiosmtpd` (Python) para recepción de correo RFC822 real |
| **Base de Datos** | PostgreSQL 16 |
| **Comunicación en Vivo** | WebSockets (FastAPI + React custom hook con auto-reconexión) |
| **Contenedores & Proxy** | Docker, Docker Compose, Nginx |

---

## 📁 Estructura del Monorepo

```
Proyecto_correos_temporales/
├── backend/
│   ├── app/
│   │   ├── api/            # Endpoints REST (inbox, messages) & WebSockets
│   │   ├── core/           # Configuración Pydantic, base de datos y seguridad
│   │   ├── db/             # Modelos SQLAlchemy 2.0 (Inbox, Message, Attachment)
│   │   ├── schemas/        # Esquemas Pydantic v2
│   │   └── services/       # Parser MIME/HTML, servidor SMTP aiosmtpd, scheduler de limpieza
│   ├── alembic/            # Migraciones de base de datos
│   ├── Dockerfile
│   ├── entrypoint.sh       # Ejecuta 'alembic upgrade head' y levanta Uvicorn
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # EmailCard, ExpirationTimer, InboxList, MessageDetail, QRCodeModal, Header
│   │   ├── hooks/          # useInbox, useWebSocket
│   │   ├── services/       # Cliente Axios API
│   │   └── utils/          # Formateadores & sanitizador DOMPurify
│   ├── index.html
│   ├── Dockerfile          # Multi-stage build (Node -> Nginx)
│   └── tailwind.config.js
├── infra/
│   └── nginx.conf          # Configuración proxy para el frontend
├── docker-compose.yml      # Despliegue listo para producción
├── .env.example
└── README.md
```

---

## 🚀 Despliegue Local con Docker Compose

1. **Clonar o copiar el repositorio**:
   ```bash
   cd Proyecto_correos_temporales
   ```

2. **Crear archivo `.env`**:
   ```bash
   cp .env.example .env
   ```

3. **Iniciar los servicios**:
   ```bash
   docker-compose up --build -d
   ```

4. **Acceder a la aplicación**:
   - **Frontend**: http://localhost:3000
   - **Documentación API (Swagger)**: http://localhost:8000/api/docs
   - **Servidor SMTP Local**: Escuchando en `localhost:2525` y `localhost:25`

---

## 🌐 Despliegue en Dokploy & Configuración de Dominio MX

Para recibir correos **reales de Gmail, Outlook, Yahoo, etc.**, se requiere configurar un dominio propio con registros DNS **A** y **MX**.

### 1. Configuración de Registros DNS
En tu proveedor de DNS (Cloudflare, Namecheap, GoDaddy, etc.), agrega los siguientes registros:

| Tipo | Nombre | Valor | Prioridad |
|---|---|---|---|
| **A** | `temp` | `IP_DE_TU_SERVIDOR` | - |
| **A** | `mail.temp` | `IP_DE_TU_SERVIDOR` | - |
| **MX** | `temp` | `mail.temp.tudominio.com` | `10` |

### 2. Abrir Puerto 25 en el Firewall / VPS
Asegúrate de que el proveedor de tu servidor VPS (Hetzner, DigitalOcean, AWS, Linode) mantenga abierto el **puerto 25 entrante (SMTP)**.

### 3. Configuración en Dokploy
1. En Dokploy, crea una nueva aplicación basada en Docker Compose utilizando el repositorio.
2. Define las variables de entorno en el panel de Dokploy:
   ```env
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=tu_contrasena_segura
   POSTGRES_DB=tempmail
   DOMAINS=temp.tudominio.com,tudominio.com
   ```
3. Dokploy (Traefik) se encargará del certificado SSL (HTTPS) para el puerto web (80/443), mientras que el servicio `backend` responderá directamente las conexiones de correo en el puerto 25/2525.

---

## 🧪 Prueba de Recepción de Correo Local

Puedes enviar un correo de prueba sintético utilizando Python desde cualquier consola local:

```python
import smtplib
from email.message import EmailMessage

msg = EmailMessage()
msg["Subject"] = "¡Hola desde la prueba de correo!"
msg["From"] = "remitente@ejemplo.com"
msg["To"] = "xxxxxx@tempmail.local" # Dirección que aparece en tu pantalla
msg.set_content("Este es un correo de prueba enviado en tiempo real.")

with smtplib.SMTP("localhost", 2525) as server:
    server.send_message(msg)
    print("Correo enviado exitosamente.")
```

Al ejecutar este script, verás aparecer el mensaje instantáneamente en la interfaz de usuario sin necesidad de refrescar la pantalla.
