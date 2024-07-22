"use client";
import { Accordion, AccordionControl, AccordionItem, AccordionPanel, Button, Center, Container, Group, LoadingOverlay, Paper, Text } from "@mantine/core";
import React, { useState, type FC } from "react";
import { StlViewer } from "react-stl-viewer";

type ModelGeneratorProps = {
  iterations: {
    id: string;
    number: number;
    code: string;
    created_at: Date;
  }[];
};

const ModelGenerator: FC<ModelGeneratorProps> = ({ iterations }) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Paper shadow="xs" p="sm" m="md">
      <Accordion chevronPosition="right" variant="contained">
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
                  (async () => {
                    setIsLoading(true);
                    await new Promise((res) => setTimeout(res, 1000));
                    setIsLoading(false);
                  })().catch(() => {
                    console.error("Something went wrong");
                  });
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
      >
        <StlViewer
          style={{
              top: 0,
              left: 0,
              border: "1px solid lightgray",
              borderRadius: "0.4rem",
              height: "100%",
              width: "100%",
              margin: "0.4rem 0",
              visibility: isLoading ? "hidden" : "visible",
          }}
          orbitControls
          shadows
          url={"https://storage.googleapis.com/ucloud-v3/ccab50f18fb14c91ccca300a.stl"}
        />
        <Button pos="absolute" right="0" bottom="0" m="1rem">Download</Button>
      </Container>
      <LoadingOverlay visible={isLoading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
    </Paper>
  );
}

export default ModelGenerator;
