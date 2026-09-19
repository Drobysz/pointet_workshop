"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import styles from "./image-dropzone.module.scss";

export interface ImagePreview {
  id: string;
  name: string;
  url: string;
  detail?: string;
}

interface ImageDropzoneProps {
  label: string;
  images: ImagePreview[];
  onFiles: (files: File[]) => void;
  onRemove: (id: string) => void;
  multiple?: boolean;
  disabled?: boolean;
  disableSelection?: boolean;
}

export function ImageDropzone({ label, images, onFiles, onRemove, multiple = false, disabled = false, disableSelection = false }: ImageDropzoneProps) {
  const t = useTranslations("images");
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function acceptFiles(files: File[]) {
    if (disabled || disableSelection || files.length === 0) return;
    if (!multiple && files.length > 1) {
      setError(t("singleOnly"));
      return;
    }
    if (files.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024 || file.size === 0)) {
      setError(t("invalidFile"));
      return;
    }
    setError("");
    onFiles(files);
  }

  return (
    <section className={styles.root} aria-labelledby={`${id}-label`}>
      <h3 id={`${id}-label`} className={styles.label}>{label}</h3>
      <div
        className={`${styles.dropzone} ${dragging ? styles.dragging : ""}`}
        onDragOver={(event) => { event.preventDefault(); if (!disabled && !disableSelection) setDragging(true); }}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFiles(Array.from(event.dataTransfer.files)); }}
        aria-disabled={disabled || disableSelection}
      >
        <Upload size={22} aria-hidden="true" />
        <p>{t("drop")}</p>
        <button type="button" disabled={disabled || disableSelection} onClick={() => input.current?.click()} aria-describedby={`${id}-hint`}>
          {multiple ? t("chooseMany") : t("choose")}
        </button>
        <p id={`${id}-hint`} className={styles.hint}>{t("hint")}</p>
        <input
          ref={input} type="file" accept="image/jpeg,image/png,image/webp" multiple={multiple}
          hidden disabled={disabled || disableSelection} aria-label={label}
          onChange={(event) => { acceptFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }}
        />
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {images.length ? (
        <ul className={styles.previews}>
          {images.map((image) => (
            <li key={image.id}>
              <Image src={image.url} alt={image.name} width={56} height={56} unoptimized />
              <span><strong>{image.name}</strong>{image.detail ? <span>{image.detail}</span> : null}</span>
              <button type="button" disabled={disabled} onClick={() => onRemove(image.id)} aria-label={t("remove", { name: image.name })}><X size={17} /></button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
