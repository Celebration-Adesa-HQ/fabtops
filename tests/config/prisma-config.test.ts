import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('prisma 7 config', () => {
  it('defines datasource url in prisma.config.ts instead of schema.prisma', () => {
    const prismaConfigPath = resolve(process.cwd(), 'prisma.config.ts');
    const schemaPath = resolve(process.cwd(), 'prisma', 'schema.prisma');

    expect(existsSync(prismaConfigPath)).toBe(true);

    const schema = readFileSync(schemaPath, 'utf8');
    expect(schema).not.toContain('url      = env("DATABASE_URL")');
  });
});
