import { useState, useEffect } from "react";
import IntroAnimation from "@/components/IntroAnimation";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setShowIntro(false);
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleIntroComplete = () => {
    setShowIntro(false);
    navigate("/auth");
  };

  if (showIntro) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return null;
};

export default Index;
