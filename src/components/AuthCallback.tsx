import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const AuthCallback = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data.session?.user && !error) {
        // Check if this is a new user from social login
        const onboardingData = localStorage.getItem('drumio-onboarding');
        
        if (onboardingData) {
          try {
            const parsedData = JSON.parse(onboardingData);
            
            // Update user profile with onboarding data
            const { error: updateError } = await supabase
              .from('users')
              .update({
                user_experience: parsedData.experience || null,
                user_drum_setup: parsedData.setup || null,
                user_goal: parsedData.goal || null,
                user_how_diduhear: parsedData.source || null,
              })
              .eq('id', data.session.user.id);
            
            if (!updateError) {
              // Clear onboarding data after successful update
              localStorage.removeItem('drumio-onboarding');
            }
          } catch (error) {
            console.error('Error processing onboarding data:', error);
          }
        }
      }
    };

    handleAuthCallback();
  }, []);

  return null;
};