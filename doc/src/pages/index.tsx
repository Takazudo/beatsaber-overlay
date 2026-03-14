import type { ReactNode } from "react";
import clsx from "clsx";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import DocsSitemap from "@site/src/components/DocsSitemap";
import styles from "./index.module.css";

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title}>
      <main className={clsx(styles.main)}>
        <div className={styles.layout}>
          <aside className={styles.leftCol}>
            <div className={styles.leftColContent}>
              <div className={styles.headerSection}>
                <h1>{siteConfig.title}</h1>
                <p className={styles.tagline}>{siteConfig.tagline}</p>
              </div>
            </div>
          </aside>
          <div className={styles.rightCol}>
            <DocsSitemap />
          </div>
        </div>
      </main>
    </Layout>
  );
}
