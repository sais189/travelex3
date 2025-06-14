import { useState, useEffect, useRef } from "react";
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
  const [dimensions, setDimensions] = useState({ width: 320, height: 400 });
  const [isResizing, setIsResizing] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

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
      // Enhanced context based on current page
      const pageContext = {
        currentPage: location,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        pageTitle: document.title
      };

      const response = await apiRequest("POST", "/api/chatbot/query", {
        message: input,
        context: pageContext
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.response) {
        throw new Error("No response received from server");
      }
      
      return data.response;
    } catch (error) {
      console.error("Chatbot API error:", error);
      
      // Enhanced fallback response based on current page
      const pageSpecificFallback = getPageSpecificFallback(location);
      return `I'm experiencing technical difficulties right now, but I can still help you. ${pageSpecificFallback}

For immediate assistance:
📞 Phone: 0491906089
📧 Email: contact@travelex.com
🕒 Available: 24/7`;
    }
  };

  const getPageSpecificFallback = (currentLocation: string): string => {
    if (currentLocation.includes('/destinations')) {
      return "You're browsing our destinations. Each package includes luxury accommodations, meals, and guided activities.";
    } else if (currentLocation.includes('/booking')) {
      return "You're in the booking process. All our packages include flexible cancellation up to 48 hours before departure.";
    } else if (currentLocation.includes('/my-trips')) {
      return "You're viewing your trips. You can modify or cancel bookings through this section.";
    } else if (currentLocation.includes('/contact')) {
      return "You're on our contact page. Our support team is available to help with any questions.";
    } else if (currentLocation.includes('/about')) {
      return "You're learning about TravelEx. We specialize in luxury travel experiences with over 1000 satisfied customers.";
    } else {
      return "Browse our premium destinations or contact our support team for personalized assistance.";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Resize functionality
  const handleResize = (direction: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = dimensions.width;
    const startHeight = dimensions.height;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = startWidth;
      let newHeight = startHeight;

      switch (direction) {
        case 'se': // southeast
          newWidth = Math.max(280, startWidth + (e.clientX - startX));
          newHeight = Math.max(300, startHeight + (e.clientY - startY));
          break;
        case 'sw': // southwest
          newWidth = Math.max(280, startWidth - (e.clientX - startX));
          newHeight = Math.max(300, startHeight + (e.clientY - startY));
          break;
        case 'ne': // northeast
          newWidth = Math.max(280, startWidth + (e.clientX - startX));
          newHeight = Math.max(300, startHeight - (e.clientY - startY));
          break;
        case 'nw': // northwest
          newWidth = Math.max(280, startWidth - (e.clientX - startX));
          newHeight = Math.max(300, startHeight - (e.clientY - startY));
          break;
        case 'n': // north
          newHeight = Math.max(300, startHeight - (e.clientY - startY));
          break;
        case 's': // south
          newHeight = Math.max(300, startHeight + (e.clientY - startY));
          break;
        case 'e': // east
          newWidth = Math.max(280, startWidth + (e.clientX - startX));
          break;
        case 'w': // west
          newWidth = Math.max(280, startWidth - (e.clientX - startX));
          break;
      }

      // Constrain to viewport
      newWidth = Math.min(newWidth, window.innerWidth - 100);
      newHeight = Math.min(newHeight, window.innerHeight - 100);

      setDimensions({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Don't show chatbot on admin pages or 404
  if (location.startsWith("/admin") || location === "/404") {
    return null;
  }

  return (
    <div className="fixed z-[70] bottom-4 right-4 sm:bottom-6 sm:right-6">
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
            ref={chatRef}
            className={`glass-morphism rounded-2xl shadow-2xl overflow-hidden flex flex-col absolute bottom-20 right-0 ${
              isResizing ? 'select-none' : ''
            }`}
            style={{ 
              width: `${dimensions.width}px`,
              height: `${dimensions.height}px`,
              cursor: isResizing ? 'resizing' : 'default'
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
                    <div className="text-xs text-mint-accent">
                      {isLoading ? "Analyzing..." : "Ready to help"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
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
                            <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                              {message.text}
                            </div>
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

            {/* Resize Handles */}
            {/* Corner handles */}
            <div
              className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize hover:bg-gold-accent/20 rounded-tl-2xl"
              onMouseDown={handleResize('nw')}
            />
            <div
              className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize hover:bg-gold-accent/20 rounded-tr-2xl"
              onMouseDown={handleResize('ne')}
            />
            <div
              className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize hover:bg-gold-accent/20 rounded-bl-2xl"
              onMouseDown={handleResize('sw')}
            />
            <div
              className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize hover:bg-gold-accent/20 rounded-br-2xl"
              onMouseDown={handleResize('se')}
            />
            
            {/* Edge handles */}
            <div
              className="absolute top-0 left-3 right-3 h-1 cursor-n-resize hover:bg-gold-accent/20"
              onMouseDown={handleResize('n')}
            />
            <div
              className="absolute bottom-0 left-3 right-3 h-1 cursor-s-resize hover:bg-gold-accent/20"
              onMouseDown={handleResize('s')}
            />
            <div
              className="absolute left-0 top-3 bottom-3 w-1 cursor-w-resize hover:bg-gold-accent/20"
              onMouseDown={handleResize('w')}
            />
            <div
              className="absolute right-0 top-3 bottom-3 w-1 cursor-e-resize hover:bg-gold-accent/20"
              onMouseDown={handleResize('e')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}