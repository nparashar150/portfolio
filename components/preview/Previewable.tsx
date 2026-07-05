"use client";

import type { MouseEvent, ReactNode } from "react";
import { preview, type PreviewKind } from "@/lib/preview";

export function Previewable({
  children,
  href,
  target,
  preview: src,
  label,
  kind = "image",
  embed,
  className,
}: {
  children: ReactNode;
  href?: string;
  target?: string;
  preview?: string;
  label?: string;
  kind?: PreviewKind;
  /* when true, the mini browser loads the live href instead of the screenshot */
  embed?: boolean;
  className?: string;
}) {
  const onEnter = (e: MouseEvent) => {
    if (kind === "image" && !src) return;
    preview.show({ kind, src, label, url: href, embed, x: e.clientX, y: e.clientY });
  };
  const onMove = (e: MouseEvent) => preview.move(e.clientX, e.clientY);
  const onLeave = () => preview.hide();

  const handlers = {
    onMouseEnter: onEnter,
    onMouseMove: onMove,
    onMouseLeave: onLeave,
  };

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={target === "_blank" ? "noreferrer" : undefined}
        className={className}
        {...handlers}
      >
        {children}
      </a>
    );
  }

  return (
    <span className={className} {...handlers}>
      {children}
    </span>
  );
}
