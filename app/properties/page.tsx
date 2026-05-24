"use client";

import { useState, useRef } from "react";
import { useAuth } from "../context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { MobileLayout } from "../components/mobile-layout";
import { PropertyCard } from "../components/property-card";
import { Lightbox } from "../components/lightbox";
import { useProperties } from "../context/properties-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

export default function PropertiesPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const { properties, addProperty, deleteProperty, addImagesToProperty } =
    useProperties();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading || !isLoggedIn) {
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImages((prev) => [...prev, event.target?.result as string]);
          setError("");
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || images.length === 0) {
      setError(
        "Please enter a property name and select at least one photo or video",
      );
      return;
    }

    setLoading(true);
    try {
      addProperty({
        name: name.trim(),
        description: description.trim(),
        images,
      });

      setName("");
      setDescription("");
      setImages([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setShowForm(false);
    } catch {
      setError("Failed to add property");
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (propertyImages: string[], index: number) => {
    setLightboxImages(propertyImages);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <MobileLayout>
      <main className="w-full max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-start"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Properties
            </h1>
            <p className="text-muted-foreground">
              {properties.length} propert{properties.length !== 1 ? "ies" : "y"}
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            {showForm ? "Cancel" : "Add Property"}
          </Button>
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

        {/* Add Property Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-foreground mb-6">
                Add New Property
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Media Upload */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Property media (photos or videos) *
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-lg p-8 hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">
                      Click to upload photos or videos
                    </span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG, GIF, MP4 or WebM - Multiple files supported
                    </span>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {/* Image Previews */}
                  {images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                      {images.map((img, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="relative group"
                        >
                          {img.startsWith("data:video/") ? (
                            <video
                              src={img}
                              className="w-full h-32 object-cover rounded-lg border-2 border-border"
                              muted
                              controls
                            />
                          ) : (
                            <img
                              src={img}
                              alt={`Preview ${index}`}
                              className="w-full h-32 object-cover rounded-lg border-2 border-border"
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-destructive rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Property Name */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Property Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Garden Pavilion"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="bg-input border-border"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Describe this property..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={loading}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  {loading ? "Adding..." : "Add Property"}
                </Button>
              </form>
            </Card>
          </motion.div>
        )}

        {/* Properties Grid */}
        {properties.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {properties.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={index}
                onImageClick={(imgIndex) =>
                  handleImageClick(property.images, imgIndex)
                }
                onDelete={() => {
                  if (confirm(`Delete "${property.name}"?`)) {
                    deleteProperty(property.id);
                  }
                }}
                onAddImages={(newImages) =>
                  addImagesToProperty(property.id, newImages)
                }
              />
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-12 text-center bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No properties yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your first property to showcase your venues
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                Add Property
              </Button>
            </Card>
          </motion.div>
        )}
      </main>

      {/* Lightbox */}
      <Lightbox
        isOpen={lightboxOpen}
        images={lightboxImages}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
    </MobileLayout>
  );
}
