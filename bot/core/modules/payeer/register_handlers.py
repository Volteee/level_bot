from aiogram import Dispatcher, F
from aiogram.filters import Command, or_f


from .pay_order import pay_order, reply_order, skip_reply_order
from .states import PayOrderSteps



def register_handlers(dp: Dispatcher) -> None:
    dp.callback_query.register(pay_order, F.data.startswith('pay_order_'))
    dp.message.register(reply_order, PayOrderSteps.GET_REPLY, F.text)
    dp.callback_query.register(skip_reply_order, PayOrderSteps.GET_REPLY)