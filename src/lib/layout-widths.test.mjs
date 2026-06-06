import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = (path) => fs.readFileSync(new URL(path, import.meta.url), "utf8");

test("catalog, header, and cart use a shared 1600px max width", () => {
  assert.match(source("../app/(app)/page.tsx"), /max-w-\[1600px\]/);
  assert.match(source("../components/header/header.tsx"), /max-w-\[1600px\]/);
  assert.match(source("../components/cart/cart-bar.tsx"), /max-w-\[1600px\]/);
  assert.match(source("../components/cart/cart-page.tsx"), /max-w-\[1600px\]/);
});

test("wide catalog and cart expose roomier desktop layouts", () => {
  assert.match(source("../components/product/product-list.tsx"), /2xl:grid-cols-4/);
  assert.match(
    source("../components/cart/cart-page.tsx"),
    /minmax\(420px,\s*460px\)/,
  );
});
