import { MobileNav, Sidebar } from "./layout/index";
import styles from "./layout/admin-layout.module.scss";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <MobileNav />
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
