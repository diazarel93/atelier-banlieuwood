"use client";

import { useState, useCallback, useRef } from "react";

export interface ConfirmActionState<T = unknown> {
  /** Whether the confirm dialog is open */
  open: boolean;
  /** Title for the dialog */
  title: string;
  /** Description for the dialog */
  description: string;
  /** Label for the confirm button */
  confirmLabel: string;
  /** Variant for the confirm button */
  confirmVariant: "danger" | "default";
  /** Whether the action is pending */
  isPending: boolean;
  /** Close the dialog */
  onClose: () => void;
  /** Execute the pending action */
  onConfirm: () => void;
  /** Request confirmation before executing an action */
  requestConfirm: (config: ConfirmConfig<T>) => void;
}

interface ConfirmConfig<T = unknown> {
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "default";
  action: () => void | Promise<void>;
  data?: T;
}

/**
 * Hook to standardize confirmation dialogs for destructive actions.
 *
 * Usage:
 * ```tsx
 * const confirm = useConfirmAction();
 * confirm.requestConfirm({
 *   title: "Retirer l'élève ?",
 *   description: "L'élève sera retiré de la séance.",
 *   confirmLabel: "Retirer",
 *   confirmVariant: "danger",
 *   action: () => removeStudent.mutate(studentId),
 * });
 * // Render <ConfirmModal {...confirm} /> in JSX
 * ```
 */
export function useConfirmAction<T = unknown>(): ConfirmActionState<T> {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    confirmVariant: "danger" | "default";
    action: (() => void | Promise<void>) | null;
    isPending: boolean;
  }>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "Confirmer",
    confirmVariant: "default",
    action: null,
    isPending: false,
  });

  const actionRef = useRef<(() => void | Promise<void>) | null>(null);

  const requestConfirm = useCallback((config: ConfirmConfig<T>) => {
    actionRef.current = config.action;
    setState({
      open: true,
      title: config.title,
      description: config.description,
      confirmLabel: config.confirmLabel || "Confirmer",
      confirmVariant: config.confirmVariant || "default",
      action: config.action,
      isPending: false,
    });
  }, []);

  const onClose = useCallback(() => {
    actionRef.current = null;
    setState((s) => ({ ...s, open: false, action: null }));
  }, []);

  const onConfirm = useCallback(async () => {
    const action = actionRef.current;
    if (!action) return;
    setState((s) => ({ ...s, isPending: true }));
    try {
      await action();
      actionRef.current = null;
      setState((s) => ({ ...s, open: false, action: null, isPending: false }));
    } catch {
      // Keep dialog open on error so user can retry
      setState((s) => ({ ...s, isPending: false }));
    }
  }, []);

  return {
    open: state.open,
    title: state.title,
    description: state.description,
    confirmLabel: state.confirmLabel,
    confirmVariant: state.confirmVariant,
    isPending: state.isPending,
    onClose,
    onConfirm,
    requestConfirm,
  };
}
