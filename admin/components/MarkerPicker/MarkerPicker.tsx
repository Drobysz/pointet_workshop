"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import type { Color, Material } from "@/interface/domain";
import { getMarkerOptions } from "@/queries";
import { Button } from "../Button/Button";
import { Checkbox } from "../Field/Field";
import { SearchField } from "../SearchField/SearchField";
import styles from "./marker-picker.module.scss";

export type SelectableMarker = Material | Color;

interface MarkerPickerProps {
  kind: "colors" | "materials";
  name: string;
  label: string;
  selected: SelectableMarker[];
  onChange: (markers: SelectableMarker[]) => void;
  disabled?: boolean;
}

/**
 * Searchable, paginated multi-select backed by the markers API. Selected
 * markers persist across searches and pages through hidden inputs.
 */
export function MarkerPicker({
  kind,
  name,
  label,
  selected,
  onChange,
  disabled = false,
}: MarkerPickerProps) {
  const t = useTranslations("picker");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (search.trim() === filter) return;
    const timeout = setTimeout(() => {
      setFilter(search.trim());
      setPage(1);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search, filter]);

  const result = useSWR(
    ["marker-options", kind, filter, page],
    () => getMarkerOptions(kind, page, filter),
  );
  const busy = result.isLoading || search.trim() !== filter;
  const selectedIds = new Set(selected.map((marker) => marker.id));

  function toggle(marker: SelectableMarker, checked: boolean) {
    onChange(checked
      ? [...selected, marker]
      : selected.filter((item) => item.id !== marker.id));
  }

  return (
    <fieldset className={styles.root} disabled={disabled}>
      <legend className={styles.legend}>{label}</legend>
      {selected.map((marker) => (
        <input key={marker.id} type="hidden" name={name} value={marker.id} />
      ))}
      <SearchField
        label={t("search", { label })}
        placeholder={t("search", { label })}
        value={search}
        onChange={setSearch}
      />
      <p className={styles.count} aria-live="polite">
        {t("selected", { count: selected.length })}
      </p>
      <div className={styles.options} aria-busy={busy}>
        {busy ? (
          <p className={styles.state} role="status">{t("loading")}</p>
        ) : result.error ? (
          <div className={styles.state} role="alert">
            <p>{t("error")}</p>
            <Button variant="secondary" size="sm" onClick={() => void result.mutate()}>
              {t("retry")}
            </Button>
          </div>
        ) : result.data?.data.length ? (
          result.data.data.map((marker) => (
            <Checkbox
              key={marker.id}
              label={marker.name}
              checked={selectedIds.has(marker.id)}
              adornment={"hexcode" in marker ? (
                <i className={styles.swatch} style={{ backgroundColor: marker.hexcode }} aria-hidden="true" />
              ) : undefined}
              onChange={(event) => toggle(marker, event.target.checked)}
            />
          ))
        ) : (
          <p className={styles.state}>{t("empty")}</p>
        )}
      </div>
      {result.data && result.data.meta.last_page > 1 ? (
        <div className={styles.pagination}>
          <Button
            variant="outline"
            size="sm"
            disabled={busy || page <= 1}
            onClick={() => setPage(page - 1)}
          >
            {t("previous")}
          </Button>
          <span>{page} / {result.data.meta.last_page}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={busy || page >= result.data.meta.last_page}
            onClick={() => setPage(page + 1)}
          >
            {t("next")}
          </Button>
        </div>
      ) : null}
    </fieldset>
  );
}
