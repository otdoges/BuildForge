"use client";

import { 
  UserButton, 
  SignInButton, 
  SignUpButton,
  useUser
} from "@clerk/nextjs";
import { Button } from "./button";

export function UserProfile() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-2">
        <SignInButton>
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </SignInButton>
        <SignUpButton>
          <Button size="sm">
            Sign Up
          </Button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="hidden md:block text-sm">
        Welcome, {user.firstName || 'User'}
      </div>
      <UserButton 
        appearance={{
          elements: {
            userButtonAvatarBox: "w-8 h-8",
          }
        }}
      />
    </div>
  );
} 