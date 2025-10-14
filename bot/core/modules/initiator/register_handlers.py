from aiogram import Dispatcher, F
from aiogram.filters import Command, or_f

from .create_order import create_order_command, get_description, get_currency, get_amount, get_files, get_files_callback
from .states import CreateOrderSteps


def register_handlers(dp: Dispatcher) -> None:
    dp.message.register(create_order_command, Command("order"))
    dp.message.register(get_description, CreateOrderSteps.GET_DESCRIPTION, F.text)
    dp.callback_query.register(get_currency, CreateOrderSteps.GET_CURRENCY, F.data.startswith('currency_'))
    dp.message.register(get_amount, CreateOrderSteps.GET_AMOUNT, F.text)
    dp.message.register(get_files, CreateOrderSteps.GET_FILES, or_f(F.document, F.photo, F.video))
    dp.callback_query.register(get_files_callback, CreateOrderSteps.GET_FILES, F.data == 'skip')