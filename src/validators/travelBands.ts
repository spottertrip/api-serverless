import * as yup from 'yup'
import { t } from '@helpers/i18n'
import ValidationError from '@errors/ValidationError'
import TravelBand from '@models/TravelBand';

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required(t('errors.travelBands.name.required'))
    .max(20, t('errors.travelBands.name.max'))
    .min(3, t('errors.travelBands.name.min')),
  description: yup
    .string()
    .max(120, t('errors.travelBands.description.max')),
})

/**
 * Validate travel band interface from User Input
 * @param {TravelBand} travelBand - Travel Band to validate
 */
export const validateTravelBand = async (travelBand: TravelBand) => {
  try {
    await validationSchema.validate(travelBand, { abortEarly: false })
  } catch (e) {
    throw new ValidationError(t('errors.travelBands.invalid'), e.errors)
  }
}
