import { useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Get onboarding data from localStorage
      const onboardingData = localStorage.getItem('drumio-onboarding');
      const parsedOnboardingData = onboardingData ? JSON.parse(onboardingData) : {};
      
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            user_experience: parsedOnboardingData.experience || null,
            user_drum_setup: parsedOnboardingData.setup || null,
            user_goal: parsedOnboardingData.goal || null,
            user_how_diduhear: parsedOnboardingData.source || null,
          }
        }
      });

      if (data.user && !error) {
        // Clear onboarding data after successful signup
        localStorage.removeItem('drumio-onboarding');
      }

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signInWithProvider = async (provider: 'google' | 'facebook') => {
    try {
      // For social login, we'll store onboarding data in localStorage
      // and retrieve it after successful authentication
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithProvider,
    signOut,
  };
};