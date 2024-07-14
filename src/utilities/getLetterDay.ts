import dayjs from 'dayjs';
import iCal, { type VEvent } from 'node-ical';

import type { CalendarLetterDays } from './typedefs';

const cycleDayURL =
	'https://calendar.google.com/calendar/ical/hollandhall.org_rqggarpb66eqmgm80dg7n8atqg%40group.calendar.google.com/public/basic.ics';

export default async (): Promise<CalendarLetterDays | null> => {
	const calendar = await iCal.async.fromURL(cycleDayURL);
	const now = dayjs('2024-05-06').format('YYYY-MM-DD');
	for await (let calEvent of Object.values(calendar)) {
		calEvent = calEvent as VEvent;
		if (calEvent.summary.length === 1) {
			if (dayjs(calEvent.start).format('YYYY-MM-DD') === now) {
				return calEvent.summary as CalendarLetterDays;
			}
		}
	}
	return null;
};
