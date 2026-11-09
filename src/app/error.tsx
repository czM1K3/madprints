"use client";

import { type FC } from "react";

type CustomErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const CustomError: FC<CustomErrorProps> = ({ error, reset }) => (
  <div className="center stack" role="alert">
    <h1>Something went wrong</h1>
    <p className="muted">{error.message}</p>
    <div><button type="button" className="btn" onClick={() => reset()}>Try again</button></div>
  </div>
);

export default CustomError;
