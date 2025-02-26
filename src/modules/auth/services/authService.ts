import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-default-jwt-secret';

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function registerUser(userData: RegisterUserData) {
  const { email, password, name, role = 'user' } = userData;
  
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await hash(password, 10);
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === 'admin' ? 'admin' : 'user',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });
    
    return user;
  } catch (error: any) {
    // Ensure we're throwing an Error object
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(error?.message || 'Failed to register user');
  }
}

export async function authenticateUser(credentials: LoginCredentials) {
  const { email, password } = credentials;
  
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Check password
  const passwordMatch = await compare(password, user.password);
  
  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }
  
  // Return user data (excluding password)
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });
  
  return user;
}

interface LoginParams {
  email: string;
  password: string;
}

export async function loginUser({ email, password }: LoginParams) {
  // Find the user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const token = jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}
