'use client'

import { AuthProvider } from './context/auth-context'
import { PhotosProvider } from './context/photos-context'
import { PropertiesProvider } from './context/properties-context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PhotosProvider>
        <PropertiesProvider>
          {children}
        </PropertiesProvider>
      </PhotosProvider>
    </AuthProvider>
  )
}
