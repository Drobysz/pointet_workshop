"use client";

import { useEffect, useId, useState } from "react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import type { Color, Material } from "@/interface/domain";
import { getMarkerOptions } from "@/queries";
import styles from "./marker-picker.module.scss";

export type SelectableMarker = Material | Color;

export function MarkerPicker({ kind, name, label, selected, onChange, disabled = false }: {
  kind: "colors" | "materials";
  name: string;
  label: string;
  selected: SelectableMarker[];
  onChange: (markers: SelectableMarker[]) => void;
  disabled?: boolean;
}) {
  const t = useTranslations("picker");
  const id = useId();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  useEffect(() => {
    if (search.trim() === filter) return;
    const timeout = setTimeout(() => { setFilter(search.trim()); setPage(1); }, 250);
    return () => clearTimeout(timeout);
  }, [search, filter]);
  const result = useSWR(["marker-options", kind, filter, page], () => getMarkerOptions(kind, page, filter));
  const busy = result.isLoading || search.trim() !== filter;
  const selectedIds = new Set(selected.map((marker) => marker.id));

  return (
    <fieldset className={styles.root} disabled={disabled}>
      <legend>{label}</legend>
      {selected.map((marker) => <input key={marker.id} type="hidden" name={name} value={marker.id} />)}
      <label className={styles.search} htmlFor={id}>{t("search", { label })}</label>
      <input id={id} type="search" placeholder={t("search", { label })} value={search} onChange={(event) => setSearch(event.target.value)} className={styles.input} />
      <p className={styles.count} aria-live="polite">{t("selected", { count: selected.length })}</p>
      <div className={styles.options} aria-busy={busy}>
        {busy ? <p role="status">{t("loading")}</p> : result.error ? (
          <div role="alert"><p>{t("error")}</p><button type="button" onClick={() => void result.mutate()}>{t("retry")}</button></div>
        ) : result.data?.data.length ? result.data.data.map((marker) => (
          <label className={styles.option} key={marker.id}>
            <input type="checkbox" checked={selectedIds.has(marker.id)} onChange={(event) => onChange(event.target.checked ? [...selected, marker] : selected.filter((item) => item.id !== marker.id))} />
            {"hexcode" in marker ? <i className={styles.swatch} style={{ backgroundColor: marker.hexcode }} aria-hidden="true" /> : null}
            <span>{marker.name}</span>
          </label>
        )) : <p>{t("empty")}</p>}
      </div>
      {result.data && result.data.meta.last_page > 1 ? (
        <div className={styles.pagination}>
          <button type="button" disabled={busy || page <= 1} onClick={() => setPage(page - 1)}>{t("previous")}</button>
          <span>{page} / {result.data.meta.last_page}</span>
          <button type="button" disabled={busy || page >= result.data.meta.last_page} onClick={() => setPage(page + 1)}>{t("next")}</button>
        </div>
      ) : null}
    </fieldset>
  );
}
