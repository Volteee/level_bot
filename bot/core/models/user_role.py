from datetime import datetime
from uuid import UUID
from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import connection
from .models import UserRole


@connection
async def add_user_role(
    session: AsyncSession,
    user_role: UserRole,
) -> None:
    session.add(user_role)
    await session.commit()


@connection
async def get_user_role_by_id(
    session: AsyncSession,
    id: UUID, 
) -> UserRole | None:
    query = select(UserRole).where(UserRole.id == id)
    result = await session.execute(query)
    records = result.scalars().first()
    return records


@connection
async def get_user_roles_by_user_id(
    session: AsyncSession,
    user_id: UUID,
) -> UserRole | None:
    query = select(UserRole).where(UserRole.user_id == user_id)
    result = await session.execute(query)
    records = result.scalars().all()
    return records


@connection
async def get_all_users_roles(
    session: AsyncSession,
) -> list[UserRole]:
    query = select(UserRole)
    result = await session.execute(query)
    records = result.scalars().all()
    return records


@connection
async def update_user_role(
    session: AsyncSession, 
    user_role: UserRole,
) -> None:
    query = update(UserRole).where(UserRole.id == user_role.id).values(
        role=user_role.role,
        updated_at=datetime.now()
    )
    await session.execute(query)
    await session.commit()


@connection
async def delete_user_role(
    session: AsyncSession,
    id: UUID,
) -> None:
    query = delete(UserRole).where(UserRole.id == id)
    await session.execute(query)
    await session.commit()