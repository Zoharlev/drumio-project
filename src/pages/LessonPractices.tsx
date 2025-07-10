import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLessonPractices } from "@/hooks/useLessonPractices";

const LessonPractices = () => {
  const navigate = useNavigate();
  const { lessonId } = useParams<{ lessonId: string }>();
  
  const { data, isLoading } = useLessonPractices(lessonId || "");

  const getLevelStars = (level: string) => {
    const levelMap: { [key: string]: number } = {
      'beginner': 1,
      'intermediate': 3,
      'advanced': 5
    };
    return levelMap[level.toLowerCase()] || 1;
  };

  const renderStars = (level: number) => {
    return Array.from({
      length: 5
    }, (_, i) => (
      <span key={i} className={`text-lg ${i < level ? 'text-drumio-yellow' : 'text-muted-foreground'}`}>
        ★
      </span>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading practices...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Lesson not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground font-poppins">
          {data.lesson.title}
        </h1>
      </div>

      {/* Practice Sessions Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Practice Sessions</h2>
        
        <div className="space-y-4">
          {data.practices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No practice sessions available for this lesson.</p>
            </div>
          ) : (
            data.practices.map((practice) => (
              <Card key={practice.id} className="relative overflow-hidden border-none bg-card">
                <div 
                  className="relative h-48 bg-cover bg-center bg-no-repeat" 
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url(${data.lesson.background_image_url || '/lovable-uploads/ced3ac1d-0317-4c8a-9be2-23b8f68dac90.png'})`
                  }}
                >
                  <CardContent className="absolute inset-0 p-6 flex flex-col justify-between">
                    {/* Content */}
                    <div className="flex-1 flex flex-col justify-center">
                      <h3 className="text-2xl font-bold text-white mb-2 font-poppins">
                        {practice.title}
                      </h3>
                    </div>

                    {/* Bottom section with level and tags */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Level indicator */}
                        <div className="flex items-center gap-2 bg-black/40 rounded-lg px-3 py-2">
                          <div className="flex items-center">
                            {renderStars(getLevelStars(data.lesson.level))}
                          </div>
                          <span className="text-white text-sm font-medium capitalize">
                            {data.lesson.level}
                          </span>
                        </div>

                        {/* Tag - using practice type as tag */}
                        {practice.practice_type && (
                          <Badge 
                            variant="secondary" 
                            className="bg-black/40 text-white border-none hover:bg-black/50"
                          >
                            {practice.practice_type.title}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonPractices;