import os
from aiogram import Bot
from aiogram.types import CallbackQuery, Message, InputMediaDocument, InputMediaPhoto, InputMediaVideo, FSInputFile
from aiogram.fsm.context import FSMContext

from core import models
from core.utils.enums import FileMediaTypeEnum, MessageTypeEnum, OrderStateEnum
from core.utils.get_order_next_step import get_order_next_step
from core.utils.maps import STATE_ENUM_TO_TEXT

from .states import PayOrderSteps
from ..keyboards import cancelButton, SkipOrCancelKeyboard, chooseActionKeyboard


async def pay_order(call: CallbackQuery, bot: Bot, state: FSMContext):
    await state.clear()
    await call.message.delete()
    resp_type = call.data.replace('pay_order_', '')
    await state.set_state(PayOrderSteps.GET_REPLY)
    if resp_type == 'canceled':
        new_message = await call.message.answer(
            'Напишите причину отказа.',
            reply_to_message_id=call.message.reply_to_message.message_id,
            reply_markup=cancelButton
        )

        await state.update_data(
            resp_type=resp_type,
            last_message_id=new_message.message_id,
            order_message_id=call.message.reply_to_message.message_id,
        )

        return
    
    new_message = await call.message.answer(
        'Напишите описание к одобрению.',
        reply_to_message_id=call.message.reply_to_message.message_id,
        reply_markup=SkipOrCancelKeyboard,
    )

    await state.update_data(
        resp_type=resp_type,
        last_message_id=new_message.message_id,
        order_message_id=call.message.reply_to_message.message_id,
    )


async def reply_order(message: Message, bot: Bot, state: FSMContext):
    state_data = await state.get_data()
    resp_type = state_data['resp_type']
    await bot.delete_message(message.chat.id, state_data['last_message_id'])
    order_message = await models.message.get_message(message.chat.id, state_data['order_message_id'])
    order = await models.order.get_order_by_id(id=order_message.order_id)
    if resp_type == 'canceled':
        order.state = OrderStateEnum.CANCELED
    else:
        order.state = OrderStateEnum.PAID
    order.reply = message.text
    await models.order.update_order(order=order)
    messages = await models.message.get_messages(order.id, MessageTypeEnum.INITIATOR_MESSAGE)
    for msg in messages: await bot.delete_message(msg.chat_id, msg.message_id)
    order_text = f'ID: {order.id}\n' \
    f'Статус: {STATE_ENUM_TO_TEXT[order.state]}\n'\
    f'Обоснование: {order.reply}\n'\
    f'Сумма: {order.amount} {order.currency.value}\n'\
    f'Описание: {order.description}'
    files = await models.file.get_order_files(order_id=order.id)
    if not files:
        await bot.send_message(messages[-1].chat_id, order_text)
        return
    media_group = []
    if files[-1].media_type == FileMediaTypeEnum.DOCUMENT:
        caption = None
        for file in files:
            if file == files[-1]:
                caption = order_text
            media_group.append(InputMediaDocument(media=FSInputFile(file.path), caption=caption))
    else:
        caption = None
        for file in files:
            if file == files[-1]:
                caption = order_text
            if file.media_type == FileMediaTypeEnum.PHOTO:
                media_group.append(InputMediaPhoto(media=FSInputFile(file.path), caption=caption))
            else:
                media_group.append(InputMediaVideo(media=FSInputFile(file.path), caption=caption))
    await bot.send_media_group(messages[-1].chat_id, media_group)
    for file in files: os.remove(file.path)
    await state.clear()


async def skip_reply_order(call: CallbackQuery, bot: Bot, state: FSMContext):
    state_data = await state.get_data()
    await bot.delete_message(call.message.chat.id, state_data['last_message_id'])
    order_message = await models.message.get_message(call.message.chat.id, state_data['order_message_id'])
    order = await models.order.get_order_by_id(id=order_message.order_id)
    order.state = OrderStateEnum.PAID
    await models.order.update_order(order=order)
    messages = await models.message.get_messages(order.id, MessageTypeEnum.INITIATOR_MESSAGE)
    for msg in messages: await bot.delete_message(msg.chat_id, msg.message_id)
    order_text = f'ID: {order.id}\n' \
    f'Статус: {STATE_ENUM_TO_TEXT[order.state]}\n'\
    f'Сумма: {order.amount} {order.currency.value}\n'\
    f'Описание: {order.description}'
    files = await models.file.get_order_files(order_id=order.id)
    if not files:
        await bot.send_message(messages[-1].chat_id, order_text)
        return
    media_group = []
    if files[-1].media_type == FileMediaTypeEnum.DOCUMENT:
        caption = None
        for file in files:
            if file == files[-1]:
                caption = order_text
            media_group.append(InputMediaDocument(media=FSInputFile(file.path), caption=caption))
    else:
        caption = None
        for file in files:
            if file == files[-1]:
                caption = order_text
            if file.media_type == FileMediaTypeEnum.PHOTO:
                media_group.append(InputMediaPhoto(media=FSInputFile(file.path), caption=caption))
            else:
                media_group.append(InputMediaVideo(media=FSInputFile(file.path), caption=caption))
    await bot.send_media_group(messages[-1].chat_id, media_group)
    for file in files: os.remove(file.path)
    await state.clear()