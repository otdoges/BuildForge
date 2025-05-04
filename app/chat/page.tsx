"use client";

import { ChatInterface } from '../../chat-interface';

export default function ChatPage() {
  return (
    <div className="min-h-screen flex">
      <ChatInterface initialModel="combined" />
    </div>
  );
} 