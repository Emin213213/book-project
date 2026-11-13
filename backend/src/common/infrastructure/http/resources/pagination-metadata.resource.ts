import { ApiProperty } from "@nestjs/swagger";

/** Represents pagination metadata in an HTTP collection response. */
export class PaginationMetadataResource {
  @ApiProperty({
    description: "The current page number.",
    example: 2,
    format: "int32",
    minimum: 1,
    nullable: false,
    readOnly: true,
    required: true,
    type: Number,
  })
  readonly current_page: number;

  @ApiProperty({
    description: "The last available page number.",
    example: 5,
    format: "int32",
    minimum: 0,
    nullable: false,
    readOnly: true,
    required: true,
    type: Number,
  })
  readonly last_page: number;

  @ApiProperty({
    description: "The maximum number of items per page.",
    example: 15,
    format: "int32",
    minimum: 1,
    nullable: false,
    readOnly: true,
    required: true,
    type: Number,
  })
  readonly per_page: number;

  @ApiProperty({
    description: "The total number of items in the collection.",
    example: 73,
    format: "int32",
    minimum: 0,
    nullable: false,
    readOnly: true,
    required: true,
    type: Number,
  })
  readonly total: number;

  constructor(total: number, page: number, perPage: number) {
    this.current_page = page;
    this.last_page = Math.ceil(total / perPage);
    this.per_page = perPage;
    this.total = total;
  }

  /**
   * Creates pagination metadata and calculates the last page number.
   *
   * @param total the total number of items
   * @param page the current page number
   * @param perPage the maximum number of items per page
   * @returns the pagination metadata
   */
  static make(
    total: number,
    page: number,
    perPage: number,
  ): PaginationMetadataResource {
    return new PaginationMetadataResource(total, page, perPage);
  }
}
