'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Property {
  id: string
  name: string
  description: string
  images: string[]
  createdDate: string
}

interface PropertiesContextType {
  properties: Property[]
  addProperty: (property: Omit<Property, 'id' | 'createdDate'>) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
  updateProperty: (id: string, updates: Partial<Omit<Property, 'id' | 'createdDate'>>) => Promise<void>
  addImagesToProperty: (id: string, images: string[]) => Promise<void>
  removeImageFromProperty: (id: string, imageIndex: number) => Promise<void>
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined)

export function PropertiesProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    async function loadProperties() {
      try {
        const res = await fetch('/api/properties', { cache: 'no-store' })
        if (!res.ok) {
          throw new Error('Failed to load shared properties')
        }
        const data = await res.json()
        setProperties(data.properties ?? [])
      } catch (error) {
        console.error('Unable to load shared property data:', error)
        setProperties([])
      }
    }
    loadProperties()
  }, [])

  const addProperty = async (property: Omit<Property, 'id' | 'createdDate'>) => {
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(property),
    })

    if (!res.ok) {
      throw new Error('Failed to add property')
    }

    const data = await res.json()
    setProperties((prev) => [data.property, ...prev])
  }

  const deleteProperty = async (id: string) => {
    const res = await fetch(`/api/properties/${id}`, {
      method: 'DELETE',
    })

    if (!res.ok) {
      throw new Error('Failed to delete property')
    }

    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  const updateProperty = async (id: string, updates: Partial<Omit<Property, 'id' | 'createdDate'>>) => {
    const res = await fetch(`/api/properties/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    })

    if (!res.ok) {
      throw new Error('Failed to update property')
    }

    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }

  const addImagesToProperty = async (id: string, images: string[]) => {
    const res = await fetch(`/api/properties/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_images', images }),
    })

    if (!res.ok) {
      throw new Error('Failed to add images to property')
    }

    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, images: [...p.images, ...images] } : p))
    )
  }

  const removeImageFromProperty = async (id: string, imageIndex: number) => {
    const property = properties.find((p) => p.id === id)
    if (!property) return

    const updatedImages = property.images.filter((_, i) => i !== imageIndex)
    const res = await fetch(`/api/properties/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: { images: updatedImages } }),
    })

    if (!res.ok) {
      throw new Error('Failed to remove image')
    }

    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, images: updatedImages } : p))
    )
  }

  return (
    <PropertiesContext.Provider
      value={{
        properties,
        addProperty,
        deleteProperty,
        updateProperty,
        addImagesToProperty,
        removeImageFromProperty,
      }}
    >
      {children}
    </PropertiesContext.Provider>
  )
}

export function useProperties() {
  const context = useContext(PropertiesContext)
  if (context === undefined) {
    throw new Error('useProperties must be used within PropertiesProvider')
  }
  return context
}
