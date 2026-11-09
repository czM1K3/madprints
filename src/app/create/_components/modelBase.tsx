"use client";

import React, { type Dispatch, type SetStateAction, type FC, useState, useEffect, useMemo, useId } from "react";
import { type Categories } from "~/app/_types/categories";
import Editor from "~/app/_components/common/editor";
import { Field } from "~/app/_components/ui/field";

type ModelBaseProps = {
  isEditing?: true;
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  category: number | null;
  setCategory: Dispatch<SetStateAction<number | null>>;
  categories: Categories;
  files: File[] | null;
  setFiles: Dispatch<SetStateAction<File[] | null>>;
  images: string[];
  titleError?: string | null;
  imagesError?: string | null;
};

const MAX_IMAGES = 10;

export const ModelBase: FC<ModelBaseProps> = ({
  isEditing, title, setTitle, description, setDescription, category, setCategory,
  categories, files, setFiles, images, titleError, imagesError,
}) => {
  const descriptionLabelId = useId();
  const previews = useMemo(() => (files ?? []).map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(false);
  const fetchImages = async () => {
    setIsDownloading(true);
    setDownloadError(false);
    try {
      const newFiles = await Promise.all(images.map(async (image) => {
        const data = await fetch(image);
        const blob = await data.blob();
        return new File([blob], image, { type: blob.type || "image/jpeg" });
      }));
      setFiles(newFiles);
    } catch {
      setDownloadError(true);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <section className="card stack" aria-labelledby="details-heading">
      <h2 id="details-heading">{isEditing ? "Model details" : "Model details"}</h2>

      <Field label="Model name (required)" error={titleError}>
        <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>

      <div className="field">
        <span id={descriptionLabelId} className="label">Description</span>
        <span className="hint">
          Supports <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer">Markdown<span className="visually-hidden"> (opens in new tab)</span></a> syntax.
        </span>
        <Editor code={description} setCode={setDescription} langauge="markdown" label="Description in Markdown" height="30vh" />
      </div>

      <Field label="Category">
        <select value={category ?? 0} onChange={(e) => setCategory(Number(e.target.value))}>
          {categories.names.map((name) => (
            <option key={name} value={categories.nameKey[name] ?? 0}>{name === "None" ? "No category" : name}</option>
          ))}
        </select>
      </Field>

      {files !== null ? (
        <fieldset className="stack-sm">
          <legend>Images ({files.length}/{MAX_IMAGES})</legend>
          <Field label="Add an image (PNG or JPEG)" error={imagesError} hint={files.length >= MAX_IMAGES ? "Maximum number of images reached." : undefined}>
            <input
              type="file"
              accept="image/png,image/jpeg"
              disabled={files.length >= MAX_IMAGES}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFiles((ff) => [...(ff ?? []), f]);
                e.target.value = "";
              }}
            />
          </Field>
          {previews.length > 0 && (
            <ul className="thumbs">
              {previews.map((preview, i) => (
                <li key={preview} className="stack-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt={`Selected image ${i + 1}`} style={{ width: "9rem", height: "7rem", objectFit: "cover", borderRadius: 8 }} />
                  <button
                    type="button"
                    className="btn btn-danger btn-small"
                    onClick={() => setFiles((ff) => (ff ?? []).filter((_, idx) => idx !== i))}
                  >
                    Remove<span className="visually-hidden"> image {i + 1}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </fieldset>
      ) : (
        <div className="stack-sm">
          <h3>Images</h3>
          <p className="muted">Current images stay unchanged unless you replace them.</p>
          <div>
            <button type="button" className="btn btn-secondary" onClick={() => void fetchImages()} disabled={isDownloading}>
              {isDownloading ? "Loading images…" : "Change images"}
            </button>
          </div>
          {downloadError && <p role="alert" className="field-error">Could not load current images. Try again.</p>}
        </div>
      )}
    </section>
  );
};
