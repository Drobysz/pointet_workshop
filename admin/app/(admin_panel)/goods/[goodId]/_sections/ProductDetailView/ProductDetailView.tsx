"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import { PageHeader, StatePanel } from "@/components";
import { useAppFormatters } from "@/hooks";
import type { Good } from "@/interface/domain";
import { getGood, getProductStatistics } from "@/queries";
import { InventoryStock } from "@/components/InventoryStock/InventoryStock";
import styles from "./product-detail-view.module.scss";

interface ProductGalleryProps {
  product: Good;
}

function ProductGallery({ product }: ProductGalleryProps) {
  const t = useTranslations("goods");
  const [selectedColorId, setSelectedColorId] = useState<number>();
  const [imageIndex, setImageIndex] = useState(0);
  const selectedColor = product.colors.find((color) => {
    return color.id === selectedColorId;
  }) ?? product.colors[0];
  const images = selectedColor?.images ?? [];

  function selectColor(colorId: number) {
    setSelectedColorId(colorId);
    setImageIndex(0);
  }

  function showPreviousImage() {
    setImageIndex((imageIndex - 1 + images.length) % images.length);
  }

  function showNextImage() {
    setImageIndex((imageIndex + 1) % images.length);
  }

  return (
    <section className={styles.gallery}>
      <div className={styles.stage}>
        {images[imageIndex]?.url ? (
          <Image
            src={images[imageIndex].url}
            alt={`${product.name} — ${selectedColor?.name}`}
            fill
            sizes="(max-width: 900px) 100vw, 55vw"
            priority
          />
        ) : (
          <div
            className={styles.placeholder}
            style={{ backgroundColor: selectedColor?.hexcode ?? "#f5f5f7" }}
          >
            <span>{product.name}</span>
          </div>
        )}

        {images.length > 1 ? (
          <div className={styles.controls}>
            <button
              type="button"
              aria-label={t("previousImage")}
              onClick={showPreviousImage}
            >
              <ChevronLeft size={18} />
            </button>
            <span>{imageIndex + 1} / {images.length}</span>
            <button
              type="button"
              aria-label={t("nextImage")}
              onClick={showNextImage}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        ) : null}
      </div>

      <div className={styles.colors} aria-label={t("productColors")}>
        {product.colors.map((color) => (
          <button
            type="button"
            key={color.id}
            aria-pressed={color.id === selectedColor?.id}
            onClick={() => selectColor(color.id)}
          >
            <span style={{ background: color.hexcode }} />
            <strong>{color.name}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

export function ProductDetailView({ goodId }: { goodId: string }) {
  const t = useTranslations("goods");
  const { formatCurrency, formatNumber, formatWeight } = useAppFormatters();
  const productState = useSWR(
    ["good", goodId],
    () => getGood(goodId),
  );
  const statisticsState = useSWR(
    ["good-statistics", goodId],
    () => getProductStatistics(goodId),
  );

  if (productState.isLoading || statisticsState.isLoading) {
    return <StatePanel state="loading" />;
  }

  const product = productState.data?.data;

  if (
    productState.error ||
    statisticsState.error ||
    !product ||
    !statisticsState.data
  ) {
    return (
      <StatePanel
        state="error"
        onRetry={() => {
          void productState.mutate();
          void statisticsState.mutate();
        }}
      />
    );
  }

  const statistics = statisticsState.data.data;
  const category = product.category?.name ?? t("catalog");
  const subcategory = product.subcategory?.name ?? t("uncategorized");

  return (
    <>
      <Link href="/goods" className={styles.back}>
        <ArrowLeft size={16} />
        {t("all")}
      </Link>
      <PageHeader
        title={product.name}
        description={`${category} · ${subcategory}`}
      />

      <div className={styles.hero}>
        <ProductGallery product={product} />
        <aside className={styles.info}>
          <div className={styles.price}>{formatCurrency(product.price)}</div>
          <dl>
            <div>
              <dt>{t("brand")}</dt>
              <dd>{product.brand}</dd>
            </div>
            <div>
              <dt>{t("available")}</dt>
              <dd>{t("units", { count: product.current_quantity })}</dd>
            </div>
            <div>
              <dt>{t("weigh")}</dt>
              <dd>{formatWeight(product.weigh)}</dd>
            </div>
            <div>
              <dt>{t("materials")}</dt>
              <dd>
                {product.materials?.map((material) => material.name).join(", ")
                  || "—"}
              </dd>
            </div>
            <div>
              <dt>{t("colors")}</dt>
              <dd>
                {product.colors.map((color) => color.name).join(", ") || "—"}
              </dd>
            </div>
          </dl>
          <h2>{t("form.description")}</h2>
          <p>{product.description}</p>
        </aside>
      </div>

      <InventoryStock product={product} onUpdated={async (result) => { await productState.mutate(result, { revalidate: false }); }} />

      <section className={styles.statistics}>
        <h2>{t("performance")}</h2>
        <div>
          <article>
            <span>{t("unitsSold")}</span>
            <strong>{formatNumber(statistics.units)}</strong>
          </article>
          <article>
            <span>{t("revenue")}</span>
            <strong>{formatCurrency(statistics.revenue)}</strong>
          </article>
          <article>
            <span>{t("orders")}</span>
            <strong>{formatNumber(statistics.orders)}</strong>
          </article>
        </div>
      </section>
    </>
  );
}
