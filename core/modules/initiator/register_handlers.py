from aiogram import Dispatcher, F
from aiogram.filters import Command

from .create_order import create_order_command, get_description, get_currency, get_amount
from .states import CreateOrderSteps


def register_handlers(dp: Dispatcher) -> None:
    dp.message.register(create_order_command, Command("order"))
    dp.message.register(get_description, CreateOrderSteps.GET_DESCRIPTION, F.text)
    dp.callback_query.register(get_currency, CreateOrderSteps.GET_CURRENCY, F.data.startswith('currency_'))
    dp.message.register(get_amount, CreateOrderSteps.GET_AMOUNT, F.text)