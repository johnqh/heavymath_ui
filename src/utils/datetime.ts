import { getCurrentDatetime } from "@sudobility/heavymath_types";
import { getAppConfig } from "../config/app";

export function getNow(): Date {
  return getCurrentDatetime(getAppConfig().testMode ?? false);
}

export function toChainDate(date: Date): Date {
  if (!getAppConfig().testMode) return date;
  const shifted = new Date(date);
  shifted.setFullYear(shifted.getFullYear() + 3);
  return shifted;
}
