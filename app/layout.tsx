import type { Metadata } from "next";
import { Inter, Noto_Sans_KR } from "next/font/google"; // Corrected import
import "./globals.css";
import { cn } from "@/lib/utils";
import { GlobalModals } from "@/components/GlobalModals";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: 'swap',
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Haru Implant - 강남역 임플란트",
  description: "과잉진료 없는 정직한 진료, 하루플란트 치과",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" as="style" crossOrigin="" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" />
      </head>
      <body
        className={cn(
          "antialiased bg-background-light font-pretendard"
        )}
      >
        {children}
        <GlobalModals />
      </body>
    </html>
  );
}
