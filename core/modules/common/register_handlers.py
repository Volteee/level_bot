from aiogram import Dispatcher, F
from aiogram.filters import Command
from .handlers import cancel_callback

def register_handlers(dp: Dispatcher) -> None:
    dp.callback_query.register(cancel_callback, F.data == "cancel")