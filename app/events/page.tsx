'use client'

import { useAuth } from '../context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { MobileLayout } from '../components/mobile-layout'
import { Card } from '@/components/ui/card'
import { Calendar, MapPin, Users } from 'lucide-react'

export default function EventsPage() {
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

  const events = [
    {
      title: 'Summer Party',
      date: 'June 15, 2024',
      location: 'Garden Terrace',
      guests: 75,
      description: 'An enchanting summer celebration under the stars',
    },
    {
      title: 'Evening Gala',
      date: 'May 20, 2024',
      location: 'Grand Hall',
      guests: 120,
      description: 'Elegant evening with fine dining and entertainment',
    },
    {
      title: 'Spring Celebration',
      date: 'April 10, 2024',
      location: 'Main Cottage',
      guests: 60,
      description: 'Intimate gathering celebrating the season of renewal',
    },
  ]

  return (
    <MobileLayout>
      <main className="w-full max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Recent Events
        </h1>
        <p className="text-muted-foreground mb-8">
          Browse photos from our recent celebrations
        </p>

        <div className="space-y-6">
          {events.map((event, idx) => (
            <Card
              key={idx}
              className="p-6 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() =>
                router.push(`/gallery?event=${encodeURIComponent(event.title)}`)
              }
            >
              <h2 className="text-xl font-bold text-foreground mb-3">{event.title}</h2>
              <p className="text-muted-foreground mb-4">{event.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-foreground">{event.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-accent" />
                  <span className="text-foreground">{event.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-secondary" />
                  <span className="text-foreground">{event.guests} guests</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <span className="text-sm font-medium text-primary hover:underline">
                  View Photos →
                </span>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 bg-gradient-to-br from-accent/10 to-transparent border border-accent/20">
          <h2 className="text-lg font-bold text-foreground mb-3">Plan Your Event</h2>
          <p className="text-muted-foreground mb-4">
            Whether it&apos;s an intimate gathering or a grand celebration, Grace Cottage 
            is the perfect venue for your special occasion.
          </p>
          <a href="/contact" className="text-accent font-medium hover:underline">
            Book an Event →
          </a>
        </Card>
      </main>
    </MobileLayout>
  )
}
