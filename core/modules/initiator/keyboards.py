from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from core.utils.enums import OrderCurrencyEnum


CurrencyKeyboard = InlineKeyboardMarkup(inline_keyboard=[
    [
        (InlineKeyboardButton(
            text = currency.value,
            callback_data="currency_"+currency.value,
        )) for currency in OrderCurrencyEnum
    ],
    [
        InlineKeyboardButton(
            text = "Отменить",
            callback_data="cancel",
        )
    ]
])