import Link from "next/link";

export function Footer() {
  const y = new Date().getFullYear();
  return (
    <footer className="py-10 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-500 dark:text-zinc-400">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-center sm:text-left">© {y} Site Yönetimi. Tüm hakları saklıdır.</p>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-medium">
          <Link href="/destek" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Destek
          </Link>
          <Link href="/hakkimizda" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Hakkımızda
          </Link>
          <Link href="/iletisim" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            İletişim
          </Link>
          <Link href="/login" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
            Giriş
          </Link>
        </nav>
      </div>
    </footer>
  );
}
