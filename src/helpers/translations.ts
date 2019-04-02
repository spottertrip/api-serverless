import { ICategory } from '@models/Category'
import { t } from './i18n'

/**
 * Translate every category's name and description inside a list of categories
 * @param {ICategory[]} categories - List of categories to translate name and description for
 * @return {ICategory[]} - list of categories with translated name and description
 */
export const translateCategories = (categories: ICategory[]) => {
  return categories.map((category: ICategory) => ({
    ...category,
    name: t(`categories.${category.name}.name`),
    description: t(`categories.${category.name}.description`),
  }))
}
