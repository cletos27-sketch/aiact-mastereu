import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// Status values: "paid" = successful payment, "active" = legacy/subscription, "canceled", "payment_failed", "pending"
export type PurchaseStatus = "paid" | "active" | "canceled" | "payment_failed" | "pending" | null;

// Product ID for Compliance Pack (TEST MODE)
const VALID_PRODUCT_ID = "prod_TlNdrEbFfZcfIg";

// Polling interval in milliseconds (3 seconds for faster sync)
const POLLING_INTERVAL = 3000;

export const usePurchaseStatus = () => {
  const { user, loading: authLoading } = useAuth();
  const [hasCompliancePack, setHasCompliancePack] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>(null);
  const [isSubscriptionEnded, setIsSubscriptionEnded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousStatusRef = useRef<PurchaseStatus>(null);

  // IMPLACABLE CHECK: Verifies both user_purchases AND profiles.is_paid
  const checkPurchaseStatus = useCallback(async (showToast = false) => {
    if (!user) {
      setHasCompliancePack(false);
      setPurchaseStatus(null);
      setIsSubscriptionEnded(false);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setError(null);
      
      // Query BOTH tables in parallel for absolute certainty
      const [purchaseResult, profileResult] = await Promise.all([
        supabase
          .from("user_purchases")
          .select("status, product_id")
          .eq("user_id", user.id)
          .eq("product_id", VALID_PRODUCT_ID)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("is_paid")
          .eq("user_id", user.id)
          .maybeSingle()
      ]);

      const purchaseData = purchaseResult.data;
      const purchaseError = purchaseResult.error;
      const profileData = profileResult.data;
      const profileError = profileResult.error;

      if (purchaseError) {
        console.error("Error checking purchase status:", purchaseError);
        setError(`Erro: ${purchaseError.message}`);
        if (showToast) toast.error(`Erro ao verificar status: ${purchaseError.message}`);
      }

      if (profileError) {
        console.error("Error checking profile is_paid:", profileError);
      }

      // IMPLACABLE LOGIC: Only 'paid' or 'active' status AND is_paid=true grants access
      const validPurchaseStatus = purchaseData?.status === "paid" || purchaseData?.status === "active";
      const profileIsPaid = profileData?.is_paid === true;
      
      // Access is granted ONLY if BOTH conditions are true
      const hasAccess = validPurchaseStatus && profileIsPaid;
      
      // Detect subscription ended state
      const subscriptionEnded = 
        (purchaseData && !validPurchaseStatus) || // Has purchase record but invalid status
        (profileData && !profileIsPaid) || // Profile explicitly marked as not paid
        (purchaseData?.status === "canceled") ||
        (purchaseData?.status === "payment_failed");

      const previousStatus = previousStatusRef.current;
      const currentStatus = purchaseData?.status as PurchaseStatus || null;
      
      // Update state
      setHasCompliancePack(hasAccess);
      setPurchaseStatus(currentStatus);
      setIsSubscriptionEnded(subscriptionEnded);
      previousStatusRef.current = currentStatus;

      // Show notifications for status changes
      if (showToast) {
        if (hasAccess && !previousStatus) {
          toast.success("🎉 Dossiê de Conformidade desbloqueado!");
        } else if (subscriptionEnded && previousStatus && (previousStatus === "paid" || previousStatus === "active")) {
          toast.error("⚠️ Assinatura Encerrada - Acesso aos documentos bloqueado.");
        }
      }

      // Log for debugging
      console.log("[usePurchaseStatus] Check complete:", {
        userId: user.id,
        purchaseStatus: currentStatus,
        profileIsPaid,
        hasAccess,
        subscriptionEnded
      });

    } catch (err) {
      console.error("Error checking purchase status:", err);
      setHasCompliancePack(false);
      setPurchaseStatus(null);
      setIsSubscriptionEnded(false);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      if (showToast) toast.error(`Erro de conexão: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    checkPurchaseStatus();
  }, [checkPurchaseStatus]);

  // Start polling when realtime is not connected
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    
    console.log("[usePurchaseStatus] Starting polling fallback");
    pollingIntervalRef.current = setInterval(() => {
      checkPurchaseStatus(false);
    }, POLLING_INTERVAL);
  }, [checkPurchaseStatus]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log("[usePurchaseStatus] Stopping polling fallback");
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Simplified real-time subscription with error handling
  useEffect(() => {
    if (authLoading || !user) {
      setIsRealtimeConnected(false);
      stopPolling();
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let connectionAttempted = false;

    const setupRealtime = () => {
      try {
        channel = supabase
          .channel(`purchase_status_${user.id}_${Date.now()}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "user_purchases",
            },
            (payload) => {
              // Filter manually to avoid binding issues
              if (payload.new && (payload.new as { user_id?: string }).user_id === user.id) {
                console.log("[usePurchaseStatus] user_purchases changed:", payload);
                checkPurchaseStatus(true);
              }
            }
          )
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "profiles",
            },
            (payload) => {
              // Filter manually to avoid binding issues
              if (payload.new && (payload.new as { user_id?: string }).user_id === user.id) {
                console.log("[usePurchaseStatus] profiles changed:", payload);
                checkPurchaseStatus(true);
              }
            }
          )
          .subscribe((status, err) => {
            connectionAttempted = true;
            if (status === "SUBSCRIBED") {
              console.log("[usePurchaseStatus] Realtime connected");
              setIsRealtimeConnected(true);
              stopPolling();
            } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              console.warn("[usePurchaseStatus] Realtime failed, using polling:", err);
              setIsRealtimeConnected(false);
              startPolling();
            }
          });
      } catch (err) {
        console.warn("[usePurchaseStatus] Error setting up realtime:", err);
        setIsRealtimeConnected(false);
        startPolling();
      }
    };

    setupRealtime();

    // Fallback: start polling if realtime doesn't connect in 5 seconds
    const timeout = setTimeout(() => {
      if (!connectionAttempted) {
        console.warn("[usePurchaseStatus] Realtime timeout, falling back to polling");
        startPolling();
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      if (channel) supabase.removeChannel(channel);
      stopPolling();
    };
  }, [user, authLoading, checkPurchaseStatus, startPolling, stopPolling]);

  const isPaymentFailed = purchaseStatus === "payment_failed";
  const isCanceled = purchaseStatus === "canceled";

  return { 
    hasCompliancePack, 
    purchaseStatus,
    isPaymentFailed,
    isCanceled,
    isSubscriptionEnded,
    isRealtimeConnected,
    loading,
    error,
    refresh: () => checkPurchaseStatus(true)
  };
};
