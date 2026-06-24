/** Pomoćne funkcije za polje kartice: formatiranje, Luhn provera, brend. */

/** Luhn algoritam — proverava da li je broj kartice matematički validan. */
export function luhnCheck(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 12) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** "4242424242424242" -> "4242 4242 4242 4242" (grupe po 4, max 19 cifara). */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

/** "1230" -> "12/30"; automatski ubacuje kosu crtu. */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Da li je MM/YY u budućnosti (kartica nije istekla). */
export function isFutureExpiry(value: string): boolean {
  const [mm, yy] = value.split("/").map(Number);
  if (!mm || mm < 1 || mm > 12 || Number.isNaN(yy)) return false;
  // Važi do kraja meseca isteka.
  const expiryEnd = new Date(2000 + yy, mm, 0, 23, 59, 59);
  return expiryEnd >= new Date();
}

export type CardBrand =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "diners"
  | "maestro"
  | "unknown";

/** Prepoznaje brend kartice po prvim ciframa. */
export function detectBrand(value: string): CardBrand {
  const d = value.replace(/\D/g, "");
  if (/^4/.test(d)) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(d)) return "mastercard";
  if (/^3[47]/.test(d)) return "amex";
  if (/^6(?:011|5)/.test(d)) return "discover";
  if (/^3(?:0[0-5]|[68])/.test(d)) return "diners";
  if (/^(?:50|5[6-9]|6)/.test(d)) return "maestro";
  return "unknown";
}
