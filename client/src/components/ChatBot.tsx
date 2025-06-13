import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

export default function ChatBot() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Welcome to TravelEx! I'm your professional travel assistant with access to comprehensive information about our luxury destinations, pricing, bookings, and services. I can help you with destination recommendations, booking assistance, travel planning, and answer any questions about our packages. How may I assist you today?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleOpenChatBot = (event: CustomEvent) => {
      setIsOpen(true);
      
      // If there's a message in the event detail, simulate user sending it
      if (event.detail?.message) {
        const userMessage: Message = {
          id: Date.now().toString(),
          text: event.detail.message,
          isBot: false,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, userMessage]);
        
        // Get bot response
        setTimeout(async () => {
          const botResponse = await getBotResponse(event.detail.message);
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponse,
            isBot: true,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, botMessage]);
        }, 500);
      }
    };

    window.addEventListener('openChatBot', handleOpenChatBot as EventListener);
    
    return () => {
      window.removeEventListener('openChatBot', handleOpenChatBot as EventListener);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Thinking...",
      isBot: true,
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    const messageToSend = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const botResponse = await getBotResponse(messageToSend);
      const botMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
      };
      
      // Replace loading message with actual response
      setMessages(prev => prev.slice(0, -1).concat(botMessage));
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        text: "I'm having trouble connecting right now. Please try again in a moment.",
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => prev.slice(0, -1).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  const getBotResponse = async (input: string): Promise<string> => {
    try {
      const response = await apiRequest("POST", "/api/chatbot/query", {
        message: input,
        context: {
          currentPage: location,
          timestamp: new Date().toISOString()
        }
      });
      
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error("Chatbot API error:", error);
      // Fallback response if API fails
      return "I'm having trouble accessing real-time data right now. You can reach our support team at 0491906089 or contact@travelex.com for immediate assistance.";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Don't show chatbot on admin pages or 404
  if (location.startsWith("/admin") || location === "/404") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] sm:bottom-6 sm:right-6">
      {/* Chat Button */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground rounded-full shadow-lg glow-hover"
          size="icon"
        >
          {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </Button>
      </motion.div>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute bottom-20 right-0 w-80 max-h-[calc(100vh-140px)] glass-morphism rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ 
              maxHeight: 'min(400px, calc(100vh - 140px))',
              height: 'min(400px, calc(100vh - 140px))'
            }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gold-accent rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">Travel Assistant</div>
                    <div className="text-xs text-mint-accent">Online</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="p-4 flex-1 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    className={`flex ${message.isBot ? "items-start" : "justify-end"}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {message.isBot ? (
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-gold-accent rounded-full flex items-center justify-center flex-shrink-0">
                          <Bot className="w-3 h-3 text-primary-foreground" />
                        </div>
                        <div className="bg-slate-panel rounded-lg p-3 max-w-48">
                          {message.isLoading ? (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-gold-accent rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gold-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gold-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          ) : (
                            <p className="text-sm text-foreground whitespace-pre-wrap">{message.text}</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gold-accent text-primary-foreground rounded-lg p-3 max-w-48">
                        <p className="text-sm">{message.text}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-border flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 bg-slate-panel border-border focus:border-gold-accent text-foreground text-sm"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading}
                  size="icon"
                  className="bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
