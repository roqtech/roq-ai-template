/*
  This component showcases the NotificationBell, and ChatMessageBell from ROQ
*/

import Head from "next/head";
import styles from "layout/app/app.layout.module.css";
import Image from "next/image";
import { NotificationBell, ChatMessageBell, signOut } from "@roq/nextjs";
import { useRouter } from "next/router";
import { routes } from "routes";

import Link from "next/link";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>ROQ Next.js SaaS Template</title>
        <meta name="description" content="ROQ boilerplate with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.header}>
          <Link href={"/"}>
            <Image
              className={styles.logo}
              src="/roq.svg"
              alt="ROQ Logo"
              width={80}
              height={80}
              priority
            />
          </Link>
          <div className={styles.linksContainer}>
            <button
              onClick={() => router.push(routes.frontend.analyze)}
              className="btn btn-sm btn-action"
              style={{ marginRight: 20 }}
            >
              DB Analyze
            </button>

            <Link href={routes.frontend.invites}>
              Invites
            </Link>

            {/* ROQ Notification and Chat bell */}
            <NotificationBell />
            <ChatMessageBell
              onClick={() => router.push(routes.frontend.chat)}
            />

            <button onClick={() => signOut()} className="btn btn-sm">
              Logout
            </button>
          </div>
        </div>
        <div className={styles.content}>{children}</div>
      </main>
    </>
  );
}
