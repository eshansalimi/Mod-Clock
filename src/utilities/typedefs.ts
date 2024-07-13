/* ------------------------------ Schedule Typedefs ------------------------------ */

type Time = `${number}:${number}`;

export type ActingCycleDays = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export type CalendarCycleDays = ActingCycleDays | 'X';

export type ScheduleStructure = ScheduleEventInterface[];

export interface ScheduleEventInterface {
	name: string;
	eventType: 'Mod' | 'Event' | 'Passing Time';
	startTime: Time;
	endTime: Time;
}

export interface DayScheduleInterface {
	calendarCycleDay: CalendarCycleDays | null;
	overrideCycleDay: ActingCycleDays | null;

	scheduleStructureName: string | null;
}

/* ------------------------------ UI Typedefs ------------------------------ */

export interface UISettingsInterface {
	theme: string;
	message: string;

	display: DisplayOptionsInterface;
}

export interface DisplayOptionsInterface {
	cycleDay: boolean;
	modNumber: boolean;
	countdownToEndOfMod: boolean;
}

/* ------------------------------ Other Typedefs ------------------------------ */

export interface ConnectedSocketInfo {
	id: string;
	address: string;
	creationTime: number; //Unix timestamp
}
