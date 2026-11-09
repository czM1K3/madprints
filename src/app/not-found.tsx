import { type NextPage } from "next";
import Link from "next/link";

const NotFound: NextPage = () => (
  <div className="center stack">
    <h1>Page not found</h1>
    <p className="muted">The page you are looking for does not exist or was moved.</p>
    <div><Link href="/" className="btn">Back to all models</Link></div>
  </div>
);

export default NotFound;
