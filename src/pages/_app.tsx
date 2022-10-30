import { type AppType } from "next/app";
import { type Session } from "next-auth";
import Layout from "components/layout";
import { SessionProvider } from "next-auth/react";
import { ToastContainer } from "react-toastify";
import { trpc } from "utils/trpc";

import "styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import 'reactflow/dist/base.css';

interface AppTypeProps { session: Session | null }

const MyApp: AppType<AppTypeProps> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ToastContainer
                icon={false}
                hideProgressBar={true}
                position="top-right"
                theme="dark"
                bodyClassName="font-mono text-sm uppercase leading-3"
                closeButton={(<p className="font-mono text-sm mr-4">X</p>)} />
                <Layout>
                  <Component {...pageProps} />
                </Layout>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);