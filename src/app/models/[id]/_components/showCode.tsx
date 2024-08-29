import React, { type FC, Fragment, useState } from "react";
import { Button, Modal } from "@mantine/core";
import Editor from "~/app/_components/common/editor";
import { useColorScheme } from "@mantine/hooks";

type ShowCodeProps = {
  code: string;
};

export const ShowCode: FC<ShowCodeProps> = ({ code }) => {
  const [show, setShow] = useState(false);
  const colorScheme = useColorScheme();

  return (
    <Fragment>
      <Button onClick={() => setShow(true)}>Show code</Button>
      <Modal opened={show} onClose={() => setShow(false)} title="Source code" size="xl">
        <Editor
          code={code}
          colorScheme={colorScheme}
          langauge="openscad"
          height="70vh"
          readOnly
        />
      </Modal>
    </Fragment>
  );
};
