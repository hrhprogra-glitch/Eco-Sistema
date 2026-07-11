"use client";

import { useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import styles from "./FloatingWindow.module.css";

export function FloatingWindow({
  title,
  onClose,
  children,
  width = 640,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  function handleTitleMouseDown(event: React.MouseEvent) {
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
    };

    function handleMouseMove(moveEvent: MouseEvent) {
      if (!dragRef.current) return;
      setOffset({
        x: dragRef.current.originX + (moveEvent.clientX - dragRef.current.startX),
        y: dragRef.current.originY + (moveEvent.clientY - dragRef.current.startY),
      });
    }

    function handleMouseUp() {
      dragRef.current = null;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  return (
    <div
      className={styles.window}
      style={{
        width,
        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
      }}
      role="dialog"
      aria-modal="false"
      aria-label={title}
    >
      <div className={styles.titleBar} onMouseDown={handleTitleMouseDown}>
        <span className={styles.titleText}>{title}</span>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Cerrar">
          <X size={14} />
        </button>
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
