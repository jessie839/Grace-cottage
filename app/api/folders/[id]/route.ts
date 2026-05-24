import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid folder id" }, { status: 400 });
  }

  const body = await req.json();
  const updateFields: any = {};
  if (typeof body.name === "string") updateFields.name = body.name;
  if (typeof body.description === "string")
    updateFields.description = body.description;

  if (!Object.keys(updateFields).length) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const db = await getDatabase();
  await db
    .collection("folders")
    .updateOne({ _id: new ObjectId(id) }, { $set: updateFields });

  const updatedFolder = await db
    .collection("folders")
    .findOne({ _id: new ObjectId(id) });
  return NextResponse.json({
    id: updatedFolder._id.toString(),
    name: updatedFolder.name,
    description: updatedFolder.description,
    createdDate: updatedFolder.createdDate,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid folder id" }, { status: 400 });
  }

  const db = await getDatabase();
  await db.collection("folders").deleteOne({ _id: new ObjectId(id) });
  await db.collection("photos").deleteMany({ folderId: id });

  return NextResponse.json({ success: true });
}
