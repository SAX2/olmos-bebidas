import assert from "node:assert/strict";
import test from "node:test";
import { isAdminEmail, canSignIn } from "./admin-auth.ts";

test("only exact normalized allowlisted emails can access admin", () => {
  assert.equal(isAdminEmail(" OWNER@EXAMPLE.COM ", "other@example.com, owner@example.com"), true);
  for (const email of [null, "", "attacker@example.com", "owner@example.com.evil"]) {
    assert.equal(isAdminEmail(email, "owner@example.com"), false);
  }
  assert.equal(isAdminEmail("owner@example.com", ""), false);
});

test("Google must verify the email before sign-in", () => {
  assert.equal(canSignIn({ email: "owner@example.com", email_verified: true }, "owner@example.com"), true);
  for (const verified of [false, undefined, "true"]) {
    assert.equal(canSignIn({ email: "owner@example.com", email_verified: verified }, "owner@example.com"), false);
  }
});
