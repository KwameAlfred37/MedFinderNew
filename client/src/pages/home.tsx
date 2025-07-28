import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import StatusBar from "@/components/status-bar";
import SearchBar from "@/components/search-bar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Heart, 
  History, 
  Truck, 
  User, 
  MessageCircle, 
  Settings,
  PillBottle,
  Clock
} from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const { data: searchHistory } = useQuery({
    queryKey: ["/api/search/history"],
  });

  const handleSearch = (query: string) => {
    if (query.trim()) {
      setLocation(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleProfileClick = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="flex flex-col items-center px-6 py-4">
        {/* Header with Profile or Login */}
        <div className="w-full max-w-md flex justify-between items-center mb-6">
          <div></div>
          <div className="relative">
            {isAuthenticated ? (
              <>
                <Button
                  onClick={handleProfileClick}
                  variant="ghost"
                  size="icon"
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-full status-indicator online"
                >
                  <User className="w-6 h-6 text-white" />
                </Button>

                {/* Profile Dropdown */}
                {showProfileDropdown && (
                  <div className="absolute right-0 top-14 w-48 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg z-30">
                    <div className="py-2">
                      <button 
                        onClick={() => setLocation("/profile")}
                        className="w-full px-4 py-3 text-left text-gray-800 hover:bg-gray-100 transition-colors flex items-center space-x-3 border-b border-gray-200"
                      >
                        <User className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                      </button>
                      <button 
                        onClick={() => setLocation("/chat")}
                        className="w-full px-4 py-3 text-left text-gray-800 hover:bg-gray-100 transition-colors flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-medium">Chat</span>
                        </div>
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-gray-800 hover:bg-gray-100 transition-colors flex items-center space-x-3"
                      >
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Button
                onClick={() => window.location.href = "/api/login"}
                className="button-3d text-white px-4 py-2 rounded-xl font-medium text-sm"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* App Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">MedFinder</h1>
          <p className="text-gray-300 text-lg">Find Your Medicines Instantly</p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-md mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Quick Actions */}
        <div className="w-full max-w-md mb-6">
          <h3 className="text-white text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="card-3d border-0 rounded-2xl p-6 text-center cursor-pointer">
              <MapPin className="w-8 h-8 text-purple-300 mx-auto mb-3" />
              <p className="text-white font-medium">Find Pharmacy</p>
              <p className="text-gray-300 text-sm">Locate nearby</p>
            </Card>
            <Card className="card-3d border-0 rounded-2xl p-6 text-center cursor-pointer">
              <Heart className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <p className="text-white font-medium">Emergency</p>
              <p className="text-gray-300 text-sm">Quick help</p>
            </Card>
            <Card className="card-3d border-0 rounded-2xl p-6 text-center cursor-pointer">
              <History className="w-8 h-8 text-blue-300 mx-auto mb-3" />
              <p className="text-white font-medium">History</p>
              <p className="text-gray-300 text-sm">Past searches</p>
            </Card>
            <Card className="card-3d border-0 rounded-2xl p-6 text-center cursor-pointer">
              <Truck className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-white font-medium">Delivery</p>
              <p className="text-gray-300 text-sm">Home service</p>
            </Card>
          </div>
        </div>

        {/* Recent Searches */}
        <div className="w-full max-w-md">
          <h3 className="text-white text-lg font-semibold mb-4">Recent Searches</h3>
          <div className="space-y-3">
            {searchHistory && searchHistory.length > 0 ? (
              searchHistory.slice(0, 3).map((search: any) => (
                <div key={search.id} className="suggestion-item rounded-xl p-4 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-white font-medium">{search.query}</p>
                        <p className="text-gray-400 text-sm">Search query</p>
                      </div>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {new Date(search.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="suggestion-item rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">No recent searches</p>
                      <p className="text-gray-400 text-sm">Start searching for medicines</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
