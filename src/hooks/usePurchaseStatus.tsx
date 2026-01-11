import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type PurchaseStatus = "active" | "canceled" | "payment_failed" | "pending" | null;

export const usePurchaseStatus = () => {
  const { user } = useAuth();
  const [hasCompliancePack, setHasCompliancePack] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>(null);
  const [loading, setLoading] = useState(true);

  const checkPurchaseStatus = useCallback(async () => {
    if (!user) {
      setHasCompliancePack(false);
      setPurchaseStatus(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-purchase");

      if (error) {
        console.error("Error checking purchase status:", error);
        setHasCompliancePack(false);
        setPurchaseStatus(null);
      } else {
        setHasCompliancePack(data?.hasCompliancePack || false);
        setPurchaseStatus(data?.status || null);
      }
    } catch (error) {
      console.error("Error checking purchase status:", error);
      setHasCompliancePack(false);
      setPurchaseStatus(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    checkPurchaseStatus();
  }, [checkPurchaseStatus]);

  const isPaymentFailed = purchaseStatus === "payment_failed";

  return { 
    hasCompliancePack, 
    purchaseStatus,
    isPaymentFailed,
    loading, 
    refresh: checkPurchaseStatus 
  };
};
