import EventEmitter from 'events';
import getLetterDay from './utilities/getLetterDay.js';
import { readFile, writeFile } from 'fs/promises';

import type {
	DayScheduleInterface,
	UISettingsInterface,
	ActingLetterDays,
	CalendarLetterDays,
	DisplayOptionsInterface,
	ScheduleStructure
} from './utilities/typedefs';

export const stateEmitter = new EventEmitter();

class DayScheduleClass implements DayScheduleInterface {
	#calendarLetterDay: CalendarLetterDays | null = null;
	#overrideLetterDay: ActingLetterDays | null = null;
	#scheduleStructureName: string | null = null;

	constructor() {}

	get calendarLetterDay() {
		return this.#calendarLetterDay;
	}
	get overrideLetterDay() {
		return this.#overrideLetterDay;
	}
	get scheduleStructureName() {
		return this.#scheduleStructureName;
	}

	set overrideLetterDay(letterDay: ActingLetterDays | null) {
		this.#overrideLetterDay = letterDay;
		stateEmitter.emit('schedule_update');
	}
	set scheduleStructureName(scheduleName: string | null) {
		this.#scheduleStructureName = scheduleName;
		stateEmitter.emit('schedule_update');
	}

	async refreshLetterDayFromCalendar() {
		const calDay = await getLetterDay();
		if (calDay !== this.#calendarLetterDay) {
			this.#calendarLetterDay = calDay;
			this.#overrideLetterDay = null;

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
		letterDay: true,
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

daySchedule.refreshLetterDayFromCalendar();
setInterval(
	async () => daySchedule.refreshLetterDayFromCalendar(),
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
