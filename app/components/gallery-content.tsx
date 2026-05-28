'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '../context/auth-context'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AnimatedPhotoCard } from './animated-photo-card'
import { usePhotos } from '../context/photos-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Folder, ChevronRight, Trash2 } from 'lucide-react'

export function GalleryContent() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { folders, photos, toggleLike, downloadPhoto, deletePhoto, deleteFolder, getPhotosByFolder } = usePhotos()
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    const folderParam = searchParams.get('folder')
    if (folderParam) {
      setSelectedFolderId(decodeURIComponent(folderParam))
    }
  }, [searchParams])

  if (!isLoggedIn) {
    return null
  }

  const filteredPhotos = selectedFolderId
    ? getPhotosByFolder(selectedFolderId)
    : photos

  const selectedFolder = folders.find(f => f.id === selectedFolderId)

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            {selectedFolder ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => setSelectedFolderId(null)}
                    className="text-primary hover:text-primary/80 transition-colors flex items-center gap-1 text-sm"
                  >
                    Gallery
                  </button>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{selectedFolder.name}</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  {selectedFolder.name}
                </h1>
                {selectedFolder.description && (
                  <p className="text-muted-foreground mt-1">{selectedFolder.description}</p>
                )}
              </>
            ) : (
              <>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  Photo Folders
                </h1>
                <p className="text-muted-foreground">
                  {folders.length} folder{folders.length !== 1 ? 's' : ''} • {photos.length} photo{photos.length !== 1 ? 's' : ''}
                </p>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Folders View */}
      {!selectedFolder && folders.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-semibold text-foreground mb-4">Your Folders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder, index) => (
              <motion.button
                key={folder.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedFolderId(folder.id)}
                className="p-4 text-left rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Folder className="w-8 h-8 text-primary" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Delete folder "${folder.name}" and all its photos?`)) {
                        deleteFolder(folder.id)
                      }
                    }}
                  className="p-2 bg-destructive/10 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
                <h3 className="font-semibold text-foreground">{folder.name}</h3>
                {folder.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{folder.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  {folder.photoCount} photo{folder.photoCount !== 1 ? 's' : ''}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Photos in Selected Folder */}
      {selectedFolder && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-4 bg-card/50 backdrop-blur-sm rounded-lg border border-border"
          >
            <p className="text-sm text-muted-foreground">
              {filteredPhotos.length} photo{filteredPhotos.length !== 1 ? 's' : ''} in this folder
            </p>
          </motion.div>

          {filteredPhotos.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredPhotos.map((photo, index) => (
                <AnimatedPhotoCard
                  key={photo.id}
                  photo={photo}
                  index={index}
                  onLike={toggleLike}
                  onDownload={downloadPhoto}
                  onDelete={deletePhoto}
                />
              ))}
            </motion.div>
          ) : (
            <Card className="p-12 text-center bg-card/50 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-foreground mb-2">No photos yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by uploading photos to this folder
              </p>
              <Button asChild>
                <a href="/upload">Upload Photos</a>
              </Button>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!selectedFolder && folders.length === 0 && (
        <Card className="p-12 text-center bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-2">No folders yet</h3>
          <p className="text-muted-foreground mb-4">
            Create a folder to start organizing your photos
          </p>
          <Button asChild>
            <a href="/upload">Create Folder</a>
          </Button>
        </Card>
      )}
    </main>
  )
}
