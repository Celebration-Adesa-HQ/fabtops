import { auth } from '@/lib/auth/server';

const handler = auth.handler();

export async function GET(request: Request, context: { params: Promise<{ all: string[] }> }) {
  const { all } = await context.params;
  return handler.GET(request, { params: Promise.resolve({ path: all }) });
}

export async function POST(request: Request, context: { params: Promise<{ all: string[] }> }) {
  const { all } = await context.params;
  return handler.POST(request, { params: Promise.resolve({ path: all }) });
}
