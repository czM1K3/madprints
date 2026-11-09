import React, { type Dispatch, type FC, type SetStateAction, useEffect } from "react";
import Monaco, { useMonaco } from "@monaco-editor/react";
import { conf, language } from "~/helpers/openscad-language";
import { useColorScheme } from "~/hooks/use-color-scheme";

type EditorProps = {
  code: string;
  setCode?: Dispatch<SetStateAction<string>>;
  langauge: "openscad" | "markdown";
  /** Accessible name announced by screen readers */
  label: string;
  height?: number | string | undefined;
  readOnly?: boolean;
};

const Editor: FC<EditorProps> = ({ code, setCode, langauge: lang, label, height, readOnly }) => {
  const monaco = useMonaco();
  const colorScheme = useColorScheme();
  useEffect(() => {
    if (!monaco || lang !== "openscad") return;
    if (monaco.languages.getLanguages().some((x) => x.id === "openscad")) return;
    monaco.languages.register({
      id: "openscad",
      extensions: [".scad"],
      mimetypes: ["text/openscad"],
    });
    monaco.languages.setLanguageConfiguration("openscad", conf);
    monaco.languages.setMonarchTokensProvider("openscad", language);
  }, [monaco, lang]);
  return (
    <div>
      <Monaco
        height={height}
        defaultLanguage={lang}
        value={code}
        onChange={setCode && ((e) => setCode(e ?? ""))}
        theme={colorScheme === "light" ? "light" : "vs-dark"}
        loading={<div className="spinner" role="status" aria-label="Loading editor" />}
        options={{
          readOnly,
          ariaLabel: label,
          minimap: { enabled: false },
          wordWrap: "on",
          scrollBeyondLastLine: false,
          accessibilitySupport: "auto",
        }}
      />
      {!readOnly && (
        <p className="hint small" style={{ marginTop: "0.25rem" }}>
          Keyboard users: press Ctrl+M (Cmd+Shift+M on Mac) to toggle whether Tab moves focus out of the editor.
        </p>
      )}
    </div>
  );
};

export default Editor;
