"use client";

import React, { useState, type FC } from "react";
import { ModelCard } from "./card";
import { api } from "~/trpc/react";
import { useDebouncedValue } from "~/hooks/use-debounced-value";
import { env } from "~/env";
import { type Categories } from "../_types/categories";
import { Field } from "./ui/field";

type ModelsPageProps = {
  initialData: {
    models: {
      id: string;
      description: string;
      title: string;
      images: string[];
      category: { id: number; name: string } | null;
    }[];
    pages: number;
  };
  categories: Categories;
  userId?: string;
};

export const ModelsPage: FC<ModelsPageProps> = ({ initialData, categories, userId }) => {
  const [page, setPage] = useState(1);
  const [searchCurrent, setSearchCurrent] = useState("");
  const search = useDebouncedValue(searchCurrent, 400);
  const [category, setCategory] = useState(0);

  const { data, isLoading, error, isRefetching, refetch } = api.public.modelsPage.useQuery({
    page,
    category: category || null,
    search: search || null,
    user: userId ?? null,
  }, {
    initialData,
    initialDataUpdatedAt: 0,
    refetchOnMount: false,
  });

  const busy = isLoading || isRefetching;

  return (
    <section aria-label="Models">
      <form className="filters card" role="search" onSubmit={(e) => e.preventDefault()}>
        <Field label="Search models">
          <input
            type="search"
            placeholder="Search by title or description"
            value={searchCurrent}
            onChange={(e) => { setSearchCurrent(e.target.value); setPage(1); }}
          />
        </Field>
        <Field label="Category">
          <select
            value={category}
            onChange={(e) => { setCategory(Number(e.target.value)); setPage(1); }}
          >
            {categories.names.map((name) => (
              <option key={name} value={categories.nameKey[name] ?? 0}>
                {name === "None" ? "All categories" : name}
              </option>
            ))}
          </select>
        </Field>
      </form>

      {error ? (
        <div role="alert" className="alert stack-sm">
          <strong>Could not load models.</strong>
          <div><button type="button" className="btn btn-small" onClick={() => void refetch()}>Try again</button></div>
        </div>
      ) : (
        <>
          <p className="visually-hidden" role="status">
            {busy ? "Loading models" : `${data.models.length} models shown, page ${page} of ${Math.max(data.pages, 1)}`}
          </p>
          {busy ? (
            <ul className="grid" aria-hidden="true">
              {Array.from({ length: env.NEXT_PUBLIC_PER_PAGE }, (_, i) => (
                <li key={i}><div className="skeleton skeleton-card" /></li>
              ))}
            </ul>
          ) : data.models.length === 0 ? (
            <div className="empty-state">
              <div className="big" aria-hidden="true">🔍</div>
              <p><strong>No models found.</strong></p>
              <p className="muted">Try a different search or category.</p>
            </div>
          ) : (
            <ul className="grid">
              {data.models.map((model) => (
                <li key={model.id}>
                  <ModelCard
                    id={model.id}
                    title={model.title}
                    description={model.description}
                    category={model.category?.name}
                    image={model.images[0]}
                  />
                </li>
              ))}
            </ul>
          )}
          {data.pages > 1 && (
            <nav className="pagination" aria-label="Pagination">
              <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span aria-current="page">Page {page} of {data.pages}</span>
              <button type="button" className="btn btn-secondary" disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>
                Next
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
};
