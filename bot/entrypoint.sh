#!/bin/bash
set -euxo pipefail
for sql in sql/*.table.*sql; do
    sqlite3 /db/bot.db < $sql
done;
npm run dev