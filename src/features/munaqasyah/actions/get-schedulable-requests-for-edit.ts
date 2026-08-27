'use server';

import { listSchedulableMunaqasyahRequestsForEdit } from '../queries/list-schedulable-requests';

export async function getSchedulableMunaqasyahRequestsForEdit(scheduleId: string) {
  return listSchedulableMunaqasyahRequestsForEdit(scheduleId);
}
