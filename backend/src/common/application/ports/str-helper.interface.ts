import type { Locale } from "@/common/domain/enum/locale.enum";

export const STR_HELPER = Symbol("STR_HELPER");

/** Описывает операции нормализации и форматирования строк. */
export interface StrHelperInterface {
  slug(value: string, local?: Locale): string;
  sprintf(format: string, ...args: unknown[]): string;
}
