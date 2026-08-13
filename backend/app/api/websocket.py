import logging
from typing import Dict, List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.db.models import Inbox

logger = logging.getLogger("tempmail.websocket")

class ConnectionManager:
    def __init__(self):
        # Map access_token -> list of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, token: str, websocket: WebSocket):
        await websocket.accept()
        if token not in self.active_connections:
            self.active_connections[token] = []
        self.active_connections[token].append(websocket)
        logger.info(f"WebSocket client connected for token: {token}")

    def disconnect(self, token: str, websocket: WebSocket):
        if token in self.active_connections:
            if websocket in self.active_connections[token]:
                self.active_connections[token].remove(websocket)
            if not self.active_connections[token]:
                del self.active_connections[token]
        logger.info(f"WebSocket client disconnected for token: {token}")

    async def broadcast_to_token(self, token: str, payload: dict):
        if token in self.active_connections:
            disconnected = []
            for connection in self.active_connections[token]:
                try:
                    await connection.send_json(payload)
                except Exception as e:
                    logger.error(f"Error sending WS payload: {e}")
                    disconnected.append(connection)
            for conn in disconnected:
                self.disconnect(token, conn)

ws_manager = ConnectionManager()

router = APIRouter()

@router.websocket("/ws/inbox/{token}")
async def websocket_inbox_endpoint(websocket: WebSocket, token: str):
    # Verify token exists in database before establishing
    async with AsyncSessionLocal() as db:
        stmt = select(Inbox).where(Inbox.access_token == token, Inbox.is_active == True)
        res = await db.execute(stmt)
        inbox = res.scalar_one_or_none()
        if not inbox:
            await websocket.close(code=4004, reason="Inbox not found or expired")
            return

    await ws_manager.connect(token, websocket)
    try:
        while True:
            # Keep connection alive & handle incoming pings
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(token, websocket)
