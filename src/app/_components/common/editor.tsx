"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./editorClient"), {
  ssr: false,
  loading: () => (
    <div className="center" style={{ padding: "2rem" }} role="status">
      <div className="spinner" style={{ margin: "0 auto" }} />
      <span className="visually-hidden">Loading editor</span>
    </div>
  ),
});

export default Editor;
