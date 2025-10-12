from aiogram import Bot
from aiogram.types import CallbackQuery
from aiogram.fsm.context import FSMContext


async def cancel_callback(call: CallbackQuery, bot: Bot, state: FSMContext):
    await call.message.delete()
    await state.clear()

    try:
        await bot.delete_message(
            await state.get_value('last_chat_id'),
            await state.get_value('last_message_id')
        )
    except:
        pass