/**
 * @var categoryId - ID of the category
 * @var thumbnailUrl - Link to the image representing the category (Http|s Scheme)
 * @var icon - Link to the image|icon of the category
 * @var name - Name of the category - e.g. "sport"
 * @var description - Short description of the category
 */
export interface ICategory {
  categoryId: string
  thumbnailUrl: string
  icon: string
  name: string
  description: string
}
