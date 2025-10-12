from aiogram import Bot
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext

from core import models
from core.utils.enums import UserRoleEnum
from core.utils.maps import ROLE_ENUM_TO_TEXT
from core.utils.is_float import is_float

from ..keyboards import cancelButton
from .keyboards import CurrencyKeyboard, FilesKeyboard
from .states import CreateOrderSteps


async def create_order_command(message: Message, bot: Bot, state: FSMContext):
    # user = await models.user.get_user_by_tg_username(
    #     tg_username=message.from_user.username,
    # )
    # if not user:
    #     await message.reply('Не нашел ваш username. Убедитесь, что администратор добавил вас в бота.')
    #     return
    # if user.role != UserRoleEnum.INITIATOR:
    #     await message.reply(f'Для создания заявок нужна роль инициатора. Ваша роль - {ROLE_ENUM_TO_TEXT[user.role]}.')
    #     return
    
    await message.delete()
    await state.clear()

    new_message = await message.answer(
        '<u><b>Создание заявки</b></u>\n\n'\
        'Отправьте описание для заявки. '\
        'Максимальная длина - 700 символов.',
        reply_markup=cancelButton,
    )

    await state.update_data(last_chat_id=new_message.chat.id, last_message_id=new_message.message_id)
    await state.set_state(CreateOrderSteps.GET_DESCRIPTION)


async def get_description(message: Message, bot: Bot, state: FSMContext):
    await bot.delete_message(
        await state.get_value('last_chat_id'),
        await state.get_value('last_message_id')
    )

    cond = len(message.text) <= 700
    if not cond:
        new_message = await message.answer(
            '<u><b>Создание заявки</b></u>\n\n'\
            'Слишком большая длина описания.\n\n'\
            'Отправьте описание для заявки. '\
            'Максимальная длина - 700 символов.',
            reply_markup=cancelButton,
        )
        await state.update_data(last_chat_id=new_message.chat.id, last_message_id=new_message.message_id)
        return

    await message.delete()
    await state.update_data(description=message.text)

    new_message = await message.answer(
        '<u><b>Создание заявки</b></u>\n\n'\
        'Выберите валюту.',
        reply_markup=CurrencyKeyboard,
    )

    await state.update_data(last_chat_id=new_message.chat.id, last_message_id=new_message.message_id)
    await state.set_state(CreateOrderSteps.GET_CURRENCY)


async def get_currency(call: CallbackQuery, bot: Bot, state: FSMContext):
    await bot.delete_message(
        await state.get_value('last_chat_id'),
        await state.get_value('last_message_id')
    )

    currency = call.data.replace('currency_', '')
    await state.update_data(currency=currency)

    new_message = await call.message.answer(
        '<u><b>Создание заявки</b></u>\n\n'\
        'Укажите сумму.',
        reply_markup=cancelButton,
    )

    await state.update_data(last_chat_id=new_message.chat.id, last_message_id=new_message.message_id)
    await state.set_state(CreateOrderSteps.GET_AMOUNT)


async def get_amount(message: Message, bot: Bot, state: FSMContext):
    await bot.delete_message(
        await state.get_value('last_chat_id'),
        await state.get_value('last_message_id')
    )
    
    cond = is_float(message.text.replace(',','.'))
    if not cond:
        new_message = await message.answer(
            '<u><b>Создание заявки</b></u>\n\n'\
            'Неверный формат числа.\n\n'\
            'Укажите сумму.',
            reply_markup=cancelButton,
        )
        await state.update_data(last_chat_id=new_message.chat.id, last_message_id=new_message.message_id)
        return
    
    await message.delete()
    amount = float(message.text.replace(',','.'))
    await state.update_data(amount=amount)

    new_message = await message.answer(
        '<u><b>Создание заявки</b></u>\n\n'\
        'Отправьте вложения.'\
        'Можно отправлять документы, фото и видео.',
        reply_markup=FilesKeyboard,
    )

    await state.update_data(last_chat_id=new_message.chat.id, last_message_id=new_message.message_id)
    await state.set_state(CreateOrderSteps.GET_FILES)