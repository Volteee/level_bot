from aiogram import Bot, Dispatcher
from aiogram.client.default import DefaultBotProperties
from core.middlewares.media_group_middleware import MediaGroupMiddleware
from core.settings import settings
# from aiogram.fsm.storage.mongo import MongoStorage
import asyncio
import logging

# from core.utils.init_admin import init_admin
# from core.utils.set_commands import set_commands

from core.modules import initiator, inspector, common


async def start_bot(bot: Bot):
    # await set_commands(bot)
    # await init_admin()
    pass


async def stop_bot(bot: Bot):
    pass


async def main():
    logging.basicConfig(level=logging.INFO)
    bot = Bot(token=settings.bots.bot_token, default=DefaultBotProperties(parse_mode="HTML"))

    # dp = Dispatcher(storage=MongoStorage.from_url(settings.mongo.url))
    dp = Dispatcher()
    
    dp.startup.register(start_bot)
    dp.shutdown.register(stop_bot)

    common.register_handlers(dp)
    initiator.register_handlers(dp)
    inspector.register_handlers(dp)

    dp.message.middleware(MediaGroupMiddleware())


    try:
        await dp.start_polling(bot)
    finally:
        await bot.session.close()


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass