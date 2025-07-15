import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DrumLogo from "@/components/DrumLogo";

type OnboardingStep = 1 | 2 | 3 | 4;

interface OnboardingData {
  experience: string;
  setup: string;
  goal: string;
  source: string;
}

const TOTAL_STEPS = 4;

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [data, setData] = useState<OnboardingData>({
    experience: "",
    setup: "",
    goal: "",
    source: "",
  });

  const goBack = () => {
    if (currentStep === 1) {
      navigate("/");
    } else {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep);
    }
  };

  const goNext = () => {
    if (currentStep === 4) {
      navigate("/login");
    } else {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep);
    }
  };

  const skip = () => {
    navigate("/login");
  };

  const selectOption = (field: keyof OnboardingData, value: string) => {
    const updatedData = { ...data, [field]: value };
    setData(updatedData);
    
    // Save to localStorage for use during signup
    localStorage.setItem('drumio-onboarding', JSON.stringify(updatedData));
    
    setTimeout(goNext, 300); // Small delay for visual feedback
  };

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-12">
        {/* Back button */}
        <button
          onClick={goBack}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <DrumLogo size="sm" />
          <h1 className="text-xl font-bold text-drumio-yellow font-poppins">
            Drumio
          </h1>
        </div>

        {/* Skip button */}
        <button
          onClick={skip}
          className="ml-auto text-text-secondary hover:text-foreground transition-colors font-poppins"
        >
          Skip
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-drumio-gradient transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Content based on current step */}
      <div className="flex-1 flex flex-col">
        {currentStep === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground font-poppins leading-tight">
                What's your drumming experience?
              </h2>
              <p className="text-text-secondary font-outfit">
                Help us customize your learning journey
              </p>
            </div>

            <div className="space-y-4">
              {[
                { id: "beginner", label: "Complete beginner", desc: "Never played drums before", icon: "/lovable-uploads/16ca57ab-639e-4c77-839e-781d337260b3.png" },
                { id: "some", label: "Some experience", desc: "Played a bit, know basics", icon: "/lovable-uploads/b1bd418f-dca1-4f04-8bf7-1a3370c6d3f5.png" },
                { id: "intermediate", label: "Intermediate", desc: "Can play songs, want to improve", icon: "/lovable-uploads/9acf55f7-fbae-4949-8c5c-c3f053472cf2.png" },
                { id: "advanced", label: "Advanced", desc: "Looking for challenges and refinement", icon: "/lovable-uploads/61464742-bea1-413b-ab0e-aed94d396d6c.png" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => selectOption("experience", option.id)}
                  className={`w-full p-4 rounded-xl text-left border-2 transition-all ${
                    data.experience === option.id
                      ? "border-drumio-purple bg-drumio-purple/10"
                      : "border-secondary hover:border-drumio-purple/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {option.icon && (
                      <img 
                        src={option.icon} 
                        alt="Drumsticks icon" 
                        className="w-9 h-9 object-contain" 
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-foreground font-poppins">
                        {option.label}
                      </div>
                      <div className="text-sm text-text-secondary font-outfit">
                        {option.desc}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground font-poppins leading-tight">
                What's your drum setup?
              </h2>
              <p className="text-text-secondary font-outfit">
                We'll tailor lessons to your equipment
              </p>
            </div>

            <div className="space-y-4">
              {[
                { id: "acoustic", label: "Acoustic drum kit", desc: "Full traditional drum set" },
                { id: "electronic", label: "Electronic drums", desc: "Digital/electric drum kit" },
                { id: "practice", label: "Practice pad", desc: "Drum pad or practice setup" },
                { id: "none", label: "No drums yet", desc: "Planning to get equipment" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => selectOption("setup", option.id)}
                  className={`w-full p-4 rounded-xl text-left border-2 transition-all ${
                    data.setup === option.id
                      ? "border-drumio-purple bg-drumio-purple/10"
                      : "border-secondary hover:border-drumio-purple/50"
                  }`}
                >
                  <div className="font-semibold text-foreground font-poppins">
                    {option.label}
                  </div>
                  <div className="text-sm text-text-secondary font-outfit">
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground font-poppins leading-tight">
                What's your main goal?
              </h2>
              <p className="text-text-secondary font-outfit">
                Let's focus on what matters most to you
              </p>
            </div>

            <div className="space-y-4">
              {[
                { id: "fun", label: "Play for fun", desc: "Casual playing and enjoyment" },
                { id: "band", label: "Join a band", desc: "Play with others and perform" },
                { id: "professional", label: "Professional skills", desc: "Career or serious development" },
                { id: "specific", label: "Learn specific songs", desc: "Master particular tracks" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => selectOption("goal", option.id)}
                  className={`w-full p-4 rounded-xl text-left border-2 transition-all ${
                    data.goal === option.id
                      ? "border-drumio-purple bg-drumio-purple/10"
                      : "border-secondary hover:border-drumio-purple/50"
                  }`}
                >
                  <div className="font-semibold text-foreground font-poppins">
                    {option.label}
                  </div>
                  <div className="text-sm text-text-secondary font-outfit">
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-foreground font-poppins leading-tight">
                How did you hear about us?
              </h2>
              <p className="text-text-secondary font-outfit">
                Help us understand how you found Drumio
              </p>
            </div>

            <div className="space-y-4">
              {[
                { id: "search", label: "Search engine", desc: "Google, Bing, etc." },
                { id: "social", label: "Social media", desc: "Instagram, TikTok, YouTube" },
                { id: "friend", label: "Friend or family", desc: "Someone recommended us" },
                { id: "ad", label: "Advertisement", desc: "Saw an ad somewhere" },
                { id: "other", label: "Other", desc: "Different source" },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => selectOption("source", option.id)}
                  className={`w-full p-4 rounded-xl text-left border-2 transition-all ${
                    data.source === option.id
                      ? "border-drumio-purple bg-drumio-purple/10"
                      : "border-secondary hover:border-drumio-purple/50"
                  }`}
                >
                  <div className="font-semibold text-foreground font-poppins">
                    {option.label}
                  </div>
                  <div className="text-sm text-text-secondary font-outfit">
                    {option.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}