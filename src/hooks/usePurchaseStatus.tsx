import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const usePurchaseStatus = () => {
  const { user } = useAuth();
  const [hasCompliancePack, setHasCompliancePack] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkPurchaseStatus = useCallback(async () => {
    if (!user) {
      setHasCompliancePack(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-purchase");

      if (error) {
        console.error("Error checking purchase status:", error);
        setHasCompliancePack(false);
      } else {
        setHasCompliancePack(data?.hasCompliancePack || false);
      }
    } catch (error) {
      console.error("Error checking purchase status:", error);
      setHasCompliancePack(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkPurchaseStatus();
  }, [checkPurchaseStatus]);

  return { hasCompliancePack, loading, refresh: checkPurchaseStatus };
};
