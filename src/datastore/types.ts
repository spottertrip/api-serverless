import Activity from '@models/Activity';
import ISpotter from '@models/Spotter';

/**
 * Output for List Activities Datastore query
 * lastEvaluatedId: ID of last item retrieved (used for pagination)
 * activities: list of retrieved activities
 */
export type ListActivityOutput =  {
  activities: Activity[],
  lastEvaluatedId: string,
}

/**
 * Input for list activities datastore query - filter activities based on these options
 */
export type FilterActivitiesOptions = {
  lastEvaluatedId: string,
  itemsPerPage: number,
  priceMin: number,
  priceMax: number,
  category: string,
  q: string,
}
