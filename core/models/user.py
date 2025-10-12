from datetime import datetime
from uuid import UUID
from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import connection
from .models import User


@connection
async def add_user(
    session: AsyncSession,
    user: User,
) -> None:
    session.add(user)
    await session.commit()


@connection
async def get_user_by_id(
    session: AsyncSession,
    id: UUID, 
) -> User | None:
    query = select(User).where(User.id == id)
    result = await session.execute(query)
    records = result.scalars().first()
    return records


@connection
async def get_user_by_tg_username(
    session: AsyncSession,
    tg_username: str,
) -> User | None:
    query = select(User).where(User.tg_username == tg_username)
    result = await session.execute(query)
    record = result.scalars().first()
    return record


@connection
async def get_all_users(
    session: AsyncSession,
) -> list[User]:
    query = select(User)
    result = await session.execute(query)
    records = result.scalars().all()
    return records


@connection
async def update_user(
    session: AsyncSession, 
    user: User,
) -> None:
    query = update(User).where(User.id == user.id).values(
        tg_username=user.tg_username,
        role=user.role,
        updated_at=datetime.now()
    )
    await session.execute(query)
    await session.commit()


@connection
async def delete_user(
    session: AsyncSession,
    id: UUID,
) -> None:
    query = delete(User).where(User.id == id)
    await session.execute(query)
    await session.commit()