import dayjs from 'dayjs';
import iCal, { type VEvent } from 'node-ical';

import type { CalendarCycleDays } from './typedefs';

const cycleDayURL =
	'https://calendar.google.com/calendar/ical/hollandhall.org_rqggarpb66eqmgm80dg7n8atqg%40group.calendar.google.com/public/basic.ics';

export default async (): Promise<CalendarCycleDays | null> => {
	const calendar = await iCal.async.fromURL(cycleDayURL);
	const now = dayjs('2024-05-06').format('YYYY-MM-DD');
	for await (const cycleDayEvent of Object.values(calendar)) {
		if (dayjs((cycleDayEvent as VEvent).start).format('YYYY-MM-DD') === now) {
			return (cycleDayEvent as VEvent).summary as CalendarCycleDays;
		}
	}
	return null;
};
