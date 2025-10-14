from aiogram import Dispatcher, F
from aiogram.filters import Command, or_f


from .check_order import mark_order, reply_order, skip_reply_order
from .states import CheckOrderSteps



def register_handlers(dp: Dispatcher) -> None:
    dp.callback_query.register(mark_order, F.data.startswith('mark_order_'))
    dp.message.register(reply_order, CheckOrderSteps.GET_REPLY, F.text)
    dp.callback_query.register(skip_reply_order, CheckOrderSteps.GET_REPLY)