import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSongs } from "@/hooks/useSongs";
import { useNavigate } from "react-router-dom";
const Explore = () => {
  const [activeCategory, setActiveCategory] = useState("lessons");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();
  
  const { data: allSongs = [], isLoading } = useSongs(activeCategory === "lessons" ? undefined : activeCategory);
  
  // Filter songs based on search term
  const songs = allSongs.filter(song => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    
    // Search in song title
    if (song.title.toLowerCase().includes(searchLower)) return true;
    
    // Search in song level
    if (song.level.toLowerCase().includes(searchLower)) return true;
    
    // Search in tags
    if (song.tags?.some(tag => tag.name.toLowerCase().includes(searchLower))) return true;
    
    return false;
  });
  const categories = [{
    id: "lessons",
    label: "Songs"
  }, {
    id: "songs",
    label: "Songs"
  }, {
    id: "skills",
    label: "Skills"
  }, {
    id: "techniques",
    label: "Techniques"
  }];
  const getLevelStars = (level: string) => {
    const levelMap: { [key: string]: number } = {
      'beginner': 1,
      'intermediate': 3,
      'advanced': 2,
      'professional': 3,
      'professionals': 3
    };
    return levelMap[level.toLowerCase()] || 1;
  };

  const renderStars = (level: number) => {
    return Array.from({
      length: level
    }, (_, i) => <span key={i} className="text-lg text-drumio-yellow">
      ★
    </span>);
  };

  const handleStartPractice = (songId: string) => {
    navigate(`/song/${songId}/practice`);
  };
  return <div className="min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground font-poppins">Explore</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Search Input */}
      {showSearch && (
        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search lessons by name, level, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
        <TabsList className="hidden">
          {categories.map(category => <TabsTrigger key={category.id} value={category.id} className="rounded-full px-6 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {category.label}
            </TabsTrigger>)}
        </TabsList>

        {/* Content for each tab */}
        {categories.map(category => <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading songs...</p>
                </div>
              ) : songs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No songs found for this category.</p>
                </div>
              ) : (
                songs.map((song) => (
                  <Card key={song.id} className="relative overflow-hidden border-none bg-card">
                    <div 
                      className="relative h-80 bg-cover bg-center bg-no-repeat" 
                      style={{
                        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${song.background_image_url || '/lovable-uploads/ced3ac1d-0317-4c8a-9be2-23b8f68dac90.png'})`
                      }}
                    >
                      <CardContent className="absolute inset-0 p-6 flex flex-col justify-between">
                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-center">
                          <h2 className="text-3xl font-bold text-white mb-2 font-poppins">
                            {song.title}
                          </h2>
                          <p className="text-white/80 text-lg mb-6 line-clamp-3">
                            {song.description || "No description available"}
                          </p>
                        </div>

                        {/* Bottom section with level, tags and button */}
                        <div className="space-y-4">
                          {/* Level and Tags row */}
                          <div className="flex items-center gap-4">
                            {/* Level indicator */}
                            <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-2">
                              <div className="flex items-center">
                                {renderStars(getLevelStars(song.level))}
                              </div>
                              <span className="text-white text-sm font-medium capitalize">{song.level === 'advanced' ? 'Intermediate' : song.level}</span>
                            </div>

                            {/* Tags */}
                            <div className="flex gap-2">
                              {song.tags.map((tag) => (
                                <Badge 
                                  key={tag.id} 
                                  variant="secondary" 
                                  className="bg-black/40 text-white border-none hover:bg-black/50"
                                  style={{ backgroundColor: tag.tag_color ? `${tag.tag_color}40` : undefined }}
                                >
                                  {tag.name}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Start Practice Button */}
                          <Button 
                            onClick={() => handleStartPractice(song.id)}
                            className="w-fit bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full"
                          >
                            Start Practice
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>)}
      </Tabs>
    </div>;
};
export default Explore;