import { Errors } from 'moleculer';

export class ValidationError extends Errors.ValidationError {
  constructor(data: object) {
    super('Parameters validation error!', 'VALIDATION_ERROR', data);
  }
}
