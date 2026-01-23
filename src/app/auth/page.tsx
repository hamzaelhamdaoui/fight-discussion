"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Swords, User, LogOut, Chrome, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/services/supabase/client";
import { toast } from "@/hooks/use-toast";
import { getInitials } from "@/lib/utils";

export default function AuthPage() {
  const { user, isGuest, setIsGuest, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "Could not sign in with Google. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    setIsGuest(true);
    toast({
      title: "Guest mode",
      description: "You're using FightReplay as a guest. Your data will be saved locally.",
    });
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      logout();
      toast({
        title: "Signed out",
        description: "You've been signed out successfully.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Error",
        description: "Could not sign out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 px-4 py-8">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary font-semibold"
          >
            <Swords className="h-6 w-6" />
            <span>FightReplay AI</span>
          </Link>
        </div>

        {user ? (
          // Logged in state
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="text-center">
                <Avatar className="mx-auto h-20 w-20">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                    {getInitials(user.name || user.email || "User")}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="mt-4">
                  {user.name || "Welcome back!"}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/battle">
                    <Swords className="mr-2 h-4 w-4" />
                    Start New Battle
                  </Link>
                </Button>

                <Separator />

                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={handleLogout}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="mr-2 h-4 w-4" />
                  )}
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Not logged in
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Welcome to FightReplay AI</CardTitle>
                <CardDescription>
                  Sign in to save your battles and share results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Chrome className="mr-2 h-5 w-5" />
                  )}
                  Continue with Google
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or
                    </span>
                  </div>
                </div>

                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={handleContinueAsGuest}
                  disabled={isLoading}
                  asChild
                >
                  <Link href="/battle">
                    Continue as Guest
                  </Link>
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Guest mode saves data locally. Sign in to sync across devices.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Button variant="ghost" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
