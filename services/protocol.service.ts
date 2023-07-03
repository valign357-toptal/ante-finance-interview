//#region Global Imports
import { Context, Service as MoleculerService } from 'moleculer';
import { Action, Service } from 'moleculer-decorators';
import Prisma from '@prisma/client';
import PrismaPaginate from 'prisma-paginate';
//#endregion Global Imports

//#region Local Imports
import { IProtocolService } from '@Interfaces';
import { ApiError } from "@Helpers/Errors";
//#endregion Local Imports

@Service({
	name: 'protocol',
  settings: {}
})
class ProtocolService extends MoleculerService {
  private db = PrismaPaginate(new Prisma.PrismaClient());

	public async started() {
		return this.db.$connect();
	}

  public async stopped() {
    return this.db.$disconnect();
  }


  /**
   * @swagger
   *  /protocols:
   *    get:
   *      tags:
   *        - Protocols
   *      description: List all protocols
   *      parameters:
   *        - in: query
   *          name: page
   *          schema:
   *            type: number
   *            example: 1
   *            min: 1
   *        - in: query
   *          name: pageSize
   *          schema:
   *            type: number
   *            example: 10
   *            min: 5
   *            max: 100
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/ListProtocolsOutDto'
   */
  @Action({
    params: {
      page: { type: 'number', optional: true, integer: true, convert: true, default: 1, min: 1 },
      pageSize: { type: 'number', optional: true, integer: true, convert: true, default: 10, min: 5, max: 100 }
    }
  })
  public async list(ctx: Context<IProtocolService.ListProtocolsInDto>): Promise<IProtocolService.ListProtocolsOutDto> {
    const listResult = await this.db.protocol.paginate({
      select: IProtocolService.defaultProtocolSelectFields,
      orderBy: [
        {
          name: 'asc'
        }
      ]
    }, { limit: ctx.params.pageSize, page: ctx.params.page });

    return {
      data: (listResult.result as unknown as IProtocolService.ListProtocolsOutDto['data']),
      meta: {
        page: ctx.params.page,
        pageSize: ctx.params.pageSize,
        totalItems: listResult.count,
        totalPages: listResult.totalPages,
        hasNextPage: listResult.hasNextPage,
        hasPreviousPage: listResult.hasPrevPage
      }
    };
  }

  /**
   * @swagger
   *  /protocols/search:
   *    get:
   *      tags:
   *        - Protocols
   *      description: Search protocol by name (only exact matches, case insensitive)
   *      parameters:
   *        - in: query
   *          name: name
   *          schema:
   *            type: string
   *            example: ""
   *      produces:
   *        - application/json
   *      responses:
   *        200:
   *          content:
   *            application/json:
   *              schema:
   *                $ref: '#/components/schemas/SearchForProtocolOutDto'
   */
  @Action({
    params: {
      name: { type: 'string' }
    }
  })
  public async search(ctx: Context<IProtocolService.SearchForProtocolInDto>): Promise<IProtocolService.SearchForProtocolOutDto> {
    const protocol = await this.db.protocol.findFirst({
      where: {
        name: {
          equals: ctx.params.name,
          mode: 'insensitive'
        }
      },
      select: IProtocolService.defaultProtocolSelectFields
    });
    if (!protocol) {
      throw new ApiError('PROTOCOL_NOT_FOUND');
    }

    return protocol;
  }
}

export = ProtocolService;
