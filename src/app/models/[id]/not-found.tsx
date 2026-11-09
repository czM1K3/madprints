import { type NextPage } from "next";
import Link from "next/link";

const NotFound: NextPage = () => (
  <div className="center stack">
    <h1>Model not found</h1>
    <p className="muted">It may have been removed, or the link is incorrect.</p>
    <div><Link href="/" className="btn">Back to all models</Link></div>
  </div>
);

export default NotFound;
