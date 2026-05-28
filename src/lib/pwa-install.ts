/** PWA kurulum olayı — sayfa yüklenmeden önce yakalanır (layout inline script). */

export type DeferredInstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type PwaWindow = Window & {
  __deferredPwaInstall?: DeferredInstallPrompt | null;
  __pwaInstallListeners?: Array<(ev: DeferredInstallPrompt) => void>;
};

function pwaWin(): PwaWindow {
  return window as PwaWindow;
}

export function getDeferredInstallPrompt(): DeferredInstallPrompt | null {
  if (typeof window === "undefined") return null;
  return pwaWin().__deferredPwaInstall ?? null;
}

export function subscribeDeferredInstall(onReady: (ev: DeferredInstallPrompt) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const w = pwaWin();
  const existing = w.__deferredPwaInstall;
  if (existing) {
    onReady(existing);
    return () => {};
  }

  w.__pwaInstallListeners = w.__pwaInstallListeners ?? [];
  w.__pwaInstallListeners.push(onReady);

  return () => {
    w.__pwaInstallListeners = w.__pwaInstallListeners?.filter((fn) => fn !== onReady);
  };
}

export async function triggerInstallPrompt(): Promise<"accepted" | "dismissed" | "unavailable"> {
  const ev = getDeferredInstallPrompt();
  if (!ev) return "unavailable";
  await ev.prompt();
  const choice = await ev.userChoice;
  if (choice.outcome === "accepted") {
    pwaWin().__deferredPwaInstall = null;
  }
  return choice.outcome;
}

export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (navigator as any).standalone === true
  );
}

export function isAndroidInAppBrowser(ua: string): boolean {
  return /Android/i.test(ua) && /WhatsApp|Instagram|FBAN|FBAV|Line\/|Telegram|Twitter/i.test(ua);
}

export function isAndroidChrome(ua: string): boolean {
  return /Android/i.test(ua) && /Chrome/i.test(ua) && !/EdgA|OPR|SamsungBrowser|MiuiBrowser/i.test(ua);
}

/** Layout’ta inline script ile erken kayıt — burada yalnızca yedek. */
export function registerServiceWorkerEarly(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
}
