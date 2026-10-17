"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { EntityTable, Modal, PageHeader, StatePanel } from "@/components";
import { useTableQueryState } from "@/hooks";
import { ImageDropzone } from "@/components/ImageDropzone/ImageDropzone";
import Image from "next/image";
import type { Category, Color, Subcategory } from "@/interface/domain";
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
  const [isSaving, setIsSaving] = useState(false);
  const [categoryImage, setCategoryImage] = useState<{ file: File; url: string }>();
  const [removeImage, setRemoveImage] = useState(false);
  const objectUrl = useRef<string | undefined>(undefined);
  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);
  function resetImage() {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = undefined;
    setCategoryImage(undefined);
    setRemoveImage(false);
  }

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

    setIsSaving(true);
    const body = kind === "categories" ? formData : payload;
    if (body instanceof FormData) {
      if (categoryImage) body.set("image", categoryImage.file);
      else if (removeImage) body.set("remove_image", "1");
    }
    try {
      if (editingMarker === "new") {
        const saved = await createMarker(kind, body);
        setEditingMarker(saved.data);
      } else if (editingMarker) {
        await updateMarker(kind, editingMarker.id, body);
      }
      resetImage();

      await refreshMarkerData();
      setEditingMarker(undefined);
    } catch {
      setError(t("saveError"));
    } finally {
      setIsSaving(false);
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
      render: (marker: Marker) => (
        <span className={styles.categoryName}>
          {kind === "categories" && (marker as Category).image?.url ? <Image src={(marker as Category).image!.url!} alt="" width={40} height={40} unoptimized /> : null}
          <strong>{marker.name}</strong>
        </span>
      ),
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
              resetImage();
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
  const pagination = markers.data && "meta" in markers.data
    ? {
        page: markers.data.meta.current_page,
        totalPages: markers.data.meta.last_page,
        total: markers.data.meta.total,
      }
    : undefined;

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
              resetImage();
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
          page={pagination?.page}
          totalPages={pagination?.totalPages}
          total={pagination?.total ?? markers.data.data.length}
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
          onClose={() => { if (!isSaving) { resetImage(); setEditingMarker(undefined); } }}
        >
          <form onSubmit={(event) => { event.preventDefault(); if (!isSaving) void handleSave(new FormData(event.currentTarget)); }} className={styles.form}>
            <fieldset disabled={isSaving} className={styles.formFields}>
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
            {kind === "categories" ? (
              <ImageDropzone
                label={t("image")}
                disabled={isSaving}
                images={categoryImage ? [{ id: "pending", name: categoryImage.file.name, url: categoryImage.url }] : !removeImage && (markerForDefaults as Category)?.image?.url ? [{ id: "existing", name: (markerForDefaults as Category).image!.name, url: (markerForDefaults as Category).image!.url! }] : []}
                onFiles={([file]) => {
                  if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
                  objectUrl.current = URL.createObjectURL(file);
                  setCategoryImage({ file, url: objectUrl.current });
                  setRemoveImage(false);
                }}
                onRemove={() => { resetImage(); setRemoveImage(true); }}
              />
            ) : null}
            </fieldset>
            {error ? <p role="alert">{error}</p> : null}
            <button type="submit" disabled={isSaving}>{isSaving ? common("saving") : common("save")}</button>
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
