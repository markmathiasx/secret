import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/user-database';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json();

    // Validation
    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Create user
    const user = createUser({ email, password, name, phone });

    if (!user) {
      return NextResponse.json(
        { error: 'Erro ao criar usuário' },
        { status: 500 }
      );
    }

    // Create response with cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Usuário criado com sucesso!',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
        },
      },
      { status: 201 }
    );

    // Set auth token in cookie
    response.cookies.set({
      name: 'mdh_auth_token',
      value: user.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('Register error:', error);

    if (error.message === 'User already exists') {
      return NextResponse.json(
        { error: 'Este email já está cadastrado' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Erro ao cadastrar' },
      { status: 500 }
    );
  }
}
