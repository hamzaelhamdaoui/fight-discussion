"use client";

import { motion } from "framer-motion";
import { Zap, Upload, Swords, Trophy, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AdSlot } from "@/components/ads/ad-slot";

const features = [
  {
    icon: Upload,
    title: "Upload Screenshots",
    description: "Drop your conversation screenshots - even if they're out of order!",
  },
  {
    icon: Zap,
    title: "AI Reconstruction",
    description: "Our AI rebuilds the timeline and identifies key arguments.",
  },
  {
    icon: Swords,
    title: "Epic Battle",
    description: "Watch your argument transform into an animated battle!",
  },
  {
    icon: Trophy,
    title: "Get Results",
    description: "See who won and why, with shareable results.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-12 pb-8 sm:pt-20 sm:pb-16">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-fighter-a/10 blur-3xl" />
        </div>

        <motion.div
          className="mx-auto max-w-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo/Brand */}
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Swords className="h-4 w-4" />
            <span>FightReplay AI</span>
          </motion.div>

          <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Turn Your Arguments Into{" "}
            <span className="bg-gradient-to-r from-fighter-a to-fighter-b bg-clip-text text-transparent">
              Epic Battles
            </span>
          </h1>

          <p className="mb-8 text-base text-muted-foreground sm:text-lg">
            Upload screenshots of your conversations and watch AI transform them
            into animated battles. See who really won the argument!
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="xl" asChild className="w-full sm:w-auto">
              <Link href="/battle">
                Start Battle
                <ChevronRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
            <Button
              size="xl"
              variant="outline"
              asChild
              className="w-full sm:w-auto"
            >
              <Link href="#demo">Watch Demo</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Demo Preview Section */}
      <section id="demo" className="px-4 py-8 sm:py-12">
        <motion.div
          className="mx-auto max-w-lg"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card to-muted/50">
            <CardContent className="p-0">
              {/* Mock Battle Preview */}
              <div className="relative aspect-[4/3] bg-gradient-to-b from-slate-900 to-slate-800 p-4">
                {/* Fighter A */}
                <motion.div
                  className="absolute left-4 top-4 flex items-center gap-2"
                  initial={{ x: -50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="h-12 w-12 rounded-full bg-fighter-a flex items-center justify-center text-white font-bold">
                    A
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-white/70">Person A</p>
                    <div className="h-2 w-20 rounded-full bg-white/20 overflow-hidden">
                      <motion.div
                        className="h-full bg-green-500"
                        initial={{ width: "100%" }}
                        whileInView={{ width: "65%" }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Fighter B */}
                <motion.div
                  className="absolute right-4 top-4 flex items-center gap-2"
                  initial={{ x: 50, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="text-right">
                    <p className="text-xs text-white/70">Person B</p>
                    <div className="h-2 w-20 rounded-full bg-white/20 overflow-hidden">
                      <motion.div
                        className="h-full bg-green-500"
                        initial={{ width: "100%" }}
                        whileInView={{ width: "42%" }}
                        viewport={{ once: true }}
                        transition={{ delay: 1, duration: 0.5 }}
                      />
                    </div>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-fighter-b flex items-center justify-center text-white font-bold">
                    B
                  </div>
                </motion.div>

                {/* Center Battle Text */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold text-white drop-shadow-lg">
                      FIGHT!
                    </p>
                  </div>
                </motion.div>

                {/* Attack Animation Mock */}
                <motion.div
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 max-w-[80%]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2 }}
                >
                  <div className="rounded-lg bg-white/10 backdrop-blur px-3 py-2 text-center">
                    <p className="text-xs text-white/60">Person A attacks!</p>
                    <p className="text-sm text-white font-medium">
                      &quot;You never listen to me!&quot;
                    </p>
                    <p className="text-xs text-orange-400 font-bold mt-1">
                      -15 HP (Emotional Appeal)
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Caption */}
              <div className="bg-muted/50 px-4 py-3 text-center">
                <p className="text-sm text-muted-foreground">
                  Live battle reconstruction from your conversations
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Ad Slot - Below the fold */}
      <div className="px-4 py-4">
        <AdSlot placement="landing_below_fold" />
      </div>

      {/* Features Section */}
      <section className="px-4 py-8 sm:py-16">
        <motion.div
          className="mx-auto max-w-lg"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h2
            className="mb-8 text-center text-2xl font-bold sm:text-3xl"
            variants={itemVariants}
          >
            How It Works
          </motion.h2>

          <div className="grid gap-4">
            {features.map((feature, index) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Card className="border-0 bg-card/50 backdrop-blur">
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold">{feature.title}</h3>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 sm:py-20">
        <motion.div
          className="mx-auto max-w-lg text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-fighter-b/5">
            <CardContent className="p-6 sm:p-8">
              <h2 className="mb-3 text-xl font-bold sm:text-2xl">
                Ready to Settle the Score?
              </h2>
              <p className="mb-6 text-sm text-muted-foreground sm:text-base">
                Upload your conversation screenshots and find out who really won!
              </p>
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/battle">
                  Start Your Battle
                  <Swords className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 px-4 py-6">
        <div className="mx-auto max-w-lg text-center text-sm text-muted-foreground">
          <p className="mb-2">
            FightReplay AI - For entertainment purposes only.
          </p>
          <p className="text-xs">
            Not a substitute for professional relationship advice.
          </p>
        </div>
      </footer>
    </main>
  );
}
