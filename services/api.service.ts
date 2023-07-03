//#region Global Imports
import { Service as MoleculerService } from 'moleculer';
import { Service } from 'moleculer-decorators';
import ApiGateway, { ApiRouteSchema as IMoleculerWebApiRouteSchema } from 'moleculer-web';
import swaggerUi from 'swagger-ui-express';
import SwaggerJsDoc from 'swagger-jsdoc';
//#endregion Global Imports

const swaggerJsDoc = SwaggerJsDoc({
  definition: {
    openapi: '3.0.0',
    components: {},
    info: {
      title: 'Ante.Finance (evaluation assignment) API',
      version: '1.0.0',
    },
    servers: [
      {
        url: process.env.SERVER_HOST ? `${process.env.SERVER_HOST}/api/v1` : 'http://localhost:3000/api/v1'
      }
    ],
  },
  explorer: true,

  apis: ['./services/*.service.ts', './src/Interfaces/*.ts', './src/Interfaces/Services/*.ts'],
});

const prepareRoute = (
  {
    path,
    aliases
  }: {
    path: string,
    aliases: IMoleculerWebApiRouteSchema['aliases']
  }
) => {
  return {
    mappingPolicy: "restrict",

    path,
    aliases
  };
};

@Service({
  name: 'api',
  mixins: [ApiGateway],
  settings: {
    port: process.env.PORT || 3000,

    cors: {
      origin: ["http://localhost", "http://localhost:3000"],
      methods: "*",
      allowedHeaders: "*",
      exposedHeaders: "*"
    },

    path: '/api',

    routes: [
      {
        mappingPolicy: "restrict",
        path: '/docs',
        use: [
          (req: any, res: any, next: () => void) => {
            res.send = res.end;
            res.set = () => {};

            return next();
          },
          ...swaggerUi.serve,
          swaggerUi.setup(swaggerJsDoc, { explorer: true })
        ]
      },

      prepareRoute({
        path: '/v1/protocols',
        aliases: {
          "GET /": "protocol.list",
          "GET /search": "protocol.search"
        }
      })
    ],
  }
})
class ApiService extends MoleculerService {}

export = ApiService;
