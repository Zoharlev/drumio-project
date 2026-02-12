import { useState, useEffect } from "react";
import { Search, Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSongs } from "@/hooks/useSongs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import LanguageSelector from "@/components/LanguageSelector";
import { t, isRTL, getLanguage } from "@/utils/translations";
import { Progress } from "@/components/ui/progress";
import { useAllSongsProgress } from "@/hooks/useAllSongsProgress";

const Explore = () => {
  const [activeCategory, setActiveCategory] = useState("lessons");
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState(getLanguage());
  const navigate = useNavigate();
  const { signOut } = useAuth();

  useEffect(() => {
    const handleLangChange = () => setLang(getLanguage());
    window.addEventListener("language-changed", handleLangChange);
    return () => window.removeEventListener("language-changed", handleLangChange);
  }, []);

  const rtl = isRTL();
  
  const { data: allSongs = [], isLoading } = useSongs(activeCategory === "lessons" ? undefined : activeCategory, lang);
  const songIds = allSongs.map(s => s.id);
  const { data: progressMap } = useAllSongsProgress(songIds);
  
  const songs = allSongs.filter(song => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    if (song.title.toLowerCase().includes(searchLower)) return true;
    if (song.level.toLowerCase().includes(searchLower)) return true;
    if (song.tags?.some(tag => tag.name.toLowerCase().includes(searchLower))) return true;
    return false;
  });

  const categories = [
    { id: "lessons", label: "Songs" },
    { id: "songs", label: "Songs" },
    { id: "skills", label: "Skills" },
    { id: "techniques", label: "Techniques" },
  ];

  const getLevelStars = (level: string) => {
    const levelMap: { [key: string]: number } = {
      'beginner': 1, 'intermediate': 2, 'advanced': 2, 'professional': 3, 'professionals': 3
    };
    return levelMap[level.toLowerCase()] || 1;
  };

  const renderStars = (level: number) => {
    return Array.from({ length: level }, (_, i) => (
      <span key={i} className="text-lg text-drumio-yellow">★</span>
    ));
  };

  const getLevelLabel = (level: string) => {
    let key = level.toLowerCase();
    // Map plural/variations to singular translation keys
    if (key === 'beginners') key = 'beginner';
    if (key === 'advanced') key = 'intermediate';
    return t(key as any) || level;
  };

  const handleStartPractice = (songId: string) => {
    navigate(`/song/${songId}`);
  };

  return (
    <div className="min-h-screen bg-background px-6 py-8" dir={rtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className={`absolute ${rtl ? "right-0" : "left-0"} top-full mt-1 z-50 bg-card border border-secondary rounded-lg shadow-lg py-1 min-w-[160px]`}>
                  <button
                    onClick={async () => {
                      setMenuOpen(false);
                      await signOut();
                      navigate("/login", { replace: true });
                    }}
                    className={`w-full ${rtl ? "text-right" : "text-left"} px-4 py-2.5 text-sm font-poppins text-destructive hover:bg-secondary transition-colors flex items-center gap-2`}
                  >
                    <LogOut className="w-4 h-4" />
                    {t("logout")}
                  </button>
                </div>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold text-foreground font-poppins">{t("explore")}</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <LanguageSelector />
        </div>
      </div>

      {/* Search Input */}
      {showSearch && (
        <div className="mb-6">
          <Input
            type="text"
            placeholder={t("search_placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
      )}

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
        <TabsList className="hidden">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id} className="rounded-full px-6 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {category.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t("loading")}</p>
                </div>
              ) : songs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">{t("no_results")}</p>
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
                        <div className="flex-1 flex flex-col justify-center">
                          <h2 className="text-3xl font-bold text-white mb-2 font-poppins">
                            {song.title}
                          </h2>
                          <p className="text-white/80 text-lg mb-6 line-clamp-3">
                            {song.description || t("no_description")}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-2">
                              <div className="flex items-center">
                                {renderStars(getLevelStars(song.level))}
                              </div>
                              <span className="text-white text-sm font-medium">
                                {getLevelLabel(song.level)}
                              </span>
                            </div>

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

                          {/* Progress Bar */}
                          {progressMap?.get(song.id) && (progressMap.get(song.id)!.percentage > 0) && (
                            <div>
                              <Progress value={progressMap.get(song.id)!.percentage} variant="completed" className="h-2 bg-white/20" />
                              <div className="flex justify-end mt-1">
                                <span className="text-white/80 text-xs font-medium">{progressMap.get(song.id)!.percentage}%</span>
                              </div>
                            </div>
                          )}

                          <Button
                            onClick={() => handleStartPractice(song.id)}
                            className="w-fit bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full"
                          >
                            {progressMap?.get(song.id) && progressMap.get(song.id)!.percentage > 0 ? t("continue") : t("go")}
                          </Button>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Explore;
