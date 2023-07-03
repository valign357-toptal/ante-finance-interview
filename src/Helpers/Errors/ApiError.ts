import { Errors } from 'moleculer';

type IErrorByCode = {
  defaultStatusCode: number;
  message: string;
};

const errorsByCodes: Record<string, IErrorByCode> = {
  BLOCKCHAIN_NOT_FOUND: {
    defaultStatusCode: 404,
    message: 'Blockchain with a given id wasn\'t found'
  },
  PROTOCOL_NOT_FOUND: {
    defaultStatusCode: 404,
    message: 'Protocol with a given id wasn\'t found'
  },
  INTERNAL_ERROR: {
    defaultStatusCode: 500,
    message: 'Internal error'
  }
};

export class ApiError extends Errors.MoleculerError {
  constructor(errorCode: string, statusCode?: number | null, additionalData?: object) {
    let error = errorsByCodes[errorCode];
    if (!error) {
      error = errorsByCodes.INTERNAL_ERROR;
    }

    super(error.message, statusCode || error.defaultStatusCode, errorCode, additionalData);
  }
}
