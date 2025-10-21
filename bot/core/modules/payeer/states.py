from aiogram.fsm.state import StatesGroup, State


class PayOrderSteps(StatesGroup):
    GET_REPLY = State()