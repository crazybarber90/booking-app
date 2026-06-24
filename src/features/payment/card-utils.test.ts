import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  detectBrand,
  formatCardNumber,
  formatExpiry,
  isFutureExpiry,
  luhnCheck,
} from "./card-utils";

/**
 * Testovi za payment helpere — najrizičnija logika u appu.
 * Sve su čiste funkcije (isti ulaz → isti izlaz), pa su brze i deterministicke.
 * Jedini izuzetak je `isFutureExpiry` (zavisi od "danas") → tamo zamrzavamo vreme.
 */

describe("luhnCheck", () => {
  // Poznati validni test-brojevi (prolaze Luhn).
  it.each([
    ["Visa", "4242424242424242"],
    ["Mastercard", "5555555555554444"],
    ["Amex", "378282246310005"],
  ])("vraća true za validan %s broj", (_brand, number) => {
    expect(luhnCheck(number)).toBe(true);
  });

  it("vraća false kad je kontrolna cifra pogrešna", () => {
    expect(luhnCheck("4242424242424241")).toBe(false);
  });

  it("vraća false za očigledno nevalidan broj", () => {
    expect(luhnCheck("1234567812345678")).toBe(false);
  });

  it("vraća false kad ima manje od 12 cifara", () => {
    expect(luhnCheck("4242")).toBe(false);
  });

  it("ignoriše razmake i ne-cifre", () => {
    expect(luhnCheck("4242 4242 4242 4242")).toBe(true);
  });
});

describe("formatCardNumber", () => {
  it("grupiše u blokove po 4", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
  });

  it("seče na maksimalno 19 cifara", () => {
    // 25 cifara → ostane 19 (= 4 grupe po 4 + grupa od 3).
    expect(formatCardNumber("4".repeat(25))).toBe("4444 4444 4444 4444 444");
  });

  it("uklanja postojeće ne-cifre pre formatiranja", () => {
    expect(formatCardNumber("4242-4242 abc")).toBe("4242 4242");
  });
});

describe("formatExpiry", () => {
  it("ubacuje kosu crtu posle 2 cifre", () => {
    expect(formatExpiry("1230")).toBe("12/30");
  });

  it("ne dodaje crtu dok ima ≤ 2 cifre", () => {
    expect(formatExpiry("1")).toBe("1");
    expect(formatExpiry("12")).toBe("12");
  });

  it("seče na 4 cifre (MM/YY)", () => {
    expect(formatExpiry("123456")).toBe("12/34");
  });
});

describe("isFutureExpiry", () => {
  // Zamrznemo "danas" na 24.06.2026. da test ne zavisi od pravog datuma.
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-24T12:00:00"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("true za jasno budući datum", () => {
    expect(isFutureExpiry("12/30")).toBe(true);
  });

  it("true za tekući mesec (važi do kraja meseca)", () => {
    expect(isFutureExpiry("06/26")).toBe(true);
  });

  it("false za prošli mesec (istekla)", () => {
    expect(isFutureExpiry("05/26")).toBe(false);
  });

  it("false za nevalidan mesec", () => {
    expect(isFutureExpiry("13/30")).toBe(false);
    expect(isFutureExpiry("00/30")).toBe(false);
  });

  it("false kad fali godina", () => {
    expect(isFutureExpiry("12/")).toBe(false);
  });
});

describe("detectBrand", () => {
  it.each([
    ["4111111111111111", "visa"],
    ["5555555555554444", "mastercard"],
    ["2221000000000009", "mastercard"], // novi MC opseg (2221–2720)
    ["378282246310005", "amex"],
    ["6011000000000004", "discover"],
    ["30000000000004", "diners"],
    ["6759000000000000", "maestro"],
    ["9999999999999999", "unknown"],
  ] as const)("prepoznaje %s kao %s", (number, brand) => {
    expect(detectBrand(number)).toBe(brand);
  });

  it("radi i sa razmacima u broju", () => {
    expect(detectBrand("4242 4242 4242 4242")).toBe("visa");
  });
});
