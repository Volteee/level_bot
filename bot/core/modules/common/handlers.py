from aiogram import Bot
from aiogram.types import Message, CallbackQuery
from aiogram.fsm.context import FSMContext

from core import models
from core.modules.inspector.states import CheckOrderSteps
from core.settings import settings
from core.utils.enums import UserRoleEnum


from ..keyboards import chooseActionKeyboard


async def cancel_callback(call: CallbackQuery, bot: Bot, state: FSMContext):
    await call.message.delete()

    try:
        await bot.delete_message(
            await state.get_value('last_chat_id'),
            await state.get_value('last_message_id')
        )
    except:
        pass

    if (await state.get_state()) == CheckOrderSteps.GET_REPLY.state:
        await bot.send_message(
            call.message.chat.id,
            'Выберите действие:',
            reply_to_message_id=(await state.get_value('order_message_id')),
            reply_markup=chooseActionKeyboard,
        )
    
    await state.clear()


async def cancel_command(message: Message, bot: Bot, state: FSMContext):
    await message.delete()

    try:
        await bot.delete_message(
            await state.get_value('last_chat_id'),
            await state.get_value('last_message_id')
        )
    except:
        pass

    if (await state.get_state()) == CheckOrderSteps.GET_REPLY.state:
        await bot.send_message(
            message.chat.id,
            'Выберите действие:',
            reply_to_message_id=(await state.get_value('order_message_id')),
            reply_markup=chooseActionKeyboard,
        )
        
    await state.clear()


async def start_command(message: Message, bot: Bot):
    await message.delete()
    user = await models.user.get_user_by_tg_username(tg_username=message.from_user.username)
    if user == None:
        if message.from_user.username == settings.bots.admin_username:
            user = models.User(
                message.from_user.username,
                UserRoleEnum.ADMIN,
                message.chat.id,
            )
            await models.user.add_user(user=user)
            await message.answer("Добавил вас как администратора.")
            return

        user = models.User(
            message.from_user.username,
            UserRoleEnum.UNKNOWN,
            message.chat.id,
        )
        await models.user.add_user(user=user)
        users = await models.user.get_all_users()
        for user in users:
            if user.role == UserRoleEnum.ADMIN:
                await bot.send_message(
                    user.chat_id,
                    f"Пользователь @{message.from_user.username} запрашивает выдачу роли. Для настройки зайдите в панель администратора.",
                    reply_markup=None,
                )
        await message.answer("Запросил разрешение у администратора. Подождите до одобрения запроса.")
        return
    if user.role == UserRoleEnum.UNKNOWN:
        await message.answer("Запросил разрешение у администратора. Подождите до одобрения запроса.")
        return
    if user.role == UserRoleEnum.INITIATOR:
        await message.answer("Для создания заявки используйте команду: /order\nДля отмены создания используйте команду: /cancel")
        return
    if user.role == UserRoleEnum.INSPECTOR:
        await message.answer("У вас нет команд, доступные действия будут указаны в кнопках.")
        return
    if user.role == UserRoleEnum.ADMIN:
        pass