import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserSubscription {
  id: string;
  plan_id: string;
  status: string;
  billing_cycle: string;
  starts_at: string;
  expires_at: string | null;
  auto_renew: boolean;
  subscription_plans: {
    name: string;
    display_name: string;
    features: any;
  };
}

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [pendingSubscription, setPendingSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setSubscription(null);
      setPendingSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const checkSubscription = async () => {
    if (!user) return;

    try {
      // Check for active subscription
      const { data: activeData, error: activeError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            display_name,
            features
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Check for pending subscription
      const { data: pendingData, error: pendingError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (
            name,
            display_name,
            features
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeError) {
        console.error('Error checking active subscription:', activeError);
        setSubscription(null);
      } else {
        setSubscription(activeData);
      }

      if (pendingError) {
        console.error('Error checking pending subscription:', pendingError);
        setPendingSubscription(null);
      } else {
        setPendingSubscription(pendingData);
      }
    } catch (error) {
      console.error('Error in checkSubscription:', error);
      setSubscription(null);
      setPendingSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSubscription = () => {
    if (!subscription) return false;
    
    // Check if subscription is active and not expired
    if (subscription.status !== 'active') return false;
    
    if (subscription.expires_at) {
      const expirationDate = new Date(subscription.expires_at);
      const now = new Date();
      return expirationDate > now;
    }
    
    return true;
  };

  const hasPendingSubscription = () => {
    return !!pendingSubscription;
  };

  const refreshSubscription = () => {
    if (user) {
      checkSubscription();
    }
  };

  return {
    subscription,
    pendingSubscription,
    loading,
    hasActiveSubscription: hasActiveSubscription(),
    hasPendingSubscription: hasPendingSubscription(),
    refreshSubscription,
  };
};