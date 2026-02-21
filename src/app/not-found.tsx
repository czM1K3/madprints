import { Box, Button, Center, Title } from "@mantine/core";
import { type NextPage } from "next";
import Link from "next/link";

const NotFound: NextPage = () => {
  return (
    <Center>
      <Box>
        <Center m="sm">
          <Title>Page not found</Title>
        </Center>
        <Center m="sm">
          <Link href="/">
            <Button component="div">Go back to main page</Button>
          </Link>
        </Center>
      </Box>
    </Center>
  );
}

export default NotFound;
