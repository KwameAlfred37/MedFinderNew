import { useState } from "react";
import { Search, Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Search medications, pharmacies..." }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="search-glow rounded-2xl p-1">
      <div className="flex items-center space-x-3 px-4 py-3">
        <Search className="w-5 h-5 text-purple-300" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder-gray-300 border-0 outline-none text-lg focus:ring-0"
        />
        <div className="flex space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Camera className="w-5 h-5 text-orange-400" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Upload className="w-5 h-5 text-cyan-400" />
          </Button>
        </div>
        <Button type="submit" className="button-3d p-3 rounded-xl">
          <Search className="w-4 h-4 text-white" />
        </Button>
      </div>
    </form>
  );
}
