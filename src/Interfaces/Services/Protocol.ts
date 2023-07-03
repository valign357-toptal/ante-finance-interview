//#region Global Imports
import Prisma from '@prisma/client';
//#endregion Global Imports

//#region Local Imports
import { Common } from "@Interfaces/Common";
//#endregion Local Imports

/**
 * @swagger
 * definitions:
 *   Protocol:
 *     type: object
 *     required:
 *       - id
 *       - name
 *       - totalValueLockedInUsd
 *       - blockchain
 *       - tests
 *     properties:
 *       id:
 *         type: string
 *         example: "bc54162c-649d-46e9-96fe-7728e350d880"
 *       name:
 *         type: string
 *         example: "Ante"
 *       totalValueLockedInUsd:
 *         type: string
 *         example: "44810.21"
 *       blockchain:
 *         type: object
 *         required:
 *           - id
 *           - name
 *         properties:
 *           id:
 *             type: string
 *             example: "f686ef64-6d68-406c-8ee1-0e29bc32c889"
 *           name:
 *             type: string
 *             example: "Ethereum"
 *       tests:
 *         type: array
 *         items:
 *           type: object
 *           required:
 *             - id
 *             - contractAddress
 *             - name
 *             - totalValueLockedInUsd
 *             - pools
 *           properties:
 *             id:
 *               type: string
 *               example: "3f124419-160b-470f-9aa7-790f75b29ef2"
 *             contractAddress:
 *               type: string
 *               example: "0x8270A2d8408A6D3f856227325c4F6E64b2C909B7"
 *             name:
 *               type: string
 *               example: "Ante Pool cannot pay out before failure"
 *             totalValueLockedInUsd:
 *               type: string
 *               example: "19482.70"
 *             pools:
 *               type: array
 *               items:
 *                 type: object
 *                 required:
 *                   - id
 *                   - contractAddress
 *                   - totalValueLockedInUsd
 *                   - token
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "3e921bb7-d41e-4d80-ad3a-1a3e1e594232"
 *                   contractAddress:
 *                     type: string
 *                     example: "0xEC5eE03399E6b6CEA798d88260087c9b3560e169"
 *                   totalValueLockedInUsd:
 *                     type: string
 *                     example: "19482.70"
 *                   token:
 *                     type: object
 *                     required:
 *                       - id
 *                       - contractAddress
 *                       - name
 *                       - priceInUsd
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "ae3447a9-8a55-46d7-82a3-ae0af2aaad4a"
 *                       contractAddress:
 *                         type: string
 *                         example: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
 *                       name:
 *                         type: string
 *                         example: "WETH"
 *                       priceInUsd:
 *                         type: number
 *                         example: 1948.27
 *
 */
type Protocol = Prisma.Prisma.ProtocolGetPayload<{
  select: {
    id: true,
    name: true,
    totalValueLockedInUsd: true,
    blockchain: {
      select: {
        id: true,
        name: true
      }
    },
    tests: {
      select: {
        id: true,
        contractAddress: true,
        name: true,
        totalValueLockedInUsd: true,
        pools: {
          select: {
            id: true,
            contractAddress: true,
            totalValueLockedInUsd: true,
            token: {
              select: {
                id: true,
                contractAddress: true,
                name: true,
                priceInUsd: true
              }
            }
          }
        }
      }
    }
  }
}>;

export namespace IProtocolService {
  export const defaultProtocolSelectFields = {
    id: true,
    name: true,
    totalValueLockedInUsd: true,
    blockchain: {
      select: {
        id: true,
        name: true
      }
    },
    tests: {
      select: {
        id: true,
        contractAddress: true,
        name: true,
        totalValueLockedInUsd: true,
        pools: {
          select: {
            id: true,
            contractAddress: true,
            totalValueLockedInUsd: true,
            token: {
              select: {
                id: true,
                contractAddress: true,
                name: true,
                priceInUsd: true
              }
            }
          }
        }
      }
    }
  };

  export type ListProtocolsInDto = {
    page: number;
    pageSize: number;
  };
  /**
   * @swagger
   * components:
   *   schemas:
   *     ListProtocolsOutDto:
   *       type: object
   *       required:
   *         - data
   *         - meta
   *       properties:
   *         data:
   *           type: array
   *           items:
   *             $ref: '#/definitions/Protocol'
   *         meta:
   *           $ref: '#/definitions/PaginatedListResponseMeta'
   */
  export type ListProtocolsOutDto = {
    data: Protocol[];
    meta: Common.PaginatedListResponseMeta;
  };

  export type SearchForProtocolInDto = {
    name: string;
  };
  /**
   * @swagger
   * components:
   *   schemas:
   *     SearchForProtocolOutDto:
   *       $ref: '#/definitions/Protocol'
   */
  export type SearchForProtocolOutDto = Protocol;
}
