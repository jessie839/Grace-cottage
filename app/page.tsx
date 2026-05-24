'use client'

import { useAuth } from './context/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Image, Upload, Sparkles, Palette, Folder } from 'lucide-react'
import { MobileLayout } from './components/mobile-layout'
import { usePhotos } from './context/photos-context'

export default function Dashboard() {
  const { isLoggedIn } = useAuth()
  const router = useRouter()
  const { folders, photos } = usePhotos()

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/login')
    }
  }, [isLoggedIn, router])

  if (!isLoggedIn) {
    return null
  }

  const totalPhotos = photos.length
  const totalFolders = folders.length
  const totalLikes = photos.reduce((sum, p) => sum + p.likes, 0)

  return (
    <MobileLayout>
      <main className="w-full max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2 text-balance">
            Grace Cottage
          </h1>
          <p className="text-muted-foreground">
            Preserve your most precious event memories
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { value: totalPhotos, label: 'Photos', color: 'text-primary' },
            { value: totalFolders, label: 'Folders', color: 'text-accent' },
            { value: totalLikes, label: 'Likes', color: 'text-secondary' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Card className="p-4 text-center bg-card/50 backdrop-blur-sm">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-4 mb-8"
        >
          {[
            {
              icon: Image,
              title: 'Photo Gallery',
              desc: 'Browse and manage your event photos',
              href: '/gallery',
              color: 'text-primary',
            },
            {
              icon: Upload,
              title: 'Upload Photos',
              desc: 'Add new photos to the gallery',
              href: '/upload',
              color: 'text-accent',
            },
          ].map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <Card className="p-6 bg-gradient-to-br from-card to-card/50 hover:shadow-lg transition-shadow border border-border/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {card.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{card.desc}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${card.color}`} />
                  </div>
                  <Link href={card.href}>
                    <Button variant="outline" className="w-full">
                      {card.title === 'Photo Gallery' ? 'View Gallery' : 'Upload Now'}
                    </Button>
                  </Link>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Recent Folders */}
        {folders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="p-6 bg-card/50 backdrop-blur-sm">
              <h2 className="text-xl font-semibold text-foreground mb-4">Your Folders</h2>
              <div className="space-y-2">
                {folders.slice(0, 5).map((folder, i) => (
                  <motion.div
                    key={folder.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.45 + i * 0.05 }}
                  >
                    <Link
                      href={`/gallery?folder=${encodeURIComponent(folder.id)}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors group"
                    >
                      <span className="flex items-center gap-2 text-foreground group-hover:text-primary transition-colors">
                        <Folder className="w-4 h-4" />
                        {folder.name}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {folder.photoCount} photo{folder.photoCount !== 1 ? 's' : ''}
                      </span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {[
            {
              icon: Sparkles,
              title: 'Beautiful Moments',
              desc: 'Capture and preserve the beautiful moments from your events at Grace Cottage.',
              gradient: 'from-primary/10',
              border: 'border-primary/20',
              color: 'text-primary',
            },
            {
              icon: Palette,
              title: 'Easy Sharing',
              desc: 'Share your favorite photos with guests and download them anytime.',
              gradient: 'from-accent/10',
              border: 'border-accent/20',
              color: 'text-accent',
            },
          ].map((highlight, i) => {
            const Icon = highlight.icon
            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring' }}
              >
                <Card className={`p-6 bg-gradient-to-br ${highlight.gradient} to-transparent border ${highlight.border}`}>
                  <Icon className={`w-8 h-8 ${highlight.color} mb-3`} />
                  <h3 className="font-semibold text-foreground mb-2">{highlight.title}</h3>
                  <p className="text-sm text-muted-foreground">{highlight.desc}</p>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </main>
    </MobileLayout>
  )
}
