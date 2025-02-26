import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDocumentById, updateDocument, deleteDocument, updateDocumentStatus } from '../services/documentService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the user ID and role
    const prisma = new (await import('@prisma/client')).PrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        role: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const document = await getDocumentById(params.id, user.id, user.role);
    
    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ document });
  } catch (error: any) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the user ID and role
    const prisma = new (await import('@prisma/client')).PrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        role: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    const data = await request.json();
    const { title, description } = data;
    
    // Updated to match the function signature: (id, userId, data)
    const updatedDocument = await updateDocument(params.id, user.id, {
      title,
      description
    });
    
    return NextResponse.json({ document: updatedDocument });
  } catch (error: any) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get the user ID and role
    const prisma = new (await import('@prisma/client')).PrismaClient();
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true,
        role: true
      }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    await deleteDocument(params.id, user.id, user.role);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}
