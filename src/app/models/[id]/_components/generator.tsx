"use client";
import { Accordion, AccordionControl, AccordionItem, AccordionPanel, Button, Center, Container, Group, LoadingOverlay, Paper, Text } from "@mantine/core";
import React, { useEffect, useState, type FC } from "react";
import { StlViewer } from "react-stl-viewer";

type ModelGeneratorProps = {
  iterations: {
    id: string;
    number: number;
    code: string;
    created_at: Date;
  }[];
};

type GeneratorOutput = {
  data: Uint8Array | null;
  outputs: string[];
};

declare global {
  interface Window {
    openscad?: Worker;
  }
}

const ModelGenerator: FC<ModelGeneratorProps> = ({ iterations }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<string[]>([]);

  useEffect(() => {
    if (window.openscad) {
      window.openscad.onmessage = (message: MessageEvent<GeneratorOutput>) => {
        const blob = message.data.data !== null ? new Blob([message.data.data], { type: "application/octet-stream" }) : null;
        setModelUrl(blob !== null ? URL.createObjectURL(blob) : null);
        setOutputs(message.data.outputs);
        setIsLoading(false);
      };
    }
  }, []);

  const generate = (iterationId: string) => {
    const iteration = iterations.filter((i) => i.id === iterationId)[0];
    if (iteration && window.openscad) {
      setIsLoading(true);
      window.openscad.postMessage(iteration.code);
    } else {
      console.log("Something is wrong");
    }
  }

  const download = () => {
    if (modelUrl) {
      const link = document.createElement('a');
      link.href = modelUrl;
      link.download = `model.stl`;
      document.body.append(link);
      link.click();
      link.remove();
    }
  }

  return (
    <Paper shadow="xs" p="sm" m="md" pos="relative">
      <Accordion chevronPosition="right" variant="contained" defaultValue={iterations[0]?.id}>
        {iterations.map((iteration) => (
          <AccordionItem value={iteration.id} key={iteration.id}>
            <AccordionControl>
              <Group wrap="nowrap">
                <div>
                  <Text>Version {iteration.number}</Text>
                  <Text size="sm" c="dimmed" fw={400}>
                    {iteration.created_at.toLocaleString("en-us")}
                  </Text>
                </div>
              </Group>
            </AccordionControl>
            <AccordionPanel>
              <Button
                onClick={() => {
                  generate(iteration.id);
                }}
              >Generate</Button>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <Container
        h="50vh"
        w="100%"
        p="0"
        pos="relative"
        bd="1px solid lightgray"
        mt="0.4rem"
        style={{
          borderRadius: "0.4rem",
        }}
      >
        {modelUrl ? (
          <StlViewer
            style={{
              height: "100%",
              width: "100%",
            }}
            orbitControls
            shadows
            url={modelUrl}
          />) : (
            <Center h="100%">
              <Text>Model is not yet generated</Text>
            </Center>
          )}
        <Button
          pos="absolute"
          right="0"
          bottom="0"
          m="1rem"
          onClick={() => download()}
        >Download</Button>
      </Container>
      <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
    </Paper>
  );
}

export default ModelGenerator;
