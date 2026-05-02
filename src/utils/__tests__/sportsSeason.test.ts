import { describe, it, expect } from "vitest";
import {
  buildSeasonOptions,
  hasSeasonValue,
  normalizeSeasonSortValue,
} from "../sportsSeason";

describe("buildSeasonOptions", () => {
  it("builds options from seasons array", () => {
    const seasons = [{ year: 2024 }, { year: 2023 }, { year: 2025 }];
    const options = buildSeasonOptions(seasons, (s) => s.year);
    expect(options).toHaveLength(3);
    expect(options[0].value).toBe("2025"); // sorted descending
    expect(options[1].value).toBe("2024");
    expect(options[2].value).toBe("2023");
  });

  it("deduplicates seasons", () => {
    const seasons = [{ year: 2024 }, { year: 2024 }];
    const options = buildSeasonOptions(seasons, (s) => s.year);
    expect(options).toHaveLength(1);
  });
});

describe("hasSeasonValue", () => {
  it("returns true when season exists", () => {
    const seasons = [{ year: 2024 }, { year: 2023 }];
    expect(hasSeasonValue(seasons, "2024", (s) => s.year)).toBe(true);
  });

  it("returns false when season does not exist", () => {
    const seasons = [{ year: 2024 }];
    expect(hasSeasonValue(seasons, "2022", (s) => s.year)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(hasSeasonValue([], undefined, (s) => s)).toBe(false);
  });
});

describe("normalizeSeasonSortValue", () => {
  it("handles numbers", () => {
    expect(normalizeSeasonSortValue(2024)).toBe(2024);
  });

  it("handles year strings", () => {
    expect(normalizeSeasonSortValue("2024")).toBe(2024);
  });

  it("handles range strings", () => {
    expect(normalizeSeasonSortValue("2023-2024")).toBe(2024);
  });
});
