import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight, Globe, Award, Users, TrendingUp, Rocket, Calendar, Star, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LazyImage from "@/components/LazyImage";

export default function About() {
  const [, navigate] = useLocation();

  const timelineEvents = [
    {
      year: "2020",
      title: "The Vision",
      description: "Founded by travel enthusiasts who dreamed of revolutionising how people explore the world",
      icon: Rocket,
      color: "from-blue-500 to-cyan-500"
    },
    {
      year: "2021",
      title: "First Launch",
      description: "Launched with 10 destinations and our signature 3D globe interface",
      icon: Globe,
      color: "from-green-500 to-emerald-500"
    },
    {
      year: "2022",
      title: "Global Expansion",
      description: "Reached 25 countries and 1,000+ happy travelers",
      icon: Users,
      color: "from-purple-500 to-violet-500"
    },
    {
      year: "2023",
      title: "Innovation Breakthrough",
      description: "Introduced AI-powered recommendations and immersive VR previews",
      icon: Star,
      color: "from-amber-500 to-orange-500"
    },
    {
      year: "2024",
      title: "Community Growth",
      description: "Surpassed 10,000 travelers and won 'Best Travel Platform' award",
      icon: Award,
      color: "from-rose-500 to-pink-500"
    },
    {
      year: "2025",
      title: "Future Vision",
      description: "Expanding to 100+ destinations with sustainable travel initiatives",
      icon: MapPin,
      color: "from-indigo-500 to-purple-500"
    }
  ];

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

        {/* Interactive Timeline */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Our Journey Through Time</h2>
            <p className="text-xl text-muted-foreground">
              From startup vision to global travel platform
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-gold-accent via-lavender-accent to-gold-accent opacity-30 hidden lg:block" />
            
            {timelineEvents.map((event, index) => {
              const Icon = event.icon;
              const isEven = index % 2 === 0;
              
              return (
                <motion.div
                  key={event.year}
                  className={`relative flex items-center mb-16 ${
                    isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                  } flex-col lg:flex-row`}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  {/* Content */}
                  <div className={`lg:w-5/12 ${isEven ? 'lg:pr-8' : 'lg:pl-8'} w-full`}>
                    <motion.div
                      whileHover={{ scale: 1.05, rotateY: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="glass-morphism glow-hover">
                        <CardContent className="p-6">
                          <div className="flex items-center mb-4">
                            <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${event.color} flex items-center justify-center mr-4`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-gold-accent">{event.year}</h3>
                              <h4 className="text-lg font-semibold text-foreground">{event.title}</h4>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{event.description}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Timeline Point */}
                  <div className="relative z-10 w-8 h-8 my-4 lg:my-0">
                    <motion.div
                      className={`w-8 h-8 rounded-full bg-gradient-to-r ${event.color} border-4 border-background shadow-lg`}
                      whileHover={{ scale: 1.3 }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      className={`absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-r ${event.color} opacity-50`}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="lg:w-5/12 hidden lg:block" />
                </motion.div>
              );
            })}
          </div>
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
                    <p className="text-muted-foreground text-lg leading-relaxed mt-4">Our platform leverages advanced algorithms, AI-powered recommendations, and real-time data to craft personalised journeys that exceed expectations and create lasting memories.</p>
                  </div>
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LazyImage
                      src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=75"
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
                    <LazyImage
                      src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=75"
                      alt="Luxury hotel interior"
                      className="rounded-xl shadow-lg w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-lavender-accent/20 to-transparent rounded-xl" />
                  </motion.div>
                  <div className="lg:order-2">
                    <h2 className="text-3xl font-bold mb-4">Premium Experiences</h2>
                    <p className="text-muted-foreground text-lg leading-relaxed">Every destination in our portfolio is carefully curated to offer unmatched luxury, exclusive access, and personalised service that exceeds expectations.</p>
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
                    <p className="text-muted-foreground text-lg leading-relaxed mt-4">We continuously invest in emerging technologies like virtual reality previews, blockchain-secured transactions, and real-time travel optimisation to stay at the forefront of the travel industry.</p>
                  </div>
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LazyImage
                      src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=75"
                      alt="Scenic mountain landscape with pristine lake"
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
                wanderlust into unforgettable realities through innovation, excellence, and genuine care for our travellers' journeys.
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
