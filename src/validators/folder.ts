import * as yup from 'yup'
import { t } from '@helpers/i18n'
import { IFolder } from '@models/Folder'
import ValidationError from '@errors/ValidationError'

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required(t('errors.folders.name.required'))
    .max(20, t('errors.folders.name.max'))
    .min(3, t('errors.folders.name.min')),
  description: yup
    .string()
    .max(120, t('errors.folders.description.max')),
})

/**
 * Validate folder interface from User Input
 * @param {IFolder} folder - Folder to validate
 */
export const validateFolder = async (folder: IFolder) => {
  try {
    await validationSchema.validate(folder, { abortEarly: false })
  } catch (e) {
    throw new ValidationError(t('errors.folders.invalid'), e.errors)
  }
}
