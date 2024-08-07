"use client";

import { Carousel, CarouselSlide } from "@mantine/carousel";
import { Image } from "@mantine/core";
import React, { type FC } from "react";
import { env } from "~/env";

type ImagesCarouselProps = {
  images: string[],
};

export const ImagesCarousel: FC<ImagesCarouselProps> = ({ images }) => {
  return (
    <Carousel height={400} slideGap="md" pt="sm" pb="sm">
      {images.map((image, i) => (
        <CarouselSlide key={i}>
          <Image
            src={`${env.NEXT_PUBLIC_IMAGE_PREFIX}${image}`}
            alt={`Preview image ${i + 1}`}
            fit="contain"
            w="100%"
            h="100%"
          />
        </CarouselSlide>
      ))}
    </Carousel>
  )
}