import { NextRequest, NextResponse } from "next/server";

import { signUpSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/supabase-client";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const body = signUpSchema.parse(json);

    // Check if user already exists
    const { data: existingUser } = await db.users.findByEmail(body.email);

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 12);

    // Create user using Supabase
    const { data: user, error } = await db.users.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
    });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { message: "Error creating user" },
        { status: 500 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { user: userWithoutPassword, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
