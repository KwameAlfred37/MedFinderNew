import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Send, MoreVertical, Bot } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useChat } from "@/hooks/useChat";
import StatusBar from "@/components/status-bar";
import ChatBubble from "@/components/chat-bubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/chat/messages"],
  });

  const { data: chatUsage } = useQuery({
    queryKey: ["/api/chat/usage"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { sendMessage } = useChat();

  const sendMessageMutation = useMutation({
    mutationFn: async (messageText: string) => {
      return await apiRequest("POST", "/api/chat/messages", {
        message: messageText,
        isFromBot: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/chat/usage"] });
      setMessage("");
      
      // Auto-send sign-up reminder for anonymous users when they reach 3 chats
      if (!isAuthenticated && chatUsage?.remainingChats === 1) {
        setTimeout(() => {
          apiRequest("POST", "/api/chat/messages", {
            message: "👋 You have 1 chat remaining this week! Sign in to unlock unlimited chatting and access to your full medical history.",
            isFromBot: true,
          }).then(() => {
            queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
            queryClient.invalidateQueries({ queryKey: ["/api/chat/usage"] });
          });
        }, 1000);
      } else {
        // Simulate bot response after a delay
        setTimeout(() => {
          const botResponses = [
            "I can help you find that medication. Let me search for nearby pharmacies.",
            "Would you like me to check the availability at different locations?",
            "I found several options for you. Which pharmacy would you prefer?",
            "Is there anything specific you'd like to know about this medication?",
          ];
          const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
          
          apiRequest("POST", "/api/chat/messages", {
            message: randomResponse,
            isFromBot: true,
          }).then(() => {
            queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
          });
        }, 1500);
      }
    },
    onError: (error: any) => {
      if (error.message?.includes("Chat limit reached")) {
        // Show limit reached message
        apiRequest("POST", "/api/chat/messages", {
          message: "🚫 You've reached your weekly chat limit (4 chats). Sign in to continue chatting with unlimited access!",
          isFromBot: true,
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
          queryClient.invalidateQueries({ queryKey: ["/api/chat/usage"] });
        });
      }
    }
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      // Check if anonymous user has reached chat limit
      if (!isAuthenticated && chatUsage?.isLimitReached) {
        apiRequest("POST", "/api/chat/messages", {
          message: "🚫 You've reached your weekly chat limit (4 chats). Sign in to continue chatting with unlimited access!",
          isFromBot: true,
        }).then(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/chat/messages"] });
        });
        return;
      }
      
      sendMessageMutation.mutate(message);
      sendMessage(message);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleBack = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen overflow-x-hidden">
        <StatusBar />
        <div className="flex items-center justify-center h-96">
          <div className="loading-spinner w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col">
      <StatusBar />
      
      {/* Chat Header */}
      <div className="glass-surface px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">MedBot Assistant</h3>
                <p className="text-gray-300 text-sm">
                  {isAuthenticated 
                    ? "Always here to help" 
                    : `${chatUsage?.remainingChats || 4} chats remaining this week`
                  }
                </p>
              </div>
            </div>
          </div>
          {!isAuthenticated && (
            <Button
              onClick={() => window.location.href = "/api/login"}
              className="button-3d text-white px-3 py-1 text-xs rounded-lg"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
        {messages && messages.length > 0 ? (
          messages.reverse().map((msg: any) => (
            <ChatBubble
              key={msg.id}
              message={msg.message}
              isFromBot={msg.isFromBot}
              timestamp={new Date(msg.createdAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            />
          ))
        ) : (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <ChatBubble
              message="Hello! I'm here to help you find medications and pharmacies. What can I assist you with today?"
              isFromBot={true}
              timestamp={new Date().toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            />
          </div>
        )}
        
        {sendMessageMutation.isPending && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="chat-bubble-received rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="glass-surface px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={!isAuthenticated && chatUsage?.isLimitReached 
                ? "Chat limit reached - Sign in to continue" 
                : "Type a message..."
              }
              className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-purple-500"
              disabled={sendMessageMutation.isPending || (!isAuthenticated && chatUsage?.isLimitReached)}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending || (!isAuthenticated && chatUsage?.isLimitReached)}
            className="button-3d w-12 h-12 rounded-full p-0"
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
