import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { UserProvider } from '@/lib/user-context';
import Sidebar from '@/components/Sidebar';
import InstallPrompt from '@/components/InstallPrompt';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense in depth: middleware.ts already redirects unauthenticated
  // requests before they reach this layout, but we never rely on that
  // alone for a security boundary — verify the session again here.
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <UserProvider user={user}>
      <Sidebar />
      <div className="lg:pl-64 pt-16 lg:pt-0 min-h-screen transition-all">
        <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">{children}</main>
      </div>
      <InstallPrompt />
    </UserProvider>
  );
}
