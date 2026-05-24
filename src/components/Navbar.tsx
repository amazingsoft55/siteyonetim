import { ThemeToggle } from "@/components/ThemeToggle";
import Image from "next/image";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/50 dark:border-zinc-800/50 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-6">
        <a href="/" className="flex items-center gap-2">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg shadow-sm overflow-hidden">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-cover" />
          </div>
          <span className="text-xl font-bold tracking-tight">Site Yönetimi</span>
        </a>
        <nav className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-6 mr-4 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            <a href="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Ana Sayfa</a>
            <a href="/hakkimizda" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Hakkımızda</a>
            <a href="/iletisim" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">İletişim</a>
          </div>
          <ThemeToggle />
          <a href="/login" className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-full shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Giriş Yap
          </a>
        </nav>
      </div>
    </header>
  );
}
