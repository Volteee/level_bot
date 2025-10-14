from aiogram import Bot
from aiogram.types import BotCommand, BotCommandScopeDefault


async def set_commands(bot: Bot):
    commands = [
        BotCommand(
            command="order",
            description="Создать заявку"
        ),
        BotCommand(
            command="cancel",
            description="Отмена"
        ),
        BotCommand(
            command="revoke",
            description="Отозвать заявку"
        ),
        BotCommand(
            command="help",
            description="Помощь"
        ),
        BotCommand(
            command="admin",
            description="Панель администратора"
        ),
    ]

    await bot.set_my_commands(commands, BotCommandScopeDefault())