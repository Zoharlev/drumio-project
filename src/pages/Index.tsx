import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-6xl font-bold mb-4">DrumIO</h1>
            <p className="text-xl text-muted-foreground mb-8">Master the rhythm, one beat at a time</p>
          </div>
          <Button onClick={() => navigate("/auth")} size="lg">
            Get Started
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">DrumIO</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">Welcome, {user.email}</span>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center space-y-6">
          <h2 className="text-4xl font-bold mb-4">Welcome to DrumIO</h2>
          <p className="text-xl text-muted-foreground">Your personalized drum learning experience starts here!</p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Practice Lessons</h3>
              <p className="text-muted-foreground">Access your personalized drum lessons and track your progress</p>
            </div>
            
            <div className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Record & Analyze</h3>
              <p className="text-muted-foreground">Record your practice sessions and get AI-powered feedback</p>
            </div>
            
            <div className="p-6 border border-border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Track Achievements</h3>
              <p className="text-muted-foreground">Unlock achievements and celebrate your drumming milestones</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
