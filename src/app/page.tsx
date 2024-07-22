// import { getServerAuthSession } from "~/server/auth";
import PagePage from "./page/[number]/page";

const Home = async () => {

  // const session = await getServerAuthSession();

  return (
    <PagePage params={{ number: "1" }} />
  );
}

export default Home;
