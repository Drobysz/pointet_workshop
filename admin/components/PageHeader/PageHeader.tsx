import { BackLink } from "../BackLink/BackLink";
import type { PageHeaderProps } from "./PageHeader.props";
import styles from "./page-header.module.scss";

export function PageHeader({
  title,
  description,
  actions,
  back,
}: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.copy}>
        {back ? <BackLink href={back.href}>{back.label}</BackLink> : null}
        <h1 className={styles.title}>{title}</h1>
        {description ? <p className={styles.description}>{description}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </header>
  );
}
