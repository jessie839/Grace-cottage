"use client";

import { motion } from "framer-motion";
import { Trash2, ZoomIn, Plus } from "lucide-react";
import { Property } from "../context/properties-context";
import { useRef } from "react";

interface PropertyCardProps {
  property: Property;
  index: number;
  onImageClick: (imgIndex: number) => void;
  onDelete: () => void;
  onAddImages: (images: string[]) => void;
}

export function PropertyCard({
  property,
  index,
  onImageClick,
  onDelete,
  onAddImages,
}: PropertyCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          onAddImages([event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group rounded-lg overflow-hidden border border-border bg-card hover:shadow-lg transition-shadow flex flex-col"
    >
      {/* Image Container */}
      {property.images.length > 0 ? (
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => onImageClick(0)}
          className="relative w-full aspect-video bg-muted overflow-hidden cursor-pointer flex items-center justify-center group/img flex-shrink-0"
        >
          {property.images[0].startsWith("data:video/") ? (
            <video
              src={property.images[0]}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          ) : (
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-300"
            />
          )}
          <motion.div
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2"
          >
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <ZoomIn className="w-6 h-6 text-white" />
            </div>
            {property.images.length > 1 && (
              <div className="px-3 py-1 bg-white/20 rounded-lg backdrop-blur-sm text-white text-sm font-medium">
                +{property.images.length - 1}
              </div>
            )}
          </motion.div>
        </motion.button>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => fileInputRef.current?.click()}
          className="relative w-full aspect-video bg-muted/30 border-2 border-dashed border-border overflow-hidden cursor-pointer flex items-center justify-center group/img flex-shrink-0"
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Plus className="w-8 h-8" />
            <span className="text-sm font-medium">Add Media</span>
          </div>
        </motion.button>
      )}

      {/* Content */}
      <div className="p-4 space-y-3 flex-grow flex flex-col">
        <div className="flex-grow">
          <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
            {property.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {property.description || "No description"}
          </p>
        </div>

        {/* Image Count */}
        {property.images.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {property.images.length} item
            {property.images.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Add More Images Button */}
        {property.images.length > 0 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Media
          </motion.button>
        )}

        {/* Delete Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span className="text-sm font-medium">Delete</span>
        </motion.button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleAddImages}
        className="hidden"
      />
    </motion.div>
  );
}
