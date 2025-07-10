import { ArrowLeft, Play, Pause } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const PracticeDetails = () => {
  const navigate = useNavigate();
  const { practiceId, lessonId } = useParams<{
    practiceId: string;
    lessonId: string;
  }>();

  const { data: practice, isLoading } = useQuery({
    queryKey: ["practice", practiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("practices")
        .select(`
          *,
          practice_type:practice_type(*)
        `)
        .eq("id", practiceId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: lesson } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading practice details...</p>
        </div>
      </div>
    );
  }

  if (!practice) {
    return (
      <div className="min-h-screen bg-background px-6 py-8">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Practice not found.</p>
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
          onClick={() => navigate(`/lesson/${lessonId}/practices`)}
          className="text-foreground hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground font-poppins">
          {practice.title}
        </h1>
      </div>

      {/* Practice Content */}
      <div className="space-y-6">
        {/* Main Practice Card */}
        <Card className="border-none bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {practice.title}
                </CardTitle>
                {practice.practice_type && (
                  <Badge variant="secondary" className="mt-2">
                    {practice.practice_type.title}
                  </Badge>
                )}
              </div>
              {lesson && (
                <div className="flex items-center gap-2 bg-black/10 rounded-full px-4 py-2">
                  <span className="text-yellow-400 text-sm">★</span>
                  <span className="text-foreground text-sm font-medium capitalize">
                    {lesson.level}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {practice.description && (
              <p className="text-muted-foreground mb-6">{practice.description}</p>
            )}

            {/* Audio Player Section */}
            {practice.sound_file_url && (
              <div className="bg-muted/50 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Practice Audio
                </h3>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon">
                    <Play className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div className="bg-primary rounded-full h-2 w-0"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">0:00 / 0:00</span>
                </div>
                <audio controls className="w-full mt-4" src={practice.sound_file_url}>
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {/* Chords Section */}
            {practice.chords_file_url && (
              <div className="bg-muted/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Practice Chords
                </h3>
                <Button variant="outline" asChild>
                  <a href={practice.chords_file_url} target="_blank" rel="noopener noreferrer">
                    Download Chords File
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Practice Actions */}
        <Card className="border-none bg-card">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Button className="flex-1">
                Start Practice
              </Button>
              <Button variant="outline" className="flex-1">
                Record Performance
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PracticeDetails;