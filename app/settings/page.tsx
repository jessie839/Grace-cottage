"use client";

import { useAuth } from "../context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MobileLayout } from "../components/mobile-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Lock, Download, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [publicProfile, setPublicProfile] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return null;
  }

  const handleExportData = async () => {
    const userData = localStorage.getItem("user");
    const response = await fetch("/api/photos", { cache: "no-store" });
    const data = {
      user: userData ? JSON.parse(userData) : null,
      folders: [],
      photos: [],
      timestamp: new Date().toISOString(),
    };

    if (response.ok) {
      const json = await response.json();
      data.folders = json.folders ?? [];
      data.photos = json.photos ?? [];
    }

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," +
        encodeURIComponent(JSON.stringify(data, null, 2)),
    );
    element.setAttribute("download", `grace-cottage-backup-${Date.now()}.json`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure? This will log you out of this browser. Shared photos remain in the database.",
      )
    ) {
      localStorage.removeItem("user");
      logout();
      router.push("/login");
    }
  };

  return (
    <MobileLayout>
      <main className="w-full max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Settings
        </h1>
        <p className="text-muted-foreground mb-8">
          Manage your application preferences
        </p>

        {/* Notifications */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm mb-4">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notifications
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground">
                  Email Notifications
                </p>
                <p className="text-sm text-muted-foreground">
                  Get notified when photos receive likes
                </p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications ? "bg-primary" : "bg-muted"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm mb-4">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Moon className="w-5 h-5 text-accent" />
            Appearance
          </h2>
          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Dark Mode</p>
              <p className="text-sm text-muted-foreground">
                Use dark theme throughout the app
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-12 h-6 rounded-full transition-colors ${
                darkMode ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Privacy */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm mb-4">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5 text-secondary" />
            Privacy
          </h2>
          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
            <div>
              <p className="font-medium text-foreground">Public Profile</p>
              <p className="text-sm text-muted-foreground">
                Allow guests to see your gallery
              </p>
            </div>
            <button
              onClick={() => setPublicProfile(!publicProfile)}
              className={`w-12 h-6 rounded-full transition-colors ${
                publicProfile ? "bg-primary" : "bg-muted"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  publicProfile ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </Card>

        {/* Data Management */}
        <Card className="p-6 bg-card/50 backdrop-blur-sm mb-4">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Data Management
          </h2>
          <div className="space-y-3">
            <Button
              onClick={handleExportData}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            <Button
              onClick={handleClearData}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4" />
              Clear All Data
            </Button>
          </div>
        </Card>

        {/* About */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
          <h2 className="text-lg font-bold text-foreground mb-2">About</h2>
          <p className="text-sm text-muted-foreground mb-3">
            Grace Cottage Photo Gallery v1.0
          </p>
          <p className="text-xs text-muted-foreground">
            A beautiful photo management system for Grace Cottage events. Made
            with care for preserving precious memories.
          </p>
        </Card>
      </main>
    </MobileLayout>
  );
}
