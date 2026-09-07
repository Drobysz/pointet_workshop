"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { EntityTable, Modal, PageHeader, StatePanel } from "@/components";
import { useTableQueryState } from "@/hooks";
import type { Color, Subcategory } from "@/interface/domain";
import {
  createMarker,
  deleteMarker,
  getAllCategories,
  getMarkers,
  updateMarker,
  type Marker,
  type MarkerKind,
} from "@/queries";
import styles from "./markers-view.module.scss";

const markerKinds: MarkerKind[] = [
  "categories",
  "subcategories",
  "colors",
  "materials",
];

export function MarkersView() {
  const t = useTranslations("markers");
  const common = useTranslations("common");
  const tableState = useTableQueryState();
  const [kind, setKind] = useState<MarkerKind>("categories");
  const [editingMarker, setEditingMarker] = useState<Marker | "new">();
  const [removingMarker, setRemovingMarker] = useState<Marker>();
  const [error, setError] = useState("");
  const markers = useSWR(
    ["markers", kind, tableState.page, tableState.searchQuery],
    () => getMarkers(kind, tableState.page, tableState.searchQuery),
    { keepPreviousData: true },
  );
  const categories = useSWR("all-categories", getAllCategories);

  function changeKind(nextKind: MarkerKind) {
    setKind(nextKind);
    tableState.setPage(1);
  }

  async function refreshMarkerData() {
    await markers.mutate();

    if (kind === "categories") {
      await categories.mutate();
    }
  }

  async function handleSave(formData: FormData) {
    setError("");
    const payload = Object.fromEntries(formData) as Record<string, string>;

    if (!payload.name?.trim()) {
      setError(t("nameRequired"));
      return;
    }

    try {
      if (editingMarker === "new") {
        await createMarker(kind, payload);
      } else if (editingMarker) {
        await updateMarker(kind, editingMarker.id, payload);
      }

      await refreshMarkerData();
      setEditingMarker(undefined);
    } catch {
      setError(t("saveError"));
    }
  }

  async function handleRemove() {
    if (!removingMarker) {
      return;
    }

    try {
      await deleteMarker(kind, removingMarker.id);
      await refreshMarkerData();
      setRemovingMarker(undefined);
    } catch {
      setError(t("removeError"));
    }
  }

  const columns = [
    {
      key: "name",
      label: common("name"),
      render: (marker: Marker) => <strong>{marker.name}</strong>,
    },
    ...(kind === "subcategories" ? [{
      key: "category",
      label: t("category"),
      render: (marker: Marker) => {
        return (marker as Subcategory).category?.name ?? "—";
      },
    }] : []),
    ...(kind === "colors" ? [{
      key: "hex",
      label: t("color"),
      render: (marker: Marker) => {
        const color = marker as Color;

        return (
          <span className={styles.swatch}>
            <i style={{ background: color.hexcode }} />
            {color.hexcode}
          </span>
        );
      },
    }] : []),
    {
      key: "actions",
      label: common("actions"),
      align: "right" as const,
      render: (marker: Marker) => (
        <span className={styles.actions}>
          <button
            type="button"
            aria-label={t("editLabel", { name: marker.name })}
            onClick={() => {
              setError("");
              setEditingMarker(marker);
            }}
          >
            <Pencil size={16} />
          </button>
          <button
            type="button"
            aria-label={t("deleteLabel", { name: marker.name })}
            onClick={() => setRemovingMarker(marker)}
          >
            <Trash2 size={16} />
          </button>
        </span>
      ),
    },
  ];

  const markerForDefaults = editingMarker === "new"
    ? undefined
    : editingMarker;
  const modalTitleKey = editingMarker === "new"
    ? "formTitleCreate"
    : "formTitleEdit";

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={(
          <button
            type="button"
            className={styles.primary}
            onClick={() => {
              setError("");
              setEditingMarker("new");
            }}
          >
            <Plus size={17} />
            {t("create")}
          </button>
        )}
      />

      <div className={styles.tabs} role="tablist" aria-label={t("typeLabel")}>
        {markerKinds.map((markerKind) => (
          <button
            type="button"
            role="tab"
            aria-selected={kind === markerKind}
            key={markerKind}
            onClick={() => changeKind(markerKind)}
          >
            {t(markerKind)}
          </button>
        ))}
      </div>

      {markers.isLoading ? <StatePanel state="loading" /> : null}
      {markers.error || (!markers.isLoading && !markers.data) ? (
        <StatePanel state="error" onRetry={() => void markers.mutate()} />
      ) : null}
      {markers.data && (
        markers.data.data.length || tableState.searchQuery
      ) ? (
        <EntityTable<Marker>
          rows={markers.data.data}
          rowKey={(marker) => marker.id}
          search={tableState.searchInput}
          page={markers.data.meta.current_page}
          totalPages={markers.data.meta.last_page}
          total={markers.data.meta.total}
          onSearch={tableState.setSearchInput}
          onPage={tableState.setPage}
          columns={columns}
        />
      ) : null}
      {markers.data
        && !markers.data.data.length
        && !tableState.searchQuery ? <StatePanel state="empty" /> : null}

      {editingMarker ? (
        <Modal
          title={t(modalTitleKey, { kind: t(kind) })}
          onClose={() => setEditingMarker(undefined)}
        >
          <form action={handleSave} className={styles.form}>
            <label>
              {common("name")}
              <input
                name="name"
                defaultValue={markerForDefaults?.name ?? ""}
                required
              />
            </label>
            {kind === "colors" ? (
              <label>
                {t("hexColor")}
                <input
                  name="hexcode"
                  defaultValue={(markerForDefaults as Color)?.hexcode ?? "#1d1d1f"}
                  pattern="^#[0-9A-Fa-f]{6}$"
                  required
                />
              </label>
            ) : null}
            {kind === "subcategories" ? (
              <label>
                {t("category")}
                <select
                  name="category_id"
                  defaultValue={
                    (markerForDefaults as Subcategory)?.category_id ?? ""
                  }
                  required
                >
                  <option value="" disabled>{t("selectCategory")}</option>
                  {categories.data?.data.map((category) => (
                    <option value={category.id} key={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {error ? <p role="alert">{error}</p> : null}
            <button type="submit">{common("save")}</button>
          </form>
        </Modal>
      ) : null}

      {removingMarker ? (
        <Modal
          title={t("deleteTitle")}
          onClose={() => setRemovingMarker(undefined)}
        >
          <div className={styles.confirm}>
            <p>{t("deleteConfirm", { name: removingMarker.name })}</p>
            {error ? <p role="alert">{error}</p> : null}
            <div>
              <button type="button" onClick={() => setRemovingMarker(undefined)}>
                {common("cancel")}
              </button>
              <button type="button" onClick={handleRemove}>
                {common("delete")}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
