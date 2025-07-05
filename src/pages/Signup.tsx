import { useNavigate } from "react-router-dom";
import DrumLogo from "@/components/DrumLogo";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-8">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <DrumLogo size="lg" />
          <h1 className="text-2xl font-bold text-drumio-yellow font-poppins">
            Drumio
          </h1>
        </div>

        {/* Placeholder content */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white font-poppins">
            Sign Up
          </h2>
          <p className="text-text-secondary font-outfit">
            Sign up functionality coming soon! This is a placeholder page.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="w-full py-4 px-6 rounded-xl bg-drumio-gradient text-white text-lg font-semibold font-poppins hover:opacity-90 transition-opacity"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}