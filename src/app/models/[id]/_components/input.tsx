import { Input, InputWrapper, NumberInput, Text } from "@mantine/core";
import React, { type FC } from "react";

export type ParameterType = "Number" | "Boolean" | "String";

export type ParameterInput = {
  id: string;
  name: string;
  datatype: ParameterType;
  default_value: string;
  description: string | null;
};

type ParameterInputProps = {
  input: ParameterInput;
  value: string;
  onChange: (value: string) => void;
}

export const ParameterInputField: FC<ParameterInputProps> = ({ input, value, onChange }) => {
  switch (input.datatype) {
    case "String":
      return (
        <InputWrapper description={input.description} label={input.name}>
          <Input
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
          />
        </InputWrapper>
      );
    case "Number":
      return (
        <NumberInput
          label={input.name}
          description={input.description}
          step={1}
          value={parseFloat(value)}
          onChange={(e) => onChange(e.toString() || "0")}
        />
      );
    default:
      return (
        <Text>
          Error witho showing {input.name}
        </Text>
      );
  }
};
