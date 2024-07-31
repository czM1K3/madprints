"use client";

import { Box, Burger, Drawer, Button } from "@mantine/core";
import { type Session } from "next-auth";
import Link from "next/link";
import React, { useState, type FC } from "react";
import { IconCirclePlusFilled, IconLogin2, IconLogin } from '@tabler/icons-react';
import { UserInfo } from "../models/[id]/_components/user";

type RightDrawerProps = {
  session: Session | null;
};

export const RightDrawer: FC<RightDrawerProps> = ({ session }) => {
  const [opened, setOpened] = useState(false);
  return (
    <Box>
      <Burger opened={opened} onClick={() => setOpened((v) => !v)} size="sm" />
      <Drawer opened={opened} onClose={() => setOpened(false)} title="MadPrints" position="right">
        <Box display="grid" onClick={(e) => {
          if (e.target !== e.currentTarget) {
            setOpened(false)
          }
        }}>
          {session ? (
            <>
              <UserInfo image={session.user.image ?? null} name={session.user.name ?? null} id={session.user.id} />

              <Button component={Link} href="/create" mt="sm" justify="center" fullWidth variant="default" leftSection={<IconCirclePlusFilled size={18} />}>
                Create new model
              </Button>

              <Button component={Link} href="/api/auth/signout" mt="sm" justify="center" fullWidth variant="default" leftSection={<IconLogin2 size={18} />}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} href="/api/auth/signin" mt="sm" justify="center" fullWidth variant="default" leftSection={<IconLogin size={18} />}>
                Sign in
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </Box>
  );
};
