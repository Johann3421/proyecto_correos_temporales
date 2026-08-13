#!/bin/sh
set -e

echo "Checking PostgreSQL connection..."
python -c "
import asyncio, os, sys, time
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def wait_for_db():
    url = os.getenv('DATABASE_URL')
    for i in range(30):
        try:
            engine = create_async_engine(url)
            async with engine.connect() as conn:
                await conn.execute(text('SELECT 1'))
            print('PostgreSQL is ready!')
            return
        except Exception as e:
            print(f'Waiting for DB to accept connections ({i+1}/30)...')
            await asyncio.sleep(2)
    print('Could not connect to database after 60s')
    sys.exit(1)

asyncio.run(wait_for_db())
"

echo "Running Alembic migrations..."
alembic upgrade head

echo "Starting Uvicorn server on port 8000..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
