# دژنبشت — سایت ایستا به‌اضافهٔ یک API کوچک برای ذخیرهٔ پیشرفت نقشهٔ راه،
# بدون وابستگی و بدون مرحلهٔ ساخت. فقط همان serve.js مخزن را روی Node اجرا
# می‌کند. دیتابیس SQLite در /data است: در Dokploy یک Volume با مسیر /data
# لازم است، وگرنه پیشرفت کاربران با هر دیپلوی پاک می‌شود.
FROM node:22-alpine

ENV NODE_ENV=production
ENV PORT=8000
ENV DB_PATH=/data/progress.db

WORKDIR /app

# تنها چیزهایی که هنگام اجرا لازم‌اند؛ test/ و docs/ و design-variants/ بیرون می‌مانند.
COPY package.json serve.js index.html favicon.svg apple-touch-icon.png ./
COPY assets/ ./assets/
COPY data/ ./data/
COPY server/ ./server/

RUN mkdir -p /data && chown node:node /data

USER node

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8000)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "--disable-warning=ExperimentalWarning", "serve.js"]
