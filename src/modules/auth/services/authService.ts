import { PrismaClient } from '@prisma/client';
import { hash, compare } from 'bcrypt';

const prisma = new PrismaClient();

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export async function registerUser(userData: RegisterUserData) {
  const { email, password, name } = userData;
  
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
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });
  
  return user;
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
