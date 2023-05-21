import { pullExistingMarginUpdateRow } from '../big-query-support/margin-updates-table/pull-data/pullExistingMarginUpdateRow';
import { insertNewMarginUpdate } from '../big-query-support/margin-updates-table/push-data/insertNewMarginUpdate';
import { MarginUpdateEventInfo } from '../common/event-parsers/types';

export const processMarginUpdateEvent = async (event: MarginUpdateEventInfo): Promise<void> => {
  const marginUpdateRow = await pullExistingMarginUpdateRow(event.eventId);

  if (marginUpdateRow) {
    return;
  }

  await insertNewMarginUpdate(event);
};
