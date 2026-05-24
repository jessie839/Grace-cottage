'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Folder {
  id: string
  name: string
  description?: string
  createdDate: string
  photoCount: number
}

export interface Photo {
  id: string
  title: string
  description: string
  image: string
  video?: string
  folderId: string
  likes: number
  downloads: number
  uploadDate: string
  liked: boolean
  type: 'photo' | 'video'
}

interface PhotosContextType {
  folders: Folder[]
  photos: Photo[]
  addFolder: (name: string, description?: string) => string
  deleteFolder: (id: string) => void
  renameFolder: (id: string, name: string) => void
  addPhoto: (photo: Omit<Photo, 'id' | 'likes' | 'downloads' | 'liked'>) => void
  addMultiplePhotos: (photos: Omit<Photo, 'id' | 'likes' | 'downloads' | 'liked'>[]) => void
  deletePhoto: (id: string) => void
  toggleLike: (id: string) => void
  downloadPhoto: (id: string) => void
  getPhotosByFolder: (folderId: string) => Photo[]
}

const PhotosContext = createContext<PhotosContextType | undefined>(undefined)

const defaultFolders: Folder[] = [
  {
    id: '1',
    name: 'Summer Party',
    description: 'Beautiful summer celebration photos',
    createdDate: new Date().toISOString(),
    photoCount: 1,
  },
  {
    id: '2',
    name: 'Evening Gala',
    description: 'Elegant evening event',
    createdDate: new Date(Date.now() - 86400000).toISOString(),
    photoCount: 1,
  },
]

const defaultPhotos: Photo[] = [
  {
    id: '1',
    title: 'Summer Garden Party',
    description: 'Beautiful sunset over the garden',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23d4a574" width="400" height="300"/%3E%3Crect fill="%23f5deb3" y="200" width="400" height="100"/%3E%3Ccircle cx="300" cy="80" r="40" fill="%23ffa500"/%3E%3C/svg%3E',
    folderId: '1',
    likes: 42,
    downloads: 15,
    uploadDate: new Date().toISOString(),
    liked: false,
  },
  {
    id: '2',
    title: 'Evening Celebration',
    description: 'Guests enjoying the evening entertainment',
    image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e8d4c4" width="400" height="300"/%3E%3Crect fill="%23c19a6b" y="100" width="400" height="200"/%3E%3Ccircle cx="100" cy="100" r="30" fill="%23f5f5dc"/%3E%3Ccircle cx="200" cy="80" r="25" fill="%23f5f5dc"/%3E%3C/svg%3E',
    folderId: '2',
    likes: 38,
    downloads: 12,
    uploadDate: new Date(Date.now() - 86400000).toISOString(),
    liked: false,
  },
]

export function PhotosProvider({ children }: { children: React.ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>(defaultFolders)
  const [photos, setPhotos] = useState<Photo[]>(defaultPhotos)

  useEffect(() => {
    const storedFolders = localStorage.getItem('grace_folders')
    const storedPhotos = localStorage.getItem('grace_photos')
    
    if (storedFolders) {
      try {
        setFolders(JSON.parse(storedFolders))
      } catch {
        setFolders(defaultFolders)
      }
    }

    if (storedPhotos) {
      try {
        setPhotos(JSON.parse(storedPhotos))
      } catch {
        setPhotos(defaultPhotos)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('grace_folders', JSON.stringify(folders))
  }, [folders])

  useEffect(() => {
    localStorage.setItem('grace_photos', JSON.stringify(photos))
  }, [photos])

  const addFolder = (name: string, description?: string): string => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      description,
      createdDate: new Date().toISOString(),
      photoCount: 0,
    }
    setFolders([newFolder, ...folders])
    return newFolder.id
  }

  const deleteFolder = (id: string) => {
    setFolders(folders.filter(f => f.id !== id))
    setPhotos(photos.filter(p => p.folderId !== id))
  }

  const renameFolder = (id: string, name: string) => {
    setFolders(folders.map(f => (f.id === id ? { ...f, name } : f)))
  }

  const addPhoto = (photo: Omit<Photo, 'id' | 'likes' | 'downloads' | 'liked'>) => {
    const newPhoto: Photo = {
      ...photo,
      id: Date.now().toString(),
      likes: 0,
      downloads: 0,
      liked: false,
    }
    setPhotos([newPhoto, ...photos])
    // Update folder photo count
    setFolders(folders.map(f => 
      f.id === photo.folderId ? { ...f, photoCount: f.photoCount + 1 } : f
    ))
  }

  const addMultiplePhotos = (newPhotos: Omit<Photo, 'id' | 'likes' | 'downloads' | 'liked'>[]) => {
    const photosWithIds = newPhotos.map((photo, index) => ({
      ...photo,
      id: (Date.now() + index).toString(),
      likes: 0,
      downloads: 0,
      liked: false,
    }))
    setPhotos([...photosWithIds, ...photos])
    
    // Update folder photo count
    if (newPhotos.length > 0) {
      const folderId = newPhotos[0].folderId
      setFolders(folders.map(f => 
        f.id === folderId ? { ...f, photoCount: f.photoCount + newPhotos.length } : f
      ))
    }
  }

  const deletePhoto = (id: string) => {
    const photo = photos.find(p => p.id === id)
    if (photo) {
      setPhotos(photos.filter(p => p.id !== id))
      setFolders(folders.map(f => 
        f.id === photo.folderId ? { ...f, photoCount: Math.max(0, f.photoCount - 1) } : f
      ))
    }
  }

  const toggleLike = (id: string) => {
    setPhotos(photos.map(p => {
      if (p.id === id) {
        return {
          ...p,
          liked: !p.liked,
          likes: p.liked ? p.likes - 1 : p.likes + 1,
        }
      }
      return p
    }))
  }

  const downloadPhoto = (id: string) => {
    setPhotos(photos.map(p => {
      if (p.id === id) {
        return { ...p, downloads: p.downloads + 1 }
      }
      return p
    }))
  }

  const getPhotosByFolder = (folderId: string) => {
    return photos.filter(p => p.folderId === folderId)
  }

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
  )
}

export function usePhotos() {
  const context = useContext(PhotosContext)
  if (context === undefined) {
    throw new Error('usePhotos must be used within PhotosProvider')
  }
  return context
}
