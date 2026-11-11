import { describe, it, expect } from "vitest";

describe("ci-fail", () => {
  it("always fails", () => {
    expect(1).toBe(2);
  });
});
