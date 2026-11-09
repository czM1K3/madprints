"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";

type Toast = {
  id: number;
  title: string;
  message?: string;
  variant: "success" | "error";
};

type Notify = (toast: Omit<Toast, "id" | "variant"> & { variant?: Toast["variant"] }) => void;

const ToastContext = createContext<Notify>(() => undefined);

export const useToast = () => useContext(ToastContext);

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const notify = useCallback<Notify>(
    ({ variant = "success", ...rest }) => {
      const id = nextId.current++;
      setToasts((t) => [...t, { id, variant, ...rest }]);
      setTimeout(() => dismiss(id), variant === "error" ? 10000 : 6000);
    },
    [dismiss],
  );

  const value = useMemo(() => notify, [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toasts" aria-label="Notifications">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast ${t.variant === "error" ? "error" : ""}`}
            role={t.variant === "error" ? "alert" : "status"}
          >
            <div>
              <strong>{t.title}</strong>
              {t.message && <div>{t.message}</div>}
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-small"
              onClick={() => dismiss(t.id)}
              aria-label={`Dismiss: ${t.title}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
