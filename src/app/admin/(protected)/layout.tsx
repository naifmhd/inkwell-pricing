import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { signOut } from '@/lib/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  let session;
  try {
    session = await auth();
  } catch {
    redirect('/admin/login');
  }
  if (!session?.user) redirect('/admin/login');

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-zinc-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-zinc-700">
          <p className="font-bold text-lg">Admin Panel</p>
          <p className="text-xs text-zinc-400 mt-0.5">{session.user?.name}</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { href: '/admin/materials', label: 'Materials' },
            { href: '/admin/addons',    label: 'Add-ons' },
            { href: '/admin/config',    label: 'Pricing Config' },
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-zinc-700">
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/admin/login' }); }}>
            <button className="w-full rounded-lg px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors text-left">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 bg-zinc-50">
        <div className="mx-auto max-w-4xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
