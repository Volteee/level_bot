from aiogram import Bot
from aiogram.types import Message

from core import models
from core.utils.enums import UserRoleEnum


async def add_payeer_chat_command(message: Message, bot: Bot):
    user = await models.user.get_user_by_tg_username(
        tg_username=message.from_user.username,
    )
    if not user:
        await message.reply('Недостаточно прав.')
        return
    user_roles = await models.user_role.get_user_roles_by_user_id(user_id=user.id)
    if not user_roles:
        await message.reply('Недостаточно прав.')
        return
    is_admin = False
    for user_role in user_roles:
        if user_role.role == UserRoleEnum.ADMIN:
            is_admin = True
            break
    if not is_admin:
        await message.reply(f'Недостаточно прав.')
        return
    
    await message.delete()

    config = models.Config('payeer_chat_id', {'chat_id':message.chat.id})
    await models.config.replace_config(config=config)

    await message.answer('Чат был успешно добавлен.')