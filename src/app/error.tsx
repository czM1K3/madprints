'use client';

import { Center, Box, Title, Button } from "@mantine/core";
import { type FC } from "react";

type CustomErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
};

const CustomError: FC<CustomErrorProps> = ({ error, reset }) => {
  return (
    <Center>
      <Box>
        <Title order={1}>Something went wrong!</Title>
        <Title order={2}>{error.message}</Title>
        <Button
          onClick={
            () => reset()
          }
        >
          Try again
        </Button>
      </Box>
    </Center>
  )
};

export default CustomError;
