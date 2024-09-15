"use client";

import { Center, Loader } from "@mantine/core";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./editorClient"), {
  ssr: false,
  loading: (_props) => {
    return (
      <Center m="xl">
        <Loader />
      </Center>
    );
  },
});

export default Editor;
