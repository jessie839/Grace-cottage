"use client";

import { useState, useRef } from "react";
import { useAuth } from "../context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { MobileLayout } from "../components/mobile-layout";
import { usePhotos } from "../context/photos-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, FolderPlus } from "lucide-react";

export default function UploadPage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const { folders, addFolder, addMultiplePhotos } = usePhotos();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<"folder" | "photos">("folder");
  const [folderName, setFolderName] = useState("");
  const [folderDesc, setFolderDesc] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [images, setImages] = useState<
    {
      file: File;
      previewUrl: string;
      title: string;
      description: string;
      type: "photo" | "video";
    }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newFolderCreated, setNewFolderCreated] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!folderName.trim()) {
      setError("Please enter a folder name");
      return;
    }

    try {
      const newFolderId = await addFolder(folderName, folderDesc);
      setSelectedFolderId(newFolderId);
      setFolderName("");
      setFolderDesc("");
      setNewFolderCreated(true);
      setStep("photos");
    } catch {
      setError("Unable to create folder. Please try again.");
    }
  };

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId);
    setNewFolderCreated(false);
    setStep("photos");
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const isVideo = file.type.startsWith("video/");
        const previewUrl = URL.createObjectURL(file);
        setImages((prev) => [
          ...prev,
          {
            file,
            previewUrl,
            title: file.name.replace(/\.[^.]*$/, ""),
            description: "",
            type: isVideo ? "video" : "photo",
          },
        ]);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    const img = images[index];
    if (img && img.previewUrl) {
      URL.revokeObjectURL(img.previewUrl);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateImage = (
    index: number,
    field: "title" | "description",
    value: string,
  ) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img)),
    );
  };

  const handleSubmitPhotos = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedFolderId) {
      setError("Please select a folder");
      return;
    }
    if (!uploadedBy.trim()) {
  setError("Please enter uploader name");
  return;
}

    if (images.length === 0) {
      setError("Please select at least one photo or video");
      return;
    }

    setLoading(true);
    try {
      const photosToAdd = [];

      for (const img of images) {
        // 1. Get signed parameters from our server route
        const signRes = await fetch("/api/cloudinary-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceType: img.type }),
        });

        if (!signRes.ok) {
          throw new Error(`Failed to get upload signature for "${img.title}"`);
        }

        const { signature, timestamp, cloudName, apiKey, folder } = await signRes.json();

        // 2. Upload the file directly to Cloudinary bypassing our backend
        const formData = new FormData();
        formData.append("file", img.file);
        formData.append("api_key", apiKey);
        formData.append("timestamp", timestamp.toString());
        formData.append("signature", signature);
        if (folder) {
          formData.append("folder", folder);
        }

        const resourceType = img.type === "video" ? "video" : "image";
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
        const uploadRes = await fetch(uploadUrl, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(
            errData.error?.message || `Failed to upload "${img.title}" to Cloudinary`
          );
        }

        const uploadData = await uploadRes.json();
        const mediaUrl = uploadData.secure_url;
        const publicId = uploadData.public_id;

        photosToAdd.push({
  title:
    img.title ||
    (img.type === "video" ? "Untitled Video" : "Untitled Photo"),

  description: img.description,

  
  image:
  img.type === "video"
    ? `https://res.cloudinary.com/${cloudName}/video/upload/so_0/${publicId}.jpg`
    : `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${publicId}`,

video:
  img.type === "video"
    ? `https://res.cloudinary.com/${cloudName}/video/upload/sp_auto/${publicId}.m3u8`
    : "",

publicId,

  folderId: selectedFolderId,

  uploadDate: new Date().toISOString(),
  uploadedBy,

  type: img.file.type.startsWith("video/")
  ? "video"
  : "photo",
});
      }

      // 3. Save all uploaded media metadata in one request
      await addMultiplePhotos(photosToAdd);
      
      // Clean up object URLs
      images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
      setImages([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setTimeout(() => {
        router.push("/gallery");
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload photos");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToFolder = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setStep("folder");
    setImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <MobileLayout>
      <main className="w-full max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {step === "folder" ? "Create or Select Folder" : "Upload Photos & Videos"}
          </h1>
          <p className="text-muted-foreground">
            {step === "folder"
              ? "Organize your media in folders"
              : `Upload unlimited files to "${
                  folders.find((f) => f.id === selectedFolderId)?.name ||
                  "Selected Folder"
                }"`}
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Step 1: Folder Selection */}
        {step === "folder" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Create New Folder */}
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <FolderPlus className="w-5 h-5" />
                Create New Folder
              </h2>
              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Folder Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Summer Party 2024"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    className="bg-input border-border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Describe this event..."
                    value={folderDesc}
                    onChange={(e) => setFolderDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  Create Folder
                </Button>
              </form>
            </Card>

            {/* Existing Folders */}
            {folders.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Or Select Existing Folder
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {folders.map((folder, index) => (
                    <motion.button
                      key={folder.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSelectFolder(folder.id)}
                      className="p-4 text-left rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <h3 className="font-semibold text-foreground">
                        {folder.name}
                      </h3>
                      {folder.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {folder.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {folder.photoCount} file
                        {folder.photoCount !== 1 ? "s" : ""}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Photo Upload */}
        {step === "photos" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <form onSubmit={handleSubmitPhotos} className="space-y-6">
                <div> 
                  <label className="block text-sm font-medium text-foreground mb-2">
                     Uploaded By * 
                     </label> 
                     <Input type="text" placeholder="Enter your name" value={uploadedBy} onChange={(e) => setUploadedBy(e.target.value)} className="bg-input border-border" /> 
                     </div>
                {/* Image Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Select photos or videos (Upload as many as you want) *
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-lg p-8 hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Click to upload or drag and drop
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Photos or videos (PNG, JPG, GIF, MP4, WebM) - No limit on
                      number of files
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleImagesChange}
                    className="hidden"
                  />
                </div>

                {/* Image Previews */}
                {images.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      {images.length} item{images.length !== 1 ? "s" : ""}{" "}
                      selected
                    </h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {images.map((img, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 rounded-lg border border-border bg-secondary/20"
                        >
                          <div className="flex gap-4">
                            {img.type === "video" ? (
                              <video
                                src={img.previewUrl}
                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                muted
                                controls
                              />
                            ) : (
                            <img
  src={img.previewUrl}
  onClick={() => {
    console.log("clicked"); // test
    setFullscreenImage(img.previewUrl);
  }}
  className="w-20 h-20 object-cover rounded-lg flex-shrink-0 cursor-pointer hover:opacity-80 transition"
  alt="preview"
/>
                            )}
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                placeholder="File title"
                                value={img.title}
                                onChange={(e) =>
                                  handleUpdateImage(
                                    index,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 text-sm rounded bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                              <input
                                type="text"
                                placeholder="Description (optional)"
                                value={img.description}
                                onChange={(e) =>
                                  handleUpdateImage(
                                    index,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-2 py-1 text-sm rounded bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="p-1 hover:bg-destructive/20 rounded transition-colors flex-shrink-0 animate-none"
                            >
                              <X className="w-5 h-5 text-destructive" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToFolder}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || images.length === 0}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                  >
                    {loading
                      ? "Uploading..."
                      : `Upload ${images.length} File${images.length !== 1 ? "s" : ""}`}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </main>
      {fullscreenImage && (
  <div
    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
    onClick={() => setFullscreenImage(null)}
  >
    <img
      src={fullscreenImage}
      className="max-w-[95%] max-h-[95%] object-contain rounded-lg"
      alt="Fullscreen"
    />

    {/* Close button */}
    <button
      onClick={() => setFullscreenImage(null)}
      className="absolute top-4 right-4 text-white text-2xl"
    >
      ✕
    </button>
  </div>
)}
    </MobileLayout>
  );
}
