import { Box, Button, Card, CloseButton, Divider, Modal, NativeSelect, Table, TableTbody, TableTd, TableThead, TableTr, TextInput, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import React, { type Dispatch, type SetStateAction, type FC, useState, useEffect } from "react";
import { ModelGenerator } from "~/app/models/[id]/_components/generator";
import { type ParameterType, type ParameterInput, ParameterInputField } from "~/app/models/[id]/_components/input";
import { getRandomIntPositive } from "~/helpers/random";
import { useColorScheme } from "@mantine/hooks";
import Editor from "~/app/_components/common/editor";

type ModelIterationProps = {
  code: string;
  setCode: Dispatch<SetStateAction<string>>;
  parameters: ParameterInput[];
  setParameters: Dispatch<SetStateAction<ParameterInput[]>>;
  setTimeToGenerate: Dispatch<SetStateAction<number | null>>;
  createScreenshot?: () => Promise<void>;
};

export const ModelIteration: FC<ModelIterationProps> = ({ code, setCode, parameters, setParameters, createScreenshot, setTimeToGenerate }) => {
  const [showAddParameter, setShowAddParameter] = useState(false);
  const [newParameterType, setNewParameterType] = useState<ParameterType>("Number");
  const [newParameterName, setNewParameterName] = useState("");
  const [newParameterDefault, setNewParameterDefault] = useState("");
  const [newParameterDescription, setNewParameterDescription] = useState("");
  const colorScheme = useColorScheme();

  useEffect(() => {
    switch (newParameterType) {
      case "Boolean":
        setNewParameterDefault("false");
        return;
      case "Number":
        setNewParameterDefault("0");
        return;
      case "String":
        setNewParameterDefault("");
        return;
    }
  }, [newParameterType]);

  const addParameter = () => {
    if (newParameterName.length === 0) {
      notifications.show({
        title: "Wrong input",
        message: "Parameter name has got to include any letters",
        color: "red",
      });
      return;
    }
    const existingNames = [...parameters].map((p) => p.name.toUpperCase());
    if (existingNames.includes(newParameterName.toUpperCase())) {
      notifications.show({
        title: "Wrong input",
        message: `Parameter name "${newParameterName}" already exists`,
        color: "red",
      });
      return;
    }
    const newParameter: ParameterInput = {
      datatype: newParameterType,
      default_value: newParameterDefault,
      description: newParameterDescription,
      id: getRandomIntPositive().toString(),
      name: newParameterName,
    }
    setParameters(p => [...p, newParameter]);
    setNewParameterName("");
    setNewParameterType("Number");
    setShowAddParameter(false);
    setNewParameterDescription("");
    setNewParameterDefault("0");
  }
  return (
    <Card shadow="sm" withBorder p="md" mb="sm">
      <Title>Create iteration</Title>
      <Title order={2}>OpenSCAD code</Title>
      <Editor
        code={code}
        setCode={setCode}
        colorScheme={colorScheme}
        langauge="openscad"
        height="50vh"
      />
      <Divider my="md" />

      <Title order={2}>Parameters</Title>
      <Table>
        <TableThead>
          <TableTr>
            <TableTd>Name</TableTd>
            <TableTd>Datatype</TableTd>
            <TableTd>Default value</TableTd>
            <TableTd>Description</TableTd>
            <TableTd>Delete</TableTd>
          </TableTr>
        </TableThead>
        <TableTbody>
          {parameters.map((parameter, i) => (
            <TableTr key={i}>
              <TableTd>{parameter.name}</TableTd>
              <TableTd>{parameter.datatype}</TableTd>
              <TableTd>{parameter.default_value}</TableTd>
              <TableTd>{parameter.description}</TableTd>
              <TableTd>
                <CloseButton onClick={() => {
                  setParameters((p) => {
                    const copy = [...p];
                    copy.splice(i, 1);
                    return copy;
                  });
                }} />
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
      <Box>
        <Button mt="sm" onClick={() => setShowAddParameter(true)}>Add parameter</Button>
      </Box>
      <Modal opened={showAddParameter} onClose={() => setShowAddParameter(false)} title="Add parameter">
        <NativeSelect
          label="Parameter datatype"
          value={newParameterType}
          onChange={(e) => setNewParameterType(e.currentTarget.value as ParameterType)}
          data={["Number", "String"]}
        />
        <TextInput
          label="Parameter name"
          value={newParameterName}
          onChange={(e) => setNewParameterName(e.currentTarget.value)}
        />
        <ParameterInputField
          input={{
            id: "1",
            datatype: newParameterType,
            name: "Default value",
            default_value: "",
            description: null,
          }}
          value={newParameterDefault}
          onChange={setNewParameterDefault}
        />
        <TextInput
          label="Description"
          value={newParameterDescription}
          onChange={(e) => setNewParameterDescription(e.currentTarget.value)}
        />
        <Button m="0.5rem 0 0" onClick={() => addParameter()}>Add</Button>
      </Modal>
      <Divider my="md" />

      <Title order={2}>Preview</Title>
      <ModelGenerator
        iterations={[{
          code,
          created_at: new Date("1998-04-10T12:00:00"), // Please don't hate me :D
          id: "1",
          parameters,
        }]}
        createScreenshot={createScreenshot}
        setTimeToGenerate={setTimeToGenerate}
      />
    </Card>
  );
}
