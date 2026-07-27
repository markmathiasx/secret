import { expect, test } from "@playwright/test";
import {
  getCommerceFeedAvailability,
  getProductAvailabilityMode,
  getPublicStockQuantity,
  getStructuredDataAvailability,
} from "../lib/product-availability";

test("made-to-order products keep preorder semantics without exposing fake stock", () => {
  const product = {
    availabilityMode: "made_to_order",
    readyToShip: false,
    status: "Sob encomenda",
    stock: 24,
  };

  expect(getProductAvailabilityMode(product)).toBe("made_to_order");
  expect(getPublicStockQuantity(product)).toBe(0);
  expect(getCommerceFeedAvailability(product)).toBe("preorder");
  expect(getStructuredDataAvailability(product)).toBe("https://schema.org/PreOrder");
});

test("ready-to-ship products keep in-stock semantics and public quantity", () => {
  const product = {
    readyToShip: true,
    status: "Pronta entrega",
    stock: 4,
  };

  expect(getProductAvailabilityMode(product)).toBe("in_stock");
  expect(getPublicStockQuantity(product)).toBe(4);
  expect(getCommerceFeedAvailability(product)).toBe("in stock");
  expect(getStructuredDataAvailability(product)).toBe("https://schema.org/InStock");
});
