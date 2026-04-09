import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-pretendard",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "설전 - 온라인 토론 플랫폼",
  description:
    "하나의 핵심 주제 아래 다양한 의견을 나누고, 공감/비공감 반응과 댓글로 토론을 이어가는 온라인 설전 플랫폼",
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={`${notoSansKR.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
