"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import {
  Button,
  EntityTable,
  Input,
  Modal,
  PageHeader,
  Panel,
  Segmented,
  Select,
  StatePanel,
} from "@/components";
import { useTableQueryState } from "@/hooks";
import { ImageDropzone } from "@/components/ImageDropzone/ImageDropzone";
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
import formStyles from "@/components/FormModal/form-modal.module.scss";
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

  useEffect(() => () => {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
  }, []);

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

  function closeEditor() {
    if (isSaving) return;
    resetImage();
    setError("");
    setEditingMarker(undefined);
  }

  const columns = [
    {
      key: "name",
      label: common("name"),
      render: (marker: Marker) => {
        const image = kind === "categories" ? (marker as Category).image : undefined;

        return (
          <span className={styles.name}>
            {image?.url ? (
              <Image src={image.url} alt="" width={40} height={40} unoptimized />
            ) : null}
            <strong>{marker.name}</strong>
          </span>
        );
      },
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
            <i style={{ background: color.hexcode }} aria-hidden="true" />
            <code>{color.hexcode}</code>
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
          <Button
            variant="ghost"
            icon
            size="sm"
            aria-label={t("editLabel", { name: marker.name })}
            onClick={() => {
              setError("");
              resetImage();
              setEditingMarker(marker);
            }}
          >
            <Pencil size={15} aria-hidden="true" />
          </Button>
          <Button
            variant="ghost"
            icon
            size="sm"
            className={styles.remove}
            aria-label={t("deleteLabel", { name: marker.name })}
            onClick={() => {
              setError("");
              setRemovingMarker(marker);
            }}
          >
            <Trash2 size={15} aria-hidden="true" />
          </Button>
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
  const existingImage = (markerForDefaults as Category | undefined)?.image;
  const dropzoneImages = categoryImage
    ? [{ id: "pending", name: categoryImage.file.name, url: categoryImage.url }]
    : !removeImage && existingImage?.url
      ? [{ id: "existing", name: existingImage.name, url: existingImage.url }]
      : [];

  return (
    <>
      <PageHeader
        title={t("title")}
        description={t("description")}
        actions={(
          <Button
            variant="primary"
            onClick={() => {
              setError("");
              resetImage();
              setEditingMarker("new");
            }}
          >
            <Plus size={17} aria-hidden="true" />
            {t("create")}
          </Button>
        )}
      />

      <Segmented
        className={styles.tabs}
        label={t("typeLabel")}
        value={kind}
        onChange={changeKind}
        items={markerKinds.map((markerKind) => ({ value: markerKind, label: t(markerKind) }))}
      />

      {markers.isLoading ? <Panel><StatePanel state="loading" /></Panel> : null}
      {markers.error || (!markers.isLoading && !markers.data) ? (
        <Panel>
          <StatePanel state="error" onRetry={() => void markers.mutate()} />
        </Panel>
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
        && !tableState.searchQuery ? <Panel><StatePanel state="empty" /></Panel> : null}

      {editingMarker ? (
        <Modal title={t(modalTitleKey, { kind: t(kind) })} onClose={closeEditor}>
          <form
            className={formStyles.form}
            onSubmit={(event) => {
              event.preventDefault();
              if (!isSaving) void handleSave(new FormData(event.currentTarget));
            }}
          >
            <fieldset disabled={isSaving} className={formStyles.formFields}>
              <Input
                label={common("name")}
                name="name"
                defaultValue={markerForDefaults?.name ?? ""}
                required
              />
              {kind === "colors" ? (
                <div className={styles.colorField}>
                  <Input
                    label={t("hexColor")}
                    name="hexcode"
                    defaultValue={(markerForDefaults as Color | undefined)?.hexcode ?? "#1d1d1f"}
                    pattern="^#[0-9A-Fa-f]{6}$"
                    required
                  />
                </div>
              ) : null}
              {kind === "subcategories" ? (
                <Select
                  label={t("category")}
                  name="category_id"
                  defaultValue={(markerForDefaults as Subcategory | undefined)?.category_id ?? ""}
                  required
                >
                  <option value="" disabled>{t("selectCategory")}</option>
                  {categories.data?.data.map((category) => (
                    <option value={category.id} key={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              ) : null}
              {kind === "categories" ? (
                <ImageDropzone
                  label={t("image")}
                  disabled={isSaving}
                  images={dropzoneImages}
                  onFiles={([file]) => {
                    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
                    objectUrl.current = URL.createObjectURL(file);
                    setCategoryImage({ file, url: objectUrl.current });
                    setRemoveImage(false);
                  }}
                  onRemove={() => {
                    resetImage();
                    setRemoveImage(true);
                  }}
                />
              ) : null}
            </fieldset>
            {error ? <p className={formStyles.error} role="alert">{error}</p> : null}
            <div className={formStyles.actions}>
              <Button variant="secondary" disabled={isSaving} onClick={closeEditor}>
                {common("cancel")}
              </Button>
              <Button type="submit" variant="primary" pending={isSaving}>
                {isSaving ? common("saving") : common("save")}
              </Button>
            </div>
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
            {error ? <p className={formStyles.error} role="alert">{error}</p> : null}
            <div className={formStyles.actions}>
              <Button variant="secondary" onClick={() => setRemovingMarker(undefined)}>
                {common("cancel")}
              </Button>
              <Button variant="danger" onClick={() => void handleRemove()}>
                {common("delete")}
              </Button>
            </div>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
