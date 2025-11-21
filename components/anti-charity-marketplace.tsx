"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Heart, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AntiCharity {
  id: string;
  name: string;
  description?: string;
  meme_url?: string;
  hate_score: number;
  category?: string;
  logo_url?: string;
  website_url?: string;
}

interface AntiCharityMarketplaceProps {
  selectedCharityId?: string;
  onSelect: (charityId: string) => void;
  className?: string;
}

const getHateScoreColor = (score: number) => {
  if (score >= 80) return "bg-red-500";
  if (score >= 60) return "bg-orange-500";
  return "bg-yellow-500";
};

const getHateScoreLabel = (score: number) => {
  if (score >= 80) return "Maximum Hate";
  if (score >= 60) return "High Hate";
  return "Medium Hate";
};

export function AntiCharityMarketplace({
  selectedCharityId,
  onSelect,
  className,
}: AntiCharityMarketplaceProps) {
  const [charities, setCharities] = useState<AntiCharity[]>([]);
  const [filteredCharities, setFilteredCharities] = useState<AntiCharity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [hateScoreFilter, setHateScoreFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch charities from Supabase
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/anti-charities");
        
        if (!response.ok) {
          throw new Error("Failed to fetch anti-charities");
        }

        const data = await response.json();
        setCharities(data);
        setFilteredCharities(data);
      } catch (err) {
        console.error("Error fetching anti-charities:", err);
        setError("Failed to load anti-charities. Please try again.");
        // Fallback to mock data if API fails
        setCharities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCharities();
  }, []);

  // Get unique categories
  const categories = Array.from(
    new Set(charities.map((c) => c.category).filter(Boolean) as string[])
  ).sort();

  // Apply filters
  useEffect(() => {
    let filtered = [...charities];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (charity) =>
          charity.name.toLowerCase().includes(query) ||
          charity.description?.toLowerCase().includes(query) ||
          charity.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((charity) => charity.category === selectedCategory);
    }

    // Hate score filter
    if (hateScoreFilter !== "all") {
      filtered = filtered.filter((charity) => {
        if (hateScoreFilter === "high") return charity.hate_score >= 70;
        if (hateScoreFilter === "medium") return charity.hate_score >= 40 && charity.hate_score < 70;
        if (hateScoreFilter === "low") return charity.hate_score < 40;
        return true;
      });
    }

    // Sort by hate score (descending) then by name
    filtered.sort((a, b) => {
      if (b.hate_score !== a.hate_score) {
        return b.hate_score - a.hate_score;
      }
      return a.name.localeCompare(b.name);
    });

    setFilteredCharities(filtered);
  }, [charities, searchQuery, selectedCategory, hateScoreFilter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setHateScoreFilter("all");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || hateScoreFilter !== "all";

  if (loading) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading anti-charities...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && charities.length === 0) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-destructive mb-2">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Heart className="h-8 w-8 text-red-500" />
          Anti-Charity Marketplace
        </h2>
        <p className="text-muted-foreground">
          Choose the "charity" you'd hate to support if you lose your bet
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-lg">Search & Filter</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="w-full sm:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search anti-charities by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Hate Score Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Hate Score</label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={hateScoreFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHateScoreFilter("all")}
                  >
                    All Scores
                  </Button>
                  <Button
                    variant={hateScoreFilter === "high" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHateScoreFilter("high")}
                  >
                    High (70+)
                  </Button>
                  <Button
                    variant={hateScoreFilter === "medium" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHateScoreFilter("medium")}
                  >
                    Medium (40-69)
                  </Button>
                  <Button
                    variant={hateScoreFilter === "low" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setHateScoreFilter("low")}
                  >
                    Low (&lt;40)
                  </Button>
                </div>
              </div>

              {/* Reset Filters */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Reset Filters
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Showing {filteredCharities.length} of {charities.length} anti-charities
        </p>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            Clear all
          </Button>
        )}
      </div>

      {/* Charity Grid */}
      {filteredCharities.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-2">No anti-charities found</p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCharities.map((charity) => {
            const isSelected = selectedCharityId === charity.id;

            return (
              <Card
                key={charity.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-lg relative overflow-hidden group",
                  isSelected && "border-primary border-2 shadow-lg ring-2 ring-primary/20"
                )}
                onClick={() => onSelect(charity.id)}
              >
                {/* Hate Score Badge */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge
                    className={cn(
                      getHateScoreColor(charity.hate_score),
                      "text-white font-semibold shadow-md"
                    )}
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {charity.hate_score}
                  </Badge>
                </div>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute top-3 left-3 z-10">
                    <Badge className="bg-primary text-primary-foreground">
                      Selected
                    </Badge>
                  </div>
                )}

                {/* Meme Image */}
                <div className="w-full h-48 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 relative overflow-hidden group/image">
                  {charity.meme_url ? (
                    <>
                      <img
                        src={charity.meme_url}
                        alt={`${charity.name} meme`}
                        className="w-full h-full object-cover group-hover/image:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Hide image and show placeholder on error
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const placeholder = target.parentElement?.querySelector(".meme-placeholder");
                          if (placeholder) {
                            (placeholder as HTMLElement).style.display = "flex";
                          }
                        }}
                      />
                      <div className="meme-placeholder absolute inset-0 flex items-center justify-center text-6xl hidden">
                        😈
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-6xl">
                      😈
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded z-10">
                    Meme
                  </div>
                </div>

                {/* Charity Info */}
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-1">{charity.name}</CardTitle>
                  {charity.description && (
                    <CardDescription className="line-clamp-2">
                      {charity.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    {charity.category && (
                      <Badge variant="outline" className="text-xs">
                        {charity.category}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {getHateScoreLabel(charity.hate_score)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {charities.length === 0 && !loading && !error && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No anti-charities available. Check back later!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

