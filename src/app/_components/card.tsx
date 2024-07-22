import { Button, Card, CardSection, Text } from "@mantine/core";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";

type ModelCardProps = {
  id: string;
  title: string;
  description: string;
};

export const ModelCard: FC<ModelCardProps> = ({ description, id, title }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <CardSection>
        <Image
          src="/bg-8.png"
          alt={`Image of ${title}`}
          width={400}
          height={200}
        />
      </CardSection>
      <Text fw={500}>{title}</Text>
      <Text size="sm" c="dimmed">{description}</Text>
      <Button component={Link} href={`/models/${id}`}>
        View
      </Button>
    </Card>
  )
};
