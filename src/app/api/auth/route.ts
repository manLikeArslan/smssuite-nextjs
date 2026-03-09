import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    const { password } = await request.json();
    const correctPassword = process.env.APP_PASSWORD;

    if (password === correctPassword) {
        const cookieStore = await cookies();
        cookieStore.set("auth_session", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 24 hours
            path: "/",
        });

        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
}

export async function DELETE() {
    const cookieStore = await cookies();
    cookieStore.delete("auth_session");
    return NextResponse.json({ success: true });
}

export async function GET() {
    const cookieStore = await cookies();
    const session = cookieStore.get("auth_session");
    return NextResponse.json({ authenticated: !!session });
}
