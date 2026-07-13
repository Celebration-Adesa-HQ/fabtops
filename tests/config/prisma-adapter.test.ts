import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('prisma runtime adapter', () => {
  it('configures PrismaClient with a postgres adapter', () => {
    const packageJson = JSON.parse(
      readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'),
    ) as {
      dependencies?: Record<string, string>;
    };
    const prismaSource = readFileSync(resolve(process.cwd(), 'lib', 'db', 'prisma.ts'), 'utf8');

    expect(packageJson.dependencies?.['@prisma/adapter-pg']).toBeDefined();
    expect(prismaSource).toContain('@prisma/adapter-pg');
    expect(prismaSource).toContain('adapter:');
    expect(prismaSource).toContain("from '@prisma/client'");
  });

  it('rebuilds the Prisma client when required delegates are missing without dynamic require', () => {
    const prismaSource = readFileSync(resolve(process.cwd(), 'lib', 'db', 'prisma.ts'), 'utf8');

    expect(prismaSource).toContain("REQUIRED_DELEGATES = ['user', 'wishlistItem']");
    expect(prismaSource).toContain('createPrismaClient()');
    expect(prismaSource).not.toContain('require.cache');
    expect(prismaSource).not.toContain("require('@prisma/client')");
  });
});
