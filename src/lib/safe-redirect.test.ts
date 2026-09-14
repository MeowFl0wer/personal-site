import assert from "node:assert/strict";
import { test } from "node:test";
import { sameOriginTarget } from "./safe-redirect";

const ORIGIN = "https://euan.im";

/**
 * The cases that matter are the ones that look like paths and are not.
 * `/\evil.example` is the one that was actually live.
 */
const ELSEWHERE = [
  "/\\evil.example",
  "/\\\\evil.example",
  "//evil.example",
  "//evil.example/path",
  "\\\\evil.example",
  "https://evil.example",
  "http://evil.example",
  "//evil.example:80",
  "https://euan.im.evil.example",
  "javascript:alert(1)",
  "data:text/html,<script>alert(1)</script>",
  "\\/evil.example",
  "/\t/evil.example",
  "/\n/evil.example",
];

for (const requested of ELSEWHERE) {
  test(`refuses ${JSON.stringify(requested)}`, () => {
    const target = sameOriginTarget(requested, ORIGIN);
    assert.equal(target.origin, ORIGIN, `escaped to ${target.href}`);
    assert.equal(target.href, `${ORIGIN}/about`);
  });
}

const HERE: [string, string][] = [
  ["/about", "/about"],
  ["/work/project-alpha", "/work/project-alpha"],
  ["/about?access=expired", "/about?access=expired"],
  ["/about#experience", "/about#experience"],
  ["https://euan.im/about", "/about"],
  ["/%5Cevil.example", "/%5Cevil.example"],
];

for (const [requested, path] of HERE) {
  test(`allows ${JSON.stringify(requested)}`, () => {
    const target = sameOriginTarget(requested, ORIGIN);
    assert.equal(target.origin, ORIGIN);
    assert.equal(target.href, ORIGIN + path);
  });
}

test("empty and missing fall back", () => {
  for (const requested of ["", null, undefined]) {
    assert.equal(sameOriginTarget(requested, ORIGIN).href, `${ORIGIN}/about`);
  }
});

/**
 * The trap this function exists to avoid: a same-origin result whose pathname,
 * resolved again, is not same-origin. Returning a URL rather than a string is
 * what keeps it closed, so assert that the caller can use it directly.
 */
test("a same-origin result stays same-origin when reused", () => {
  const target = sameOriginTarget("/..//evil.example", ORIGIN);
  assert.equal(target.origin, ORIGIN);
  assert.equal(new URL(target.pathname, ORIGIN).origin !== ORIGIN, true,
    "precondition: this is the pathname that would escape on a second parse");
  assert.equal(new URL(target).origin, ORIGIN, "reusing the URL itself is safe");
});
