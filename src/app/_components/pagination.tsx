"use client";

import { Pagination } from "@mantine/core";
import { useRouter } from "next/navigation";
import React, { type FC } from "react";

type ModelsPaginationProps = {
  currentPage: number;
  maxPages: number;
};

export const ModelsPagination: FC<ModelsPaginationProps> = ({ currentPage, maxPages }) => {
  const router = useRouter();
  return (
    <Pagination total={maxPages} value={currentPage} onChange={(v) => router.push(`/page/${v}`)} />
  )
};
