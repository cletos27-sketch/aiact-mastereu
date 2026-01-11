import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// Status values: "paid" = successful payment, "active" = legacy/subscription, "canceled", "payment_failed", "pending"
export type PurchaseStatus = "paid" | "active" | "canceled" | "payment_failed" | "pending" | null;

// Product ID for Compliance Pack (TEST MODE)
const VALID_PRODUCT_ID = "prod_TlNdrEbFfZcfIg";

// Polling interval in milliseconds (5 seconds)
const POLLING_INTERVAL = 5000;

export const usePurchaseStatus = () => {
  const { user, loading: authLoading } = useAuth();
  const [hasCompliancePack, setHasCompliancePack] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkPurchaseStatus = useCallback(async (showToast = false) => {
    if (!user) {
      setHasCompliancePack(false);
      setPurchaseStatus(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setError(null);
      
      // Query directly from user_purchases table for faster response
      const { data, error: queryError } = await supabase
        .from("user_purchases")
        .select("status, product_id")
        .eq("user_id", user.id)
        .eq("product_id", VALID_PRODUCT_ID)
        .maybeSingle();

      if (queryError) {
        console.error("Error checking purchase status:", queryError);
        setHasCompliancePack(false);
        setPurchaseStatus(null);
        
        // Provide detailed error feedback
        if (queryError.code === "42501") {
          setError("Erro de permissão ao verificar compra. Tente fazer logout e login novamente.");
          if (showToast) toast.error("Erro de permissão ao verificar compra.");
        } else if (queryError.code === "PGRST301") {
          setError("Erro de conexão com o banco de dados.");
          if (showToast) toast.error("Erro de conexão. Verifique sua internet.");
        } else {
          setError(`Erro: ${queryError.message}`);
          if (showToast) toast.error(`Erro ao verificar status: ${queryError.message}`);
        }
      } else if (data) {
        // Accept both "paid" and "active" as valid purchase statuses
        const isActive = data.status === "paid" || data.status === "active";
        const wasInactive = !hasCompliancePack;
        
        setHasCompliancePack(isActive);
        setPurchaseStatus(data.status as PurchaseStatus);
        
        // Notify user when status changes to active
        if (isActive && wasInactive && showToast) {
          toast.success("🎉 Dossiê de Conformidade desbloqueado!");
        }
      } else {
        setHasCompliancePack(false);
        setPurchaseStatus(null);
      }
    } catch (err) {
      console.error("Error checking purchase status:", err);
      setHasCompliancePack(false);
      setPurchaseStatus(null);
      const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      if (showToast) toast.error(`Erro de conexão: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [user, hasCompliancePack]);

  // Initial fetch
  useEffect(() => {
    checkPurchaseStatus();
  }, [checkPurchaseStatus]);

  // Start polling when realtime is not connected
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return; // Already polling
    
    console.log("Starting polling fallback for purchase status");
    pollingIntervalRef.current = setInterval(() => {
      checkPurchaseStatus(false);
    }, POLLING_INTERVAL);
  }, [checkPurchaseStatus]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log("Stopping polling fallback");
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Real-time subscription to user_purchases changes
  // Only subscribe AFTER auth is complete and user exists
  useEffect(() => {
    // Don't try to connect if auth is still loading or no user
    if (authLoading || !user) {
      setIsRealtimeConnected(false);
      stopPolling();
      return;
    }

    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase
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
            // Re-fetch the status when changes are detected with toast notification
            checkPurchaseStatus(true);
          }
        )
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log("Realtime connected for user_purchases");
            setIsRealtimeConnected(true);
            stopPolling(); // Stop polling since realtime is working
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("Realtime channel error for user_purchases:", err);
            setIsRealtimeConnected(false);
            startPolling(); // Fallback to polling
          } else if (status === "CLOSED") {
            console.log("Realtime channel closed for user_purchases");
            setIsRealtimeConnected(false);
          }
        });
    } catch (err) {
      console.error("Error setting up realtime subscription:", err);
      setIsRealtimeConnected(false);
      startPolling(); // Fallback to polling on error
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
      stopPolling();
    };
  }, [user, authLoading, checkPurchaseStatus, startPolling, stopPolling]);

  // Also check profiles.is_paid as backup
  useEffect(() => {
    if (!user) return;

    const checkProfileIsPaid = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_paid")
        .eq("user_id", user.id)
        .maybeSingle();
      
      // If profiles.is_paid is true but no purchase record found, still unlock
      if (data?.is_paid && !hasCompliancePack && purchaseStatus === null) {
        setHasCompliancePack(true);
        setPurchaseStatus("active");
      }
    };

    checkProfileIsPaid();
  }, [user, hasCompliancePack, purchaseStatus]);

  const isPaymentFailed = purchaseStatus === "payment_failed";

  return { 
    hasCompliancePack, 
    purchaseStatus,
    isPaymentFailed,
    isRealtimeConnected,
    loading,
    error,
    refresh: () => checkPurchaseStatus(true)
  };
};
