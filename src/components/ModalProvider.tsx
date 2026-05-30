"use client";

import * as React from "react";
import { X, CheckCircle, AlertTriangle, Info, Trash2 } from "lucide-react";

type ModalType = "alert" | "confirm";

type ModalState = {
  open: boolean;
  type: ModalType;
  title: string;
  message: string;
  variant: "success" | "error" | "warning" | "info";
  confirmLabel?: string;
  cancelLabel?: string;
  resolve?: (value: boolean) => void;
};

const initialState: ModalState = {
  open: false,
  type: "alert",
  title: "",
  message: "",
  variant: "info",
};

const ModalContext = React.createContext<{
  showAlert: (opts: { title?: string; message: string; variant?: ModalState["variant"] }) => Promise<void>;
  showConfirm: (opts: {
    title?: string;
    message: string;
    variant?: ModalState["variant"];
    confirmLabel?: string;
    cancelLabel?: string;
  }) => Promise<boolean>;
}>({
  showAlert: async () => {},
  showConfirm: async () => false,
});

export function useAlert() {
  return React.useContext(ModalContext).showAlert;
}

export function useConfirm() {
  return React.useContext(ModalContext).showConfirm;
}

const VARIANT_CONFIG = {
  success: {
    icon: CheckCircle,
    iconClass: "text-emerald-500",
    bgClass: "bg-emerald-50 dark:bg-emerald-500/10",
    btnClass: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
  },
  error: {
    icon: AlertTriangle,
    iconClass: "text-red-500",
    bgClass: "bg-red-50 dark:bg-red-500/10",
    btnClass: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    bgClass: "bg-amber-50 dark:bg-amber-500/10",
    btnClass: "bg-amber-600 hover:bg-amber-700 focus:ring-amber-500",
  },
  info: {
    icon: Info,
    iconClass: "text-indigo-500",
    bgClass: "bg-indigo-50 dark:bg-indigo-500/10",
    btnClass: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
  },
};

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ModalState>(initialState);

  const showAlert = React.useCallback(
    (opts: { title?: string; message: string; variant?: ModalState["variant"] }) =>
      new Promise<void>((resolve) => {
        setState({
          open: true,
          type: "alert",
          title: opts.title ?? "Bilgi",
          message: opts.message,
          variant: opts.variant ?? "info",
          resolve: () => resolve(),
        });
      }),
    [],
  );

  const showConfirm = React.useCallback(
    (opts: {
      title?: string;
      message: string;
      variant?: ModalState["variant"];
      confirmLabel?: string;
      cancelLabel?: string;
    }) =>
      new Promise<boolean>((resolve) => {
        setState({
          open: true,
          type: "confirm",
          title: opts.title ?? "Onay",
          message: opts.message,
          variant: opts.variant ?? "warning",
          confirmLabel: opts.confirmLabel,
          cancelLabel: opts.cancelLabel,
          resolve,
        });
      }),
    [],
  );

  const close = (value: boolean) => {
    state.resolve?.(value);
    setState(initialState);
  };

  const handleKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (!state.open) return;
      if (e.key === "Escape") close(state.type === "alert" ? true : false);
      if (e.key === "Enter" && state.type === "confirm") close(true);
    },
    [state.open, state.type],
  );

  React.useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    if (state.open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [state.open, handleKeyDown]);

  const config = VARIANT_CONFIG[state.variant];
  const Icon = config.icon;

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {state.open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => close(state.type === "alert" ? true : false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4 p-6 pb-0">
              <div className={`shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center ${config.bgClass}`}>
                <Icon className={`h-6 w-6 ${config.iconClass}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{state.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{state.message}</p>
              </div>
              <button
                type="button"
                onClick={() => close(true)}
                className="shrink-0 p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 pt-5">
              {state.type === "confirm" && (
                <button
                  type="button"
                  onClick={() => close(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400"
                >
                  {state.cancelLabel ?? "İptal"}
                </button>
              )}
              <button
                type="button"
                onClick={() => close(state.type === "alert" ? true : true)}
                className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors focus:outline-none focus:ring-2 ${config.btnClass}`}
              >
                {state.type === "confirm" ? (state.confirmLabel ?? "Onayla") : "Tamam"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
