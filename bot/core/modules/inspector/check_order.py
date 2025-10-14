import os
from aiogram import Bot
from aiogram.types import CallbackQuery, Message, InputMediaDocument, InputMediaPhoto, InputMediaVideo, FSInputFile
from aiogram.fsm.context import FSMContext

from core import models
from core.utils.enums import FileMediaTypeEnum, MessageTypeEnum, OrderStateEnum
from core.utils.get_order_next_step import get_order_next_step
from core.utils.maps import STATE_ENUM_TO_TEXT

from .states import CheckOrderSteps
from ..keyboards import cancelButton, SkipOrCancelKeyboard, chooseActionKeyboard


async def mark_order(call: CallbackQuery, bot: Bot, state: FSMContext):
    await state.clear()
    await call.message.delete()
    resp_type = call.data.replace('mark_order_', '')
    await state.set_state(CheckOrderSteps.GET_REPLY)
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
        return
    relation = await models.relation.get_relation_by_initiator(initiator_id=order.initiator_id)
    step = get_order_next_step(order.step, order.level, relation)
    if step == 5:
        order.state = OrderStateEnum.SUCCESS
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
        return
    else:
        await message.answer('Вы не можете написать описание для одобрения, только пропустить этот шаг.')


async def skip_reply_order(call: CallbackQuery, bot: Bot, state: FSMContext):
    state_data = await state.get_data()
    await bot.delete_message(call.message.chat.id, state_data['last_message_id'])
    order_message = await models.message.get_message(call.message.chat.id, state_data['order_message_id'])
    order = await models.order.get_order_by_id(id=order_message.order_id)
    relation = await models.relation.get_relation_by_initiator(initiator_id=order.initiator_id)
    step = get_order_next_step(order.step, order.level, relation)
    order.step = step
    await models.order.update_order(order=order)
    files = await models.file.get_order_files(order_id=order.id)
    inspector = None
    match step:
        case 1:
            inspector = await models.user.get_user_by_id(id=relation.first_inspector_id)
        case 2:
            inspector = await models.user.get_user_by_id(id=relation.second_inspector_id)
        case 3:
            inspector = await models.user.get_user_by_id(id=relation.third_inspector_id)
        case 4:
            inspector = await models.user.get_user_by_id(id=relation.forth_inspector_id)
    
    if step == 5:
        order.state = OrderStateEnum.SUCCESS
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
        return

    initiator = await models.user.get_user_by_id(id=order.initiator_id)
    order_text = f"ID: {order.id}\n"\
    f"Инициатор: @{initiator.tg_username}\n"\
    f'Сумма: {order.amount} {order.currency.value}\n'\
    f'Описание: {order.description}'

    if not files:
        await bot.send_message(inspector.chat_id, order_text, reply_markup=chooseActionKeyboard)
    
    old_messages = await models.message.get_messages(order.id, MessageTypeEnum.INSPECTOR_MESSAGE)
    for msg in old_messages: await models.message.delete_message(msg.id)
    
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
    new_messages = await bot.send_media_group(initiator.chat_id, media_group)
    for message in new_messages:
        model_message = models.Message(
            message.chat.id,
            message.message_id,
            MessageTypeEnum.INSPECTOR_MESSAGE,
            order.id,
        )
        await models.message.add_message(message=model_message)