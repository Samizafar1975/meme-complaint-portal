import { EnrollmentWindowToggle } from "@/components/admin/EnrollmentWindowToggle";

export default function AdminOverviewPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-nixor-maroon">Admin Overview</h1>
      <EnrollmentWindowToggle />
    </div>
  );
}
