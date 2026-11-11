import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user?.role !== "ADMIN") {
    redirect("/");
  }

  // ตัวเลขงานค้างบนเมนู
  const [ordersToDo, quotesPending] = await Promise.all([
    prisma.order.count({ where: { status: { in: ["WAITING_VERIFY", "PAID", "PREPARING"] } } }),
    prisma.quote.count({ where: { status: "PENDING" } }),
  ]);

  return (
    <AdminShell
      badges={{ ordersToDo, quotesPending }}
      userName={session.user?.name || session.user?.email || "แอดมิน"}
    >
      {children}
    </AdminShell>
  );
}
