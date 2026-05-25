"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface LightboxProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
}

function checkIsVideo(url: string) {
  if (!url) return false;
  return (
    url.startsWith("data:video/") ||
    url.startsWith("video/") ||
    url.includes("/video/upload/") ||
    /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(url)
  );
}

export function Lightbox({
  isOpen,
  images,
  initialIndex = 0,
  onClose,
}: LightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleArrows = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.addEventListener("keydown", handleArrows);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.removeEventListener("keydown", handleArrows);
    };
  }, [isOpen, images.length, onClose]);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  const isVideo = checkIsVideo(currentImage);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors z-10"
              aria-label="Close lightbox"
            >
              <X className="w-6 h-6 text-white" />
            </motion.button>

            {/* Image Counter */}
            {images.length > 1 && (
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="absolute top-4 left-4"
              >
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                  {currentIndex + 1} / {images.length}
                </div>
              </motion.div>
            )}

            {/* Media */}
            {isVideo ? (
              <video
                key={currentIndex}
                src={currentImage}
                controls
                autoPlay
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            ) : (
              <motion.img
                key={currentIndex}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={currentImage}
                alt={`Image ${currentIndex + 1}`}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            )}

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </motion.button>
              </>
            )}

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
              >
                {images.map((img, idx) => (
                  <motion.button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentIndex
                        ? "border-white"
                        : "border-white/30 opacity-60 hover:opacity-100"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {checkIsVideo(img) ? (
                      <video
                        src={img}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
