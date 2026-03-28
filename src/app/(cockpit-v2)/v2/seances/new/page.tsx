import { Suspense } from "react";
import { SessionCreateWizard } from "@/components/v2/session-create-wizard";
import { BreadcrumbV2 } from "@/components/v2/breadcrumb";

export default function NewSeancePage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 pt-16 lg:pt-8 pb-8">
      <BreadcrumbV2 items={[{ label: "Séances", href: "/v2/seances" }, { label: "Nouvelle séance" }]} />
      <div className="mt-6">
        <Suspense fallback={<div className="animate-pulse h-96 rounded-2xl bg-muted/30" />}>
          <SessionCreateWizard />
        </Suspense>
      </div>
    </div>
  );
}
