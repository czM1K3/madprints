"use client";
import { Accordion, AccordionControl, AccordionItem, AccordionPanel, Box, Button, Center, Code, Container, Group, LoadingOverlay, Modal, Paper, Text, Title } from "@mantine/core";
import React, { useEffect, useState, type FC } from "react";
import { StlViewer } from "react-stl-viewer";
import { ParameterInputField, ParameterType, type ParameterInput } from "./input";

type ModelGeneratorProps = {
  iterations: {
    id: string;
    number: number;
    code: string;
    created_at: Date;
    parameters: ParameterInput[];
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
  const [showOutputs, setShowOutputs] = useState(false);
  const [parameters, setParameters] = useState<Record<string, string>>({});

  useEffect(() => {
    if (window.openscad) {
      window.openscad.onmessage = (message: MessageEvent<GeneratorOutput>) => {
        setOutputs(message.data.outputs);
        setIsLoading(false);
        if (message.data.data) {
          const blob = new Blob([message.data.data], { type: "application/octet-stream" });
          setModelUrl(URL.createObjectURL(blob));
        } else {
          setModelUrl(null);
          setShowOutputs(true);
        }
      };
    }
    iterationChange(iterations[0]?.id ?? null);
  }, []);

  const iterationChange = (id: string | null) => {
    const matchingIterations = iterations.find((iteration) => iteration.id === id);
    if (matchingIterations) {
      const arr = matchingIterations.parameters.map((parameter) => ({ [parameter.name]: parameter.default_value }));
      const obj = Object.fromEntries(arr.flatMap(Object.entries));
      setParameters(obj);
    }
  }

  const parameterChange = (parameterName: string, value: string) => {
    console.log(value);
    setParameters((parameters) => {
      const obj = { ...parameters };
      obj[parameterName] = value;
      return obj;
    });
  }

  const generate = (iterationId: string) => {
    const iteration = iterations.filter((i) => i.id === iterationId)[0];
    if (iteration && window.openscad) {
      const arr: string[] = [];
      Object.entries(parameters).forEach(([key, value]) => {
        arr.push("-D");
        const valueEdited = (() => {
          const parameter = iteration.parameters.find((parameter) => parameter.name === key);
          if (!parameter) return "error";
          switch (parameter.datatype) {
            case "Number":
              return value;
            case "Boolean":
              return value === "true" ? "true" : "false";
            case "String":
              return `"${value}"`;
            default:
              return "error";
          }
        })()
        arr.push(`${key}=${valueEdited}`);
      });
      console.log(arr);
      setIsLoading(true);
      window.openscad.postMessage({
        code : iteration.code,
        parameters: arr,
      });
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
      <Accordion chevronPosition="right" variant="contained" defaultValue={iterations[0]?.id} onChange={iterationChange}>
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
              {(iteration.parameters.length > 0) && (
                <Paper m="1rem 0" p="1rem 0.5rem">
                  <Title>Parameters</Title>
                  {iteration.parameters.map((parameter) => (
                    <ParameterInputField
                      key={parameter.id}
                      input={parameter}
                      value={parameters[parameter.name] ?? ""}
                      onChange={(value) => parameterChange(parameter.name, value)}
                    />
                  ))}
                  <Button
                    m="1rem 0 0"
                    onClick={() => {
                      iterationChange(iteration.id);
                    }}
                  >Reset default values</Button>
                  {/* {JSON.stringify(parameters)} */}
                </Paper>
              )}
              <Button
                m="0.2rem"
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
        <Box
          pos="absolute"
          right="0"
          bottom="0"
          p=""
        >
        <Button
            onClick={() => setShowOutputs(true)}
            disabled={outputs.length === 0}
          >Show logs</Button>
        <Button
            m="1rem"
            onClick={() => download()}
            disabled={!modelUrl}
          >Download</Button>
        </Box>
      </Container>
      <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
      <Modal opened={showOutputs} onClose={() => setShowOutputs(false)} title="Logs">
        <Code block>{outputs.join("\n")}</Code>
      </Modal>
    </Paper>
  );
}

export default ModelGenerator;
