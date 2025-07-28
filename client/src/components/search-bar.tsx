import { useState, useRef, useEffect } from "react";
import { Search, Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

// Common medicine suggestions
const commonMedicines = [
  "Paracetamol", "Ibuprofen", "Aspirin", "Amoxicillin", "Omeprazole",
  "Metformin", "Lisinopril", "Atorvastatin", "Levothyroxine", "Amlodipine",
  "Insulin", "Vitamin D", "Multivitamin", "Cough Syrup", "Antacid"
];

export default function SearchBar({ onSearch, placeholder = "Search medications, pharmacies..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on query
  useEffect(() => {
    if (query.length > 0) {
      const filtered = commonMedicines.filter(medicine =>
        medicine.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 5)); // Show max 5 suggestions
      setShowSuggestions(filtered.length > 0 && query.length > 1);
    } else {
      setShowSuggestions(false);
    }
  }, [query]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Handle prescription file upload
      const formData = new FormData();
      formData.append('prescription', file);
      
      // You can implement prescription scanning here
      onSearch(`prescription: ${file.name}`);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use rear camera for prescription scanning
      });
      
      // Create video element for camera preview
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      
      // For now, just trigger search with camera indication
      onSearch("camera: prescription scan");
      
      // Stop the stream
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access is required to scan prescriptions');
    }
  };

  return (
    <div ref={searchRef} className="relative">
      <form onSubmit={handleSubmit} className="search-glow rounded-2xl p-1">
        <div className="flex items-center space-x-3 px-4 py-3">
          <Search className="w-5 h-5 text-purple-300" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-white placeholder-gray-300 border-0 outline-none text-lg focus:ring-0"
          />
          <div className="flex space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCameraCapture}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Scan prescription with camera"
            >
              <Camera className="w-5 h-5 text-orange-400" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleFileUpload}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Upload prescription file"
            >
              <Upload className="w-5 h-5 text-cyan-400" />
            </Button>
          </div>
          <Button type="submit" className="button-3d p-3 rounded-xl">
            <Search className="w-4 h-4 text-white" />
          </Button>
        </div>
      </form>

      {/* Auto-suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg z-50 overflow-hidden">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full px-4 py-3 text-left text-gray-800 hover:bg-purple-50 transition-colors flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
            >
              <Search className="w-4 h-4 text-purple-500" />
              <span>{suggestion}</span>
            </button>
          ))}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
