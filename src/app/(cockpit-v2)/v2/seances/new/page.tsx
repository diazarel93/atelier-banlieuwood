import { SessionCreateWizard } from "@/components/v2/session-create-wizard";
import { BreadcrumbV2 } from "@/components/v2/breadcrumb";

export default function NewSeancePage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-6 py-8">
      <BreadcrumbV2 items={[
        { label: "Séances", href: "/v2/seances" },
        { label: "Nouvelle séance" },
      ]} />
      <div className="mt-6">
        <SessionCreateWizard />
      </div>
    </div>
  );
}
