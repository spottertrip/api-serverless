import { t } from '@helpers/i18n'
import InternalServerError from '@errors/InternalServerError';

export default class DatabaseError extends InternalServerError {
  constructor(message: string) {
    console.error(message)
    super(t('errors.database.internal'))
  }
}
