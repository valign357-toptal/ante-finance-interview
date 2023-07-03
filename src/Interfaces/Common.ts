export namespace Common {
  /**
   * @swagger
   * definitions:
   *   PaginatedListResponseMeta:
   *     type: object
   *     required:
   *       - page
   *       - pageSize
   *       - totalItems
   *       - totalPages
   *       - hasNextPage
   *       - hasPreviousPage
   *     properties:
   *       page:
   *         type: number
   *         example: 1
   *       pageSize:
   *         type: number
   *         example: 10
   *       totalItems:
   *         type: number
   *         example: 23
   *       totalPages:
   *         type: number
   *         example: 3
   *       hasNextPage:
   *         type: boolean
   *         example: true
   *       hasPreviousPage:
   *         type: boolean
   *         example: false
   */
  export interface PaginatedListResponseMeta {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }
}
