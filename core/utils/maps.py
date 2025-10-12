from .enums import UserRoleEnum


ROLE_ENUM_TO_TEXT = {
    UserRoleEnum.INITIATOR: "инициатор",
    UserRoleEnum.INSPECTOR: "проверяющий",
    UserRoleEnum.ADMIN: "администратор",
}