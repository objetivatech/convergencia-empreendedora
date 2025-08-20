import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  roles: Database["public"]["Enums"]["user_role"][] | null;
  subscription_types: Database["public"]["Enums"]["subscription_type"][] | null;
  is_admin: boolean;
  can_edit_blog: boolean;
  onboarding_completed: boolean;
}

export const useUserRoles = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('👤 useUserRoles effect triggered:', { user: user?.email, hasUser: !!user });
    if (user) {
      loadUserProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) {
      console.log('🚫 loadUserProfile: No user found');
      return;
    }

    console.log('🔍 loadUserProfile: Starting for user:', user.email);
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      console.log('📊 Profile query result:', { data, error, userId: user.id });

      if (error) {
        console.error('❌ Error loading user profile:', error);
        // Try without .single() in case of data issues
        const { data: dataArray, error: errorArray } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id);
        
        console.log('🔄 Fallback query result:', { dataArray, errorArray });
        
        if (dataArray && dataArray.length > 0) {
          setProfile(dataArray[0]);
          console.log('✅ Profile loaded via fallback:', dataArray[0]);
        }
        return;
      }

      if (data) {
        setProfile(data);
        console.log('✅ Profile loaded successfully:', { email: data.email, isAdmin: data.is_admin });
      } else {
        console.log('⚠️ No profile data returned');
      }
    } catch (error) {
      console.error('💥 Exception in loadUserProfile:', error);
    } finally {
      setLoading(false);
      console.log('🏁 loadUserProfile completed');
    }
  };

  const hasRole = (role: Database["public"]["Enums"]["user_role"]): boolean => {
    return profile?.roles?.includes(role) ?? false;
  };

  const hasSubscription = (subscription: Database["public"]["Enums"]["subscription_type"]): boolean => {
    return profile?.subscription_types?.includes(subscription) ?? false;
  };

  const isAdmin = (): boolean => {
    return profile?.is_admin ?? false;
  };

  const canEditBlog = (): boolean => {
    return profile?.can_edit_blog || isAdmin();
  };

  const addRole = async (role: Database["public"]["Enums"]["user_role"]) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase.rpc('add_user_role', {
        user_uuid: user.id,
        new_role: role
      });

      if (error) {
        console.error('Error adding role:', error);
        return;
      }

      await loadUserProfile();
    } catch (error) {
      console.error('Error in addRole:', error);
    }
  };

  const removeRole = async (role: Database["public"]["Enums"]["user_role"]) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase.rpc('remove_user_role', {
        user_uuid: user.id,
        old_role: role
      });

      if (error) {
        console.error('Error removing role:', error);
        return;
      }

      await loadUserProfile();
    } catch (error) {
      console.error('Error in removeRole:', error);
    }
  };

  const addSubscription = async (subscription: Database["public"]["Enums"]["subscription_type"]) => {
    if (!user || !profile) return;

    try {
      const newSubscriptions = [...(profile.subscription_types || []), subscription];
      
      const { error } = await supabase
        .from('profiles')
        .update({ subscription_types: newSubscriptions })
        .eq('id', user.id);

      if (error) {
        console.error('Error adding subscription:', error);
        return;
      }

      await loadUserProfile();
    } catch (error) {
      console.error('Error in addSubscription:', error);
    }
  };

  return {
    profile,
    loading,
    hasRole,
    hasSubscription,
    isAdmin,
    canEditBlog,
    addRole,
    removeRole,
    addSubscription,
    refreshProfile: loadUserProfile
  };
};