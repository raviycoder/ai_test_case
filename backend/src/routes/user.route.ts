import { Router } from 'express';
import {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
	getUserSession,
} from '../controllers/user.controller';

const router = Router();

// /api/users
router.get('/', getUsers);
router.post('/', createUser);
router.get('/session', getUserSession);

// /api/users/:id
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;