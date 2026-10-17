import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, expect, it, vi } from "vitest";
import messages from "@/messages/fr.json";
import {
  deleteProductImage,
  updateProductImage,
} from "@/queries";
import { ProductImageEditor } from "./ProductImageEditor";

vi.mock("@/queries", () => ({
  deleteProductImage: vi.fn(),
  updateProductImage: vi.fn(),
}));

const image = {
  id: 10,
  color_id: 2,
  name: "Front",
  path: "goods/1/front.png",
  url: "https://example.test/front.png",
  sort_order: 0,
};

const colors = [
  { id: 2, name: "Brown", hexcode: "#654321" },
  { id: 3, name: "White", hexcode: "#ffffff" },
];

function renderEditor(onChanged = vi.fn(async () => {})) {
  render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <ProductImageEditor
        colors={colors}
        images={[image]}
        onChanged={onChanged}
      />
    </NextIntlClientProvider>,
  );

  return onChanged;
}

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("edits the image metadata and assigned color", async () => {
  const onChanged = renderEditor();
  const updatedImage = {
    ...image,
    color_id: 3,
    name: "Side view",
    sort_order: 4,
  };
  vi.mocked(updateProductImage).mockResolvedValue({ data: updatedImage });

  fireEvent.change(screen.getByLabelText(messages.goods.images.name), {
    target: { value: "Side view" },
  });
  fireEvent.change(screen.getByLabelText(messages.goods.images.assignedColor), {
    target: { value: "3" },
  });
  fireEvent.change(screen.getByLabelText(messages.goods.images.order), {
    target: { value: "4" },
  });
  fireEvent.click(screen.getByRole("button", {
    name: messages.goods.images.saveImage,
  }));

  await waitFor(() => {
    expect(updateProductImage).toHaveBeenCalledWith(10, {
      color_id: 3,
      name: "Side view",
      sort_order: 4,
    });
  });
  expect(onChanged).toHaveBeenCalledOnce();
});

it("requires confirmation before removing an image", async () => {
  const onChanged = renderEditor();
  vi.mocked(deleteProductImage).mockResolvedValue(undefined);

  fireEvent.click(screen.getByRole("button", {
    name: messages.goods.images.removeImage,
  }));
  expect(deleteProductImage).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole("button", {
    name: messages.goods.images.confirmRemove,
  }));

  await waitFor(() => {
    expect(deleteProductImage).toHaveBeenCalledWith(10);
  });
  expect(onChanged).toHaveBeenCalledOnce();
});
