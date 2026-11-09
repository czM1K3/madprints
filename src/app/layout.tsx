import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata, type Viewport } from "next";
import Link from "next/link";

import { TRPCReactProvider } from "~/trpc/react";
import { auth } from "~/server/auth";
import { ToastProvider } from "./_components/ui/toast";

export const metadata: Metadata = {
  title: { default: "MadPrints", template: "%s | MadPrints" },
  description: "3D model generation for the masses",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

// Zooming must stay enabled for accessibility.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        <a href="#main" className="skip-link">Skip to main content</a>
        <header className="site-header">
          <div className="container">
            <Link href="/" className="brand">
              <span className="logo" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" /><path d="m3 7 9 5 9-5M12 12v10" /></svg>
              </span>
              MadPrints
            </Link>
            <nav className="site-nav" aria-label="Main">
              <ul>
                {session ? (
                  <>
                    <li><Link href="/create" className="btn btn-small">Create model</Link></li>
                    <li>
                      <Link href={`/users/${session.user.id}`} className="btn btn-secondary btn-small">
                        {session.user.name ?? "My profile"}
                      </Link>
                    </li>
                    <li><Link href="/api/auth/signout" className="btn btn-secondary btn-small">Sign out</Link></li>
                  </>
                ) : (
                  <li><Link href="/api/auth/signin" className="btn btn-small">Sign in</Link></li>
                )}
              </ul>
            </nav>
          </div>
        </header>
        <ToastProvider>
          <TRPCReactProvider>
            <main id="main" className="container" tabIndex={-1}>
              {children}
            </main>
          </TRPCReactProvider>
        </ToastProvider>
        <div dangerouslySetInnerHTML={{
          __html: '<script src="/worker-loader.js"></script>',
        }} />
      </body>
    </html>
  );
}
