/** Сведения о клиенте, полученные из HTTP-запроса. */
export type RequestContext = {
  readonly ip: string;
  readonly userAgent?: string;
};
