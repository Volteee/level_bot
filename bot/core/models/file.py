from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from core.database import connection
from .models import File


@connection
async def add_file(
    session: AsyncSession,
    file: File
) -> None:
    session.add(file)
    await session.commit()


@connection
async def get_order_files(
    session: AsyncSession,
    order_id: UUID,
) -> list[File]:
    query = select(File).where(File.order_id == order_id)
    result = await session.execute(query)
    records = result.scalars().all()
    return records


@connection
async def delete_order_files(
    session: AsyncSession,
    order_id: UUID, 
) -> None:
    query = delete(File).where(File.order_id == order_id)
    await session.execute(query)
    await session.commit()