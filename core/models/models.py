from core.utils.enums import OrderCurrencyEnum, UserRoleEnum, OrderStateEnum, MessageTypeEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, BigInteger
from .base import Base
from uuid import UUID, uuid4


class User(Base):
    __tablename__ = 'users'

    tg_username: Mapped[str] = mapped_column(unique=True)
    role: Mapped[UserRoleEnum]
    orders: Mapped[list["Order"]] = relationship(
        "Order",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    relation: Mapped["Relation"] = relationship(
        "Relation",
        back_populates="initiator",
    )


class File(Base):
    __tablename__ = 'files'

    path: Mapped[str] = mapped_column(unique=True)
    is_document: Mapped[bool]
    is_photo: Mapped[bool]
    order_id: Mapped[int] = mapped_column(ForeignKey('orders.id'))
    order: Mapped["Order"] = relationship(
        "Order",
        back_populates="files",
    )


class Message(Base):
    __tablename__ = 'messages'

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    chat_id: Mapped[int] = mapped_column(BigInteger)
    message_id: Mapped[int] = mapped_column(BigInteger)
    message_type: Mapped[MessageTypeEnum]
    order_id: Mapped[int] = mapped_column(ForeignKey('orders.id'))
    order: Mapped["Order"] = relationship(
        "Order",
        back_populates="messages",
    )


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
    initiator: Mapped["User"] = relationship(
        "User",
        back_populates="orders",
    )
    files: Mapped[list["File"]] = relationship(
        "File",
        back_populates="order",
        cascade="all, delete-orphan"
    )
    messages: Mapped[list["Message"]] = relationship(
        "Message",
        back_populates="order",
        cascade="all, delete-orphan"
    )

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


class Relation(Base):
    __tablename__ = 'relations'

    initiator_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'))
    first_inspector_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'), nullable=True)
    second_inspector_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'), nullable=True)
    third_inspector_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'), nullable=True)
    forth_inspector_id: Mapped[UUID] = mapped_column(ForeignKey('users.id'), nullable=True)
    initiator: Mapped["User"] = relationship(
        "User",
        back_populates="relation",
    )