import { stateEmitter, daySchedule, uiSettings } from '../state.js';

import type { Namespace, Server as SocketIOServer } from 'socket.io';

export default async (ioServer: SocketIOServer) => {
	const publicNamespace = ioServer.of('/');

	stateEmitter.on('schedule_update', async () =>
		sendScheduleUpdateToClients(publicNamespace)
	);
	stateEmitter.on('ui_update', async () =>
		sendUIUpdateToClients(publicNamespace)
	);

	publicNamespace.on('connection', async (socket) => {
		socket.emit('publish_schedule', daySchedule);
		socket.emit('publish_ui', daySchedule);
	});
};

const sendScheduleUpdateToClients = async (publicNamespace: Namespace) =>
	publicNamespace.emit('publish_schedule', daySchedule);

const sendUIUpdateToClients = async (publicNamespace: Namespace) => {
	publicNamespace.emit('publish_ui', uiSettings);
};
