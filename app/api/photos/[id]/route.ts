import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDatabase } from "@/lib/mongodb";
import cloudinary from "@/lib/cloudinary";

function normalizePhoto(photo: any) {
  return {
    id: photo._id.toString(),
    title: photo.title,
    description: photo.description,
    image: photo.image,
    video: photo.video,
    publicId: photo.publicId,
    folderId: photo.folderId,
    likes: photo.likes,
    downloads: photo.downloads,
    uploadDate: photo.uploadDate,
    liked: photo.liked,
    type: photo.type,
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
  }

  const body = await req.json();
  const db = await getDatabase();
  const photos = db.collection("photos");
  const existing = await photos.findOne({ _id: new ObjectId(id) });

  if (!existing) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  if (body.action === "toggleLike") {
    const liked = !existing.liked;
    await photos.updateOne(
      { _id: new ObjectId(id) },
      { $set: { liked, likes: existing.likes + (liked ? 1 : -1) } },
    );
  } else if (body.action === "incrementDownloads") {
    await photos.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { downloads: 1 } },
    );
  } else {
    const updateFields: any = {};
    if (typeof body.title === "string") updateFields.title = body.title;
    if (typeof body.description === "string")
      updateFields.description = body.description;
    if (typeof body.image === "string") updateFields.image = body.image;
    if (typeof body.video === "string") updateFields.video = body.video;
    if (typeof body.publicId === "string") updateFields.publicId = body.publicId;
    if (typeof body.type === "string") updateFields.type = body.type;
    if (typeof body.folderId === "string")
      updateFields.folderId = body.folderId;
    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }
    await photos.updateOne({ _id: new ObjectId(id) }, { $set: updateFields });
  }

  const updated = await photos.findOne({ _id: new ObjectId(id) });
  if (!updated) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }
  return NextResponse.json(normalizePhoto(updated));
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
  }

  const db = await getDatabase();
  const photo = await db.collection("photos").findOne({ _id: new ObjectId(id) });
  if (photo && photo.publicId) {
    try {
      await cloudinary.uploader.destroy(photo.publicId, {
        resource_type: photo.type === "video" ? "video" : "image",
      });
    } catch (err) {
      console.error("Failed to delete asset from Cloudinary:", err);
    }
  }

  await db.collection("photos").deleteOne({ _id: new ObjectId(id) });
  return NextResponse.json({ success: true });
}
