import Link from 'next/link';
import { QuoteProvider } from '@/components/quote/QuoteContext';

export default function QuoteLayout({ children }: { children: React.ReactNode }) {
  return (
    <QuoteProvider>
      <div className="min-h-screen bg-zinc-50">
        <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-zinc-900">Inkwell</h1>
          <Link href="/admin" className="text-sm text-zinc-400 hover:text-zinc-700 transition-colors">
            Admin →
          </Link>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      </div>
    </QuoteProvider>
  );
}
