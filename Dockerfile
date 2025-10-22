FROM python:3.12.10 AS bot_builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc

COPY ./bot/requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt


FROM python:3.12.10-slim AS bot

WORKDIR /app

COPY --from=bot_builder /app/wheels /wheels
COPY --from=bot_builder /app/requirements.txt .

RUN pip install --no-cache /wheels/*

RUN mkdir -p /data/files/

COPY ./bot/core/ ./core/
COPY ./bot/main.py ./

CMD ["python", "-u", "./main.py"]


FROM python:3.12.10-slim AS migration

WORKDIR /app

COPY --from=bot_builder /app/wheels /wheels
COPY --from=bot_builder /app/requirements.txt .

RUN pip install --no-cache /wheels/*

COPY ./bot/core/ ./core/
COPY ./bot/migration/ ./migration/
COPY ./bot/alembic.ini ./

CMD ["alembic", "upgrade", "head"]


FROM node:20-alpine AS front_builder

WORKDIR /app

COPY ./front .

RUN npm ci

RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=front_builder /app/public ./public

COPY --from=front_builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=front_builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

CMD node server.js