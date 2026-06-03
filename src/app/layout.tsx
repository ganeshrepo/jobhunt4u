import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobHunt4U — AI-Powered Job Hunting",
  description:
    "AI-powered platform to discover jobs, optimize resumes, improve ATS scores, and automate your job search.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white antialiased">{children}</body>
    </html>
  );
}
