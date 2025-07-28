import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Edit, User, CreditCard, Bell, Shield, Pill, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import StatusBar from "@/components/status-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: searchHistory } = useQuery({
    queryKey: ["/api/search/history"],
    enabled: !!user,
  });

  const handleBack = () => {
    setLocation("/");
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <StatusBar />
      
      <div className="px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <h2 className="text-xl font-semibold text-white">Profile</h2>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full"
          >
            <Edit className="w-5 h-5 text-white" />
          </Button>
        </div>

        {/* Profile Info */}
        <Card className="glass-card border-0 rounded-2xl p-6 mb-6">
          <CardContent className="p-0">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {user?.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {getInitials(user?.firstName, user?.lastName)}
                  </span>
                )}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {user?.firstName || user?.lastName 
                  ? `${user?.firstName || ""} ${user?.lastName || ""}`.trim()
                  : "User"
                }
              </h3>
              <p className="text-gray-300 mb-4">{user?.email || "No email provided"}</p>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="text-center">
                  <p className="text-white font-semibold">{searchHistory?.length || 0}</p>
                  <p className="text-gray-400">Searches</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">0</p>
                  <p className="text-gray-400">Saved</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold">0</p>
                  <p className="text-gray-400">Reviews</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Options */}
        <div className="space-y-3">
          <Card className="glass-card border-0 rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors">
            <CardContent className="p-0 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-500/30 rounded-full flex items-center justify-center">
                  <Pill className="w-5 h-5 text-purple-300" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">My Medications</p>
                  <p className="text-gray-400 text-sm">Manage prescriptions</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors">
            <CardContent className="p-0 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-500/30 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-300" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Health Profile</p>
                  <p className="text-gray-400 text-sm">Medical information</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors">
            <CardContent className="p-0 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-500/30 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-green-300" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Payment Methods</p>
                  <p className="text-gray-400 text-sm">Cards & insurance</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors">
            <CardContent className="p-0 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-yellow-500/30 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-yellow-300" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Notifications</p>
                  <p className="text-gray-400 text-sm">Reminders & alerts</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </CardContent>
          </Card>

          <Card className="glass-card border-0 rounded-2xl p-4 cursor-pointer hover:bg-white/5 transition-colors">
            <CardContent className="p-0 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-500/30 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-300" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">Privacy & Security</p>
                  <p className="text-gray-400 text-sm">Account protection</p>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </CardContent>
          </Card>
        </div>

        {/* Sign Out */}
        <Button
          onClick={handleLogout}
          className="w-full mt-8 bg-red-500/20 border border-red-500/30 text-red-400 py-4 rounded-2xl font-medium hover:bg-red-500/30 transition-colors"
          variant="outline"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
