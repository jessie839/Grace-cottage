'use client'

import { Suspense } from 'react'
import { GalleryContent } from '../components/gallery-content'
import { MobileLayout } from '../components/mobile-layout'

export default function GalleryPage() {
  return (
    <MobileLayout>
      <Suspense
        fallback={
          <main className="w-full max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading gallery...</p>
            </div>
          </main>
        }
      >
        <GalleryContent />
      </Suspense>
    </MobileLayout>
  )
}
