from aiogram.fsm.state import StatesGroup, State


class CreateOrderSteps(StatesGroup):
    GET_DESCRIPTION = State()
    GET_CURRENCY = State()
    GET_AMOUNT = State()
    GET_FILES = State()