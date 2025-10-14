from datetime import datetime
from uuid import UUID
from sqlalchemy import Uuid
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column
from sqlalchemy.ext.asyncio import AsyncAttrs


class Base(AsyncAttrs, DeclarativeBase):
    __abstract__ = True

    id: Mapped[UUID] = mapped_column(Uuid, primary_key=True)
    created_at: Mapped[datetime]
    updated_at: Mapped[datetime] = mapped_column(nullable=True)

    @declared_attr.directive
    def __tablename__(cls) -> str:
        return cls.__name__.lower() + 's'