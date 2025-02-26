import { NextRequest, NextResponse } from 'next/server';
import { registerUser } from '../services/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;
    
    // Validate inputs
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }
    
    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Register user
    const user = await registerUser({ name, email, password });
    
    return NextResponse.json({ 
      success: true,
      message: 'User registered successfully', 
      user: { 
        id: user.id, 
        name: user.name,
        email: user.email,
        role: user.role 
      } 
    });
    
  } catch (error: any) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to register user'
      },
      { status: error.message === 'User with this email already exists' ? 409 : 500 }
    );
  }
}
