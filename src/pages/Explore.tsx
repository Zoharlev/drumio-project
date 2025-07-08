import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
const Explore = () => {
  const [activeCategory, setActiveCategory] = useState("lessons");

  // Mock data - replace with real data from Supabase
  const mockLesson = {
    id: "1",
    title: "Lesson Title",
    description: "Lesson description",
    backgroundImage: "/lovable-uploads/ced3ac1d-0317-4c8a-9be2-23b8f68dac90.png",
    level: 3,
    tags: ["Tag", "Tag"]
  };
  const categories = [{
    id: "lessons",
    label: "Lessons"
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
  const renderStars = (level: number) => {
    return Array.from({
      length: 5
    }, (_, i) => <span key={i} className={`text-lg ${i < level ? 'text-drumio-yellow' : 'text-muted-foreground'}`}>
        ★
      </span>);
  };
  return <div className="min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-foreground font-poppins"></h1>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Search className="h-5 w-5" />
        </Button>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
        <TabsList className="bg-muted/50 p-1 h-auto rounded-full">
          {categories.map(category => <TabsTrigger key={category.id} value={category.id} className="rounded-full px-6 py-2 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {category.label}
            </TabsTrigger>)}
        </TabsList>

        {/* Content for each tab */}
        {categories.map(category => <TabsContent key={category.id} value={category.id} className="mt-6">
            <div className="space-y-4">
              {/* Lesson Card */}
              <Card className="relative overflow-hidden border-none bg-card">
                <div className="relative h-80 bg-cover bg-center bg-no-repeat" style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${mockLesson.backgroundImage})`
            }}>
                  <CardContent className="absolute inset-0 p-6 flex flex-col justify-between">
                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center">
                      <h2 className="text-3xl font-bold text-white mb-2 font-poppins">
                        {mockLesson.title}
                      </h2>
                      <p className="text-white/80 text-lg mb-6">
                        {mockLesson.description}
                      </p>
                    </div>

                    {/* Bottom section with level, tags and button */}
                    <div className="space-y-4">
                      {/* Level and Tags row */}
                      <div className="flex items-center gap-4">
                        {/* Level indicator */}
                        <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-2">
                          <div className="flex items-center">
                            {renderStars(mockLesson.level)}
                          </div>
                          <span className="text-white text-sm font-medium">Level</span>
                        </div>

                        {/* Tags */}
                        <div className="flex gap-2">
                          {mockLesson.tags.map((tag, index) => <Badge key={index} variant="secondary" className="bg-black/40 text-white border-none hover:bg-black/50">
                              {tag}
                            </Badge>)}
                        </div>
                      </div>

                      {/* Start Practice Button */}
                      <Button className="w-fit bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-3 rounded-full">
                        Start Practice
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          </TabsContent>)}
      </Tabs>
    </div>;
};
export default Explore;