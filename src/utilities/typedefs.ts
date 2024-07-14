/* ------------------------------ Schedule Typedefs ------------------------------ */

type Time = `${number}:${number}`;

export type ActingLetterDays = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type CalendarLetterDays = ActingLetterDays | 'X';

export type ScheduleStructure = ScheduleEventInterface[];

export interface ScheduleEventInterface {
	name: string;
	eventType: 'Mod' | 'Event' | 'Passing Time';
	startTime: Time;
	endTime: Time;
}

export interface DayScheduleInterface {
	calendarLetterDay: CalendarLetterDays | null;
	overrideLetterDay: ActingLetterDays | null;

	scheduleStructureName: string | null;
}

/* ------------------------------ UI Typedefs ------------------------------ */

export interface UISettingsInterface {
	theme: string;
	message: string;

	display: DisplayOptionsInterface;
}

export interface DisplayOptionsInterface {
	letterDay: boolean;
	modNumber: boolean;
	countdownToEndOfMod: boolean;
}

/* ------------------------------ Other Typedefs ------------------------------ */

export interface ConnectedSocketInfo {
	id: string;
	address: string;
	creationTime: number; //Unix timestamp
}
