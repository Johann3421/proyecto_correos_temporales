#!/bin/sh
set -e

export PYTHONPATH="/app:$PYTHONPATH"

echo "Checking PostgreSQL connection..."
python -c "
import asyncio, os, sys
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def wait_for_db():
    url = os.getenv('DATABASE_URL')
    for i in range(30):
        try:
            engine = create_async_engine(url)
            async with engine.connect() as conn:
                await conn.execute(text('SELECT 1'))
            await engine.dispose()
            print('PostgreSQL is ready!')
            return
        except Exception as e:
            print(f'Waiting for DB ({i+1}/30): {e}')
            await asyncio.sleep(2)
    print('Could not connect to database after 60s')
    sys.exit(1)

asyncio.run(wait_for_db())
"

echo "Running Alembic migrations..."
alembic upgrade head || {
    echo "Warning: Alembic upgrade encountered an issue. Ensuring database tables exist via SQLAlchemy Base.metadata..."
    python -c "
import asyncio
from app.core.database import engine, Base
import app.db.base
async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
asyncio.run(init())
"
}

echo "Starting Uvicorn server on port 8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
