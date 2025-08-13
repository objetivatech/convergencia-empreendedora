import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useReferralTracking = () => {
  useEffect(() => {
    // Track referral clicks when page loads
    const trackReferralClick = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');
      
      if (referralCode) {
        try {
          // Store referral code in sessionStorage for the user session
          sessionStorage.setItem('referralCode', referralCode);
          
          // Track the click
          const { error } = await supabase.rpc('track_referral_click', {
            referral_code: referralCode
          });
          
          if (error) {
            console.error('Error tracking referral click:', error);
          }
        } catch (error) {
          console.error('Error in referral tracking:', error);
        }
      }
    };

    trackReferralClick();
  }, []);

  const getReferralCode = (): string | null => {
    return sessionStorage.getItem('referralCode');
  };

  const clearReferralCode = () => {
    sessionStorage.removeItem('referralCode');
  };

  return {
    getReferralCode,
    clearReferralCode
  };
};