import enum


class UserRoleEnum(str, enum.Enum):
    INITIATOR = "INITIATOR"
    INSPECTOR = "INSPECTOR"
    ADMIN = "ADMIN"


class OrderStateEnum(str, enum.Enum):
    CREATED = "CREATED"
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    CANCELED = "CANCELED"


class OrderCurrencyEnum(str, enum.Enum):
    RUB = "RUB"
    USD = "USD"


class MessageTypeEnum(str, enum.Enum):
    INITIATOR_MESSAGE = 'INITIATOR_MESSAGE'
    INSPECTOR_MESSAGE = 'INSPECTOR_MESSAGE'