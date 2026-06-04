import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

const adsenseId =
  process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-XXXXXXXXXX";

export const metadata: Metadata = {
  title: {
    default: "JobHunt4U — AI-Powered Job Search & Resume Optimizer",
    template: "%s | JobHunt4U",
  },
  description:
    "JobHunt4U is your AI career copilot. Get instant ATS resume scores, match with thousands of jobs, auto-generate tailored cover letters, and ace interviews with AI-powered prep. Land your dream job faster.",
  keywords: [
    "AI job search",
    "ATS resume checker",
    "resume optimizer AI",
    "job application tracker",
    "AI career assistant",
    "resume ATS score",
    "smart job matching",
    "interview prep AI",
    "cover letter generator",
    "job hunt platform",
    "AI resume writer",
    "career copilot",
    "job search automation",
    "resume optimization",
    "ATS score checker free",
    "job tracker app",
    "AI powered recruiting",
    "skill gap analysis",
  ],
  authors: [{ name: "JobHunt4U" }],
  creator: "JobHunt4U",
  publisher: "JobHunt4U",
  metadataBase: new URL("https://www.jobhunt4u.com"),
  alternates: {
    canonical: "https://www.jobhunt4u.com",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.jobhunt4u.com",
    siteName: "JobHunt4U",
    title: "JobHunt4U — AI-Powered Job Search & Resume Optimizer",
    description:
      "Your AI career copilot. ATS resume scoring, smart job matching, cover letter generation, and interview prep — all in one platform.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "JobHunt4U — AI Career Copilot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JobHunt4U — AI-Powered Job Search & Resume Optimizer",
    description:
      "Your AI career copilot. ATS resume scoring, smart job matching, cover letter generation, and interview prep — all in one platform.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "google-adsense-account": adsenseId,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "JobHunt4U",
  applicationCategory: "BusinessApplication",
  description:
    "AI-powered job hunting platform with ATS resume scoring, smart job matching, cover letter generation, and interview preparation.",
  url: "https://www.jobhunt4u.com",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  featureList: [
    "ATS Resume Score Analysis",
    "AI Job Matching",
    "Resume Optimization",
    "Cover Letter Generation",
    "Interview Prep with AI",
    "Application Tracker",
    "Skill Gap Analysis",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-slate-950 text-white antialiased">
        {children}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
