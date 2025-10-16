# Первоначальная настройка

## Требования:

На сервере должен быть установлен Docker.

После создания бота, нужно поменять его настройки в botfather: ```/mybots -> выбрать бота -> "Bot Settings"```. Здесь ```"Allow Groups?"``` должен быть ```enabled```, и ```"Group Privacy"``` должен быть ```disabled```.


## Переменные окружения ```.env```

```
BOT_TOKEN=tg_bot_token
ADMIN_USERNAME=tg_username
POSTGRES_USER=pg_user
POSTGRES_PASSWORD=pg_password
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=db_name
MONGO=mongodb://mongodb:27017
```

Здесь:
- BOT_TOKEN - токен тг бота, получается после создания у @BotFather
- ADMIN_USERNAME - юзернейм из тг первого админа, без "@"
- POSTGRES_USER - юзер pg, можно поставить любой
- POSTGRES_PASSWORD - пароль pg, можно поставить любой
- POSTGRES_HOST - хост pg, **не менять!**
- POSTGRES_DB - название базы pg, можно поставить любой
- MONGO - mongo url, **не менять!**


Пример ```.env``` файла есть в репозитории: ```.env_example```.


## Запуск

После создания ```.env``` файла, просто поднимаем бота:

```
docker compose up -d
```

Сразу как бот запустится, нужно выбрать и добавить в бота группу админов, команда - ```/addchat```, это разовая операция, при перезапуске данные сохраняются.

Чтобы понять функционал, советую вызвать команды: ```/start```, ```/help``` и ```/admin```