'use server';

import { listSchedulableRequestsForEdit } from '../queries/list-schedulable-requests';

export async function getSchedulableRequestsForEdit(scheduleId: string) {
  return listSchedulableRequestsForEdit(scheduleId);
}
