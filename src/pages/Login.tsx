import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Chrome, Facebook } from "lucide-react";
import DrumLogo from "@/components/DrumLogo";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signInWithProvider } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Error logging in",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        
        // Navigate to home page
        navigate("/");
      }
    } catch (error) {
      toast({
        title: "Error logging in",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await signInWithProvider(provider);
      
      if (error) {
        toast({
          title: "Error logging in",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error logging in",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col px-6 py-8 max-w-md mx-auto">
      {/* Logo */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="w-48 h-48 flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{backgroundImage: 'url(/lovable-uploads/510fe5e0-9da9-4a4f-b14b-1da58f985a07.png)'}}>
          <DrumLogo size="xl" showGlow={true} />
        </div>

        <h1 className="text-2xl font-bold text-drumio-yellow font-poppins">
          Drumio
        </h1>
      </div>

      {/* Welcome message */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 font-poppins leading-tight">
          Welcome to Drumio!
        </h2>
      </div>

      {/* Login form */}
      <form onSubmit={handleLogin} className="space-y-6">
        {/* Email field */}
        <div className="space-y-2">
          <label className="text-sm text-text-secondary font-poppins">
            Email address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email"
              className="w-full p-4 rounded-lg border-2 border-secondary bg-card text-white placeholder-text-tertiary font-poppins focus:border-drumio-purple focus:outline-none transition-colors"
              required
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <label className="text-sm text-text-secondary font-poppins">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full p-4 pr-12 rounded-lg border-2 border-secondary bg-card text-white placeholder-text-tertiary font-poppins focus:border-drumio-purple focus:outline-none transition-colors"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-foreground"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Forgot password */}
        <div className="text-right">
          <button
            type="button"
            className="text-drumio-purple hover:text-drumio-purple/80 text-sm font-poppins"
          >
            Forgot password?
          </button>
        </div>

        {/* Login button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-12 rounded-xl border-2 border-drumio-purple bg-gradient-to-r from-transparent via-white/10 to-transparent text-drumio-purple text-2xl font-semibold font-poppins hover:bg-white/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>

      {/* Social login */}
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-secondary"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-background px-4 text-text-secondary font-poppins">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg border-2 border-secondary hover:border-drumio-purple/50 transition-colors"
          >
            <Chrome className="w-5 h-5 text-white" />
            <span className="text-white font-poppins">Google</span>
          </button>
          <button 
            onClick={() => handleSocialLogin('facebook')}
            className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg border-2 border-secondary hover:border-drumio-purple/50 transition-colors"
          >
            <Facebook className="w-5 h-5 text-blue-500" />
            <span className="text-white font-poppins">Facebook</span>
          </button>
        </div>
      </div>

      {/* Sign up link */}
      <div className="mt-8 text-center">
        <p className="text-text-secondary font-poppins">
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-drumio-purple hover:text-drumio-purple/80 font-semibold"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}