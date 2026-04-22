# Runtime-only image using pre-built Next.js standalone output
FROM node:20-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user (Debian style)
RUN groupadd --system --gid 1001 nodejs && \
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

# Create entrypoint script that runs db push then starts server
RUN printf '#!/bin/sh\nset -e\necho "Running Prisma db push..."\nnode node_modules/prisma/build/index.js db push --accept-data-loss --skip-generate\necho "Starting Next.js server..."\nexec node server.js\n' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

USER nextjs

EXPOSE 3000

CMD ["/app/entrypoint.sh"]
