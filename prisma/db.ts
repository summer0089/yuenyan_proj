import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db = (postgres as any)({
  contractJson,
  url: process.env['DATABASE_URL']!,
});
