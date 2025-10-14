from aiogram.fsm.state import StatesGroup, State


class CheckOrderSteps(StatesGroup):
    GET_REPLY = State()