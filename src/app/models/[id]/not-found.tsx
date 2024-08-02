import { Box, Button, Center, Title } from "@mantine/core";
import { type NextPage } from "next";
import Link from "next/link";

const NotFound: NextPage = () => {
  return (
    <Center>
      <Box>
        <Center m="sm">
          <Title>Model not found</Title>
        </Center>
        <Center m="sm">
          <Button
            component={Link}
            href="/"
          >Go back to main page</Button>
        </Center>
      </Box>
    </Center>
  );
}

export default NotFound;
