from aiogram import Dispatcher, F
from aiogram.filters import Command
from .handlers import cancel_callback, cancel_command, start_command

def register_handlers(dp: Dispatcher) -> None:
    dp.callback_query.register(cancel_callback, F.data == "cancel")
    dp.message.register(cancel_command, Command("cancel"))
    dp.message.register(start_command, Command("start"))