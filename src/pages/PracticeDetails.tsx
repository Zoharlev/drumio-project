import { ArrowLeft, ArrowRight, Clock, Target } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
const PracticeDetails = () => {
  const navigate = useNavigate();
  const {
    practiceId,
    lessonId
  } = useParams<{
    practiceId: string;
    lessonId: string;
  }>();
  const {
    data: practice,
    isLoading
  } = useQuery({
    queryKey: ["practice", practiceId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("practices").select(`
          *,
          practice_type:practice_type(*)
        `).eq("id", practiceId).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  const {
    data: lesson
  } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle();
      if (error) throw error;
      return data;
    }
  });
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading practice details...</p>
        </div>
      </div>;
  }
  if (!practice) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Practice not found.</p>
        </div>
      </div>;
  }

  // Mock practice skills for demonstration
  const practiceSkills = ["Ghost Notes", "Accents", "Swells", "Level Matching"];
  return <div className="min-h-screen relative overflow-hidden" style={{
    background: `linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%), 
                     url(${lesson?.background_image_url || '/lovable-uploads/ced3ac1d-0317-4c8a-9be2-23b8f68dac90.png'})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  }}>
      {/* Header */}
      <div className="relative z-10 flex items-center p-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/lesson/${lessonId}/practices`)} className="text-white hover:bg-white/10 mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-6 pb-8">
        {/* Practice Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center border-4 border-white/20 shadow-2xl">
            <img src="/lovable-uploads/671d91a3-58e4-4109-be60-2975d8fa10f7.png" alt="Drum icon" className="w-14 h-14 object-contain" />
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 font-poppins">
            {practice.title}
          </h1>
          <p className="text-white/80 text-lg">
            {practice.practice_type?.title || "Practice"}
          </p>
          
          {/* Level and Tags */}
          <div className="flex items-center justify-center gap-3 mt-4">
            {lesson && <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 font-medium">
                ★ {lesson.level}
              </Badge>}
            <Badge variant="outline" className="border-white/30 text-white/80 bg-white/10">
              Tag name
            </Badge>
          </div>
        </div>

        {/* Start Practice Button */}
        <div className="mb-12">
          <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-4 text-lg rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-none" size="lg">
            Start Practice
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        {/* Practice Details */}
        <div className="space-y-6">
          {/* Main Description */}
          <div>
            
            <p className="text-white/70 text-base leading-relaxed">
              {practice.description || 'Simple 4/4 beat with ghost notes on the "e" and "a"'}
            </p>
          </div>

          {/* Tempo and Focus */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center">
                <Clock className="h-4 w-4 text-purple-300" />
              </div>
              <span className="text-white/80">Tempo: 75 - 95 bpm</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-pink-600/30 flex items-center justify-center">
                <Target className="h-4 w-4 text-pink-300" />
              </div>
              <span className="text-white/80">Focus: Light snare taps between backbeats</span>
            </div>
          </div>

          {/* Skills */}
          <div className="space-y-3">
            {practiceSkills.map((skill, index) => <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                  <span className="text-white text-xs">★</span>
                </div>
                <span className="text-white/80">{skill}</span>
              </div>)}
          </div>

          {/* Audio Section */}
          {practice.sound_file_url && <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Practice Audio
              </h3>
              <audio controls className="w-full" src={practice.sound_file_url}>
                Your browser does not support the audio element.
              </audio>
            </div>}

          {/* Chords Section */}
          {practice.chords_file_url && <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">
                Practice Charts
              </h3>
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <a href={practice.chords_file_url} target="_blank" rel="noopener noreferrer">
                  Download Charts
                </a>
              </Button>
            </div>}
        </div>
      </div>
    </div>;
};
export default PracticeDetails;