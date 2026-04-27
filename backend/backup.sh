#!/bin/bash

# Stephen Asatsa Website Backend Backup Script

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backend_backup_${TIMESTAMP}.tar.gz"

echo "📦 Creating backup..."

# Create backup
tar -czf "${BACKUP_DIR}/${BACKUP_FILE}" \
    app.py \
    main.py \
    requirements.txt \
    .env \
    venv/ \
    logs/ \
    data/

echo "✅ Backup created: ${BACKUP_DIR}/${BACKUP_FILE}"

# Keep only last 10 backups
cd backups
ls -t *.tar.gz | tail -n +11 | xargs -r rm
echo "🧹 Cleanup completed"
