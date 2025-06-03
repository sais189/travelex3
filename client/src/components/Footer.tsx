import { motion } from "framer-motion";
import { Link } from "wouter";
import { Globe, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Story", href: "/about" },
      { name: "Careers", href: "/contact" },
      { name: "Press", href: "/contact" },
    ],
    destinations: [
      { name: "Top Destinations", href: "/destinations" },
      { name: "Adventure Travel", href: "/destinations" },
      { name: "Luxury Escapes", href: "/destinations" },
      { name: "Cultural Tours", href: "/destinations" },
    ],
    support: [
      { name: "Help Center", href: "/contact" },
      { name: "Contact Us", href: "/contact" },
      { name: "Booking Support", href: "/contact" },
      { name: "Travel Insurance", href: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/contact" },
      { name: "Terms of Service", href: "/contact" },
      { name: "Cookie Policy", href: "/contact" },
      { name: "Refund Policy", href: "/contact" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  ];

  return (
    <footer className="bg-background/95 backdrop-blur-sm border-t border-border">
      <div className="container mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center space-x-2 mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <Globe className="text-gold-accent text-3xl" />
              <span className="text-2xl font-bold text-gold-accent">Globetrotter</span>
            </motion.div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Pioneering the future of travel through immersive experiences and cutting-edge technology. 
              Discover extraordinary destinations with our premium travel platform.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="w-4 h-4 text-gold-accent" />
                <span>hello@globetrotter.com</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="w-4 h-4 text-gold-accent" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <MapPin className="w-4 h-4 text-gold-accent" />
                <span>San Francisco, CA</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <motion.span
                      className="text-muted-foreground hover:text-gold-accent transition-colors cursor-pointer"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Destinations</h3>
            <ul className="space-y-3">
              {footerLinks.destinations.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <motion.span
                      className="text-muted-foreground hover:text-gold-accent transition-colors cursor-pointer"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <motion.span
                      className="text-muted-foreground hover:text-gold-accent transition-colors cursor-pointer"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <motion.span
                      className="text-muted-foreground hover:text-gold-accent transition-colors cursor-pointer"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {link.name}
                    </motion.span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border">
          <div className="flex space-x-4 mb-4 md:mb-0">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-gold-accent hover:bg-gold-accent/20 transition-colors"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  aria-label={social.label}
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              );
            })}
          </div>

          <div className="text-center md:text-right">
            <p className="text-muted-foreground text-sm mb-2">
              © {currentYear} Globetrotter. All rights reserved.
            </p>
            <p className="text-muted-foreground text-xs flex items-center justify-center md:justify-end">
              Made with <Heart className="w-3 h-3 mx-1 text-red-500" /> for adventurous souls
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}