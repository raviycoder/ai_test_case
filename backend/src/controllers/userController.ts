import { Request, Response } from 'express';
import { User } from '../models/User';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { ApiResponse } from '../types/common';

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({ isActive: true })
    .select('-__v')
    .sort({ createdAt: -1 });

  const response: ApiResponse = {
    success: true,
    message: 'Users retrieved successfully',
    data: users
  };

  res.status(200).json(response);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id).select('-__v');
  
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
