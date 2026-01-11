import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type PurchaseStatus = "active" | "canceled" | "payment_failed" | "pending" | null;

// Product ID for Compliance Pack
const VALID_PRODUCT_ID = "prod_TlNdrEbFfZcfIg";

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
      // Query directly from user_purchases table for faster response
      const { data, error } = await supabase
        .from("user_purchases")
        .select("status, product_id")
        .eq("user_id", user.id)
        .eq("product_id", VALID_PRODUCT_ID)
        .maybeSingle();

      if (error) {
        console.error("Error checking purchase status:", error);
        setHasCompliancePack(false);
        setPurchaseStatus(null);
      } else if (data) {
        const isActive = data.status === "active";
        setHasCompliancePack(isActive);
        setPurchaseStatus(data.status as PurchaseStatus);
      } else {
        setHasCompliancePack(false);
        setPurchaseStatus(null);
      }
    } catch (error) {
      console.error("Error checking purchase status:", error);
      setHasCompliancePack(false);
      setPurchaseStatus(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    checkPurchaseStatus();
  }, [checkPurchaseStatus]);

  // Real-time subscription to user_purchases changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`user_purchases_${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_purchases",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Purchase status changed via realtime:", payload);
          // Re-fetch the status when changes are detected
          checkPurchaseStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, checkPurchaseStatus]);

  const isPaymentFailed = purchaseStatus === "payment_failed";

  return { 
    hasCompliancePack, 
    purchaseStatus,
    isPaymentFailed,
    loading, 
    refresh: checkPurchaseStatus 
  };
};
