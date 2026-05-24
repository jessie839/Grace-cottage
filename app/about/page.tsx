'use client'

import { useAuth } from '../context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { MobileLayout } from '../components/mobile-layout'
import { Card } from '@/components/ui/card'

export default function AboutPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  if (!isLoggedIn) {
    return null
  }

  return (
    <MobileLayout>
      <main className="w-full max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          About Grace Cottage
        </h1>
        <p className="text-muted-foreground mb-8">
          Learn more about our beautiful apartment and services
        </p>

        <div className="space-y-6">
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-foreground mb-3">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed">
             Grace Cottage Apartment is a simple and comfortable apartment designed for peaceful family living. With practical facilities and a safe environment, the apartment provides residents with the comfort and convenience needed for everyday life. </p>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-foreground mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
             Our mission is to provide a safe, peaceful, and comfortable living environment for families by offering essential facilities, reliable infrastructure, and a friendly community atmosphere.
            </p>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-foreground mb-3">Facilities</h2>
           <ul className="space-y-2 text-muted-foreground">
  <li>• Wide parking area</li>
  <li>• Individual water tank for every house</li>
  <li>• Separate service area for each flat</li>
  <li>• Balcony/service area available even for ground floor flats</li>
  <li>• Hot water facility available in both bathrooms through a single heater system</li>
  <li>• Dual safety grills in every flat</li>
  <li>• Individual gate keys for all flat members</li>
  <li>• Peaceful and family-friendly environment</li>
</ul>
          </Card>

         
        </div>
      </main>
    </MobileLayout>
  )
}
