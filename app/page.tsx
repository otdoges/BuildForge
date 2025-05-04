"use client"

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Globe, Key, Github, ExternalLink, Layout, Workflow } from "lucide-react";
import { motion } from "framer-motion";

export default function Page() {
  useEffect(() => {
    // Initialize any animations or libraries here
  }, []);

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800">
        <div className="container flex justify-between items-center py-4 px-4 md:px-6">
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-10 w-10 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-xl">B</div>
            <span className="font-bold text-xl">BuildBox</span>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="ghost" className="text-zinc-400 hover:text-white" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button className="bg-violet-600 hover:bg-violet-700" asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-24 md:py-32 overflow-hidden">
        <div className="container max-w-5xl mx-auto text-center space-y-10 px-4">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Badge variant="outline" className="px-3 py-1 text-sm rounded-full bg-zinc-800 text-zinc-300 border-zinc-700 mb-6">
              Website Builder + Authentication + Backend
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-indigo-500"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Build your website <br /> without the complexity
          </motion.h1>
          
          <motion.p 
            className="text-xl text-zinc-400 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            The all-in-one platform for creating modern websites with authentication, 
            API integration, and real-time updates.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap justify-center gap-4 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            <Button size="lg" className="bg-violet-600 hover:bg-violet-700 px-8" asChild>
              <Link href="/signup">Start building for free</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" asChild>
              <Link href="/examples">
                View examples
                <ExternalLink className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Floating 3D-like elements */}
      <div className="relative">
        <motion.div 
          className="absolute -top-32 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div 
          className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"
          animate={{ 
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>

      {/* Features */}
      <section className="py-24 border-t border-zinc-800 relative overflow-hidden">
        <div className="container px-4">
          <motion.h2 
            className="text-3xl md:text-4xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Everything you need to build modern websites
          </motion.h2>
          
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeIn} className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/50 backdrop-blur-sm">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-violet-600/20 text-violet-500 mb-4">
                <Layout className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Modern Templates</h3>
              <p className="text-zinc-400">
                Start with beautiful templates or build from scratch with our easy-to-use interface.
              </p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/50 backdrop-blur-sm">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-violet-600/20 text-violet-500 mb-4">
                <Code className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Monaco Code Editor</h3>
              <p className="text-zinc-400">
                Advanced code editing with syntax highlighting and IntelliSense support.
              </p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/50 backdrop-blur-sm">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-violet-600/20 text-violet-500 mb-4">
                <Key className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Authentication</h3>
              <p className="text-zinc-400">
                Built-in authentication with Supabase for secure user management.
              </p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/50 backdrop-blur-sm">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-violet-600/20 text-violet-500 mb-4">
                <Workflow className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Convex Backend</h3>
              <p className="text-zinc-400">
                Powerful real-time backend with automatic syncing and serverless functions.
              </p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/50 backdrop-blur-sm">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-violet-600/20 text-violet-500 mb-4">
                <Github className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">GitHub Integration</h3>
              <p className="text-zinc-400">
                Easily sync your projects with GitHub repositories for version control.
              </p>
            </motion.div>
            
            <motion.div variants={fadeIn} className="p-6 border border-zinc-800 rounded-xl bg-zinc-900/50 backdrop-blur-sm">
              <div className="rounded-full w-12 h-12 flex items-center justify-center bg-violet-600/20 text-violet-500 mb-4">
                <Key className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">API Key Management</h3>
              <p className="text-zinc-400">
                Create and manage API keys with client-side encryption for secure access.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-24 bg-gradient-to-b from-black to-zinc-900">
        <motion.div 
          className="container max-w-5xl mx-auto text-center space-y-8 px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold">Ready to start building?</h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Join thousands of developers and businesses who build with BuildBox.
          </p>
          <Button size="lg" className="bg-violet-600 hover:bg-violet-700 px-8 mt-6" asChild>
            <Link href="/signup">Get started for free</Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-12 bg-black">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="h-8 w-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold text-lg">B</div>
              <span className="font-semibold">BuildBox</span>
            </div>
            <div className="flex gap-8">
              <Link href="/pricing" className="text-sm text-zinc-400 hover:text-white">
                Pricing
              </Link>
              <Link href="/docs" className="text-sm text-zinc-400 hover:text-white">
                Documentation
              </Link>
              <Link href="/blog" className="text-sm text-zinc-400 hover:text-white">
                Blog
              </Link>
              <Link href="/contact" className="text-sm text-zinc-400 hover:text-white">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-zinc-800 text-center text-sm text-zinc-500">
            &copy; {new Date().getFullYear()} BuildBox. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}