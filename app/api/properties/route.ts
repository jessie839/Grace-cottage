import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDatabase();
    const properties = await db
      .collection("properties")
      .find()
      .sort({ createdDate: -1 })
      .toArray();

    return NextResponse.json({
      properties: properties.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description,
        images: p.images || [],
        createdDate: p.createdDate,
      })),
    });
  } catch (error: any) {
    console.error("Failed to fetch properties:", error);
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name || !body.images) {
      return NextResponse.json(
        { error: "Name and images are required" },
        { status: 400 },
      );
    }

    const db = await getDatabase();
    const newProperty = {
      name: body.name,
      description: body.description || "",
      images: body.images,
      createdDate: new Date().toISOString(),
    };

    const result = await db.collection("properties").insertOne(newProperty);
    
    return NextResponse.json({
      property: {
        id: result.insertedId.toString(),
        ...newProperty,
      },
    });
  } catch (error: any) {
    console.error("Failed to create property:", error);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
