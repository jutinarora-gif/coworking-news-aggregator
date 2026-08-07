import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

export function RouteProgress() {
  const isPending = useRouterState({ select: (s) => s.status === "pending" });
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isPending) {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      setVisible(true);
      setWidth(15);
      timerRef.current = setInterval(() => {
        setWidth((w) => (w < 85 ? w + (85 - w) * 0.1 : w));
      }, 150);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setWidth(100);
      hideTimeoutRef.current = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 300);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPending]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[3px] bg-transparent">
      <div
        className="h-full bg-flare transition-[width,opacity] duration-300 ease-out shadow-[0_0_8px_var(--flare)]"
        style={{ width: `${width}%`, opacity: width === 100 ? 0 : 1 }}
      />
    </div>
  );
}
