import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { ArrowLeft, Filter } from "lucide-react";
import PharmacyCard from "@/components/pharmacy-card";
import { Button } from "@/components/ui/button";

export default function SearchResults() {
  const [, setLocation] = useLocation();
  const query = new URLSearchParams(window.location.search).get('q') || '';

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["/api/search", { q: query }],
    enabled: !!query,
  });

  const handleBack = () => {
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen overflow-x-hidden">
        <div className="flex items-center justify-center h-96">
          <div className="loading-spinner w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  const pharmacies = searchResults?.pharmacies || [];
  const medicines = searchResults?.medicines || [];

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Button>
          <h2 className="text-xl font-semibold text-white">Search Results</h2>
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full"
          >
            <Filter className="w-5 h-5 text-white" />
          </Button>
        </div>

        {/* Search Query */}
        <div className="mb-6">
          <p className="text-gray-300">
            Showing results for: <span className="text-white font-semibold">{query}</span>
          </p>
          <p className="text-sm text-gray-400">
            Found {pharmacies.length} pharmacies and {medicines.length} medicines
          </p>
        </div>

        {/* Medicines Section */}
        {medicines.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white text-lg font-semibold mb-4">Medicines</h3>
            <div className="space-y-3">
              {medicines.map((medicine: any) => (
                <div key={medicine.id} className="result-card rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{medicine.name}</h4>
                      <p className="text-gray-600 text-sm">{medicine.category}</p>
                      {medicine.genericName && (
                        <p className="text-gray-500 text-xs">Generic: {medicine.genericName}</p>
                      )}
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/search?q=${encodeURIComponent(medicine.name)}`)}
                    >
                      Find Stores
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pharmacies Section */}
        {pharmacies.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white text-lg font-semibold mb-4">Pharmacies</h3>
            <div className="space-y-4">
              {pharmacies.map((pharmacy: any) => (
                <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {pharmacies.length === 0 && medicines.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">No results found</h3>
            <p className="text-gray-400 text-sm">
              Try searching with different keywords or check your spelling
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
