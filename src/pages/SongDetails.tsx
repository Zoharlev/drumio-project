import { ArrowLeft, Play } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSongPractices } from "@/hooks/useSongPractices";

const SongDetails = () => {
  const navigate = useNavigate();
  const { songId } = useParams<{ songId: string }>();
  const { data, isLoading } = useSongPractices(songId || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Song not found.</p>
        </div>
      </div>
    );
  }

  const handlePreview = () => {
    navigate(`/song/${songId}/practice`);
  };

  const handlePracticeClick = (practiceId: string) => {
    navigate(`/song/${songId}/practice/${practiceId}`);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat px-6 py-8"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.85)), url(${data.song.background_image_url || '/lovable-uploads/ced3ac1d-0317-4c8a-9be2-23b8f68dac90.png'})`
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/explore')} 
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-white font-poppins">
          {data.song.title}
        </h1>
      </div>

      {/* Preview Button */}
      <Button
        onClick={handlePreview}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-2xl text-lg mb-6"
      >
        Preview
      </Button>

      {/* Song Progress Bar */}
      <div className="mb-8">
        <Progress value={0} className="h-3 bg-muted/30" />
        <div className="flex justify-end mt-2">
          <span className="text-white text-sm font-medium">0 %</span>
        </div>
      </div>

      {/* Sessions Section */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-6 font-poppins">Sessions</h2>
        
        <div className="space-y-4">
          {data.practices.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No practice sessions available for this song.</p>
            </div>
          ) : (
            data.practices.map((practice) => (
              <Card 
                key={practice.id}
                className="bg-primary/90 hover:bg-primary border-none cursor-pointer transition-colors duration-200"
                onClick={() => handlePracticeClick(practice.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 font-poppins">
                        {practice.title}
                      </h3>
                      {practice.description && (
                        <p className="text-white/80 text-sm mb-4 line-clamp-2">
                          {practice.description}
                        </p>
                      )}
                      
                      {/* Practice Progress Bar */}
                      <Progress value={0} className="h-2 bg-white/20" />
                    </div>

                    {/* Play Button */}
                    <Button
                      size="icon"
                      className="bg-foreground hover:bg-foreground/90 text-background shrink-0 h-12 w-12 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePracticeClick(practice.id);
                      }}
                    >
                      <Play className="h-6 w-6" fill="currentColor" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SongDetails;
