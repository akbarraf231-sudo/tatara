import Sidebar from "@/components/admin/Sidebar";

export const metadata = {
  title: "Admin — Tatara Bakery",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      <Sidebar />
      <div className="flex-1 min-w-0 pb-20 md:pb-0">{children}</div>
    </div>
  );
}
