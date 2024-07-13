import EventEmitter from 'events';
import getCycleDayFromCalendar from './utilities/getCycleDayFromCalendar';
import { readFile, writeFile } from 'fs/promises';

import type {
	DayScheduleInterface,
	UISettingsInterface,
	ActingCycleDays,
	CalendarCycleDays,
	DisplayOptionsInterface,
	ScheduleStructure
} from './utilities/typedefs';

export const stateEmitter = new EventEmitter();

class DayScheduleClass implements DayScheduleInterface {
	#calendarCycleDay: CalendarCycleDays | null = null;
	#overrideCycleDay: ActingCycleDays | null = null;
	#scheduleStructureName: string | null = null;

	constructor() {}

	get calendarCycleDay() {
		return this.#calendarCycleDay;
	}
	get overrideCycleDay() {
		return this.#overrideCycleDay;
	}
	get scheduleStructureName() {
		return this.#scheduleStructureName;
	}

	set overrideCycleDay(cycleDay: ActingCycleDays | null) {
		this.#overrideCycleDay = cycleDay;
		stateEmitter.emit('schedule_update');
	}
	set scheduleStructureName(scheduleName: string | null) {
		this.#scheduleStructureName = scheduleName;
		stateEmitter.emit('schedule_update');
	}

	async refreshCycleDayFromCalendar() {
		const calDay = await getCycleDayFromCalendar();
		if (calDay !== this.#calendarCycleDay) {
			this.#calendarCycleDay = calDay;
			this.#overrideCycleDay = null;

			const today = new Date();
			if (calDay == null) {
				this.#scheduleStructureName = null;
			} else if (today.getDay() === 3) {
				this.#scheduleStructureName = 'Late Start';
			} else {
				this.#scheduleStructureName = 'Normal';
			}
			stateEmitter.emit('schedule_update');
		}
	}
}

class UISettingsClass implements UISettingsInterface {
	#theme = 'default';
	#message = 'Go Dutch!';
	#display: DisplayOptionsInterface = {
		cycleDay: true,
		modNumber: true,
		countdownToEndOfMod: false
	};

	constructor() {}

	get theme() {
		return this.#theme;
	}
	get message() {
		return this.#message;
	}
	get display() {
		return this.#display;
	}

	set theme(newTheme: string) {
		this.#theme = newTheme;
		stateEmitter.emit('ui_update');
	}
	set message(newMessage: string) {
		this.#message = newMessage;
		stateEmitter.emit('ui_update');
	}
	set display(displayOpts: DisplayOptionsInterface) {
		this.#display = displayOpts;
		stateEmitter.emit('ui_update');
	}
}

export const daySchedule = new DayScheduleClass();
export const uiSettings = new UISettingsClass();

daySchedule.refreshCycleDayFromCalendar();
setInterval(
	async () => daySchedule.refreshCycleDayFromCalendar(),
	1000 * 60 * 30 // Every 30 minutes
);

export const createNewScheduleStructure = async (
	newSchedName: string,
	newSchedJSON: ScheduleStructure
) => {
	try {
		const filepath = `${process.cwd()}/Public/scheduleStructure.json`;
		const existingData = await readFile(filepath, 'utf-8');
		const dataJSON = JSON.parse(existingData);
		dataJSON[newSchedName] = newSchedJSON;
		const updatedString = JSON.stringify(dataJSON);
		await writeFile(filepath, updatedString, 'utf-8');
	} catch (err) {
		console.error(err);
	}
};
