import Link from "next/link";
import React, { type FC } from "react";

type UserInfoProps = {
  id: string;
  name: string | null;
  image: string | null;
};

export const UserInfo: FC<UserInfoProps> = ({ image, name, id }) => (
  <Link href={`/users/${id}`} className="row" style={{ display: "inline-flex", gap: "0.6rem", textDecoration: "none", color: "inherit" }}>
    {image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt="" width={36} height={36} style={{ borderRadius: "50%" }} />
    ) : (
      <span aria-hidden="true" className="badge" style={{ borderRadius: "50%", width: 36, height: 36, display: "grid", placeItems: "center" }}>
        {(name ?? "?").charAt(0).toUpperCase()}
      </span>
    )}
    <span>
      <span className="muted small">By </span>
      <strong>{name ?? "Unknown"}</strong>
    </span>
  </Link>
);
