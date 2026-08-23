import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, isSessionUser } from '@/lib/auth';
import { createAdminClient } from '@/lib/supabase/admin';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH update a team member's role — admin only.
export async function PATCH(request: Request, { params }: RouteParams) {
  const userOrResponse = await requireAdmin();
  if (!isSessionUser(userOrResponse)) return userOrResponse;
  const currentUser = userOrResponse;

  const { id } = await params;

  try {
    const body = await request.json();
    const role = body.role;
    if (role !== 'ADMIN' && role !== 'SELLER') {
      return NextResponse.json({ error: 'Role must be ADMIN or SELLER.' }, { status: 400 });
    }

    if (id === currentUser.id && role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'You cannot remove your own Admin access.' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { error: authError } = await admin.auth.admin.updateUserById(id, {
      app_metadata: { role },
    });
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json({ error: 'Failed to update team member.' }, { status: 500 });
  }
}
