import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";

export async function GET() {
  const db = await getDatabase();
  const [folders, photos] = await Promise.all([
    db.collection("folders").find().sort({ createdDate: -1 }).toArray(),
    db.collection("photos").find().project({ folderId: 1 }).toArray(),
  ]);

  const photoCountMap = photos.reduce<Record<string, number>>((acc, photo) => {
    acc[photo.folderId] = (acc[photo.folderId] || 0) + 1;
    return acc;
  }, {});

  return NextResponse.json(
    folders.map((folder) => ({
      id: folder._id.toString(),
      name: folder.name,
      description: folder.description,
      createdDate: folder.createdDate,
      photoCount: photoCountMap[folder._id.toString()] || 0,
    })),
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, description } = body;

  if (!name || typeof name !== "string") {
    return NextResponse.json(
      { error: "Folder name is required" },
      { status: 400 },
    );
  }

  const db = await getDatabase();
  const result = await db.collection("folders").insertOne({
    name,
    description: typeof description === "string" ? description : undefined,
    createdDate: new Date().toISOString(),
  });

  return NextResponse.json({
    id: result.insertedId.toString(),
    name,
    description: typeof description === "string" ? description : undefined,
    createdDate: new Date().toISOString(),
    photoCount: 0,
  });
}
