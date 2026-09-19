import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import messages from "@/messages/fr.json";
import { ImageDropzone } from "./ImageDropzone";

describe("ImageDropzone", () => {
  it("accepts dropped images and rejects invalid or oversized batches", () => {
    const onFiles = vi.fn();
    render(<NextIntlClientProvider locale="fr" messages={messages}><ImageDropzone label="Photos" images={[]} onFiles={onFiles} onRemove={vi.fn()} multiple /></NextIntlClientProvider>);
    const target = screen.getByText(messages.images.drop);
    const valid = new File(["image"], "photo.png", { type: "image/png" });
    fireEvent.drop(target, { dataTransfer: { files: [valid] } });
    expect(onFiles).toHaveBeenCalledWith([valid]);
    const invalid = new File(["text"], "note.txt", { type: "text/plain" });
    fireEvent.drop(target, { dataTransfer: { files: [invalid] } });
    expect(screen.getByRole("alert")).toHaveTextContent(messages.images.invalidFile);
    const large = new File(["image"], "large.png", { type: "image/png" });
    Object.defineProperty(large, "size", { value: 10 * 1024 * 1024 + 1 });
    fireEvent.drop(target, { dataTransfer: { files: [large] } });
    expect(onFiles).toHaveBeenCalledTimes(1);
  });
});
