from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton


cancelButton = InlineKeyboardMarkup(inline_keyboard=[
    [
        InlineKeyboardButton(
            text = "Отменить",
            callback_data="cancel"
        )
    ]
])


SkipOrCancelKeyboard = InlineKeyboardMarkup(inline_keyboard=[
    [
        InlineKeyboardButton(
            text = "Пропустить",
            callback_data="skip",
        )
    ],
    [
        InlineKeyboardButton(
            text = "Отменить",
            callback_data="cancel",
        )
    ]
])


chooseActionKeyboard = InlineKeyboardMarkup(inline_keyboard=[
    [
        InlineKeyboardButton(
            text = "Одобрить",
            callback_data="mark_order_success"
        ),
        InlineKeyboardButton(
            text = "Отклонить",
            callback_data="mark_order_canceled"
        )
    ]
])