import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { productPublicId, signWidgetParams, verifyUpload, validatePreset } from "./cloudinary.ts";

const now = 1788880000;
const secret = "test-only-secret";
const preset = "olmos_product_images_v1";
const publicId = `olmos/productos/${createHash("sha256").update("A").digest("hex")}`;
const params = { timestamp: now, public_id: publicId, upload_preset: preset, source: "uw" };
test("identifiers are stable and do not collide when SKU punctuation differs", () => {
  assert.equal(productPublicId("A"), publicId);
  assert.notEqual(productPublicId("a/b"), productPublicId("a-b"));
  assert.throws(() => productPublicId(" "));
});
test("sign only the fixed product and preset, reject tampered parameters", () => {
  const expected = createHash("sha1").update(`public_id=${publicId}&source=uw&timestamp=${now}&upload_preset=${preset}${secret}`).digest("hex");
  assert.equal(signWidgetParams("A", params, secret, now), expected);
  for (const changed of [
    { ...params, public_id: "other" }, { ...params, upload_preset: "unsigned" },
    { ...params, eager: "w_400" }, { ...params, transformation: "w_10000" },
    { ...params, timestamp: now - 3601 }, { ...params, timestamp: now + 600 },
    { ...params, source: "other" }, { timestamp: now },
  ]) assert.throws(() => signWidgetParams("A", changed, secret, now));
});
test("verify signed receipt and build trusted versioned URL, ignoring client URL", () => {
  const receipt = { public_id: publicId, version: now, signature: createHash("sha1").update(`public_id=${publicId}&version=${now}${secret}`).digest("hex"), secure_url: "https://evil.example/payload" };
  assert.equal(verifyUpload("A", receipt, secret, "demo"), `https://res.cloudinary.com/demo/image/upload/v${now}/${publicId}.webp`);
  assert.throws(() => verifyUpload("B", receipt, secret, "demo"));
  assert.throws(() => verifyUpload("A", { ...receipt, version: now + 1 }, secret, "demo"));
  assert.throws(() => verifyUpload("A", { ...receipt, signature: "bad" }, secret, "demo"));
});
test("server refuses presets that allow unsigned, oversized or paid processing", () => {
  const config = { name: preset, unsigned: false, settings: { allowed_formats: ["jpg", "png", "webp"], eval: "if (resource_info.bytes > 5242880) { throw new Error('La imagen supera 5 MB'); }", transformation: [{ crop: "limit", width: 1200, height: 1200, format: "webp", quality: 80 }], overwrite: true, backup: false } };
  assert.doesNotThrow(() => validatePreset(config));
  for (const changed of [
    { ...config, unsigned: true },
    { ...config, settings: { ...config.settings, eval: "" } },
    { ...config, settings: { ...config.settings, allowed_formats: ["svg"] } },
    { ...config, settings: { ...config.settings, transformation: [] } },
    { ...config, settings: { ...config.settings, moderation: "aws_rek" } },
  ]) assert.throws(() => validatePreset(changed));
});
