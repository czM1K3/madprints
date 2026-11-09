import { notFound } from "next/navigation";
import { type FC } from "react";
import { api, HydrateClient } from "~/trpc/server";
import { ModelGenerator } from "./_components/generator";
import { UserInfo } from "./_components/user";
import { auth } from "~/server/auth";
import Link from "next/link";
import type { Metadata } from "next";
import Markdown from "markdown-to-jsx";
import { ImagesGallery } from "./_components/images";

type ModelPageProps = {
  params: Promise<{ id: string }>;
};

export const generateMetadata = async (props: ModelPageProps): Promise<Metadata> => {
  const { id } = await props.params;
  const title = await api.public.modelTitle({ id }).catch(() => null);
  return { title: title ?? "Model not found" };
};

const ModelPage: FC<ModelPageProps> = async (props) => {
  const { id } = await props.params;
  const modelData = await api.public.modelPage({ id }).catch(() => null);
  if (!modelData) {
    return notFound();
  }
  const session = await auth();
  const isOwner = session?.user?.id === modelData.user.id;
  return (
    <HydrateClient>
      <article className="stack">
        <header className="stack-sm">
          <h1>{modelData.title}</h1>
          <UserInfo id={modelData.user.id} image={modelData.user.image} name={modelData.user.name} />
          {isOwner && (
            <div className="row">
              <Link href={`/models/${modelData.id}/edit`} className="btn btn-secondary">Edit details</Link>
              <Link href={`/models/${modelData.id}/new-iteration`} className="btn btn-secondary">Add new version</Link>
            </div>
          )}
        </header>
        <ImagesGallery images={modelData.images} title={modelData.title} />
        <section aria-labelledby="about" className="prose">
          <h2 id="about">About this model</h2>
          <Markdown options={{ disableParsingRawHTML: true }}>{modelData.description}</Markdown>
        </section>
        {modelData.iterations.length > 0 && (
          <section aria-labelledby="generate">
            <h2 id="generate">Customize and generate</h2>
            <ModelGenerator iterations={modelData.iterations} />
          </section>
        )}
      </article>
    </HydrateClient>
  );
};

export default ModelPage;
