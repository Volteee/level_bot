from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


cancelButton = InlineKeyboardMarkup(inline_keyboard=[
    [
        InlineKeyboardButton(
            text = "Отменить",
            callback_data="cancel"
        )
    ]
])