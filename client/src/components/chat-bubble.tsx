import { Bot, User } from "lucide-react";

interface ChatBubbleProps {
  message: string;
  isFromBot: boolean;
  timestamp: string;
}

export default function ChatBubble({ message, isFromBot, timestamp }: ChatBubbleProps) {
  if (isFromBot) {
    return (
      <div className="flex items-start space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="chat-bubble-received rounded-2xl rounded-bl-md px-4 py-3 max-w-xs">
          <p className="text-white text-sm">{message}</p>
          <span className="text-gray-400 text-xs mt-1 block">{timestamp}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3 justify-end">
      <div className="chat-bubble-sent rounded-2xl rounded-br-md px-4 py-3 max-w-xs">
        <p className="text-white text-sm">{message}</p>
        <span className="text-purple-200 text-xs mt-1 block">{timestamp}</span>
      </div>
    </div>
  );
}
