import "~/styles/globals.css";
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { AppShell, AppShellHeader, AppShellMain, ColorSchemeScript, Container, Group, MantineProvider } from "@mantine/core";
import { theme } from "./_theme";
import Link from "next/link";
import { auth } from "~/server/auth";
import { headers } from "next/headers";
import { RightDrawer } from "./_components/drawer";
import { Notifications } from '@mantine/notifications';

export const metadata: Metadata = {
  title: "MadPrints",
  description: "3D model generation for the masses",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();
  const colorScheme = headers().get("sec-ch-prefers-color-scheme");
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript defaultColorScheme={colorScheme === "dark" ? "dark" : "light"} />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body className={GeistSans.className}>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Notifications position="top-right" />
          <TRPCReactProvider>
            <AppShell
              header={{ height: 60 }}
            >
              <AppShellHeader>
                <Group h="100%" px="md" justify="space-between">
                  <Link href="/">MadPrints</Link>
                  <RightDrawer session={session} />
                </Group>
              </AppShellHeader>
              <AppShellMain>
                <Container mt="lg">
                  {children}
                </Container>
              </AppShellMain>
            </AppShell>
          </TRPCReactProvider>
        </MantineProvider>
        <div dangerouslySetInnerHTML={{
          __html:'<script src="/worker-loader.js"></script>'
        }} />
      </body>
    </html>
  );
}
