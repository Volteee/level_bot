import os

from time import time
from aiogram import Bot
from aiogram.types import Message, CallbackQuery, InputMediaDocument, InputMediaPhoto, InputMediaVideo, FSInputFile
from aiogram.fsm.context import FSMContext

from core import models
from core.utils.get_order_level import get_order_level
from core.utils.get_order_next_step import get_order_next_step
from core.utils.enums import FileMediaTypeEnum, MessageTypeEnum, OrderCurrencyEnum, OrderStateEnum, UserRoleEnum
from core.utils.maps import ROLE_ENUM_TO_TEXT, STATE_ENUM_TO_TEXT
from core.utils.is_float import is_float

from ..keyboards import cancelButton, chooseActionKeyboard, SkipOrCancelKeyboard
from .keyboards import CurrencyKeyboard
from .states import CreateOrderSteps


async def create_order_command(message: Message, bot: Bot, state: FSMContext):
    user = await models.user.get_user_by_tg_username(
        tg_username=message.from_user.username,
    )
    if not user:
        await message.reply('Не нашел ваш username. Убедитесь, что администратор добавил вас в бота.')
        return
    user_roles = await models.user_role.get_user_roles_by_user_id(user_id=user.id)
    if not user_roles:
        await message.reply('Не нашел вашу роль. Убедитесь, что администратор зарегистрировал вас.')
        return
    is_initiator = False
    for user_role in user_roles:
        if user_role.role == UserRoleEnum.INITIATOR:
            is_initiator = True
            break
    if not is_initiator:
        await message.reply(f'Для создания заявок нужна роль инициатора. Ваши роли: {', '.join([ROLE_ENUM_TO_TEXT[role.role] for role in user_roles])}.')
        return
    
    await message.delete()
    await state.clear()

    new_message = await message.answer(
        '<u><b>Создание заявки</b></u>\n\n'\
        'Отправьте описание для заявки. '\
        'Максимальная длина - 700 символов.',
        reply_markup=cancelButton,
    )

    await state.update_data(last_chat_id=new_message.chat.id, last_message_id=new_message.message_id)
    await state.set_state(CreateOrderSteps.GET_DESCRIPTION)


async def get_description(message: Message, bot: Bot, state: FSMContext):
    await bot.delete_message(
        await state.get_value('last_chat_id'),
        await state.get_value('last_message_id')
    )

    cond = len(message.text) <= 700
    if not cond:
        new_message = await message.answer(
            '<u><b>Создание заявки</b></u>\n\n'\
            'Слишком большая длина описания.\n\n'\
            'Отправьте описание для заявки. '\
            'Максимальная длина - 700 символов.',
            reply_markup=cancelButton,
        )
        await state.update_data(last_chat_id=new_message.chat.id, last_message_id=new_message.message_id)
        return

    await message.delete()
    await state.update_data(description=message.text)

    new_message = await message.answer(
        '<u><b>Создание заявки</b></u>\n\n'\
        'Выберите валюту.\n\n'\
        f'Описание: {message.text}',
        reply_markup=CurrencyKeyboard,
    )

    await state.update_data(last_chat_id=new_message.chat.id, last_message_id=new_message.message_id)
    await state.set_state(CreateOrderSteps.GET_CURRENCY)


async def get_currency(call: CallbackQuery, bot: Bot, state: FSMContext):
    await bot.delete_message(
        await state.get_value('last_chat_id'),
        await state.get_value('last_message_id')
    )

    currency = call.data.replace('currency_', '')
    await state.update_data(currency=currency)

    new_message = await call.message.answer(
        '<u><b>Создание заявки</b></u>\n\n'\
        'Укажите сумму.\n\n'\
        f'Описание: {await state.get_value('description')}\n'\
        f'Валюта: {currency}',
        reply_markup=cancelButton,
    )

    await state.update_data(last_chat_id=new_message.chat.id, last_message_id=new_message.message_id)
    await state.set_state(CreateOrderSteps.GET_AMOUNT)


async def get_amount(message: Message, bot: Bot, state: FSMContext):
    await bot.delete_message(
        await state.get_value('last_chat_id'),
        await state.get_value('last_message_id')
    )
    
    cond = is_float(message.text.replace(',','.')) or float(message.text.replace(',','.')) <= 0
    if not cond:
        new_message = await message.answer(
            '<u><b>Создание заявки</b></u>\n\n'\
            'Неверный формат числа.\n\n'\
            'Укажите сумму.',
            reply_markup=cancelButton,
        )
        await state.update_data(last_chat_id=new_message.chat.id, last_message_id=new_message.message_id)
        return
    
    await message.delete()
    amount = float(message.text.replace(',','.'))
    await state.update_data(amount=amount)

    new_message = await message.answer(
        '<u><b>Создание заявки</b></u>\n\n'\
        'Отправьте вложения. '\
        'Можно отправлять документы, фото и видео.\n\n'\
        f'Описание: {await state.get_value('description')}\n'\
        f'Валюта: {await state.get_value('currency')}\n'\
        f'Сумма: {amount}',
        reply_markup=SkipOrCancelKeyboard,
    )

    await state.update_data(last_chat_id=new_message.chat.id, last_message_id=new_message.message_id)
    await state.set_state(CreateOrderSteps.GET_FILES)


async def get_files(
    message: Message,
    bot: Bot,
    state: FSMContext,
    album: list[Message] = None,
):
    if album == None:
        album = [message]
    initiator_username = album[-1].from_user.username
    initiator = await models.user.get_user_by_tg_username(tg_username=initiator_username)
    relation = await models.relation.get_relation_by_initiator(initiator_id=initiator.id)
    if relation == None:
        await message.answer('Администратор не назначил вам проверяющих. Обратитесь к нему за помощью.')
        await state.clear()
        return
    state_data = await state.get_data()
    level = await get_order_level(
        state_data["amount"],
        OrderCurrencyEnum(state_data['currency']),
    )
    step = get_order_next_step(0, level, relation)
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
        case 5:
            await album[-1].answer("Администратор не назначил вам проверяющих. Обратитесь к нему за помощью.")
            return
    is_document = False
    for message in album:
        if message.document: is_document = True
        await message.delete()
    order = models.Order(
        level,
        step,
        OrderStateEnum.PENDING,
        initiator.id,
        state_data['description'],
        state_data['amount'],
        OrderCurrencyEnum(state_data['currency']),
    )
    await models.order.add_order(order=order)

    order_text = f'ID: {order.id}\n' \
    f'Статус: {STATE_ENUM_TO_TEXT[order.state]}\n'\
    f'Сумма: {order.amount} {order.currency.value}\n'\
    f'Описание: {order.description}'

    await bot.delete_message(
        await state.get_value('last_chat_id'),
        await state.get_value('last_message_id')
    )
    
    media_group = []

    if is_document:
        caption = None
        for message in album:
            if message == album[-1]:
                caption = order_text
            media_group.append(InputMediaDocument(media=message.document.file_id, caption=caption))
    else:
        caption = None
        for message in album:
            if message == album[-1]:
                caption = order_text
            if message.photo:
                media_group.append(InputMediaPhoto(media=message.photo[-1].file_id, caption=caption))
            else:
                media_group.append(InputMediaVideo(media=message.video.file_id, caption=caption))

    new_media_group = await bot.send_media_group(
        media=media_group,
        chat_id=album[-1].chat.id
    )

    for message in new_media_group:
        model_message = models.Message(
            chat_id=message.chat.id,
            message_id=message.message_id,
            message_type=MessageTypeEnum.INITIATOR_MESSAGE,
            order_id=order.id,
        )
        await models.message.add_message(message=model_message)

    files: list[models.File] = []

    if is_document:
        for message in album:
            path = os.path.join('/data','files',f'{int(time())}_{message.document.file_name}')
            await bot.download(message.document, path)
            file = models.File(
                path,
                FileMediaTypeEnum.DOCUMENT,
                order.id,
            )
            await models.file.add_file(file=file)
            files.append(file)
    else:
        for message in album:
            if message.photo:
                path = os.path.join('/data','files',f'{int(time())}_{message.photo[-1].file_id}')
                await bot.download(message.photo[-1], path)
                file = models.File(
                    path,
                    FileMediaTypeEnum.PHOTO,
                    order.id,
                )
                await models.file.add_file(file=file)
                files.append(file)
            else:
                path = os.path.join('/data','files',f'{int(time())}_{message.video.file_name}')
                await bot.download(message.video, path)
                file = models.File(
                    path,
                    FileMediaTypeEnum.VIDEO,
                    order.id,
                )
                await models.file.add_file(file=file)
                files.append(file)
        

    order_text = f"ID: {order.id}\n"\
    f"Инициатор: @{initiator_username}\n"\
    f'Сумма: {order.amount} {order.currency.value}\n'\
    f'Описание: {order.description}'
    
    media_group = []

    if is_document:
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

    new_media_group = await bot.send_media_group(
        chat_id=inspector.chat_id,
        media=media_group,
    )

    await bot.send_message(
        chat_id=inspector.chat_id,
        text="Выберите действие:",
        reply_to_message_id=new_media_group[-1].message_id,
        reply_markup=chooseActionKeyboard
    )

    for message in new_media_group:
        model_message = models.Message(
            message.chat.id,
            message.message_id,
            MessageTypeEnum.INSPECTOR_MESSAGE,
            order.id,
        )
        await models.message.add_message(message=model_message)

    await state.clear()


async def get_files_callback(
    call: CallbackQuery,
    bot: Bot,
    state: FSMContext,
):
    initiator_username = call.from_user.username
    initiator = await models.user.get_user_by_tg_username(tg_username=initiator_username)
    relation: models.Relation = await models.relation.get_relation_by_initiator(initiator_id=initiator.id)
    state_data = await state.get_data()
    level = await get_order_level(
        state_data["amount"],
        OrderCurrencyEnum(state_data['currency']),
    )
    step = get_order_next_step(0, level, relation)
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
        case 5:
            await call.message.answer("Произошла ошибка, администратор не назначил вам проверяющих.")
            return
    order = models.Order(
        level,
        step,
        OrderStateEnum.PENDING,
        initiator.id,
        state_data['description'],
        state_data['amount'],
        OrderCurrencyEnum(state_data['currency']),
    )
    await models.order.add_order(order=order)

    order_text = f'ID: {order.id}\n' \
    f'Статус: {STATE_ENUM_TO_TEXT[order.state]}\n'\
    f'Сумма: {order.amount} {order.currency.value}\n'\
    f'Описание: {order.description}'

    await bot.delete_message(
        await state.get_value('last_chat_id'),
        await state.get_value('last_message_id')
    )

    new_message = await call.message.answer(order_text)
    model_message = models.Message(
        chat_id=new_message.chat.id,
        message_id=new_message.message_id,
        message_type=MessageTypeEnum.INITIATOR_MESSAGE,
        order_id=order.id,
    )
    await models.message.add_message(message=model_message)

    order_text = f"ID: {order.id}\n"\
    f"Инициатор: @{initiator_username}\n"\
    f'Сумма: {order.amount} {order.currency.value}\n'\
    f'Описание: {order.description}'
    new_message = await bot.send_message(inspector.chat_id, order_text)
    await bot.send_message(
        chat_id=inspector.chat_id,
        text="Выберите действие:",
        reply_to_message_id=new_message.message_id,
        reply_markup=chooseActionKeyboard
    )
    model_message = models.Message(
        new_message.chat.id,
        new_message.message_id,
        MessageTypeEnum.INSPECTOR_MESSAGE,
        order.id,
    )
    await models.message.add_message(message=model_message)

    await state.clear()