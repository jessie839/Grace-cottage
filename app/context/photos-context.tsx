"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Folder {
  id: string;
  name: string;
  description?: string;
  createdDate: string;
  photoCount: number;
}

export interface Photo {
  id: string;
  title: string;
  description: string;
  image: string;
  video?: string;
  publicId?: string;
  folderId: string;
  likes: number;
  downloads: number;
  uploadDate: string;
  liked: boolean;
  type: "photo" | "video";
}

interface PhotosContextType {
  folders: Folder[];
  photos: Photo[];
  addFolder: (name: string, description?: string) => Promise<string>;
  deleteFolder: (id: string) => Promise<void>;
  renameFolder: (id: string, name: string) => Promise<void>;
  addPhoto: (
    photo: Omit<Photo, "id" | "likes" | "downloads" | "liked">,
  ) => Promise<void>;
  addMultiplePhotos: (
    photos: Omit<Photo, "id" | "likes" | "downloads" | "liked">[],
  ) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  downloadPhoto: (id: string) => Promise<void>;
  getPhotosByFolder: (folderId: string) => Photo[];
}

const PhotosContext = createContext<PhotosContextType | undefined>(undefined);

export function PhotosProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/photos", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("Failed to load shared data");
        }

        const data = await res.json();
        setFolders(data.folders ?? []);
        setPhotos(data.photos ?? []);
      } catch (error) {
        console.error("Unable to load shared photo data:", error);
        setFolders([]);
        setPhotos([]);
      }
    }

    loadData();
  }, []);

  const addFolder = async (
    name: string,
    description?: string,
  ): Promise<string> => {
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });

    if (!res.ok) {
      throw new Error("Failed to create folder");
    }

    const folder = await res.json();
    setFolders((prev) => [folder, ...prev]);
    return folder.id;
  };

  const deleteFolder = async (id: string) => {
    const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
    if (!res.ok) {
      throw new Error("Failed to delete folder");
    }

    setFolders((prev) => prev.filter((folder) => folder.id !== id));
    setPhotos((prev) => prev.filter((photo) => photo.folderId !== id));
  };

  const renameFolder = async (id: string, name: string) => {
    const res = await fetch(`/api/folders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      throw new Error("Failed to rename folder");
    }

    const updated = await res.json();
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === id ? { ...folder, name: updated.name } : folder,
      ),
    );
  };

  const addPhoto = async (
    photo: Omit<Photo, "id" | "likes" | "downloads" | "liked">,
  ) => {
    const res = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photos: [photo] }),
    });

    if (!res.ok) {
      throw new Error("Failed to upload photo");
    }

    const data = await res.json();
    const inserted = data.photos[0];

    setPhotos((prev) => [inserted, ...prev]);
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === inserted.folderId
          ? { ...folder, photoCount: folder.photoCount + 1 }
          : folder,
      ),
    );
  };

  const addMultiplePhotos = async (
    newPhotos: Omit<Photo, "id" | "likes" | "downloads" | "liked">[],
  ) => {
    const res = await fetch("/api/photos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photos: newPhotos }),
    });

    if (!res.ok) {
      throw new Error("Failed to upload photos");
    }

    const data = await res.json();
    const inserted = data.photos;

    setPhotos((prev) => [...inserted, ...prev]);

    if (inserted.length > 0) {
      const folderId = inserted[0].folderId;
      setFolders((prev) =>
        prev.map((folder) =>
          folder.id === folderId
            ? { ...folder, photoCount: folder.photoCount + inserted.length }
            : folder,
        ),
      );
    }
  };

  const deletePhoto = async (id: string) => {
    const photo = photos.find((p) => p.id === id);
    if (!photo) return;

    const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
    if (!res.ok) {
      throw new Error("Failed to delete photo");
    }

    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setFolders((prev) =>
      prev.map((folder) =>
        folder.id === photo.folderId
          ? { ...folder, photoCount: Math.max(0, folder.photoCount - 1) }
          : folder,
      ),
    );
  };

  const toggleLike = async (id: string) => {
    const res = await fetch(`/api/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggleLike" }),
    });

    if (!res.ok) {
      throw new Error("Unable to update like status");
    }

    const updated = await res.json();
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === id ? updated : photo)),
    );
  };

  const downloadPhoto = async (id: string) => {
    const res = await fetch(`/api/photos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "incrementDownloads" }),
    });

    if (!res.ok) {
      throw new Error("Unable to update download count");
    }

    const updated = await res.json();
    setPhotos((prev) =>
      prev.map((photo) => (photo.id === id ? updated : photo)),
    );
  };

  const getPhotosByFolder = (folderId: string) => {
    return photos.filter((p) => p.folderId === folderId);
  };

  return (
    <PhotosContext.Provider
      value={{
        folders,
        photos,
        addFolder,
        deleteFolder,
        renameFolder,
        addPhoto,
        addMultiplePhotos,
        deletePhoto,
        toggleLike,
        downloadPhoto,
        getPhotosByFolder,
      }}
    >
      {children}
    </PhotosContext.Provider>
  );
}

export function usePhotos() {
  const context = useContext(PhotosContext);
  if (context === undefined) {
    throw new Error("usePhotos must be used within PhotosProvider");
  }
  return context;
}
