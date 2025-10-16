FROM python:3.12.10 AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && \
    apt-get install -y --no-install-recommends gcc

COPY ./bot/requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /app/wheels -r requirements.txt


FROM python:3.12.10-slim AS bot

WORKDIR /app

COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

RUN pip install --no-cache /wheels/*

RUN mkdir -p /app/data/files/

COPY ./bot/core/ ./core/
COPY ./bot/main.py ./

CMD ["python", "-u", "./main.py"]


FROM python:3.12.10-slim AS migration

WORKDIR /app

COPY --from=builder /app/wheels /wheels
COPY --from=builder /app/requirements.txt .

RUN pip install --no-cache /wheels/*

COPY ./bot/core/ ./core/
COPY ./bot/migration/ ./migration/
COPY ./bot/alembic.ini ./

CMD ["alembic", "upgrade", "head"]


FROM node:20-alpine AS builder

WORKDIR /app

COPY ./front/package.json ./front/package-lock.json* ./
RUN npm ci

COPY ./front/src ./src
COPY ./front/public ./public
COPY ./front/next.config.js .
COPY ./front/tsconfig.json .

RUN npm run build


FROM node:20-alpine AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Environment variables must be redefined at run time
ARG ENV_VARIABLE
ENV ENV_VARIABLE=${ENV_VARIABLE}
ARG NEXT_PUBLIC_ENV_VARIABLE
ENV NEXT_PUBLIC_ENV_VARIABLE=${NEXT_PUBLIC_ENV_VARIABLE}
ARG POSTGRES_HOST
ENV POSTGRES_HOST=${POSTGRES_HOST}
ARG POSTGRES_PORT
ENV POSTGRES_PORT=${POSTGRES_PORT}
ARG POSTGRES_DATABASE
ENV POSTGRES_DATABASE=${POSTGRES_DATABASE}
ARG POSTGRES_USER
ENV POSTGRES_USER=${POSTGRES_USER}
ARG POSTGRES_PASSWORD
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Uncomment the following line to disable telemetry at run time
# ENV NEXT_TELEMETRY_DISABLED 1

# Note: Don't expose ports here, Compose will handle that for us

# We can use the node process itself here
CMD node server.js