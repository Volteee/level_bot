import enum


class UserRoleEnum(str, enum.Enum):
    INITIATOR = "INITIATOR"
    INSPECTOR = "INSPECTOR"
    PAYEER = "PAYEER"
    UNKNOWN = "UNKNOWN"
    ADMIN = "ADMIN"


class OrderStateEnum(str, enum.Enum):
    CREATED = "CREATED"
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    CANCELED = "CANCELED"
    PAID = "PAID"


class OrderCurrencyEnum(str, enum.Enum):
    RUB = "RUB"
    USD = "USD"


class MessageTypeEnum(str, enum.Enum):
    INITIATOR_MESSAGE = 'INITIATOR_MESSAGE'
    INSPECTOR_MESSAGE = 'INSPECTOR_MESSAGE'


class FileMediaTypeEnum(str, enum.Enum):
    DOCUMENT = 'DOCUMENT'
    PHOTO = 'PHOTO'
    VIDEO = 'VIDEO'