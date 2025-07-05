import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-drumio-intro-bg flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
      {/* Logo and main content */}
      <div className="flex flex-col items-center gap-12 max-w-sm w-full relative z-10">
        {/* Logo with glowing effect */}
        <div className="flex flex-col items-center gap-4">
          <div 
            className="relative w-64 h-64 bg-cover bg-center bg-no-repeat rounded-full"
            style={{ backgroundImage: `url(/lovable-uploads/ced3ac1d-0317-4c8a-9be2-23b8f68dac90.png)` }}
          ></div>

          {/* Logo text */}
          <h1 className="text-5xl font-bold text-drumio-yellow font-poppins">
            Drumio
          </h1>
        </div>

        {/* Main heading */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white leading-tight font-poppins">
            Before we start, let's get to know you better!
          </h2>
        </div>

        {/* CTA Button */}
        <button
          onClick={() => navigate("/onboarding")}
          className="w-full py-4 px-12 rounded-xl border-2 border-drumio-purple bg-gradient-to-r from-transparent via-white/10 to-transparent text-drumio-purple text-2xl font-semibold font-poppins hover:bg-white/5 transition-all duration-200"
        >
          Let's go!
        </button>
      </div>

      {/* Decorative musical elements */}
      <div className="absolute top-[62%] right-8 transform rotate-8 opacity-80">
        <img 
          src="/lovable-uploads/4cf55a02-424e-4546-ba5d-1dc675dfe9d5.png" 
          alt="Musical note" 
          className="w-12 h-16 opacity-80"
        />
      </div>
      
      <div className="absolute top-[45%] left-8 transform -rotate-12 opacity-60">
        <img 
          src="/lovable-uploads/612e71c8-70fd-4a49-813e-0c89853f685b.png" 
          alt="Musical note" 
          className="w-8 h-12 opacity-60"
        />
      </div>
      
      <div className="absolute bottom-[20%] right-16 transform rotate-45 opacity-70">
        <img 
          src="/lovable-uploads/a4b900d1-3ed6-4288-8e65-aff93c1984a0.png" 
          alt="Musical symbol" 
          className="w-6 h-6 opacity-70"
        />
      </div>

      <div className="absolute top-[25%] left-[15%] transform rotate-12 opacity-75">
        <img 
          src="/lovable-uploads/2db9f6bc-65d3-4c42-9404-0ac30f33bf91.png" 
          alt="Drum with sticks" 
          className="w-16 h-12 opacity-75"
        />
      </div>
    </div>
  );
};

export default Index;
