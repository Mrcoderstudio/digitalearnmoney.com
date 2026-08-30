import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin Panel - Digital Earn Money",
  description: "Admin dashboard for Digital Earn Money platform",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "admin") {
    redirect("/login");
  }

  return (
    <AdminShell username={session.user.username || "Admin"}>
      {children}
    </AdminShell>
  );
}