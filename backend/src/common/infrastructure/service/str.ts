import { Injectable } from "@nestjs/common";
import slug from "slug";
import sprintfjs from "sprintf-js";

import type { StrHelperInterface } from "@/common/application/ports/str-helper.interface";
import { Locale } from "@/common/domain/enum/locale.enum";

/** Предоставляет операции нормализации и форматирования строк. */
@Injectable()
export class Str implements StrHelperInterface {
  /** Нормализует строку для использования в URL. */
  public slug(value: string, local: Locale = Locale.EN): string {
    return slug(value, {
      lower: true,
      locale: local,
      remove: /[^\p{L}\p{N}\s-]/gu,
      trim: true,
    });
  }

  /** Форматирует строку, подставляя аргументы вместо спецификаторов. */
  public sprintf(format: string, ...args: unknown[]): string {
    return sprintfjs.sprintf(format, ...args);
  }
}
