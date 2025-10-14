import aiohttp
from core import models
from core.utils.enums import OrderCurrencyEnum


LINKS = [
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    'https://latest.currency-api.pages.dev/v1/currencies/usd.json',
    'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
    'https://latest.currency-api.pages.dev/v1/currencies/usd.json',
]


async def get_order_level(
    amount: float,
    currency: OrderCurrencyEnum,
) -> int:
    async with aiohttp.ClientSession() as session:
        for link in LINKS:
            try:
                async with session.get(link) as resp:
                    rate = (await resp.json())["usd"]["rub"]
            except:
                rate = 100
    
    if currency == OrderCurrencyEnum.RUB:
        amount /= rate
    
    rc = (await models.config.get_config_by_key(key="relation_conditions")).data

    if rc['first_low'] < amount <= rc['first_high']:
        return 1
    if rc['second_low'] < amount <= rc['second_high']:
        return 2
    if rc['third_low'] < amount <= rc['third_high']:
        return 3
    if rc['forth_low'] < amount:
        return 4

    raise Exception("Incorrect amount")