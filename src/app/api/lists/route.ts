import { NextResponse } from "next/server";
import { getAllLists, createList, addContact } from "@/lib/db";
import { isValidPhone } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const lists = getAllLists.all();
        return NextResponse.json(lists);
    } catch (error) {
        return NextResponse.json({ error: "Failed to load lists" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { name, numbers } = await req.json();

        if (typeof name !== 'string' || !name.trim()) {
            return NextResponse.json({ error: "Name is required and must be a string" }, { status: 400 });
        }

        if (!Array.isArray(numbers)) {
            return NextResponse.json({ error: "Numbers must be an array" }, { status: 400 });
        }

        const invalidPhones = numbers.filter(phone => !isValidPhone(phone));
        if (invalidPhones.length > 0) {
            return NextResponse.json({
                error: "Invalid phone number format detected in list",
                invalidPhones: invalidPhones.slice(0, 10)
            }, { status: 400 });
        }

        const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

        // Save list
        createList.run(id, name, numbers.length);

        // Save contacts
        for (const phone of numbers) {
            addContact.run(id, phone, 'new');
        }

        return NextResponse.json({
            id,
            name,
            count: numbers.length,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("LIST SAVE ERROR:", error);
        return NextResponse.json({ error: "Failed to save list" }, { status: 500 });
    }
}
