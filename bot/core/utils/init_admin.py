from core.settings import settings
from core import models
from core.utils.enums import UserRoleEnum


async def init_admin():
    try:
        await models.user.add_user(
            settings.bots.admin_username,
            UserRoleEnum.ADMIN
        )
    except:
        user = await models.user.get_user_by_tg_username(
            tg_username=settings.bots.admin_username
        )
        await models.user.update_user(
            user[0].id,
            username=settings.bots.admin_username,
            role=UserRoleEnum.ADMIN
        )
