import dotenv from 'dotenv';
dotenv.config({
	path: `${process.cwd()}/.env.${process.env.NODE_ENV || 'development'}`
});

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

import session from 'express-session';
import router from './router.js';

import adminNamespaceHandler from './socket-handlers/adminNSP.js';
import publicNamespaceHandler from './socket-handlers/publicNSP.js';

const expressApp = express();
const httpServer = createServer(expressApp);
const socketIOServer = new Server(httpServer, {
	cors: {
		origin: 'http://localhost'
	}
});

// Augmenting express-session with custom SessionData object (from aksosm.com)
declare module 'express-session' {
	interface SessionData {
		username: string;
		userIsAdmin: boolean;
	}
}

const sessionMiddleware = session({
	secret: process.env.SESSION_SECRET || 'go dutch',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
	// Some sort of separate store will be needed. Keeping session data in memory is unsafe and will usually have memory leaks
});

expressApp.use(sessionMiddleware);
expressApp.use(express.static(`${process.cwd()}/Public`));
expressApp.use(router);

socketIOServer.engine.use(sessionMiddleware);
adminNamespaceHandler(socketIOServer);
publicNamespaceHandler(socketIOServer);

const serverPort = process.env.SERVER_PORT || 3000;
httpServer.listen(serverPort, () => {
	console.log(
		'\x1b[32m\x1b[40m%s\x1b[0m',
		`Mod Clock server running on http://localhost:${serverPort}`
	);
});
