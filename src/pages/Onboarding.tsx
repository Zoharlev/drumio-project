import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DrumLogo from "@/components/DrumLogo";
import LanguageSelector from "@/components/LanguageSelector";

type OnboardingStep = 1 | 2 | 3 | 4;

interface OnboardingData {
  experience: string;
  setup: string;
  goal: string;
  source: string;
}

const TOTAL_STEPS = 4;

const step1Icons = [
  "/lovable-uploads/16ca57ab-639e-4c77-839e-781d337260b3.png",
  "/lovable-uploads/b1bd418f-dca1-4f04-8bf7-1a3370c6d3f5.png",
  "/lovable-uploads/9acf55f7-fbae-4949-8c5c-c3f053472cf2.png",
  "/lovable-uploads/61464742-bea1-413b-ab0e-aed94d396d6c.png",
];
const step2Icons = [
  "/lovable-uploads/da44e5a4-12a3-46d2-b4d9-5818c68062e5.png",
  "/lovable-uploads/afd53a4f-533b-4344-873d-e3dd42113d04.png",
  "/lovable-uploads/68f61ab6-2d54-4ab1-8750-68501d901ae9.png",
  "/lovable-uploads/019dc1ea-8c36-44a8-9089-10cafb8a1cee.png",
];
const step3Icons = [
  "/lovable-uploads/f3b9ec0d-331a-427b-a5e1-6936ebacc0d5.png",
  "/lovable-uploads/a5f56d46-e4d7-41ff-8e55-5002aad52e2c.png",
  "/lovable-uploads/a512b8e1-5320-4945-bcff-3a02a1c24254.png",
  "/lovable-uploads/e4d271d2-a8b5-491d-8964-85ad967d64a2.png",
];
const step4Icons = [
  "/lovable-uploads/665c8cf6-d820-411e-bcb7-38206dfacfa8.png",
  "/lovable-uploads/7a3b4ed3-273b-4011-bb8c-37d204192c18.png",
  "/lovable-uploads/63796174-1c95-4d3e-a110-e71c341f5086.png",
  undefined,
  undefined,
];

const translations = {
  en: {
    skip: "Skip",
    step1: {
      title: "What's your drumming experience?",
      subtitle: "Help us customize your learning journey",
      options: [
        { id: "beginner", label: "Complete beginner", desc: "Never played drums before" },
        { id: "some", label: "Some experience", desc: "Played a bit, know basics" },
        { id: "intermediate", label: "Intermediate", desc: "Can play songs, want to improve" },
        { id: "advanced", label: "Advanced", desc: "Looking for challenges and refinement" },
      ],
    },
    step2: {
      title: "What's your drum setup?",
      subtitle: "We'll tailor lessons to your equipment",
      options: [
        { id: "acoustic", label: "Acoustic drum kit", desc: "Full traditional drum set" },
        { id: "electronic", label: "Electronic drums", desc: "Digital/electric drum kit" },
        { id: "practice", label: "Practice pad", desc: "Drum pad or practice setup" },
        { id: "none", label: "No drums yet", desc: "Planning to get equipment" },
      ],
    },
    step3: {
      title: "What's your main goal?",
      subtitle: "Let's focus on what matters most to you",
      options: [
        { id: "fun", label: "Play for fun", desc: "Casual playing and enjoyment" },
        { id: "band", label: "Join a band", desc: "Play with others and perform" },
        { id: "professional", label: "Professional skills", desc: "Career or serious development" },
        { id: "specific", label: "Learn specific songs", desc: "Master particular tracks" },
      ],
    },
    step4: {
      title: "How did you hear about us?",
      subtitle: "Help us understand how you found Drumio",
      options: [
        { id: "search", label: "Search engine", desc: "Google, Bing, etc." },
        { id: "social", label: "Social media", desc: "Instagram, TikTok, YouTube" },
        { id: "friend", label: "Friend or family", desc: "Someone recommended us" },
        { id: "ad", label: "Advertisement", desc: "Saw an ad somewhere" },
        { id: "other", label: "Other", desc: "Different source" },
      ],
    },
  },
  he: {
    skip: "דלג",
    step1: {
      title: "מה הניסיון שלך בתיפוף?",
      subtitle: "נתאים את מסלול הלמידה בשבילך",
      options: [
        { id: "beginner", label: "מתחיל לגמרי", desc: "אף פעם לא ניגנתי על תופים" },
        { id: "some", label: "קצת ניסיון", desc: "ניגנתי קצת, מכיר את הבסיס" },
        { id: "intermediate", label: "בינוני", desc: "יודע לנגן שירים, רוצה להשתפר" },
        { id: "advanced", label: "מתקדם", desc: "מחפש אתגרים ושיפור" },
      ],
    },
    step2: {
      title: "מה הסטאפ שלך?",
      subtitle: "נתאים את השיעורים לציוד שלך",
      options: [
        { id: "acoustic", label: "מערכת תופים אקוסטית", desc: "סט תופים מסורתי מלא" },
        { id: "electronic", label: "תופים אלקטרוניים", desc: "מערכת תופים דיגיטלית" },
        { id: "practice", label: "פד אימון", desc: "פד תופים או סטאפ אימון" },
        { id: "none", label: "אין לי עדיין תופים", desc: "מתכנן להשיג ציוד" },
      ],
    },
    step3: {
      title: "מה המטרה העיקרית שלך?",
      subtitle: "בואו נתמקד במה שחשוב לך",
      options: [
        { id: "fun", label: "לנגן בשביל הכיף", desc: "נגינה קז׳ואלית והנאה" },
        { id: "band", label: "להצטרף להרכב", desc: "לנגן עם אחרים ולהופיע" },
        { id: "professional", label: "מיומנויות מקצועיות", desc: "קריירה או התפתחות רצינית" },
        { id: "specific", label: "ללמוד שירים ספציפיים", desc: "לשלוט בשירים מסוימים" },
      ],
    },
    step4: {
      title: "איך שמעת עלינו?",
      subtitle: "עזרו לנו להבין איך מצאתם את דרומיו",
      options: [
        { id: "search", label: "מנוע חיפוש", desc: "גוגל, בינג וכו׳" },
        { id: "social", label: "רשתות חברתיות", desc: "אינסטגרם, טיקטוק, יוטיוב" },
        { id: "friend", label: "חבר או משפחה", desc: "מישהו המליץ לנו" },
        { id: "ad", label: "פרסומת", desc: "ראיתי פרסומת איפשהו" },
        { id: "other", label: "אחר", desc: "מקור אחר" },
      ],
    },
  },
};

type LangKey = keyof typeof translations;

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);
  const [lang, setLang] = useState<LangKey>(() => {
    const stored = localStorage.getItem("drumio-language") || "en";
    return stored in translations ? (stored as LangKey) : "en";
  });
  const [data, setData] = useState<OnboardingData>({
    experience: "",
    setup: "",
    goal: "",
    source: "",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const current = localStorage.getItem("drumio-language") || "en";
      const key = current in translations ? (current as LangKey) : "en";
      setLang((prev) => (prev !== key ? key : prev));
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const t = translations[lang];
  const isRtl = lang === "he";

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
    localStorage.setItem('drumio-onboarding', JSON.stringify(updatedData));
    setTimeout(goNext, 300);
  };

  const progressPercentage = (currentStep / TOTAL_STEPS) * 100;

  const stepConfigs: { key: keyof typeof t; field: keyof OnboardingData; icons: (string | undefined)[] }[] = [
    { key: "step1", field: "experience", icons: step1Icons },
    { key: "step2", field: "setup", icons: step2Icons },
    { key: "step3", field: "goal", icons: step3Icons },
    { key: "step4", field: "source", icons: step4Icons },
  ];

  const activeConfig = stepConfigs[currentStep - 1];
  const stepT = t[activeConfig.key] as { title: string; subtitle: string; options: { id: string; label: string; desc: string }[] };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8 max-w-md mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-12">
        <button
          onClick={goBack}
          className="p-2 rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className={`w-6 h-6 text-foreground ${isRtl ? "rotate-180" : ""}`} />
        </button>

        <div className="flex items-center gap-2">
          <DrumLogo size="sm" />
          <h1 className="text-xl font-bold text-drumio-yellow font-poppins">
            Drumio
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSelector />
          <button
            onClick={skip}
            className="text-text-secondary hover:text-foreground transition-colors font-poppins"
          >
            {t.skip}
          </button>
        </div>
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

      {/* Content */}
      <div className="flex-1 flex flex-col">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground font-poppins leading-tight">
              {stepT.title}
            </h2>
            <p className="text-text-secondary font-outfit">
              {stepT.subtitle}
            </p>
          </div>

          <div className="space-y-4">
            {stepT.options.map((option, idx) => {
              const icon = activeConfig.icons[idx];
              return (
                <button
                  key={option.id}
                  onClick={() => selectOption(activeConfig.field, option.id)}
                  className={`w-full p-4 rounded-xl text-start border-2 transition-all ${
                    data[activeConfig.field] === option.id
                      ? "border-drumio-purple bg-drumio-purple/10"
                      : "border-secondary hover:border-drumio-purple/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {icon && (
                      <img
                        src={icon}
                        alt=""
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
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
