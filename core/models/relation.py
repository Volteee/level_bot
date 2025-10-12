from datetime import datetime
from uuid import UUID
from sqlalchemy import select, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from core.database import connection
from .models import Relation


@connection
async def add_relation(
    session: AsyncSession,
    relation: Relation,
) -> None:
    session.add(relation)
    await session.commit()


@connection
async def get_relation_by_initiator(
    session: AsyncSession,
    initiator_id: UUID,
) -> Relation | None:
    query = select(Relation).where(Relation.initiator_id == initiator_id)
    result = await session.execute(query)
    record = result.scalars().first()
    return record


@connection
async def get_all_relations(
    session: AsyncSession,
) -> list[Relation]:
    query = select(Relation)
    result = await session.execute(query)
    records = result.scalars().all()
    return records


@connection
async def update_relation(
    session: AsyncSession, 
    relation: Relation,
) -> None:
    query = update(Relation).where(Relation.id == relation.id).values(
        first_inspector_id=relation.first_inspector_id,
        second_inspector_id=relation.second_inspector_id,
        third_inspector_id=relation.third_inspector_id,
        forth_inspector_id=relation.forth_inspector_id,
        updated_at=datetime.now()
    )
    await session.execute(query)
    await session.commit()


@connection
async def delete_user(
    session: AsyncSession,
    id: UUID,
) -> None:
    query = delete(Relation).where(Relation.id == id)
    await session.execute(query)
    await session.commit()