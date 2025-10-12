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


class AdminChat():
    def __init__(self) -> None:
        try:
            with open("./data/config/admin_chat_id.txt", "r") as file:
                text = file.read()
                self.id = int(text if text else 0)
        except FileNotFoundError:
            with open("./data/config/admin_chat_id.txt", "w") as file:
                file.write("0")
    def set_chat_id(self, chat_id: int) -> None:
        self.id = chat_id
        with open("./data/config/admin_chat_id.txt", "w") as file:
            file.write(str(chat_id))


@dataclass
class Settings:
    bots: Bots
    database: Database
    mongo: Mongo
    admin_chat: AdminChat


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
        ),
        admin_chat=AdminChat(),
    )


settings = get_settings()
settings.database.url=f"postgresql+asyncpg://{settings.database.db_user}:{settings.database.db_password}@{settings.database.db_host}:{settings.database.db_port}/{settings.database.db_name}"
