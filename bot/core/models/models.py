from datetime import datetime
from core.utils.enums import FileMediaTypeEnum, OrderCurrencyEnum, UserRoleEnum, OrderStateEnum, MessageTypeEnum
from sqlalchemy.dialects.postgresql import JSON as pgJSON
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey, BigInteger
from .base import Base
from uuid import UUID, uuid4


class User(Base):
    __tablename__ = 'users'

    tg_username: Mapped[str] = mapped_column(unique=True)
    chat_id: Mapped[int] = mapped_column(BigInteger)

    def __init__(
        self,
        tg_username: str,
        chat_id: int,
    ) -> None:
        self.id = uuid4()
        self.tg_username = tg_username
        self.chat_id = chat_id
        self.created_at = datetime.now()


class UserRole(Base):
    __tablename__ = 'users_roles'

    user_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'))
    role: Mapped[UserRoleEnum]

    def __init__(
        self,
        user_id: UUID,
        role: UserRoleEnum,
    ) -> None:
        self.id = uuid4()
        self.user_id = user_id
        self.role = role
        self.created_at = datetime.now()


class File(Base):
    __tablename__ = 'files'

    path: Mapped[str] = mapped_column(unique=True)
    media_type: Mapped[FileMediaTypeEnum]
    order_id: Mapped[UUID] = mapped_column(ForeignKey('orders.id'))

    def __init__(
        self,
        path: str,
        media_type: FileMediaTypeEnum,
        order_id: UUID,
    ) -> None:
        self.id = uuid4()
        self.path = path
        self.media_type = media_type
        self.order_id = order_id
        self.created_at = datetime.now()


class Message(Base):
    __tablename__ = 'messages'

    chat_id: Mapped[int] = mapped_column(BigInteger)
    message_id: Mapped[int] = mapped_column(BigInteger)
    message_type: Mapped[MessageTypeEnum]
    order_id: Mapped[UUID] = mapped_column(ForeignKey('orders.id'))

    def __init__(
        self,
        chat_id: int,
        message_id: int,
        message_type: MessageTypeEnum,
        order_id: UUID,
    ):
        self.id = uuid4()
        self.chat_id = chat_id
        self.message_id = message_id
        self.message_type = message_type
        self.order_id = order_id
        self.created_at = datetime.now()



class Order(Base):
    __tablename__ = 'orders'

    level: Mapped[int]
    step: Mapped[int]
    state: Mapped[OrderStateEnum]
    initiator_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'))
    description: Mapped[str]
    reply: Mapped[str] = mapped_column(nullable=True)
    amount: Mapped[float]
    currency: Mapped[OrderCurrencyEnum]

    def __init__(
        self,
        level: int,
        step: int,
        state: OrderStateEnum,
        initiator_id: UUID,
        description: str,
        amount: float,
        currency: OrderCurrencyEnum,
        reply: str = None,
    ):
        self.id = uuid4()
        self.level = level
        self.step = step
        self.state = state
        self.initiator_id = initiator_id
        self.description = description
        self.amount = amount
        self.currency = currency
        self.reply = reply
        self.created_at = datetime.now()


class Relation(Base):
    __tablename__ = 'relations'

    initiator_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'))
    first_inspector_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'), nullable=True)
    second_inspector_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'), nullable=True)
    third_inspector_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'), nullable=True)
    forth_inspector_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'), nullable=True)


class Config(Base):
    __tablename__ = 'configs'

    key: Mapped[str]
    data: Mapped[dict] = mapped_column(pgJSON)

    def __init__(
        self,
        key: str,
        data: dict,
    ):
        self.id = uuid4()
        self.key = key
        self.data = data
        self.created_at = datetime.now()