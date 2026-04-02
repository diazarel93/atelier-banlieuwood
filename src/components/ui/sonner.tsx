"use client";

import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-bw-teal" />,
        info: <InfoIcon className="size-4 text-bw-violet" />,
        warning: <TriangleAlertIcon className="size-4 text-bw-amber" />,
        error: <OctagonXIcon className="size-4 text-bw-danger" />,
        loading: <Loader2Icon className="size-4 animate-spin text-bw-primary" />,
      }}
      style={
        {
          "--normal-bg": "#15181F",
          "--normal-text": "#E8EAED",
          "--normal-border": "rgba(255,255,255,0.06)",
          "--border-radius": "0.75rem",
          "--success-bg": "#15181F",
          "--success-text": "var(--color-bw-teal)",
          "--success-border": "rgba(78,205,196,0.15)",
          "--error-bg": "#15181F",
          "--error-text": "#EF4444",
          "--error-border": "rgba(239,68,68,0.15)",
          "--warning-bg": "#15181F",
          "--warning-text": "#F59E0B",
          "--warning-border": "rgba(245,158,11,0.15)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
