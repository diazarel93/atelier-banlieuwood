"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Copy, Check, Users, MessageSquare, Trash2 } from "lucide-react";
import { LedIndicator } from "@/components/ui/led-indicator";
import type { DashboardClass } from "@/lib/models/dashboard";
import type { LiveSnapshot } from "@/hooks/use-dashboard";

export function ClassHeader({
  cls,
  stats,
  onSendMessage,
  onDeleteClass,
  isDeleting,
}: {
  cls: DashboardClass;
  stats?: LiveSnapshot["stats"];
  onSendMessage: () => void;
  onDeleteClass?: () => void;
  isDeleting?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(cls.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {cls.name}
            {stats && stats.activeCount > 0 && (
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <LedIndicator status="active" />
                {stats.activeCount}
              </span>
            )}
          </h2>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={copyCode}
              className="flex items-center gap-1.5 text-sm font-mono bg-muted px-2.5 py-1 rounded-lg hover:bg-muted/80 transition-colors"
            >
              <span className="font-bold tracking-widest">{cls.joinCode}</span>
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
            {stats && (
              <>
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  {stats.totalStudents} \u00e9l\u00e8ve{stats.totalStudents !== 1 ? "s" : ""}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  {stats.activeCount} actif{stats.activeCount !== 1 ? "s" : ""}
                </Badge>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onSendMessage}>
          <MessageSquare className="h-4 w-4 mr-2" />
          Message \u00e0 la classe
        </Button>
        {onDeleteClass && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="text-muted-foreground hover:text-red-500 hover:border-red-500"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer &laquo; {cls.name} &raquo; ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Tous les \u00e9l\u00e8ves, sessions, messages et annotations seront supprim\u00e9s. Cette action est irr\u00e9versible.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-700"
                  onClick={onDeleteClass}
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
