'use client'

import { useAuth } from '../context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { MobileLayout } from '../components/mobile-layout'
import { usePhotos } from '../context/photos-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { User, Mail, LogOut, Heart, Download, Camera } from 'lucide-react'

export default function ProfilePage() {
  const { isLoggedIn, user, logout } = useAuth()
  const router = useRouter()
  const { photos } = usePhotos()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  if (!isLoggedIn || !user) {
    return null
  }

  const userPhotos = photos.length
  const totalLikes = photos.reduce((sum, p) => sum + p.likes, 0)
  const totalDownloads = photos.reduce((sum, p) => sum + p.downloads, 0)

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <MobileLayout>
      <main className="w-full max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            My Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account and view your statistics
          </p>
        </div>

        {/* User Card */}
        <Card className="p-6 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm mb-6 border border-border/50">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">{user.username}</h2>
                <p className="text-sm text-muted-foreground">Gallery Administrator</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>

          {/* Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Mail className="w-5 h-5 text-primary" />
              <span>graceamose0@gmail.com</span>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 bg-card/50 backdrop-blur-sm text-center">
            <Camera className="w-8 h-8 text-primary mx-auto mb-3" />
            <div className="text-3xl font-bold text-foreground mb-1">{userPhotos}</div>
            <div className="text-sm text-muted-foreground">Photos Uploaded</div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm text-center">
            <Heart className="w-8 h-8 text-accent mx-auto mb-3" />
            <div className="text-3xl font-bold text-foreground mb-1">{totalLikes}</div>
            <div className="text-sm text-muted-foreground">Total Likes</div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm text-center">
            <Download className="w-8 h-8 text-secondary mx-auto mb-3" />
            <div className="text-3xl font-bold text-foreground mb-1">{totalDownloads}</div>
            <div className="text-sm text-muted-foreground">Total Downloads</div>
          </Card>
        </div>

        {/* Settings Section */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive updates when photos get likes
                </p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Public Profile</p>
                <p className="text-sm text-muted-foreground">
                  Allow others to view your gallery
                </p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Use dark theme in the application
                </p>
              </div>
              <input type="checkbox" className="w-5 h-5" />
            </div>
          </div>
        </Card>

        {/* Additional Info */}
        <Card className="mt-6 p-6 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
          <h3 className="text-lg font-semibold text-foreground mb-2">Gallery Tips</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Organize photos by events for better management</li>
            <li>• Add descriptive titles to help guests find photos</li>
            <li>• Use meaningful descriptions with details about the moment</li>
            <li>• Monitor download counts to see what guests love most</li>
          </ul>
        </Card>
      </main>
    </MobileLayout>
  )
}
