import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = await getDatabase();
  const [folders, photos] = await Promise.all([
    db.collection("folders").find().sort({ createdDate: -1 }).toArray(),
    db.collection("photos").find().sort({ uploadDate: -1 }).toArray(),
  ]);

  const photoCountMap = photos.reduce<Record<string, number>>((acc, photo) => {
    acc[photo.folderId] = (acc[photo.folderId] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json({
    folders: folders.map((folder) => ({
      id: folder._id.toString(),
      name: folder.name,
      description: folder.description,
      createdDate: folder.createdDate,
      photoCount: photoCountMap[folder._id.toString()] || 0,
    })),
    photos: photos.map((photo) => ({
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
    })),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const photos = Array.isArray(body.photos) ? body.photos : [];

  if (!photos.length) {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }

  const docs = photos.map((photo: any) => ({
    title: photo.title,
    description: photo.description || "",
    image: photo.image,
    video: photo.video,
    publicId: photo.publicId,
    folderId: photo.folderId,
    likes: 0,
    downloads: 0,
    uploadDate: photo.uploadDate || new Date().toISOString(),
    liked: false,
    type: photo.type,
  }));

  const db = await getDatabase();
  const result = await db.collection("photos").insertMany(docs);
  const insertedIds = Object.values(result.insertedIds) as {
    toString: () => string;
  }[];

  const inserted = docs.map((doc: any, index: number) => ({
    id: insertedIds[index].toString(),
    ...doc,
  }));

  return NextResponse.json({ photos: inserted });
}
