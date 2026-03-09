import { NextResponse } from "next/server";
import { getAllLists, createList, addContact } from "@/lib/db";

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
