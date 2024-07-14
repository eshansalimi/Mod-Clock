import {
	createNewScheduleStructure,
	daySchedule,
	stateEmitter,
	uiSettings
} from '../state.js';

import type { Server as SocketIOServer } from 'socket.io';
import type { Request } from 'express';
import type {
	ActingLetterDays,
	ConnectedSocketInfo,
	DisplayOptionsInterface,
	ScheduleStructure
} from 'src/utilities/typedefs';

export default async (ioServer: SocketIOServer) => {
	const adminNamespace = ioServer.of('/admin');

	// NOT asynchronous
	adminNamespace.use((socket, next) => {
		const { session } = socket.request as Request;
		if (session.userIsAdmin) return socket.emit('not_authorized');
		return next();
	});

	adminNamespace.on('connection', async (socket) => {
		socket.on('refresh_letterday', async () =>
			daySchedule.refreshLetterDayFromCalendar()
		);
		socket.on(
			'override_calendar_letterday',
			async (overrideVal: ActingLetterDays) =>
				(daySchedule.overrideLetterDay = overrideVal)
		);
		socket.on(
			'update_schedule_structure',
			async (newScheduleName: string | null) =>
				(daySchedule.scheduleStructureName = newScheduleName)
		);

		socket.on(
			'update_ui_theme',
			async (newTheme: string) => (uiSettings.theme = newTheme)
		);
		socket.on(
			'update_ui_message',
			async (newMsg: string) => (uiSettings.message = newMsg)
		);
		socket.on(
			'update_ui_display_options',
			async (newDisplayOpts: DisplayOptionsInterface) =>
				(uiSettings.display = newDisplayOpts)
		);

		socket.on('force_disconnect_client', async (socketID: string) =>
			ioServer.of('/').sockets.get(socketID)?.disconnect()
		);

		socket.on('force_clients_update', async () => {
			stateEmitter.emit('schedule_update');
			stateEmitter.emit('ui_update');
		});

		socket.on(
			'create_schedule_structure',
			async (newScheduleName: string, newSchedStruct: ScheduleStructure) => {
				createNewScheduleStructure(newScheduleName, newSchedStruct).then(
					() => (daySchedule.scheduleStructureName = newScheduleName)
				);
			}
		);

		setInterval(
			async () =>
				socket.emit(
					'connected_sockets_list',
					await getAllConnectedSockets(ioServer)
				),
			1000 * 10
		);
	});
};

const getAllConnectedSockets = async (ioServer: SocketIOServer) => {
	const mapOfAdminSockets = ioServer.of('/admin').sockets;
	const mapOfPublicSockets = ioServer.of('/').sockets;

	const connectedSockets = {
		admin: [] as ConnectedSocketInfo[],
		public: [] as ConnectedSocketInfo[]
	};

	mapOfAdminSockets.forEach(async (socket) => {
		connectedSockets.admin.push({
			id: socket.id,
			address: socket.handshake.address,
			creationTime: socket.handshake.issued
		} as ConnectedSocketInfo);
	});

	mapOfPublicSockets.forEach(async (socket) => {
		connectedSockets.public.push({
			id: socket.id,
			address: socket.handshake.address,
			creationTime: socket.handshake.issued
		} as ConnectedSocketInfo);
	});
	return connectedSockets;
};
