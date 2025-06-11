import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Search, Calendar, MapPin, Star, Plane, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OptimizedImage } from "@/components/ui/optimized-image";
import EarthGlobe from "@/components/EarthGlobe";
import type { Destination } from "@shared/schema";
import { useState, useMemo } from "react";

export default function Home() {
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [searchDate, setSearchDate] = useState("");

  const { data: destinations = [] } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const featuredDestinations = useMemo(() => destinations.slice(0, 4), [destinations]);

  const handleSearch = () => {
    if (selectedDestination) {
      navigate(`/booking/${selectedDestination.id}`);
    } else {
      navigate("/destinations");
    }
  };

  const handleDestinationSelect = (destination: Destination) => {
    setSelectedDestination(destination);
    setOpen(false);
  };

  const handleBookNow = (destinationId: number) => {
    navigate(`/booking/${destinationId}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with 3D Globe */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Explore the{" "}
                <span className="text-gold-accent">Future</span> of Travel
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Discover extraordinary destinations with our immersive travel
                experiences powered by cutting-edge technology.
              </p>

              {/* Search Bar */}
              <motion.div
                className="glass-morphism rounded-2xl p-6 mb-8 max-w-2xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gold-accent w-5 h-5 z-10" />
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className="w-full justify-between pl-10 bg-slate-panel border-border hover:border-gold-accent text-left font-normal"
                        >
                          {selectedDestination
                            ? selectedDestination.name
                            : "Where to?"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent 
                        className="w-full p-0 bg-slate-panel border-border"
                        side="bottom"
                        sideOffset={8}
                        align="start"
                        avoidCollisions={false}
                      >
                        <Command>
                          <CommandInput placeholder="Search destinations..." className="h-9" />
                          <CommandList>
                            <CommandEmpty>No destinations found.</CommandEmpty>
                            <CommandGroup>
                              {destinations.map((destination) => (
                                <CommandItem
                                  key={destination.id}
                                  value={destination.name}
                                  onSelect={() => handleDestinationSelect(destination)}
                                  className="cursor-pointer hover:bg-gold-accent/10"
                                >
                                  <div className="flex items-center space-x-3">
                                    <MapPin className="w-4 h-4 text-gold-accent" />
                                    <div>
                                      <div className="font-medium">{destination.name}</div>
                                      <div className="text-sm text-muted-foreground">{destination.country}</div>
                                    </div>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lavender-accent w-5 h-5" />
                    <Input
                      type="date"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      className="pl-10 bg-slate-panel border-border focus:border-lavender-accent text-foreground"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    className="bg-gold-accent hover:bg-gold-accent/80 text-primary-foreground glow-hover"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {selectedDestination ? "Book Now" : "Search"}
                  </Button>
                </div>
              </motion.div>

              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Button
                  onClick={() => navigate("/destinations")}
                  className="bg-lavender-accent hover:bg-lavender-accent/80 text-primary-foreground glow-hover"
                  size="lg"
                >
                  <Plane className="w-5 h-5 mr-2" />
                  Explore Trips
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate("/about")}
                  className="border-gold-accent text-gold-accent hover:bg-gold-accent hover:text-primary-foreground"
                >
                  Learn More
                </Button>
              </motion.div>
            </motion.div>

            {/* 3D Globe */}
            <motion.div
              className="flex justify-center lg:justify-end"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              <EarthGlobe />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Popular Destinations</h2>
            <p className="text-muted-foreground text-lg">
              Discover the world's most breathtaking locations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDestinations.map((destination, index) => (
              <motion.div
                key={destination.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Card 
                  className="glass-morphism card-tilt cursor-pointer glow-hover overflow-hidden h-full flex flex-col group"
                  onClick={() => navigate(`/booking/${destination.id}`)}
                >
                  <div className="relative h-48 flex-shrink-0 overflow-hidden">
                    <OptimizedImage
                      src={destination.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"}
                      alt={destination.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      priority={index < 2}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 right-4">
                      <div className="flex items-center space-x-1 bg-black bg-opacity-50 rounded-full px-2 py-1">
                        <Star className="w-3 h-3 text-gold-accent fill-current" />
                        <span className="text-xs text-white font-medium">{destination.rating}</span>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-gold-accent transition-colors duration-200">
                        {destination.name}
                      </h3>
                      <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-4 min-h-[5rem]">
                        {destination.shortDescription || destination.description.slice(0, 180) + "..."}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-auto pt-4">
                      <div className="flex flex-col">
                        <span className="text-gold-accent font-bold text-xl">
                          ${parseFloat(destination.price).toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">per person</span>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(destination.id);
                        }}
                        className="bg-lavender-accent hover:bg-lavender-accent/80 text-primary-foreground transition-all duration-200 px-6 hover:scale-105"
                        size="sm"
                      >
                        Book Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Button
              onClick={() => navigate("/destinations")}
              variant="outline"
              size="lg"
              className="border-gold-accent text-gold-accent hover:bg-gold-accent hover:text-primary-foreground"
            >
              View All Destinations
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}