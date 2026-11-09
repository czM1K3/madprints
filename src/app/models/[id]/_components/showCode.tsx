"use client";

import React, { type FC, useState } from "react";
import { Modal } from "~/app/_components/ui/modal";
import Editor from "~/app/_components/common/editor";

type ShowCodeProps = {
  code: string;
};

export const ShowCode: FC<ShowCodeProps> = ({ code }) => {
  const [show, setShow] = useState(false);
  return (
    <>
      <button type="button" className="btn btn-secondary" onClick={() => setShow(true)}>Show code</button>
      <Modal open={show} onClose={() => setShow(false)} title="Source code" wide>
        <Editor code={code} langauge="openscad" label="OpenSCAD source code (read only)" height="65vh" readOnly />
      </Modal>
    </>
  );
};
