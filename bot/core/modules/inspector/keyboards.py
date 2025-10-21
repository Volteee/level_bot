from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


chooseActionKeyboard = InlineKeyboardMarkup(inline_keyboard=[
    [
        InlineKeyboardButton(
            text = "Выплатить",
            callback_data="pay_order_success"
        ),
        InlineKeyboardButton(
            text = "Отклонить",
            callback_data="pay_order_canceled"
        )
    ]
])