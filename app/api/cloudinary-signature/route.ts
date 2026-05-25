import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { resourceType } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "grace-cottage";

    // Parameters to sign must match EXACTLY what the client sends to Cloudinary.
    const paramsToSign = {
      timestamp,
      folder,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
    });
  } catch (error: any) {
    console.error("Cloudinary signature generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate signature" },
      { status: 500 }
    );
  }
}
