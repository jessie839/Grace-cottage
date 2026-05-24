'use client'

import { useState, useRef } from 'react'
import { useAuth } from '../context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { MobileLayout } from '../components/mobile-layout'
import { usePhotos } from '../context/photos-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload, X, FolderPlus, Image as ImageIcon } from 'lucide-react'

export default function UploadPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const { folders, addFolder, addMultiplePhotos } = usePhotos()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<'folder' | 'photos'>('folder')
  const [folderName, setFolderName] = useState('')
  const [folderDesc, setFolderDesc] = useState('')
  const [selectedFolderId, setSelectedFolderId] = useState('')
  const [images, setImages] = useState<{ file: string; title: string; description: string; type: 'photo' | 'video' }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [newFolderCreated, setNewFolderCreated] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  if (!isLoggedIn) {
    return null
  }

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!folderName.trim()) {
      setError('Please enter a folder name')
      return
    }

    const newFolderId = addFolder(folderName, folderDesc)
    setSelectedFolderId(newFolderId)
    setFolderName('')
    setFolderDesc('')
    setNewFolderCreated(true)
    setStep('photos')
  }

  const handleSelectFolder = (folderId: string) => {
    setSelectedFolderId(folderId)
    setNewFolderCreated(false)
    setStep('photos')
  }

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const isVideo = file.type.startsWith('video/')
        const reader = new FileReader()
        reader.onload = (event) => {
          setImages((prev) => [
            ...prev,
            {
              file: event.target?.result as string,
              title: file.name.replace(/\.[^.]*$/, ''),
              description: '',
              type: isVideo ? 'video' : 'photo',
            },
          ])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdateImage = (index: number, field: 'title' | 'description', value: string) => {
    setImages((prev) =>
      prev.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    )
  }

  const handleSubmitPhotos = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!selectedFolderId) {
      setError('Please select a folder')
      return
    }

    if (images.length === 0) {
      setError('Please select at least one photo')
      return
    }

    setLoading(true)
    try {
      const photosToAdd = images.map((img) => ({
        title: img.title || (img.type === 'video' ? 'Untitled Video' : 'Untitled Photo'),
        description: img.description,
        image: img.type === 'video' ? 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23333" width="400" height="300"/%3E%3Cpath d="M160 80 L160 220 L280 150 Z" fill="%23fff"/%3E%3C/svg%3E' : img.file,
        video: img.type === 'video' ? img.file : undefined,
        folderId: selectedFolderId,
        uploadDate: new Date().toISOString(),
        type: img.type,
      }))

      addMultiplePhotos(photosToAdd)
      setImages([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setTimeout(() => {
        router.push('/gallery')
      }, 1000)
    } catch {
      setError('Failed to upload photos')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToFolder = () => {
    setStep('folder')
    setImages([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
            {step === 'folder' ? 'Create or Select Folder' : 'Upload Photos'}
          </h1>
          <p className="text-muted-foreground">
            {step === 'folder'
              ? 'Organize your photos in folders'
              : `Upload unlimited photos to "${
                  folders.find((f) => f.id === selectedFolderId)?.name || 'Selected Folder'
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
        {step === 'folder' && (
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
                      className="p-4 text-left rounded-lg border-2 border-border hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <h3 className="font-semibold text-foreground">{folder.name}</h3>
                      {folder.description && (
                        <p className="text-sm text-muted-foreground mt-1">{folder.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {folder.photoCount} photo{folder.photoCount !== 1 ? 's' : ''}
                      </p>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Photo Upload */}
        {step === 'photos' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <form onSubmit={handleSubmitPhotos} className="space-y-6">
                {/* Image Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Select Photos (Upload as many as you want) *
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
                      Photos (PNG, JPG, GIF) or Videos (MP4, WebM, etc.) - No limit on number of files
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
                      {images.length} photo{images.length !== 1 ? 's' : ''} selected
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
                            <img
                              src={img.file}
                              alt={`Preview ${index}`}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                placeholder="Photo title"
                                value={img.title}
                                onChange={(e) =>
                                  handleUpdateImage(index, 'title', e.target.value)
                                }
                                className="w-full px-2 py-1 text-sm rounded bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                              <input
                                type="text"
                                placeholder="Photo description (optional)"
                                value={img.description}
                                onChange={(e) =>
                                  handleUpdateImage(index, 'description', e.target.value)
                                }
                                className="w-full px-2 py-1 text-sm rounded bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="p-1 hover:bg-destructive/20 rounded transition-colors flex-shrink-0"
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
                    {loading ? 'Uploading...' : `Upload ${images.length} File${images.length !== 1 ? 's' : ''}`}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </main>
    </MobileLayout>
  )
}
