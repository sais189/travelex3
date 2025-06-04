import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Plane, Star, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

interface Destination {
  id: number;
  name: string;
  country: string;
  description: string;
  imageUrl: string;
  price: string;
  rating: string;
  reviewCount: number;
  distanceKm?: string;
}

export default function LocationSearchDropdown() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Fetch destinations
  const { data: destinations = [] } = useQuery({
    queryKey: ['/api/destinations'],
  });

  // Get unique countries for filter
  const countries = Array.from(new Set((destinations as Destination[]).map(dest => dest.country)));

  // Filter destinations based on search term and country
  const filteredDestinations = (destinations as Destination[]).filter((dest: Destination) => {
    const matchesSearch = dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dest.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === "all" || dest.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  useEffect(() => {
    setIsOpen(isFocused && searchTerm.length > 0);
  }, [isFocused, searchTerm]);

  const handleDestinationSelect = (destination: Destination) => {
    setSearchTerm("");
    setIsOpen(false);
    setIsFocused(false);
    navigate(`/booking/${destination.id}`);
  };

  const handleViewAllDestinations = () => {
    setSearchTerm("");
    setIsOpen(false);
    setIsFocused(false);
    navigate("/destinations");
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            className="pl-10 pr-4 h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus:border-gold-accent"
          />
        </div>
        <Select value={selectedCountry} onValueChange={setSelectedCountry}>
          <SelectTrigger className="w-[140px] h-12 bg-white/10 backdrop-blur-sm border-white/20 text-white focus:border-gold-accent">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4" />
              <SelectValue placeholder="Where to" />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-space-blue/95 backdrop-blur-sm border-gold-accent/20">
            <SelectItem value="all" className="text-white hover:bg-gold-accent/20">
              All Countries
            </SelectItem>
            {countries.map(country => (
              <SelectItem 
                key={country} 
                value={country}
                className="text-white hover:bg-gold-accent/20"
              >
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-50"
          >
            <Card className="glass-morphism border-gold-accent/20 shadow-2xl">
              <CardContent className="p-4">
                {filteredDestinations.length > 0 ? (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground mb-3">
                      {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''} found
                    </div>
                    
                    {filteredDestinations.slice(0, 5).map((destination: Destination) => (
                      <motion.div
                        key={destination.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => handleDestinationSelect(destination)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={destination.imageUrl}
                              alt={destination.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-white truncate">
                                {destination.name}
                              </h3>
                              <Badge variant="secondary" className="ml-2 bg-gold-accent/20 text-gold-accent">
                                ${destination.price}
                              </Badge>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <MapPin className="w-3 h-3 mr-1" />
                                {destination.country}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Star className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                                {destination.rating}
                              </div>
                            </div>
                          </div>
                          <Plane className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </motion.div>
                    ))}

                    {filteredDestinations.length > 5 && (
                      <div className="pt-2 border-t border-white/10">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleViewAllDestinations}
                          className="w-full text-gold-accent hover:text-gold-accent/80 hover:bg-gold-accent/10"
                        >
                          View all {filteredDestinations.length} destinations
                        </Button>
                      </div>
                    )}
                  </div>
                ) : searchTerm.length > 0 ? (
                  <div className="text-center py-4">
                    <div className="text-muted-foreground mb-2">No destinations found</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleViewAllDestinations}
                      className="text-gold-accent hover:text-gold-accent/80"
                    >
                      Browse all destinations
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground mb-3">Popular destinations</div>
                    {destinations.slice(0, 3).map((destination: Destination) => (
                      <motion.div
                        key={destination.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                        onClick={() => handleDestinationSelect(destination)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={destination.imageUrl}
                              alt={destination.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-white text-sm">
                              {destination.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {destination.country}
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-gold-accent/20 text-gold-accent text-xs">
                            ${destination.price}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}