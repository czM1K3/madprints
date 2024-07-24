import React, { type FC, Fragment, useState } from "react";
import { Button, Code, Modal } from "@mantine/core";

type ShowCodeProps = {
  code: string;
};

export const ShowCode: FC<ShowCodeProps> = ({ code }) => {
  const [show, setShow] = useState(false);

  return (
    <Fragment>
      <Button onClick={() => setShow(true)}>Show code</Button>
      <Modal opened={show} onClose={() => setShow(false)} title="Source code">
        <Code block>{code}</Code>
      </Modal>
    </Fragment>
  );
};
