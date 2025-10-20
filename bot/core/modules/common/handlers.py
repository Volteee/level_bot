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
                message.chat.id,
            )
            await models.user.add_user(user=user)
            user_role = models.UserRole(
                user.id,
                UserRoleEnum.ADMIN,
            )
            await models.user_role.add_user_role(user_role=user_role)

            await message.answer("Добавил вас как администратора.")
            return

        user = models.User(
            message.from_user.username,
            message.chat.id,
        )
        await models.user.add_user(user=user)
        user_role = models.UserRole(
            user.id,
            UserRoleEnum.UNKNOWN,
        )
        await models.user_role.add_user_role(user_role=user_role)
        users_roles = await models.user_role.get_all_users_roles()
        for user_role in users_roles:
            if user_role.role == UserRoleEnum.ADMIN:
                user = await models.user.get_user_by_id(id=user_role.user_id)
                await bot.send_message(
                    user.chat_id,
                    f"Пользователь @{message.from_user.username} запрашивает выдачу роли. Для настройки зайдите в панель администратора.",
                    reply_markup=None,
                )
        await message.answer("Запросил разрешение у администратора. Подождите одобрения запроса.")
        return
    user_roles = await models.user_role.get_user_roles_by_user_id(user_id=user.id)
    sub = [role.role for role in user_roles]
    if (UserRoleEnum.UNKNOWN in sub) or (not user_roles):
        await message.answer("Запросил разрешение у администратора. Подождите одобрения запроса.")
        return
    if (UserRoleEnum.INITIATOR in sub):
        await message.answer("Для создания заявки используйте команду: /order\nДля отмены создания используйте команду: /cancel")
        return
    if (UserRoleEnum.INSPECTOR in sub):
        await message.answer("У вас нет команд, доступные действия будут указаны в кнопках.")
        return
    if (UserRoleEnum.PAYEER in sub):
        await message.answer("У вас нет доступных команд.")
        return
    if (UserRoleEnum.ADMIN in sub):
        pass