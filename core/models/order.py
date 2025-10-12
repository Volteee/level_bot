from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from .models import Order
from sqlalchemy import select, update
from core.database import connection
from uuid import UUID


@connection
async def add_order(
    session: AsyncSession,
    order: Order,
) -> None:
    session.add(order)
    await session.commit()


@connection
async def get_order_by_id(
    session: AsyncSession,
    id: UUID,
) -> Order | None:
    query = select(Order).where(Order.id == id)
    result = await session.execute(query)
    records = result.scalars().first()
    return records


@connection
async def get_all_orders(
    session: AsyncSession
) -> list[Order]:
    query = select(Order)
    result = await session.execute(query)
    records = result.all()
    return records


@connection
async def update_order(
    session: AsyncSession,
    order: Order,
) -> None:
    query = update(Order).where(Order.id == order.id).values(
        step=order.step,
        state=order.state,
        reply=order.reply,
        updated_at=datetime.now()
    )
    await session.execute(query)
    await session.commit()
