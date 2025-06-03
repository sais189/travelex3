import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight, Globe, Award, Users, TrendingUp, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  const [, navigate] = useLocation();

  const stats = [
    { icon: Globe, label: "Destinations", value: "50+", color: "text-gold-accent" },
    { icon: Users, label: "Happy Travelers", value: "10k+", color: "text-lavender-accent" },
    { icon: Award, label: "Countries", value: "25", color: "text-mint-accent" },
    { icon: TrendingUp, label: "Average Rating", value: "4.9", color: "text-gold-accent" },
  ];

  return (
    <div className="min-h-screen pt-32 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl font-bold mb-6">About Globetrotter</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Pioneering the future of travel with cutting-edge technology and unparalleled luxury experiences across the globe.
          </p>
        </motion.div>

        {/* Company Story */}
        <div className="space-y-12 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Card className="glass-morphism">
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      We believe travel should transcend the ordinary. By combining futuristic technology with luxurious accommodations, we create immersive experiences that connect travelers with destinations in unprecedented ways.
                    </p>
                    <p className="text-muted-foreground text-lg leading-relaxed mt-4">
                      Our platform leverages advanced algorithms, AI-powered recommendations, and real-time data to craft personalized journeys that exceed expectations and create lasting memories.
                    </p>
                  </div>
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                      alt="Futuristic travel technology"
                      className="rounded-xl shadow-lg w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-gold-accent/20 to-transparent rounded-xl" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="glass-morphism">
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <motion.div
                    className="relative lg:order-1"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400"
                      alt="Luxury hotel interior"
                      className="rounded-xl shadow-lg w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-lavender-accent/20 to-transparent rounded-xl" />
                  </motion.div>
                  <div className="lg:order-2">
                    <h2 className="text-3xl font-bold mb-4">Premium Experiences</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Every destination in our portfolio is carefully curated to offer unmatched luxury, exclusive access, and personalized service that exceeds expectations.
                    </p>
                    <p className="text-muted-foreground text-lg leading-relaxed mt-4">
                      From private overwater villas in the Maldives to exclusive mountain chalets in the Swiss Alps, we partner with the world's finest accommodations to ensure your journey is nothing short of extraordinary.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="glass-morphism">
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <h2 className="text-3xl font-bold mb-4">Innovation at Heart</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Our cutting-edge platform features a 3D interactive globe, AI-powered chatbot assistance, and seamless payment integration to make your booking experience as smooth as your travels.
                    </p>
                    <p className="text-muted-foreground text-lg leading-relaxed mt-4">
                      We continuously invest in emerging technologies like virtual reality previews, blockchain-secured transactions, and real-time travel optimization to stay at the forefront of the travel industry.
                    </p>
                  </div>
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                      alt="Travel innovation and technology"
                      className="rounded-xl shadow-lg w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-mint-accent/20 to-transparent rounded-xl" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          className="grid md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="glass-morphism text-center glow-hover">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className={`w-12 h-12 bg-opacity-20 rounded-full flex items-center justify-center ${
                        stat.color === 'text-gold-accent' ? 'bg-gold-accent' :
                        stat.color === 'text-lavender-accent' ? 'bg-lavender-accent' : 'bg-mint-accent'
                      }`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                    <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                    <div className="text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Mission Statement */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Card className="glass-morphism">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
                To democratize luxury travel by making extraordinary experiences accessible to adventurous souls worldwide. 
                We strive to break down barriers between dreamers and destinations, creating a seamless bridge that transforms 
                wanderlust into unforgettable realities through innovation, excellence, and genuine care for our travelers' journeys.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold mb-6">Ready to Explore?</h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied travelers who have discovered the world through Globetrotter. 
            Your next adventure is just a click away.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/destinations")}
              className="bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground font-bold py-4 px-8 text-lg glow-hover"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Start Exploring
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/contact")}
              className="border-gold-accent text-gold-accent hover:bg-gold-accent hover:text-primary-foreground py-4 px-8 text-lg"
            >
              Contact Us
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
