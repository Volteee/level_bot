from aiogram import Dispatcher
from aiogram.filters import Command

from .handlers import add_payeer_chat_command

def register_handlers(dp: Dispatcher) -> None:
    dp.message.register(add_payeer_chat_command, Command('add_payeer_chat'))