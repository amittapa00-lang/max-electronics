import "./globals.css";
import { IBM_Plex_Sans_Thai } from "next/font/google";
import Navbar from "@/components/Navbar";
import SiteFooter from "@/components/SiteFooter";
import Providers from "@/components/Providers";
import PageViewTracker from "@/components/PageViewTracker";

const thaiFont = IBM_Plex_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-thai",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={thaiFont.variable}>
      <body className="min-h-screen flex flex-col">
        <PageViewTracker />
        <Providers>
          <Navbar />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
