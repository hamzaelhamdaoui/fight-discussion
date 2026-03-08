"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Swords, LogOut, Loader2, Save, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { createClient } from "@/services/supabase/client";
import { useTranslations } from "@/hooks/use-translations";
import { toast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { user, setIsGuest, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

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
        title: t.errors.generic,
        description: t.errors.network,
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    setIsGuest(true);
    toast({
      title: t.auth.continueAsGuest,
      description: t.auth.loginSubtitle,
    });
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      logout();
      toast({
        title: t.common.confirm,
        description: t.auth.loginSubtitle,
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: t.common.error,
        description: t.errors.generic,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cinder px-4 py-8 flex flex-col items-center relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-cyan/10 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange/10 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8">
          {/* Logo Icon with gradient background */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan to-orange mb-4 shadow-lg shadow-cyan/20">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white font-space-grotesk">FightReplay</h1>
        </div>

        {user ? (
          // Logged in state
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* User Card */}
            <div className="rounded-2xl bg-cinder-light border border-white/10 p-6 text-center">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan to-orange flex items-center justify-center mx-auto mb-4 shadow-lg shadow-cyan/30">
                <span className="text-2xl font-bold text-white font-space-grotesk">
                  {(user.name || user.email || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-white font-space-grotesk">
                {user.name || t.auth.loginTitle}
              </h2>
              <p className="text-sm text-white/50 mt-1 font-inter">{user.email}</p>

              {/* Actions */}
              <div className="mt-6 space-y-3">
                <Link
                  href="/battle"
                  className="w-full py-3 rounded-xl bg-blue text-white font-semibold flex items-center justify-center gap-2 hover:bg-blue/90 transition-colors shadow-lg shadow-blue/30 font-space-grotesk"
                >
                  <Swords className="w-5 h-5" />
                  {t.landing.hero.cta}
                </Link>

                <button
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors font-space-grotesk"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                  Cerrar sesión
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          // Not logged in
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Login Card */}
            <div className="rounded-2xl bg-cinder-light border border-white/10 p-6">
              {/* Title */}
              <h2 className="text-xl font-bold text-white text-center font-space-grotesk">
                {t.auth.loginTitle}
              </h2>
              <p className="text-sm text-white/50 text-center mt-2 font-inter">
                {t.auth.loginSubtitle}
              </p>

              {/* Buttons */}
              <div className="mt-6 space-y-3">
                {/* Google Button - white */}
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full py-3.5 rounded-xl bg-white text-black font-semibold flex items-center justify-center gap-3 hover:bg-white/90 transition-colors font-space-grotesk"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  )}
                  {t.auth.continueWithGoogle}
                </button>

                {/* Divider */}
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-xs text-white/30 bg-cinder-light font-inter">o</span>
                  </div>
                </div>

                {/* Guest Button - dark */}
                <Link
                  href="/battle"
                  onClick={handleContinueAsGuest}
                  className="w-full py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium flex items-center justify-center hover:bg-white/10 transition-colors font-space-grotesk"
                >
                  {t.auth.continueAsGuest}
                </Link>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="space-y-3">
              {/* Benefit 1 - Save battles */}
              <div className="rounded-xl bg-cinder-light border border-cyan/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center flex-shrink-0">
                    <Save className="w-5 h-5 text-cyan" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white font-space-grotesk">Guarda tus batallas</p>
                    <p className="text-xs text-white/40 font-inter">Accede a tus replays en cualquier momento</p>
                  </div>
                </div>
              </div>

              {/* Benefit 2 - Share links */}
              <div className="rounded-xl bg-cinder-light border border-orange/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange/10 flex items-center justify-center flex-shrink-0">
                    <Share2 className="w-5 h-5 text-orange" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white font-space-grotesk">Crea enlaces para compartir</p>
                    <p className="text-xs text-white/40 font-inter">Muestra tus mejores duelos al mundo</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-[10px] text-white/30 tracking-widest uppercase mb-4 font-inter">
                SOLO PARA ENTRETENIMIENTO
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm text-cyan hover:text-cyan/80 transition-colors font-space-grotesk"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Inicio
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
