//#region Global Imports
import { Context, Service as MoleculerService } from 'moleculer';
import { Action, Method, Service } from 'moleculer-decorators';
import Prisma from '@prisma/client';
import * as ethers from 'ethers';
import BigNumber from 'bignumber.js';
import bluebird from 'bluebird';
import axios from 'axios';
//#endregion Global Imports

//#region Local Imports
import { ApiError } from '@Helpers/Errors';
import { IIndexerService } from '@Interfaces';
import abi from '@Utils/abi';
//#endregion Local Imports

@Service({
	name: 'indexer'
})
class IndexerService extends MoleculerService {
  private db = new Prisma.PrismaClient();

	public async started() {
		return this.db.$connect();
	}

  public async stopped() {
    return this.db.$disconnect();
  }


  @Action({
    params: {
      blockchainId: { type: 'uuid' }
    }
  })
  public async indexAndPersistAnteDataForParticularBlockchain(ctx: Context<IIndexerService.IndexAndPersistAnteDataForParticularBlockchainInDto>): Promise<IIndexerService.IndexAndPersistAnteDataForParticularBlockchainOutDto> {
    const blockchain = await this.db.blockchain.findFirst({ where: { id: ctx.params.blockchainId } });
    if (!blockchain) {
      throw new ApiError('BLOCKCHAIN_NOT_FOUND');
    }

    const provider = ethers.getDefaultProvider(blockchain.rpcEndpoint);
    const poolFactoryContract = new ethers.Contract(
      blockchain.antePoolFactoryContractAddress,
      abi.AntePoolFactory,
      provider
    );

    const tokensDataCache: Record<string, { name: string; priceInUsd: number; }> = {};
    const tokensDataRetrievalPromisesMap: Record<string, Promise<{ name: string; priceInUsd: number; } | null>> = {};
    const getTokenData = async (tokenContractAddress: string) => {
      let tokenData: { name: string; priceInUsd: number; } | null = tokensDataCache[tokenContractAddress];
      if (!tokenData) {
        if (!tokensDataRetrievalPromisesMap[tokenContractAddress]) {
          tokensDataRetrievalPromisesMap[tokenContractAddress] = this.getTokenData(blockchain.coingeckoPlatformId, tokenContractAddress);
        }
        tokenData = await tokensDataRetrievalPromisesMap[tokenContractAddress];

        if (tokenData) {
          tokensDataCache[tokenContractAddress] = tokenData;
        }
      }

      return tokenData;
    };

    const poolsCount = await poolFactoryContract.numPools().then(res => BigNumber(res).toNumber());

    type Pool = {
      contractAddress: string;
      testContractAddress: string;
      token: {
        contractAddress: string;
        name: string;
        priceInUsd: number;
      };
      totalValueLockedInUsd: BigNumber;
    };
    const pools: Pool[] = [];
    await bluebird.map(
      Array.from(Array(poolsCount).keys()),
      async (i) => {
        const poolContractAddress = await poolFactoryContract.allPools(i);
        const poolContract = new ethers.Contract(
          poolContractAddress,
          abi.AntePool,
          provider
        );

        const [
          testContractAddress,
          tokenContractAddress,
          totalStaked,
          totalChallengerStaked
        ] = await Promise.all([
          poolContract.anteTest(),
          poolContract.token(),
          poolContract.getTotalStaked().then(totalStaked => BigNumber(ethers.formatEther(totalStaked))),
          poolContract.getTotalChallengerStaked().then(totalStaked => BigNumber(ethers.formatEther(totalStaked)))
        ]);

        const tokenData = await getTokenData(tokenContractAddress);
        if (tokenData) {
          pools.push({
            contractAddress: poolContractAddress,
            testContractAddress,
            token: {
              contractAddress: tokenContractAddress,
              ...tokenData
            },
            totalValueLockedInUsd: totalStaked.plus(totalChallengerStaked).multipliedBy(tokenData.priceInUsd)
          });
        }
      },
      { concurrency: 25 }
    );

    type Test = {
      contractAddress: string;
      name?: string;
      protocolName?: string;
      totalValueLockedInUsd: BigNumber;
      pools: Pool[];
    };
    const tests: Test[] = pools.reduce((acc: Test[], pool: Pool) => {
      const test = acc.find(({ contractAddress }) => contractAddress === pool.testContractAddress);
      if (test) {
        test.totalValueLockedInUsd = test.totalValueLockedInUsd.plus(pool.totalValueLockedInUsd);
        test.pools.push(pool);
      } else {
        acc.push({
          contractAddress: pool.testContractAddress,
          totalValueLockedInUsd: pool.totalValueLockedInUsd,
          pools: [pool]
        });
      }

      return acc;
    }, []);
    await bluebird.map(
      tests,
      async (test) => {
        const testContract = new ethers.Contract(
          test.contractAddress,
          abi.AnteTest,
          provider
        );

        const [
          name,
          protocolName,
        ] = await Promise.all([
          testContract.testName(),
          testContract.protocolName()
        ]);

        Object.assign(test, { name, protocolName });
      },
      { concurrency: 25 }
    );

    type Protocol = {
      name: string;
      totalValueLockedInUsd: BigNumber;
      tests: Test[];
    };
    const protocols: Protocol[] = tests.reduce((acc: Protocol[], test: Test) => {
      if (test.protocolName) {
        const protocol = acc.find(({ name }) => name === test.protocolName);
        if (protocol) {
          protocol.totalValueLockedInUsd = protocol.totalValueLockedInUsd.plus(test.totalValueLockedInUsd);
          protocol.tests.push(test);
        } else {
          acc.push({
            name: test.protocolName,
            totalValueLockedInUsd: test.totalValueLockedInUsd,
            tests: [test]
          });
        }
      }

      return acc;
    }, []);

    await this.db.$transaction(async (tx) => {
      await bluebird.map(protocols, async (protocol) => {
        const upsertedProtocol = await tx.protocol.upsert({
          where: {
            name_blockchainId: {
              blockchainId: blockchain.id,
              name: protocol.name
            }
          },
          create: {
            name: protocol.name,
            totalValueLockedInUsd: protocol.totalValueLockedInUsd.toString(),
            blockchainId: blockchain.id
          },
          update: {
            totalValueLockedInUsd: protocol.totalValueLockedInUsd.toString()
          },
          select: {
            id: true
          }
        });

        await bluebird.map(protocol.tests, async (test) => {
          const upsertedTest = await tx.anteTest.upsert({
            where: {
              contractAddress_blockchainId: {
                blockchainId: blockchain.id,
                contractAddress: test.contractAddress
              }
            },
            create: {
              protocolId: upsertedProtocol.id,
              contractAddress: test.contractAddress,
              name: test.name as string,
              totalValueLockedInUsd: test.totalValueLockedInUsd.toString(),
              blockchainId: blockchain.id
            },
            update: {
              totalValueLockedInUsd: test.totalValueLockedInUsd.toString()
            },
            select: {
              id: true
            }
          });

          await bluebird.map(test.pools, async (pool) => {
            const upsertedToken = await tx.token.upsert({
              where: {
                contractAddress_blockchainId: {
                  blockchainId: blockchain.id,
                  contractAddress: pool.token.contractAddress
                }
              },
              create: {
                blockchainId: blockchain.id,
                contractAddress: pool.token.contractAddress,
                name: pool.token.name,
                priceInUsd: pool.token.priceInUsd
              },
              update: {
                name: pool.token.name,
                priceInUsd: pool.token.priceInUsd
              },
              select: {
                id: true
              }
            });

            await tx.antePool.upsert({
              where: {
                contractAddress_blockchainId: {
                  blockchainId: blockchain.id,
                  contractAddress: pool.contractAddress
                }
              },
              create: {
                testId: upsertedTest.id,
                contractAddress: pool.contractAddress,
                totalValueLockedInUsd: pool.totalValueLockedInUsd.toString(),
                blockchainId: blockchain.id,
                tokenId: upsertedToken.id
              },
              update: {
                totalValueLockedInUsd: pool.totalValueLockedInUsd.toString()
              }
            });
          }, { concurrency: 5 });
        }, { concurrency: 5 });
      }, { concurrency: 5 });
    });
  }

  @Method
  private async getTokenData(coingeckoPlatformId: string, tokenContractAddress: string): Promise<{ name: string; priceInUsd: number; } | null> {
    try {
      const { data } = await axios.get(`https://api.coingecko.com/api/v3/coins/${coingeckoPlatformId}/contract/${tokenContractAddress}`);

      if (data?.market_data?.current_price?.usd) {
        return {
          name: data.name,
          priceInUsd: data.market_data.current_price.usd
        };
      } else {
        return null;
      }
    } catch (error: any) {
      if (error && error.response && error.response.statusCode === 404) {
        return null;
      }

      throw error;
    }
  }
}

export = IndexerService;
