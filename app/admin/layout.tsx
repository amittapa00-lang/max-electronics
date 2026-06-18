import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(
    authOptions
  );

  if (!session) {
    redirect("/login");
  }

  if (
    (session.user as {
      role?: string;
    }).role !== "ADMIN"
  ) {
    redirect("/");
  }

  return (
    <>
      <AdminNavbar />
      {children}
    </>
  );
}