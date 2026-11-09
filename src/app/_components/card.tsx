import Link from "next/link";
import React, { type FC } from "react";

type ModelCardProps = {
  id: string;
  title: string;
  description: string;
  category?: string;
  image?: string;
};

export const ModelCard: FC<ModelCardProps> = ({ description, id, title, category, image }) => (
  <article className="model-card">
    {image ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={image} alt="" loading="lazy" />
    ) : (
      <div className="thumb-placeholder" aria-hidden="true">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"><path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" /><path d="m3 7 9 5 9-5M12 12v10" /></svg>
      </div>
    )}
    <div className="body">
      <h3><Link href={`/models/${id}`}>{title}</Link></h3>
      {category && <span className="badge">{category}</span>}
      <p className="muted">{description}</p>
    </div>
  </article>
);
