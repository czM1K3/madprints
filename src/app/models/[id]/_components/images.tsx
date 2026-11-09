"use client";

import React, { useState, type FC } from "react";

type ImagesGalleryProps = {
  images: string[];
  title: string;
};

export const ImagesGallery: FC<ImagesGalleryProps> = ({ images, title }) => {
  const [current, setCurrent] = useState(0);
  if (images.length === 0) return null;
  const shown = images[Math.min(current, images.length - 1)]!;
  return (
    <section aria-label={`Images of ${title}`}>
      <div className="gallery-main">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shown} alt={`${title}, image ${current + 1} of ${images.length}`} />
      </div>
      {images.length > 1 && (
        <ul className="thumbs">
          {images.map((image, i) => (
            <li key={image + i}>
              <button
                type="button"
                onClick={() => setCurrent(i)}
                aria-current={i === current}
                aria-label={`Show image ${i + 1} of ${images.length}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
