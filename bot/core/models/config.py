from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from .models import Config
from sqlalchemy import select, update, insert, delete
from core.database import connection


@connection
async def get_config_by_key(
    session: AsyncSession,
    key: str,
) -> Config | None:
    query = select(Config).where(Config.key == key)
    result = await session.execute(query)
    records = result.scalars().first()
    if records == None:
        if key == 'relation_conditions':
            config = Config(key='relation_conditions', data={
                'first_low': 0,
                'first_high': 2000,
                'second_low': 2000,
                'second_high': 20000,
                'third_low': 20000,
                'third_high': 40000,
                'forth_low': 40000,
            })
            query = insert(Config).values(id=config.id, key=config.key, data=config.data, created_at=config.created_at)
            await session.execute(query)
            await session.commit()
            return config
        elif key == 'payeer_chat_id':
            config = Config(key='payeer_chat_id', data={'chat_id':0})
            query = insert(Config).values(id=config.id, key=config.key, data=config.data, created_at=config.created_at)
            await session.execute(query)
            await session.commit()
            return config
    return records


@connection
async def replace_config(
    session: AsyncSession,
    config: Config,
) -> None:
    query = delete(Config).where(Config.key == config.key)
    await session.execute(query)
    query = insert(Config).values(
        id=config.id,
        key=config.key,
        data=config.data,
        created_at=datetime.now(),
    )
    await session.execute(query)
    await session.commit()


@connection
async def update_config(
    session: AsyncSession,
    config: Config,
) -> None:
    query = update(Config).where(Config.key == config.key).values(
        data=config.data,
        updated_at=datetime.now(),
    )
    await session.execute(query)
    await session.commit()
