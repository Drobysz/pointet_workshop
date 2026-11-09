"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/helpers";
import { Button } from "../Button/Button";
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

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 10 * 1024 * 1024;

export function ImageDropzone({
  label,
  images,
  onFiles,
  onRemove,
  multiple = false,
  disabled = false,
  disableSelection = false,
}: ImageDropzoneProps) {
  const t = useTranslations("images");
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const isInactive = disabled || disableSelection;

  function acceptFiles(files: File[]) {
    if (isInactive || files.length === 0) return;
    if (!multiple && files.length > 1) {
      setError(t("singleOnly"));
      return;
    }
    const isInvalid = files.some((file) => (
      !ACCEPTED_TYPES.includes(file.type) || file.size > MAX_SIZE || file.size === 0
    ));
    if (isInvalid) {
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
        className={cn(styles.dropzone, dragging && styles.dragging)}
        aria-disabled={isInactive}
        onDragOver={(event) => {
          event.preventDefault();
          if (!isInactive) setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDragging(false);
          }
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          acceptFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <Upload size={22} aria-hidden="true" className={styles.icon} />
        <p className={styles.prompt}>{t("drop")}</p>
        <Button
          variant="outline"
          size="sm"
          disabled={isInactive}
          aria-describedby={`${id}-hint`}
          onClick={() => input.current?.click()}
        >
          {multiple ? t("chooseMany") : t("choose")}
        </Button>
        <p id={`${id}-hint`} className={styles.hint}>{t("hint")}</p>
        <input
          ref={input}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple={multiple}
          hidden
          disabled={isInactive}
          aria-label={label}
          onChange={(event) => {
            acceptFiles(Array.from(event.target.files ?? []));
            event.target.value = "";
          }}
        />
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {images.length ? (
        <ul className={styles.previews}>
          {images.map((image) => (
            <li key={image.id} className={styles.preview}>
              <Image src={image.url} alt={image.name} width={56} height={56} unoptimized />
              <span className={styles.previewCopy}>
                <strong>{image.name}</strong>
                {image.detail ? <span>{image.detail}</span> : null}
              </span>
              <Button
                variant="ghost"
                icon
                size="sm"
                disabled={disabled}
                aria-label={t("remove", { name: image.name })}
                onClick={() => onRemove(image.id)}
              >
                <X size={16} aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
