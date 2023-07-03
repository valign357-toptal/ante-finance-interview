//#region Global Imports
import { Service as MoleculerService } from 'moleculer';
import { Method, Service } from 'moleculer-decorators';
import Prisma from '@prisma/client';
import MoleculerCron from 'moleculer-cron';
import bluebird from 'bluebird';
//#endregion Global Imports

@Service({
	name: 'cron',
  mixins: [MoleculerCron],
  crons: [
    {
      name: "IndexAndPersistAnteData",
      cronTime: '* * * * *',
      onTick: async function (): Promise<void> {
        // @ts-ignore
        await this.getLocalService('cron').handleIndexAndPersistAnteData();

        console.log('Cron job "IndexAndPersistAnteData" has been ticked');
      },
      runOnInit: function() {
        console.log('Cron job "IndexAndPersistAnteData" has been successfully registered');
      },
      timeZone: 'America/New_York'
    }
  ]
})
class CronService extends MoleculerService {
  private db = new Prisma.PrismaClient();

	public async started() {
		await this.db.$connect();
	}

  public async stopped() {
    await this.db.$disconnect();
  }


  @Method
  public async handleIndexAndPersistAnteData() {
    const blockchains = await this.db.blockchain.findMany();

    return bluebird.map(blockchains, async (blockchain) => {
      return this.broker.call('indexer.indexAndPersistAnteDataForParticularBlockchain', { blockchainId: blockchain.id });
    }, { concurrency: 5 });
  }
}

export = CronService;
