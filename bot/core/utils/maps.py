from .enums import UserRoleEnum, OrderStateEnum


ROLE_ENUM_TO_TEXT = {
    UserRoleEnum.UNKNOWN: "неопределен",
    UserRoleEnum.INITIATOR: "инициатор",
    UserRoleEnum.INSPECTOR: "проверяющий",
    UserRoleEnum.ADMIN: "администратор",
    UserRoleEnum.PAYEER: "плательщик"
}


STATE_ENUM_TO_TEXT = {
    OrderStateEnum.CREATED: "Заявка создана [✉️]",
    OrderStateEnum.PENDING: "Заявка обрабатывается [✍️]",
    OrderStateEnum.SUCCESS: "Заявка выполнена [✅]",
    OrderStateEnum.CANCELED: "Заявка отклонена [❌]",
}