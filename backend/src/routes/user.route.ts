import { Router } from 'express';
import {
	getUsers,
	getUserById,
	createUser,
	updateUser,
	deleteUser,
} from '../controllers/user.controller';

const router = Router();

// /api/users
router.get('/', getUsers);
router.post('/', createUser);

// /api/users/:id
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;