import { Center, Image, Paper, Text, Title } from "@mantine/core";
import { notFound } from "next/navigation";
import { type FC } from "react";
import { api, HydrateClient } from "~/trpc/server";
import { ModelGenerator } from "./_components/generator";
import { UserInfo } from "./_components/user";

type ModelPageProps = {
  params: {
    id: string;
  };
};

const ModelPage: FC<ModelPageProps> = async ({ params }) => {
  const modelData = await api.public.modelPage({ id: params.id }).catch(() => null);
  if (!modelData) {
    return notFound();
  }
  return (
    <HydrateClient>
      <main>
        <Paper shadow="xs" p="sm" m="md">
          <Title>{modelData.title}</Title>
          <Title order={2} c="gray" size={20}>{modelData.created_at.toLocaleString("en-us")}</Title>
          <UserInfo id={modelData.user.id} image={modelData.user.image} name={modelData.user.name} />
          <Center>
            <Image
              radius="md"
              src="/bg-8.png"
              alt={`Image of ${modelData.title}`}
              mah="60vh"
              maw="100%"
              w="auto"
              fit="contain"
            />
          </Center>
          <Text>{modelData.description}</Text>
        </Paper>
        {modelData.iterations.length > 0 && (
          <ModelGenerator iterations={modelData.iterations} />
        )}
      </main>
    </HydrateClient>
  );
}

export default ModelPage;
