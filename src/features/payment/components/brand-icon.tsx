import {
  FaCcAmex,
  FaCcDinersClub,
  FaCcDiscover,
  FaCcMastercard,
  FaCcVisa,
} from "react-icons/fa6";
import type { IconType } from "react-icons";
import type { CardBrand } from "../card-utils";

const MAP: Partial<Record<CardBrand, { Icon: IconType; color: string }>> = {
  visa: { Icon: FaCcVisa, color: "#1A1F71" },
  mastercard: { Icon: FaCcMastercard, color: "#EB001B" },
  maestro: { Icon: FaCcMastercard, color: "#EB001B" },
  amex: { Icon: FaCcAmex, color: "#2E77BC" },
  discover: { Icon: FaCcDiscover, color: "#FF6000" },
  diners: { Icon: FaCcDinersClub, color: "#0079BE" },
};

/** Glupa komponenta: logo prepoznatog brenda kartice (za ugao inputa). */
export function BrandIcon({ brand }: { brand: CardBrand }) {
  const entry = MAP[brand];
  if (!entry) return null;
  const { Icon, color } = entry;
  return <Icon size={26} style={{ color }} />;
}
