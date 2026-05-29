import Link from "next/link";
import { Building2, Mail, Phone, MapPin, Heart } from "lucide-react";

const footerLinks = {
  platform: {
    title: "Platform",
    links: [
      { href: "/destek", label: "Destek" },
      { href: "/hakkimizda", label: "Hakkımızda" },
      { href: "/iletisim", label: "İletişim" },
    ],
  },
  hesap: {
    title: "Hesap",
    links: [
      { href: "/login", label: "Giriş Yap" },
      { href: "/sifre-sifirla", label: "Şifremi Unuttum" },
    ],
  },
  yasal: {
    title: "Yasal",
    links: [
      { href: "/gizlilik", label: "Gizlilik Politikası" },
      { href: "/kullanim-sartlari", label: "Kullanım Şartları" },
    ],
  },
};

export function Footer() {
  const y = new Date().getFullYear();
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Marka */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
                Site Yönetimi
              </span>
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
              Türkiye&apos;nin modern apartman ve site yönetim platformu. Sakinler ve yöneticiler için tek çözüm.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Mail className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                <span>destek@siteyonetimi.app</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <Phone className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                <span>+90 (212) 000 00 00</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                <span>İstanbul, Türkiye</span>
              </div>
            </div>
          </div>

          {/* Link kolonları */}
          {Object.values(footerLinks).map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-extrabold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest mb-4">
                {col.title}
              </h3>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Alt çizgi */}
        <div className="mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            © {y} Site Yönetimi. Tüm hakları saklıdır.
          </p>
          <p className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
            Türkiye&apos;de <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> ile yapıldı
          </p>
        </div>
      </div>
    </footer>
  );
}
