import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const db = await getDatabase();
    await db.collection("properties").deleteOne({
      _id: new ObjectId(id),
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete property:", error);
    return NextResponse.json(
      { error: "Failed to delete property" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const db = await getDatabase();

    let updateDoc: any = {};
    if (body.action === "add_images") {
      updateDoc = { $push: { images: { $each: body.images } } };
    } else if (body.action === "remove_image") {
      updateDoc = { $set: body.updates };
    } else {
      updateDoc = { $set: body.updates };
    }

    await db.collection("properties").updateOne(
      { _id: new ObjectId(id) },
      updateDoc
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to update property:", error);
    return NextResponse.json(
      { error: "Failed to update property" },
      { status: 500 },
    );
  }
}
