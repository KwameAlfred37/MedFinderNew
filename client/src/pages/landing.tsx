import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PillBottle, MapPin, MessageCircle, Shield } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 py-3 text-sm font-medium glass-surface">
        <span className="text-white font-semibold">9:41</span>
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div className="w-1 h-3 bg-white rounded-full"></div>
            <div className="w-1 h-3 bg-white rounded-full"></div>
            <div className="w-1 h-3 bg-white opacity-60 rounded-full"></div>
            <div className="w-1 h-3 bg-white opacity-30 rounded-full"></div>
          </div>
          <div className="w-6 h-3 border border-white rounded-sm ml-2">
            <div className="w-4 h-1 bg-white rounded-xs mx-auto mt-0.5"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg medicine-icon">
              <PillBottle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">MedFinder</h1>
          <p className="text-gray-300 text-lg mb-2">Find Your Medicine Fast</p>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Connect with nearby pharmacies, check medicine availability, and get instant health assistance
          </p>
        </div>

        {/* Features */}
        <div className="w-full max-w-md mb-8">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="card-3d border-0 text-center p-4">
              <CardContent className="p-0">
                <MapPin className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                <h3 className="text-white font-medium text-sm">Find Pharmacies</h3>
                <p className="text-gray-300 text-xs">Locate nearby</p>
              </CardContent>
            </Card>
            <Card className="card-3d border-0 text-center p-4">
              <CardContent className="p-0">
                <MessageCircle className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                <h3 className="text-white font-medium text-sm">Chat Support</h3>
                <p className="text-gray-300 text-xs">Instant help</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 mb-8">
            <div className="glass-card rounded-xl p-4 flex items-center space-x-3">
              <PillBottle className="w-5 h-5 text-purple-300" />
              <div>
                <p className="text-white font-medium text-sm">Medicine Search</p>
                <p className="text-gray-400 text-xs">Real-time availability checking</p>
              </div>
            </div>
            <div className="glass-card rounded-xl p-4 flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-300" />
              <div>
                <p className="text-white font-medium text-sm">Secure & Private</p>
                <p className="text-gray-400 text-xs">Your health data is protected</p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <div className="w-full max-w-md">
          <Button 
            onClick={handleLogin}
            className="w-full button-3d text-white py-6 rounded-2xl font-semibold text-lg"
          >
            Get Started
          </Button>
          <p className="text-gray-400 text-xs text-center mt-4">
            Sign in securely to access all features
          </p>
        </div>
      </div>
    </div>
  );
}
