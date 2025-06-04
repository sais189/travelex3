import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export default function ChatBot() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm your travel assistant. How can I help you plan your next adventure?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");

  // Don't show chatbot on admin pages or 404
  if (location.startsWith("/admin") || location === "/404") {
    return null;
  }

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
        setTimeout(() => {
          const botResponse = getBotResponse(event.detail.message);
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: botResponse,
            isBot: true,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, botMessage]);
        }, 1000);
      }
    };

    window.addEventListener('openChatBot', handleOpenChatBot as EventListener);
    
    return () => {
      window.removeEventListener('openChatBot', handleOpenChatBot as EventListener);
    };
  }, []);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes("faq") || lowerInput.includes("frequently asked")) {
      return `Here are our most frequently asked questions:

📍 **Booking & Payments**
• How do I book a trip? - Visit our destinations page and click "Book Now"
• What payment methods do you accept? - We accept all major credit cards and PayPal
• Can I modify my booking? - Yes, modifications can be made up to 7 days before departure

🌍 **Travel Information**
• What's included in packages? - Accommodation, meals, activities, and local transportation
• Do I need travel insurance? - We recommend travel insurance for all international trips
• What about visa requirements? - We provide visa guidance, but obtaining visas is your responsibility

💰 **Pricing & Refunds**
• What are your prices? - Packages range from $1,599 to $3,299 depending on destination
• What's your refund policy? - Full refunds available up to 48 hours before departure
• Are there group discounts? - Yes, 10% discount for groups of 6+ people

📞 **Contact & Support**
• How can I contact support? - Phone: 0491906089 or email: contact@globetrotter.com
• What are your business hours? - Mon-Fri 9AM-6PM, Sat 10AM-4PM, Emergency support 24/7

Need specific help with any of these topics?`;
    }

    if (lowerInput.includes("price") || lowerInput.includes("cost") || lowerInput.includes("budget")) {
      return "I can help you find destinations within your budget! Our packages range from $1,599 (Bali Cultural Experience) to $3,299 (Maldives Luxury Resort). What's your preferred price range?";
    }
    
    if (lowerInput.includes("destination") || lowerInput.includes("where")) {
      return "We have amazing destinations including Maldives, Swiss Alps, Bali, Santorini, Iceland, Parisian Culture Tour, and New Zealand. Each offers unique experiences. What type of adventure interests you?";
    }

    if (lowerInput.includes("book") || lowerInput.includes("reservation")) {
      return "Great! You can book directly through our destinations page. Each package includes accommodations, meals, and activities. Would you like me to guide you to a specific destination?";
    }

    if (lowerInput.includes("refund") || lowerInput.includes("cancel")) {
      return "Our refund policy allows full refunds up to 48 hours before departure. For cancellations, please visit your 'My Trips' section or contact our support team at 0491906089.";
    }

    if (lowerInput.includes("contact") || lowerInput.includes("phone") || lowerInput.includes("address")) {
      return "You can reach us at:\n📞 Phone: 0491906089\n📧 Email: contact@globetrotter.com\n📍 Address: 419A Windsor Rd, Baulkham Hills NSW 2153, Australia\n\nBusiness Hours: Mon-Fri 9AM-6PM, Sat 10AM-4PM, Emergency support available 24/7";
    }

    if (lowerInput.includes("help") || lowerInput.includes("support")) {
      return "I'm here to help! I can assist with destination recommendations, pricing information, booking process, and travel policies. You can also type 'FAQ' to see frequently asked questions. What specific information do you need?";
    }

    return "That's a great question! I can help you with destination recommendations, pricing, booking assistance, and travel information. Type 'FAQ' for common questions or ask me anything specific about our travel packages!";
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
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
            className="absolute bottom-20 right-0 w-80 h-96 glass-morphism rounded-2xl shadow-2xl overflow-hidden"
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
            <div className="p-4 h-64 overflow-y-auto">
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
                          <p className="text-sm text-foreground">{message.text}</p>
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
            <div className="p-4 border-t border-border">
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
                  size="icon"
                  className="bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground"
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
