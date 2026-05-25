import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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
  
  if (!updatedFolder) {
    return NextResponse.json({ error: "Folder not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: updatedFolder._id.toString(),
    name: updatedFolder.name,
    description: updatedFolder.description,
    createdDate: updatedFolder.createdDate,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid folder id" }, { status: 400 });
  }

  const db = await getDatabase();
  
  // Find all photos in this folder first to delete their Cloudinary assets
  const photos = await db.collection("photos").find({ folderId: id }).toArray();
  for (const photo of photos) {
    if (photo.publicId) {
      try {
        await cloudinary.uploader.destroy(photo.publicId, {
          resource_type: photo.type === "video" ? "video" : "image",
        });
      } catch (err) {
        console.error("Failed to delete asset from Cloudinary:", err);
      }
    }
  }

  await db.collection("folders").deleteOne({ _id: new ObjectId(id) });
  await db.collection("photos").deleteMany({ folderId: id });

  return NextResponse.json({ success: true });
}
