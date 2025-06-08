import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, ChevronDown, Star, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useLocation } from "wouter";
import type { Destination } from "@shared/schema";

export default function DestinationDropdown() {
  const [, navigate] = useLocation();

  // Fetch destinations
  const { data: destinations = [], isLoading } = useQuery<Destination[]>({
    queryKey: ['/api/destinations'],
  });

  const handleDestinationSelect = (destination: Destination) => {
    navigate(`/booking/${destination.id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center space-x-2 h-12 px-4 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-gold-accent transition-all duration-300"
        >
          <MapPin className="w-4 h-4" />
          <span>Where to</span>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-80 bg-space-blue/95 backdrop-blur-sm border-gold-accent/20 max-h-96 overflow-y-auto"
        align="center"
        side="bottom"
        sideOffset={8}
      >
        {isLoading ? (
          <div className="p-4 text-center text-white/60">
            Loading destinations...
          </div>
        ) : destinations.length === 0 ? (
          <div className="p-4 text-center text-white/60">
            No destinations available
          </div>
        ) : (
          destinations.map((destination) => (
            <DropdownMenuItem
              key={destination.id}
              className="text-white hover:bg-gold-accent/20 cursor-pointer p-3 focus:bg-gold-accent/20"
              onClick={() => handleDestinationSelect(destination)}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={destination.imageUrl || ''} 
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white truncate">
                      {destination.name}
                    </h4>
                    <span className="text-gold-accent font-semibold ml-2">
                      ${destination.price}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-white/60 text-sm truncate">
                      {destination.country}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-white/60 text-sm">
                        {destination.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <Plane className="w-4 h-4 text-gold-accent flex-shrink-0" />
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}