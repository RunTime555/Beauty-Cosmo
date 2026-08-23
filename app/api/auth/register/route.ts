import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const name = typeof body.name === 'string' ? body.name.trim() : null;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required.' }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    let admin;
    try {
      admin = createAdminClient();
    } catch {
      return NextResponse.json(
        { error: 'Server authentication is not configured yet.' },
        { status: 500 }
      );
    }

    // First account in the system becomes the shop Admin. Everyone after
    // that is a Seller by default and can be promoted from Settings.
    const existingUserCount = await prisma.user.count();
    const role: 'ADMIN' | 'SELLER' = existingUserCount === 0 ? 'ADMIN' : 'SELLER';

    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: { role },
      user_metadata: { name },
    });

    if (error || !data.user) {
      const message =
        error?.message?.toLowerCase().includes('already') || error?.status === 422
          ? 'An account with that email already exists.'
          : error?.message || 'Failed to create account.';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    try {
      await prisma.user.create({
        data: { id: data.user.id, email, name, role },
      });
    } catch (dbError) {
      // Roll back the auth user so we don't end up with an orphaned login
      // that has no matching profile/role record.
      console.error('Failed to create mirrored user row, rolling back auth user:', dbError);
      await admin.auth.admin.deleteUser(data.user.id).catch(() => {});
      return NextResponse.json(
        { error: 'Failed to finish creating your account. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, role }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Registration failed.' }, { status: 500 });
  }
}
