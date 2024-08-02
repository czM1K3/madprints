import { Avatar, Paper, Text } from "@mantine/core";
import Link from "next/link";
import React, { type FC } from "react";

type UserInfoProps = {
  id: string;
  name: string | null;
  image: string | null;
};

export const UserInfo: FC<UserInfoProps> = ({ image, name, id }) => {
  return (
    <Link href={`/users/${id}`}>
      <Paper shadow="xs" p="sm" m="sm" pos="relative" display="inline-flex" style={{ alignItems: "center" }}>
        <Avatar src={image} name={name ?? "?"} m="0.2rem"></Avatar>
        <Text pl="0.5rem">{name ?? "Unknown"}</Text>
      </Paper>
    </Link>
  );
}
