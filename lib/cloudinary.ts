import { v2 as cloudinary } from "cloudinary";

if (!process.env.CLOUDINARY_CLOUD_NAME) {
  throw new Error("Missing CLOUDINARY_CLOUD_NAME environment variable in .env.local");
}
if (!process.env.CLOUDINARY_API_KEY) {
  throw new Error("Missing CLOUDINARY_API_KEY environment variable in .env.local");
}
if (!process.env.CLOUDINARY_API_SECRET) {
  throw new Error("Missing CLOUDINARY_API_SECRET environment variable in .env.local");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;
