import "./globals.css";
import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import PageViewTracker from "@/components/PageViewTracker";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <PageViewTracker />
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}