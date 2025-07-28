import { MapPin, Clock, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PharmacyCardProps {
  pharmacy: {
    id: string;
    name: string;
    address: string;
    phone?: string;
    rating?: string;
    reviewCount?: number;
    isOpen?: boolean;
    openTime?: string;
    closeTime?: string;
    deliveryAvailable?: boolean;
  };
}

export default function PharmacyCard({ pharmacy }: PharmacyCardProps) {
  const rating = pharmacy.rating ? parseFloat(pharmacy.rating) : 0;
  const distance = "0.3 mi"; // This would be calculated based on user location

  return (
    <Card className="result-card rounded-2xl p-6">
      <CardContent className="p-0">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{pharmacy.name}</h3>
              <p className="text-gray-600 text-sm">{pharmacy.address}</p>
              {rating > 0 && (
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-current' : ''}`} 
                      />
                    ))}
                  </div>
                  <span className="text-gray-500 text-xs">
                    {rating.toFixed(1)} ({pharmacy.reviewCount || 0} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
              pharmacy.isOpen 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {pharmacy.isOpen ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
          <span>
            <MapPin className="w-4 h-4 inline mr-1" />
            {distance} away
          </span>
          {pharmacy.openTime && pharmacy.closeTime && (
            <span>
              <Clock className="w-4 h-4 inline mr-1" />
              {pharmacy.isOpen ? `Open until ${pharmacy.closeTime}` : `Opens at ${pharmacy.openTime}`}
            </span>
          )}
          <span>
            <Truck className="w-4 h-4 inline mr-1" />
            {pharmacy.deliveryAvailable ? 'Delivery available' : 'No delivery'}
          </span>
        </div>

        <div className="flex space-x-3">
          <Button className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors">
            View Details
          </Button>
          <Button 
            variant="outline"
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Directions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
