from sqlalchemy.ext.asyncio import AsyncSession
from core.utils.enums import MessageTypeEnum
from sqlalchemy import select, delete
from core.database import connection
from .models import Message


@connection
async def add_message(
    chat_id: int,
    message_id: int,
    message_type: MessageTypeEnum,
    order_id: int,
    session: AsyncSession
) -> None:
    new_message = Message(
        chat_id=chat_id,
        message_id=message_id,
        message_type=message_type,
        order_id=order_id
    )
    session.add(new_message)
    await session.commit()


@connection
async def get_messages(
    order_id: int,
    message_type: MessageTypeEnum,
    session: AsyncSession
) -> list[Message]:
    query = select(Message).where(
        Message.order_id == order_id,
        Message.message_type == message_type
    )
    result = await session.execute(query)
    records = result.scalars().all()
    return records


@connection
async def delete_messages(
    order_id: int,
    session: AsyncSession
) -> None:
    query = delete(Message).where(Message.order_id == order_id)
    await session.execute(query)
    await session.commit()