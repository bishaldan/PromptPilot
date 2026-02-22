#!/bin/sh
set -e

npm install --no-audit --no-fund
npm run prisma:generate
npm run prisma:push
npm run seed
npm run dev -- --hostname 0.0.0.0 --port 3000
