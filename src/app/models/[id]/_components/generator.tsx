"use client";
import { Accordion, AccordionControl, AccordionItem, AccordionPanel, Box, Button, Card, Center, Code, Flex, Group, Loader, LoadingOverlay, Modal, Paper, Text, Title, Tooltip } from "@mantine/core";
import React, { type Dispatch, type  SetStateAction, useEffect, useState, type FC } from "react";
import { StlViewer } from "react-stl-viewer";
import { ParameterInputField, type ParameterInput } from "./input";
import { ShowCode } from "./showCode";
import { useColorScheme } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { msToString } from "~/helpers/time";

type Iteration = {
  id: string;
  number?: number;
  code: string;
  created_at: Date;
  time_to_generate: number | null;
  parameters: ParameterInput[];
};

type ModelGeneratorProps = {
  iterations: Iteration[];
  createScreenshot?: () => Promise<void>;
  setTimeToGenerate?: Dispatch<SetStateAction<number | null>>;
};

type GeneratorOutput = {
  data: Uint8Array | null;
  outputs: string[];
  time: number | null;
};

declare global {
  interface Window {
    openscad?: Worker;
  }
}

const getIterationDefaultParams = (iteration: Iteration) => {
  const arr = iteration.parameters.map((parameter) => ({ [parameter.name]: parameter.default_value }));
  const obj = Object.fromEntries(arr.flatMap(Object.entries));
  return obj;
}

export const ModelGenerator: FC<ModelGeneratorProps> = ({ iterations, createScreenshot, setTimeToGenerate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [outputs, setOutputs] = useState<string[]>([]);
  const [showOutputs, setShowOutputs] = useState(false);
  const [time, setTime] = useState<number | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [parameters, setParameters] = useState<Record<string, string>>(getIterationDefaultParams(iterations[0]!));
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (window.openscad) {
      window.openscad.onmessage = (message: MessageEvent<GeneratorOutput>) => {
        setOutputs(message.data.outputs);
        setIsLoading(false);
        setTime(message.data.time);
        if (message.data.data) {
          const blob = new Blob([message.data.data], { type: "application/octet-stream" });
          setModelUrl(URL.createObjectURL(blob));
        } else {
          setModelUrl(null);
          notifications.show({
            title: "Failed to generate",
            message: "Model failed to generate, check logs",
            color: "red",
          });
          setShowOutputs(true);
        }
      };
    }
  }, []);

  useEffect(() => {
    if (iterations.length >= 1) {
      setParameters(getIterationDefaultParams(iterations[0]!));
    }
  }, [iterations]);

  useEffect(() => {
    if (setTimeToGenerate) {
      setTimeToGenerate(time);
    }
  }, [time, setTimeToGenerate]);

  const iterationChange = (id: string | null) => {
    const matchingIteration = iterations.find((iteration) => iteration.id === id);
    if (matchingIteration) {
      setParameters(getIterationDefaultParams(matchingIteration));
    }
  }

  const parameterChange = (parameterName: string, value: string) => {
    setParameters((parameters) => {
      const obj = { ...parameters };
      obj[parameterName] = value;
      return obj;
    });
  }

  const generate = (iterationId: string) => {
    const iteration = iterations.find((i) => i.id === iterationId);
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
              return `"${value.replaceAll('"', '\\"')}"`;
            default:
              return "error";
          }
        })()
        arr.push(`${key}=${valueEdited}`);
      });
      setIsLoading(true);
      setEstimatedTime(iteration.time_to_generate);
      window.openscad.postMessage({
        code : iteration.code,
        parameters: arr,
      });
    } else {
      console.error("Something is wrong");
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
    <Card shadow="sm" withBorder p="sm" mt="" mb="" pos="relative">
      <Accordion chevronPosition="right" variant="contained" defaultValue={iterations[0]?.id} onChange={iterationChange}>
        {iterations.map((iteration) => (
          <AccordionItem value={iteration.id} key={iteration.id}>
            <AccordionControl>
              <Group wrap="nowrap">
                <div>
                  <Text>Version {iteration.number ?? "Preview"}</Text>
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
              <Tooltip label={`Estimated time to generate: ${msToString(iteration.time_to_generate ?? 0)}`} disabled={!iteration.time_to_generate}>
                <Button
                  m="0.2rem"
                  onClick={() => {
                    generate(iteration.id);
                  }}
                >Generate</Button>
              </Tooltip>
              <ShowCode code={iteration.code} />
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
      <Paper
        h="50vh"
        w="100%"
        p="0"
        pos="relative"
        bd={`1px solid ${colorScheme === "light" ? "var(--mantine-color-gray-3)" : "var(--mantine-color-dark-4)"}`}
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
        {createScreenshot ? (
          <Button
            onClick={() => createScreenshot()}
            disabled={!modelUrl}
          >Create screenshot</Button>
        ) : (<></>)}
        <Button
          m="1rem"
          onClick={() => setShowOutputs(true)}
          disabled={outputs.length === 0}
        >Show logs</Button>
        <Button
            mr="1rem"
            onClick={() => download()}
            disabled={!modelUrl}
          >Download</Button>
        </Box>
      </Paper>
      <LoadingOverlay
        visible={isLoading}
        zIndex={99}
        overlayProps={{ radius: "sm", blur: 2 }}
        loaderProps={{ children: (
          <Flex direction="column" align="center" gap="lg">
            <Loader />
            {estimatedTime !== null && (
              <Text>Estimated time to generate: {msToString(estimatedTime)}</Text>
            )}
          </Flex>
        ) }}
      />
      <Modal opened={showOutputs} onClose={() => setShowOutputs(false)} title="Logs" size="xl">
        {time !== null && (
          <Text>Time taken:{" " + msToString(time)}</Text>
        )}
        <Code block>{outputs.join("\n")}</Code>
      </Modal>
    </Card>
  );
}
