"use client";

import { Box, Burger, Drawer } from "@mantine/core";
import { type Session } from "next-auth";
import Link from "next/link";
import React, { useState, type FC } from "react";

type RightDrawerProps = {
  session: Session | null;
};

export const RightDrawer: FC<RightDrawerProps> = ({ session }) => {
  const [opened, setOpened] = useState(false);
  return (
    <Box>
      <Burger opened={opened} onClick={() => setOpened((v) => !v)} size="sm" />
      <Drawer opened={opened} onClose={() => setOpened(false)} title="Menu" position="right">
        <Box display="grid" onClick={(e) => {
          if (e.target !== e.currentTarget) {
            setOpened(false)
          }
        }}>
          {session ? (
            <>
              <Link href={`/users/${session.user.id}`}>Logged in as {session.user.name}</Link>
              <Link href="/create">Create new model</Link>
              <Link href="/api/auth/signout">Sign out</Link>
            </>
          ) : (
            <>
              <Link href="/api/auth/signin">Sign in</Link>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};
