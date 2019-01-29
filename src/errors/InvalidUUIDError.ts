import { t } from '@helpers/i18n'

export default class InvalidUUIDError extends Error {
  public readonly parameter

  constructor(parameter: string) {
    super('invalid_uuid')
    this.parameter = parameter
  }

  /**
   * Get Error Message - formats a translated error message based on application locale
   * to retrieve an error message based on the parameter causing the error
   */
  public getErrorMessage = () => {
    return t('errors.invalidUUID', { name: t(`parameters.${this.parameter.replace('Id', '')}`) })
  }
}
