import { useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  {
    id: "1",
    question: "How do I book a trip?",
    answer: "You can book a trip by browsing our destinations, selecting your preferred package, choosing your dates and number of guests, and completing the secure checkout process. We accept all major credit cards and offer flexible payment options.",
    category: "Booking"
  },
  {
    id: "2",
    question: "What is included in the trip packages?",
    answer: "Our luxury packages include premium accommodations, daily meals, guided tours and activities, airport transfers, and 24/7 concierge support. Specific inclusions vary by destination and are detailed on each package page.",
    category: "Packages"
  },
  {
    id: "3",
    question: "Can I cancel or modify my booking?",
    answer: "Yes, you can cancel or modify your booking up to 48 hours before departure for a full refund. Changes within 48 hours may incur fees. Please contact our support team for assistance with modifications.",
    category: "Booking"
  },
  {
    id: "4",
    question: "Do you offer group discounts?",
    answer: "Yes, we offer group discounts for bookings of 4 or more people. The discount varies by destination and season. Contact our sales team for customized group pricing and special arrangements.",
    category: "Pricing"
  },
  {
    id: "5",
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All transactions are processed securely through Stripe payment gateway.",
    category: "Payment"
  },
  {
    id: "6",
    question: "Is travel insurance included?",
    answer: "Basic travel insurance is included with all bookings. We also offer comprehensive insurance upgrades that cover medical emergencies, trip cancellation, and lost luggage. You can add this during checkout.",
    category: "Insurance"
  },
  {
    id: "7",
    question: "What should I pack for my trip?",
    answer: "Packing requirements vary by destination and season. We provide detailed packing lists in your booking confirmation email. Generally, we recommend comfortable walking shoes, weather-appropriate clothing, and any personal medications.",
    category: "Travel Tips"
  },
  {
    id: "8",
    question: "How do I contact customer support?",
    answer: "Our customer support is available 24/7. You can reach us via phone at 0491906089, email at contact@travelex.com, or use our live chat feature. We typically respond within 2 hours during business hours.",
    category: "Support"
  }
];

const categories = ["All", "Booking", "Packages", "Pricing", "Payment", "Insurance", "Travel Tips", "Support"];

interface FAQPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FAQPopup({ isOpen, onClose }: FAQPopupProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredFAQs = selectedCategory === "All" 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleChatWithBot = () => {
    onClose();
    window.dispatchEvent(new CustomEvent('openChatBot', { 
      detail: { message: 'I have a question that is not covered in the FAQ. Can you help me?' }
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">Frequently Asked Questions</DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-muted-foreground mt-2">
            Find answers to common questions about our travel packages and services.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {/* Category Filter */}
          <div className="p-6 pb-4 border-b border-border bg-muted/20">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category 
                    ? "bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground" 
                    : "border-border hover:border-gold-accent"
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* FAQ Items */}
          <div className="p-6 overflow-y-auto max-h-[calc(80vh-200px)]">
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card className="glass-morphism">
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleExpanded(faq.id)}
                        className="w-full p-4 text-left hover:bg-muted/20 transition-colors duration-200 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-xs bg-gold-accent/10 text-gold-accent px-2 py-1 rounded-full font-medium">
                              {faq.category}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground mt-2">
                            {faq.question}
                          </h3>
                        </div>
                        {expandedItems.includes(faq.id) ? (
                          <ChevronUp className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                      
                      {expandedItems.includes(faq.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="border-t border-border"
                        >
                          <div className="p-4 pt-3">
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Chat with Bot CTA */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-morphism">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Still have questions?</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Our AI travel assistant is available 24/7 to help with any specific questions.
                  </p>
                  <Button
                    onClick={handleChatWithBot}
                    className="bg-lavender-accent hover:bg-lavender-accent/80 text-primary-foreground"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat with Assistant
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}