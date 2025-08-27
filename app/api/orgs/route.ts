import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createOrg, listUserOrgs } from '@/server/repo/org';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orgs = await listUserOrgs(user.id);
  return NextResponse.json({ orgs });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  try {
    const org = await createOrg(body.name, body.slug, user.id);
    return NextResponse.json({ org });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
