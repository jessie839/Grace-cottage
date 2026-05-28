"use client";

import { motion } from "framer-motion";
import { Heart, Download, Trash2 } from "lucide-react";
import { Photo } from "../context/photos-context";

interface AnimatedPhotoCardProps {
  photo: Photo;
  index: number;
  onLike: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AnimatedPhotoCard({
  photo,
  index,
  onLike,
  onDownload,
  onDelete,
}: AnimatedPhotoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      <div className="h-full border border-border rounded-lg overflow-hidden bg-card/50 backdrop-blur-sm hover:shadow-lg transition-shadow group">
        {/* Media */}
        <div className="relative w-full aspect-square overflow-hidden bg-muted">
  <p className="absolute top-1 left-1 z-50 bg-black text-white text-xs p-1">
    {photo.type}
  </p>

  {photo.type === "video" ? (
    <video
      src={photo.video}
      poster={photo.image}
      className="w-full h-full object-cover"
      controls
      playsInline
      preload="metadata"
    />
  ) : (
    <img
      src={photo.image}
      alt={photo.title}
      className="w-full h-full object-cover"
    />
  )}
</div>

        {/* Content */}
        <div className="p-4">
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-semibold text-foreground mb-1 line-clamp-1"
          >
            {photo.title}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-xs text-muted-foreground mb-3 line-clamp-2"
          >
            {photo.description}
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="flex justify-between text-xs text-muted-foreground mb-4 pb-4 border-b border-border"
          >
            <span>{photo.likes} likes</span>
            <span>{photo.downloads} downloads</span>
          </motion.div>

          {/* Actions */}
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onLike(photo.id)}
              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                photo.liked
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary/50 text-foreground hover:bg-secondary"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${photo.liked ? "fill-current" : ""}`}
              />
              <span className="text-xs font-medium">Like</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDownload(photo.id)}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-secondary/50 text-foreground hover:bg-secondary transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="text-xs font-medium">Download</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (confirm("Delete this photo?")) {
                  onDelete(photo.id);
                }
              }}
              className="flex items-center justify-center px-3 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
