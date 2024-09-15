import React, { type Dispatch, type FC, type SetStateAction, useEffect } from "react";
import Monaco, { useMonaco } from "@monaco-editor/react";
import { Loader } from "@mantine/core";
import { conf, language } from "~/helpers/openscad-language";

type EditorProps = {
  code: string;
  setCode?: Dispatch<SetStateAction<string>>;
  colorScheme: string;
  langauge: "openscad" | "markdown";
  height?: number | string | undefined;
  readOnly?: boolean;
};

const Editor: FC<EditorProps> = ({ code, colorScheme, setCode, langauge: lang, height, readOnly }) => {
  const monaco = useMonaco();
  useEffect(() => {
    if (!monaco || !window || lang !== "openscad") return;
    const languages = monaco.languages.getLanguages();
    const openscad = languages.find((x) => x.id === "openscad");
    if (openscad) return;
    monaco.languages.register({
      id: "openscad",
      extensions: [".scad"],
      mimetypes: ["text/openscad"],
    });
    monaco.languages.setLanguageConfiguration('openscad', conf);
    monaco.languages.setMonarchTokensProvider('openscad', language);
  }, [monaco, lang]);
  return (
    <Monaco
      height={height}
      defaultLanguage={lang}
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
