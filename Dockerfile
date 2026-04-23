# Runtime-only image using pre-built Next.js standalone output
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Install OpenSSL for Prisma and create non-root user
RUN apt-get update -y && apt-get install -y openssl && \
    groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 --gid nodejs nextjs

# Copy pre-built Next.js standalone output
COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY --chown=nextjs:nodejs public ./public

# Copy Prisma client, engine, and CLI (required at runtime)
COPY --chown=nextjs:nodejs node_modules/@prisma ./node_modules/@prisma
COPY --chown=nextjs:nodejs node_modules/.prisma ./node_modules/.prisma
COPY --chown=nextjs:nodejs node_modules/prisma ./node_modules/prisma
COPY --chown=nextjs:nodejs prisma ./prisma

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
