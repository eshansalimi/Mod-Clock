// Import the package modules needed
import dotenv from 'dotenv';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import session from 'express-session';

// Import the file (self-created) modules needed
import router from './router.js';
import adminNamespaceHandler from './socket-handlers/adminNSP.js';
import publicNamespaceHandler from './socket-handlers/publicNSP.js';

// Load environment variables from the appropriate .env file
dotenv.config({
	path: `${process.cwd()}/.env.${process.env.NODE_ENV || 'development'}`
});

// Initialize Express and HTTP servers. Attach Express instance to HTTP server
const expressApp = express();
const httpServer = createServer(expressApp);
// Create SocketIO server with CORS settings
const socketIOServer = new Server(httpServer, {
	cors: {
		origin: 'http://localhost' // Allow cross-origin requests from localhost
	}
});

// Extend the express-session module with custom SessionData interface to include custom properties (idea from https://akoskm.com/how-to-use-express-session-with-custom-sessiondata-typescript)
declare module 'express-session' {
	interface SessionData {
		username: string;
		userIsAdmin: boolean;
	}
}

// Configure session middleware
const sessionMiddleware = session({
	secret: process.env.SESSION_SECRET || 'go dutch',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 }
	// NOTE: A separate store is needed for production to avoid memory leaks
});

// Use session middleware in the Express app
expressApp.use(sessionMiddleware);
// Serve static files from the Public directory
expressApp.use('/static', express.static(`${process.cwd()}/Public`));
// Use the router for handling all HTTP requests
expressApp.use(router);

// Share the session middleware with SocketIO server
socketIOServer.engine.use(sessionMiddleware);
// Set up SocketIO namespace handlers
adminNamespaceHandler(socketIOServer);
publicNamespaceHandler(socketIOServer);

// Set the server port from environment variable or default to 3000
const serverPort = process.env.SERVER_PORT || 3000;
// Start the HTTP server and log a confirmation message
httpServer.listen(serverPort, () => {
	console.log(
		'\x1b[32m\x1b[40m%s\x1b[0m',
		`Mod Clock server running on http://localhost:${serverPort}`
	);
});
