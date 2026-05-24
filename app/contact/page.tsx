'use client'

import { useState } from 'react'
import { useAuth } from '../context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { MobileLayout } from '../components/mobile-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export default function ContactPage() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  if (!isLoggedIn) {
    return null
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setFormData({ name: '', email: '', message: '' })
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <MobileLayout>
      <main className="w-full max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Contact Us
        </h1>
        <p className="text-muted-foreground mb-8">
          Get in touch with us
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="space-y-4">
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <div className="flex gap-4">
                <MapPin className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Address</h3>
                  <p className="text-sm text-muted-foreground">
                    No: R-37, Grace Cottage<br />
                    Pallavan nagar, 7th cross street<br />
                    Thiruverkadu, Chennai - 600077
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <div className="flex gap-4">
                <Phone className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Phone</h3>
                  <p className="text-sm text-muted-foreground">
                    +91 9940409759
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <div className="flex gap-4">
                <Mail className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Email</h3>
                  <p className="text-sm text-muted-foreground">
                    garceamose0@gmail.com
                  </p>
                </div>
              </div>
            </Card>

            
          </div>

          {/* Contact Form */}
          <Card className="p-6 bg-card/50 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {submitted && (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg text-primary text-sm">
                  Thank you for your message! We&apos;ll get back to you soon.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Name
                </label>
                <Input
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="bg-input border-border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <textarea
                  placeholder="Tell us about your event..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Send Message
              </Button>
            </form>
          </Card>
        </div>
      </main>
    </MobileLayout>
  )
}
