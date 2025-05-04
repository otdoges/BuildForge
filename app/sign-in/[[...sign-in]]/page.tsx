'use client';

import { SignIn } from '@clerk/nextjs';
import Image from 'next/image';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center space-x-3">
        <Image 
          src="/logo.svg" 
          alt="BuildBox Logo" 
          width={40} 
          height={40} 
          className="h-10 w-10"
        />
        <h1 className="text-2xl font-bold">BuildBox</h1>
      </div>
      <div className="w-full max-w-md">
        <SignIn 
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground",
              footerAction: "text-primary hover:text-primary/90",
              card: "bg-card shadow-lg border border-border"
            }
          }} 
        />
      </div>
    </div>
  );
} 