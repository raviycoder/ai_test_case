import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ApiResponse } from '../types/common';
import { getAuth } from './auth.controller';
import { fromNodeHeaders } from 'better-auth/node';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find().sort({ createdAt: -1 });

  const response: ApiResponse = {
    success: true,
    message: 'Users retrieved successfully',
    data: users
  };

  res.status(200).json(response);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await User.findById(id);
  
  if (!user) {
    throw createError('User not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'User retrieved successfully',
    data: user
  };

  res.status(200).json(response);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, name } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw createError('User with this email already exists', 400);
  }

  const user = await User.create({ email, name });

  const response: ApiResponse = {
    success: true,
    message: 'User created successfully',
    data: user
  };

  res.status(201).json(response);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).select('-__v');

  if (!user) {
    throw createError('User not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'User updated successfully',
    data: user
  };

  res.status(200).json(response);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // Soft delete - just mark as inactive
  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    throw createError('User not found', 404);
  }

  const response: ApiResponse = {
    success: true,
    message: 'User deleted successfully'
  };

  res.status(200).json(response);
});

export const getUserSession = asyncHandler(async (req: Request, res: Response) => {
  try {
    const auth = await getAuth();
    console.log('Auth instance:', auth, req.headers);  
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers)
    });

    if (!session || !session.user) {
      return res.status(200).json({
        success: true,
        message: 'No active session',
        data: session
      });
    }

    return res.status(200).json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});