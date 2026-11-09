"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import useSWR from "swr";
import {
  DetailList,
  PageHeader,
  Panel,
  StatePanel,
  StatusBadge,
} from "@/components";
import { useAppFormatters } from "@/hooks";
import type { Good } from "@/interface/domain";
import { getGood, getProductStatistics } from "@/queries";
import { InventoryStock } from "@/components/InventoryStock/InventoryStock";
import { cn } from "@/helpers";
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
    <Panel as="section" className={styles.gallery}>
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
            style={{ backgroundColor: selectedColor?.hexcode ?? "#f3f4f6" }}
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
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <span>{imageIndex + 1} / {images.length}</span>
            <button
              type="button"
              aria-label={t("nextImage")}
              onClick={showNextImage}
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      <div className={styles.colors} role="group" aria-label={t("productColors")}>
        {product.colors.map((color) => (
          <button
            type="button"
            key={color.id}
            className={cn(styles.color, color.id === selectedColor?.id && styles.colorActive)}
            aria-pressed={color.id === selectedColor?.id}
            onClick={() => selectColor(color.id)}
          >
            <span className={styles.colorSwatch} style={{ background: color.hexcode }} />
            <span>{color.name}</span>
          </button>
        ))}
      </div>
    </Panel>
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
    return <Panel><StatePanel state="loading" /></Panel>;
  }

  const product = productState.data?.data;

  if (
    productState.error ||
    statisticsState.error ||
    !product ||
    !statisticsState.data
  ) {
    return (
      <Panel>
        <StatePanel
          state="error"
          onRetry={() => {
            void productState.mutate();
            void statisticsState.mutate();
          }}
        />
      </Panel>
    );
  }

  const statistics = statisticsState.data.data;
  const category = product.category?.name ?? t("catalog");
  const subcategory = product.subcategory?.name ?? t("uncategorized");
  const performance = [
    { key: "units", label: t("unitsSold"), value: formatNumber(statistics.units) },
    { key: "revenue", label: t("revenue"), value: formatCurrency(statistics.revenue) },
    { key: "orders", label: t("orders"), value: formatNumber(statistics.orders) },
  ];

  return (
    <>
      <PageHeader
        title={product.name}
        description={(
          <span className={styles.tags}>
            <span className={styles.tag}>{category}</span>
            <span className={styles.tag}>{subcategory}</span>
          </span>
        )}
        actions={<StatusBadge value={product.visible ? "visible" : "hidden"} />}
        back={{ href: "/goods", label: t("back") }}
      />

      <div className={styles.hero}>
        <ProductGallery product={product} />
        <Panel as="aside" className={styles.info}>
          <div className={styles.price}>{formatCurrency(product.price)}</div>
          <DetailList
            items={[
              { key: "brand", label: t("brand"), value: product.brand },
              {
                key: "available",
                label: t("available"),
                value: t("units", { count: product.current_quantity }),
              },
              { key: "weigh", label: t("weigh"), value: formatWeight(product.weigh) },
              {
                key: "materials",
                label: t("materials"),
                value: product.materials?.map((material) => material.name).join(", ") || "—",
              },
              {
                key: "colors",
                label: t("colors"),
                value: product.colors.map((color) => color.name).join(", ") || "—",
              },
            ]}
          />
          <h2 className={styles.descriptionTitle}>{t("form.description")}</h2>
          <p className={styles.description}>{product.description}</p>
        </Panel>
      </div>

      <InventoryStock
        product={product}
        onUpdated={async (result) => {
          await productState.mutate(result, { revalidate: false });
        }}
      />

      <section className={styles.statistics} aria-labelledby="product-performance">
        <h2 id="product-performance" className={styles.statisticsTitle}>
          {t("performance")}
        </h2>
        <div className={styles.statisticsGrid}>
          {performance.map((item) => (
            <article key={item.key} className={styles.statistic}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
