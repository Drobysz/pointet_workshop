import { AsideMenu } from "./layout/index";
import styles from "./layout/admin-layout.module.scss";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <div className={styles.shell}>
      <AsideMenu />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
