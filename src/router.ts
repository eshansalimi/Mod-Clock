import {
	Router,
	type Request,
	type Response,
	type NextFunction
} from 'express';

const router = Router();

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
	if (req.session.userIsAdmin) {
		return next();
	} else {
		res.status(403).json({ success: false, message: 'Not authorized' });
		return false;
	}
};

const sendPublicFile = async (filenameFromPublicDir: string, res: Response) =>
	res.sendFile(filenameFromPublicDir, { root: `${process.cwd()}/Public/` });

router.get('/', (_req, res) => {
	sendPublicFile('home.html', res);
});

router.get('/clock', (_req, res) => {
	sendPublicFile('clock.html', res);
});

router.get('/admin', isAdmin, (_req, res) => {
	sendPublicFile('admin.html', res);
});

router.get('/login', (req, res, next) => {
	if (isAdmin(req, res, next)) res.status(200).redirect('/admin');

	sendPublicFile('login.html', res);
});

// API endpoints
router.post('/admin/login', (req, res) => {
	const { user, password } = req.body;

	if (!user || !password)
		return res
			.status(400)
			.json({ success: false, message: 'Invalid request sent' });

	if (password !== process.env.ADMIN_PASSWORD)
		return res
			.status(403)
			.json({ success: false, message: 'Incorrect credentials' });

	req.session.username = user;
	req.session.userIsAdmin = true;
	return res.status(200).redirect('/admin');
});

router.post('/admin/logout', isAdmin, (req, res) => {
	req.session.destroy((err) => {
		if (err) {
			return res.status(500).json({
				success: false,
				message: 'Failed to logout. Please try again'
			});
		}
		res.clearCookie('connect.sid');
		return res.redirect('/login');
	});
});

export default router;
