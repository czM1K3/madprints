import { Box, Button, FileButton, Image, LoadingOverlay, Select, Text, TextInput, Title } from "@mantine/core";
import React, { type Dispatch, type SetStateAction, type FC, useState, useEffect } from "react";
import { type Categories } from "~/app/_types/categories";
import { Carousel, CarouselSlide } from '@mantine/carousel';
import Editor from "~/app/_components/common/editor";
import { useColorScheme } from "@mantine/hooks";

type ModelBaseProps = {
  isEditing?: true,
  title: string
  setTitle: Dispatch<SetStateAction<string>>;
  description: string
  setDescription: Dispatch<SetStateAction<string>>;
  category: string;
  setCategory: Dispatch<SetStateAction<string>>;
  categories: Categories;
  files: File[] | null;
  setFiles: Dispatch<SetStateAction<File[] | null>>;
  images: string[];
};

const toBase64 = (file: File): Promise<string | null> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
  reader.onerror = reject;
});

export const ModelBase: FC<ModelBaseProps> = ({ isEditing, title, setTitle, description, setDescription, category, setCategory, categories, files, setFiles, images }) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const colorScheme = useColorScheme();

  useEffect(() => {
    (async () => {
      if (!files) return;
      const arr: string[] = [];
      for (const file of files) {
        const res = await toBase64(file);
        res && arr.push(res);
      }
      setPreviews(arr);
    })().catch(() => console.log("Error"));
  }, [files]);

  const [isDownloading, setIsDownloading] = useState(false);
  const fetchImages = async () => {
    setIsDownloading(true);
    const newFiles = await Promise.all(images.map(async (image) => {
      const data = await fetch(image);
      const blob = await data.blob();
      const file = new File([blob], image, {
        type: data.type || "image/jpeg",
      });
      return file;
    }));
    setFiles(newFiles);
  };

  return (
    <>
      <Title>{isEditing ? "Edit existing model" : "Create new model"}</Title>
      <TextInput
        label="Model name"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        multiple
      />
      <Text>Description</Text>
      <Editor
        code={description}
        setCode={setDescription}
        colorScheme={colorScheme}
        langauge="markdown"
        height="30vh"
      />
      <Select
        label="Category"
        placeholder="Pick category"
        data={categories.names}
        value={categories.keyName[category]}
        onChange={(v) => v ? setCategory(categories.nameKey[v] ?? "") : "" }
      />
      {files !== null ? (
        <>
          <Title order={2}>Images {`(${files.length}/10)`}</Title>
          {files.length < 10 ? (
            <FileButton onChange={(f) => f && setFiles((ff) => [...(ff ?? []), f])} accept="image/png,image/jpeg">
              {(props) => <Button {...props}>Add image</Button>}
            </FileButton>
          ) : <></>}
          {previews.length ? (
            <Carousel height={400} slideGap="md" pt="sm" pb="sm">
              {previews.map((preview, i) => (
                <CarouselSlide key={i}>
                  <Button pos="absolute" color="red" onClick={() => setFiles((files) => {
                    const copy = [...(files ?? [])];
                    copy.splice(i, 1);
                    return copy;
                  })}>Remove</Button>
                  <Image
                    src={preview}
                    alt={`Preview image ${i + 1}`}
                    fit="contain"
                    w="100%"
                    h="100%"
                  />
                </CarouselSlide>
              ))}
            </Carousel>
          ):<></>}
        </>
      ) : (
        <Box pos="relative">
          <Title order={2}>Images - no changes</Title>
          <Button m="sm" color="orange" onClick={() => fetchImages()}>I want to change images</Button>
          <LoadingOverlay visible={isDownloading} zIndex={1000} overlayProps={{ radius: "sm", blur: 2 }} />
        </Box>
      )}
    </>
  );
}
