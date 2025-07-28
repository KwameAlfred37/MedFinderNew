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
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ["/api/chat/messages"],
    enabled: !!user,
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
      setMessage("");
      
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
    },
  });

  const handleSendMessage = () => {
    if (message.trim()) {
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
                <p className="text-gray-300 text-sm">Always here to help</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full"
          >
            <MoreVertical className="w-5 h-5 text-white" />
          </Button>
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
              placeholder="Type a message..."
              className="w-full bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:border-purple-500"
              disabled={sendMessageMutation.isPending}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="button-3d w-12 h-12 rounded-full p-0"
          >
            <Send className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
}
