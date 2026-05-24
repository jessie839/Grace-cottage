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
  addProperty: (property: Omit<Property, 'id' | 'createdDate'>) => void
  deleteProperty: (id: string) => void
  updateProperty: (id: string, updates: Partial<Omit<Property, 'id' | 'createdDate'>>) => void
  addImagesToProperty: (id: string, images: string[]) => void
  removeImageFromProperty: (id: string, imageIndex: number) => void
}

const PropertiesContext = createContext<PropertiesContextType | undefined>(undefined)

const defaultProperties: Property[] = [
  {
    id: '1',
    name: 'Main Cottage',
    description: 'Our stunning main cottage with elegant interiors and modern amenities. Perfect for intimate gatherings and ceremonies.',
    images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23d4a574" width="400" height="300"/%3E%3Crect fill="%238b6f47" y="150" width="400" height="150"/%3E%3Crect fill="%23d4a574" x="50" y="80" width="100" height="120"/%3E%3Crect fill="%235a90c1" x="70" y="100" width="30" height="40"/%3E%3Crect fill="%235a90c1" x="110" y="100" width="30" height="40"/%3E%3C/svg%3E'],
    createdDate: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Garden Terrace',
    description: 'Picturesque outdoor space with scenic views, perfect for ceremonies and outdoor receptions under the stars.',
    images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%2390ee90" width="400" height="200"/%3E%3Crect fill="%23e8d4c4" y="200" width="400" height="100"/%3E%3Ccircle cx="100" cy="100" r="30" fill="%2328a745"/%3E%3Ccircle cx="300" cy="120" r="40" fill="%2328a745"/%3E%3Crect fill="%23d4a574" x="150" y="150" width="100" height="50"/%3E%3C/svg%3E'],
    createdDate: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    name: 'Grand Hall',
    description: 'Versatile hall with high ceilings and flexible layout, ideal for larger celebrations with professional lighting and acoustics.',
    images: ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23c19a6b" width="400" height="300"/%3E%3Crect fill="%238b7355" x="20" y="20" width="360" height="260"/%3E%3Ccircle cx="100" cy="80" r="15" fill="%23ffd700"/%3E%3Ccircle cx="200" cy="80" r="15" fill="%23ffd700"/%3E%3Ccircle cx="300" cy="80" r="15" fill="%23ffd700"/%3E%3C/svg%3E'],
    createdDate: new Date(Date.now() - 172800000).toISOString(),
  },
]

export function PropertiesProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>(defaultProperties)

  useEffect(() => {
    const stored = localStorage.getItem('grace_properties')
    if (stored) {
      try {
        setProperties(JSON.parse(stored))
      } catch {
        setProperties(defaultProperties)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('grace_properties', JSON.stringify(properties))
  }, [properties])

  const addProperty = (property: Omit<Property, 'id' | 'createdDate'>) => {
    const newProperty: Property = {
      ...property,
      id: Date.now().toString(),
      createdDate: new Date().toISOString(),
    }
    setProperties([newProperty, ...properties])
  }

  const deleteProperty = (id: string) => {
    setProperties(properties.filter(p => p.id !== id))
  }

  const updateProperty = (id: string, updates: Partial<Omit<Property, 'id' | 'createdDate'>>) => {
    setProperties(properties.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ))
  }

  const addImagesToProperty = (id: string, images: string[]) => {
    setProperties(properties.map(p => 
      p.id === id ? { ...p, images: [...p.images, ...images] } : p
    ))
  }

  const removeImageFromProperty = (id: string, imageIndex: number) => {
    setProperties(properties.map(p => 
      p.id === id ? { ...p, images: p.images.filter((_, i) => i !== imageIndex) } : p
    ))
  }

  return (
    <PropertiesContext.Provider value={{ properties, addProperty, deleteProperty, updateProperty, addImagesToProperty, removeImageFromProperty }}>
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
