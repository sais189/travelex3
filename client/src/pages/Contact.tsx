import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { 
  Send, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  Linkedin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChatBotClick = () => {
    // Dispatch a custom event to trigger the chatbot
    window.dispatchEvent(new CustomEvent('openChatBot'));
  };

  const handleFAQClick = () => {
    // Dispatch a custom event to open chatbot with FAQ message
    window.dispatchEvent(new CustomEvent('openChatBot', { 
      detail: { message: 'Can you show me the frequently asked questions?' }
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
      });
    }, 2000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      content: "419A Windsor Rd, Baulkham Hills NSW 2153, Australia",
      color: "text-gold-accent",
      bgColor: "bg-gold-accent",
    },
    {
      icon: Phone,
      title: "Phone",
      content: "0491906089",
      color: "text-lavender-accent",
      bgColor: "bg-lavender-accent",
    },
    {
      icon: Mail,
      title: "Email",
      content: "contact@travelex.com",
      color: "text-mint-accent",
      bgColor: "bg-mint-accent",
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <div className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
          <p className="text-xl text-muted-foreground">
            Have questions about your next adventure? We're here to help.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Card className="glass-morphism">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-semibold mb-2 block">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        placeholder="John"
                        className="bg-slate-panel border-border focus:border-gold-accent"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-semibold mb-2 block">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        placeholder="Smith"
                        className="bg-slate-panel border-border focus:border-gold-accent"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold mb-2 block">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="john@example.com"
                      className="bg-slate-panel border-border focus:border-gold-accent"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="subject" className="text-sm font-semibold mb-2 block">
                      Subject
                    </Label>
                    <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                      <SelectTrigger className="bg-slate-panel border-border focus:border-gold-accent">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="booking">Booking Support</SelectItem>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="partnership">Partnership</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-semibold mb-2 block">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleInputChange("message", e.target.value)}
                      placeholder="Tell us how we can help you..."
                      className="bg-slate-panel border-border focus:border-gold-accent resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground font-bold py-4 glow-hover"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                        Sending...
                      </div>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <Card className="glass-morphism glow-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className={`w-12 h-12 ${info.bgColor} bg-opacity-20 rounded-full flex items-center justify-center mr-4`}>
                          <Icon className={`w-6 h-6 ${info.color}`} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{info.title}</h3>
                          <p className="text-muted-foreground">{info.content}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Business Hours */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <Card className="glass-morphism">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-lavender-accent bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                      <MessageCircle className="w-6 h-6 text-lavender-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Business Hours</h3>
                      <div className="text-muted-foreground text-sm space-y-1">
                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                        <p>Saturday: 10:00 AM - 4:00 PM</p>
                        <p>Sunday: Closed</p>
                        <p className="text-mint-accent mt-2">24/7 Emergency Support Available</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Social Media */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <Card className="glass-morphism">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <motion.a
                          key={social.label}
                          href={social.href}
                          className="w-10 h-10 bg-slate-panel rounded-lg flex items-center justify-center hover:bg-gold-accent hover:text-primary-foreground transition-all duration-300 glow-hover"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: 1.1 + index * 0.1 }}
                        >
                          <Icon className="w-5 h-5" />
                        </motion.a>
                      );
                    })}
                  </div>
                  <p className="text-muted-foreground text-sm mt-4">
                    Stay updated with our latest destinations and travel tips
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* FAQ Link */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              <Card className="glass-morphism">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-2">Need Quick Answers?</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Check out our frequently asked questions or chat with our AI assistant for instant help.
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleFAQClick}
                      className="border-gold-accent text-gold-accent hover:bg-gold-accent hover:text-primary-foreground"
                    >
                      View FAQ
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleChatBotClick}
                      className="border-lavender-accent text-lavender-accent hover:bg-lavender-accent hover:text-primary-foreground"
                    >
                      Live Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="glass-morphism border-border">
          <DialogHeader>
            <DialogTitle className="text-center">
              <motion.div
                className="success-bounce"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
              >
                <div className="w-16 h-16 bg-lavender-accent bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-lavender-accent" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
                <p className="text-muted-foreground">
                  Thank you for contacting us. We'll get back to you within 24 hours.
                </p>
              </motion.div>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-6">
            <Button
              onClick={() => {
                setShowSuccess(false);
                navigate("/");
              }}
              className="w-full bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground"
            >
              Go Home
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccess(false);
                navigate("/destinations");
              }}
              className="w-full border-gold-accent text-gold-accent hover:bg-gold-accent hover:text-primary-foreground"
            >
              Explore Destinations
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
