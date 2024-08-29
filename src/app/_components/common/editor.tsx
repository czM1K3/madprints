import React, { type Dispatch, type FC, type SetStateAction } from "react";
import Monaco from "@monaco-editor/react";
import { Loader } from "@mantine/core";

type EditorProps = {
  code: string;
  setCode?: Dispatch<SetStateAction<string>>;
  colorScheme: string;
  langauge: "openscad" | "markdown";
  height?: number | string | undefined;
  readOnly?: boolean;
};

const Editor: FC<EditorProps> = ({ code, colorScheme, setCode, langauge, height, readOnly }) => {
  return (
    <Monaco
      height={height}
      defaultLanguage={langauge}
      value={code}
      onChange={setCode && ((e) => e && setCode(e))}
      theme={colorScheme === "light" ? "light" : "vs-dark"}
      loading={<Loader />}
      options={{
        readOnly,
      }}
    />
  );
};

export default Editor;
