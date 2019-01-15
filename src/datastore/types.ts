import Activity from '@models/Activity';

/**
 * Output for List Activities Datastore query
 * lastEvaluatedId: ID of last item retrieved (used for pagination)
 * activities: list of retrieved activities
 */
export type ListActivityOutput =  {
  activities: Activity[],
  lastEvaluatedId: string,
}
