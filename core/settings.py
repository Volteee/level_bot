import asyncio
from os import getenv
from dotenv import load_dotenv
from dataclasses import dataclass


@dataclass
class Bots:
    bot_token: str
    admin_username: str


@dataclass
class Database:
    db_user: str
    db_password: str
    db_host: str
    db_port: int
    db_name: str
    url: str


@dataclass
class Mongo:
    url: str


@dataclass
class Settings:
    bots: Bots
    database: Database
    mongo: Mongo


def get_settings():
    load_dotenv()
    return Settings(
        bots=Bots(
            bot_token=getenv("BOT_TOKEN"),
            admin_username=getenv("ADMIN_USERNAME"),
        ),
        database=Database(
            db_user=getenv("POSTGRES_USER"),
            db_password=getenv("POSTGRES_PASSWORD"),
            db_host=getenv("POSTGRES_HOST"),
            db_port=getenv("POSTGRES_PORT"),
            db_name=getenv("POSTGRES_DB"),
            url='',
        ),
        mongo=Mongo(
            url=getenv("MONGO_URL"),
        )
    )


settings = get_settings()
settings.database.url=f"postgresql+asyncpg://{settings.database.db_user}:{settings.database.db_password}@{settings.database.db_host}:{settings.database.db_port}/{settings.database.db_name}"
