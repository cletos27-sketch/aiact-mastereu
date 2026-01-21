import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

// Status values: "paid" = successful payment, "active" = legacy/subscription, "canceled", "payment_failed", "pending"
export type PurchaseStatus = "paid" | "active" | "canceled" | "payment_failed" | "pending" | null;

// Access levels based on price_id
export type AccessLevel = "premium" | "basic" | null;

// Price IDs for different plans
const PRICE_IDS = {
  PREMIUM: "price_1Snqs8IV86RXPoUIDO9x8pWp", // 499€ one-time - full access
  BASIC: "price_1Snqs8IV86RXPoUIUHrXN5fI",   // 99€/month - basic access
};

// Product ID for Compliance Pack
const VALID_PRODUCT_ID = "prod_TlNdrEbFfZcfIg";

// Polling interval in milliseconds (3 seconds for faster sync)
const POLLING_INTERVAL = 3000;

export const usePurchaseStatus = () => {
  const { user, loading: authLoading } = useAuth();
  const [hasCompliancePack, setHasCompliancePack] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<PurchaseStatus>(null);
  const [accessLevel, setAccessLevel] = useState<AccessLevel>(null);
  const [isSubscriptionEnded, setIsSubscriptionEnded] = useState(false);
  const [hasAnyPurchaseRecord, setHasAnyPurchaseRecord] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previousStatusRef = useRef<PurchaseStatus>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null); // Ref to hold the channel instance

  // Determine access level based on price_id
  const getAccessLevel = (priceId: string | null): AccessLevel => {
    if (!priceId) return null;
    if (priceId === PRICE_IDS.PREMIUM) return "premium";
    if (priceId === PRICE_IDS.BASIC) return "basic";
    // Default to basic for unknown prices
    return "basic";
  };

  // IMPLACABLE CHECK: Verifies both user_purchases AND profiles.is_paid
  const checkPurchaseStatus = useCallback(async (showToast = false) => {
    if (!user) {
      setHasCompliancePack(false);
      setPurchaseStatus(null);
      setAccessLevel(null);
      setIsSubscriptionEnded(false);
      setHasAnyPurchaseRecord(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setError(null);
      
      // Query BOTH tables in parallel for absolute certainty
      const [purchaseResult, profileResult, allPurchasesResult] = await Promise.all([
        supabase
          .from("user_purchases")
          .select("status, product_id, price_id")
          .eq("user_id", user.id)
          .eq("product_id", VALID_PRODUCT_ID)
          .order("created_at", { ascending: false }) // Get the latest purchase
          .limit(1)
          .maybeSingle(), // Use maybeSingle to get null if no record
        supabase
          .from("profiles")
          .select("is_paid")
          .eq("user_id", user.id)
          .maybeSingle(),
        // Check if user has ANY purchase record at all
        supabase
          .from("user_purchases")
          .select("id")
          .eq("user_id", user.id)
          .limit(1)
      ]);

      const purchaseData = purchaseResult.data;
      const purchaseError = purchaseResult.error;
      const profileData = profileResult.data;
      const profileError = profileResult.error;
      const allPurchases = allPurchasesResult.data;

      if (purchaseError) {
        console.error("Error checking purchase status:", purchaseError);
        setError(`Erro: ${purchaseError.message}`);
        if (showToast) toast.error(`Erro ao verificar status: ${purchaseError.message}`);
      }

      if (profileError) {
        console.error("Error checking profile is_paid:", profileError);
      }

      // Track if user has any purchase record
      const hasPurchaseRecord = allPurchases && allPurchases.length > 0;
      setHasAnyPurchaseRecord(hasPurchaseRecord);

      // NEW LOGIC: Access is strictly based on profiles.is_paid
      const profileIsPaid = profileData?.is_paid === true;
      const currentPurchaseStatus = purchaseData?.status as PurchaseStatus || null; // Keep detailed status from user_purchases

      const hasAccess = profileIsPaid; // This is the core change

      // Determine access level based on price_id, but only if hasAccess is true
      const currentAccessLevel = hasAccess ? getAccessLevel(purchaseData?.price_id || null) : null;
      
      // Detect subscription ended state (more nuanced now)
      const subscriptionEnded = 
        (hasPurchaseRecord && !profileIsPaid) || // Has a record, but profile says not paid
        (currentPurchaseStatus === "canceled"); // Explicitly canceled

      const isPaymentFailed = currentPurchaseStatus === "payment_failed";
      const isCanceled = currentPurchaseStatus === "canceled"; // Redundant with subscriptionEnded, but kept for clarity

      const previousStatus = previousStatusRef.current;
      
      // Update state
      setHasCompliancePack(hasAccess); // Now directly reflects profileIsPaid
      setPurchaseStatus(currentPurchaseStatus);
      setAccessLevel(currentAccessLevel);
      setIsSubscriptionEnded(subscriptionEnded);
      previousStatusRef.current = currentPurchaseStatus;

      // Show notifications for status changes
      if (showToast) {
        if (hasAccess && !previousStatus) {
          const levelMsg = currentAccessLevel === "premium" 
            ? "🎉 Pacote Premium desbloqueado - Acesso completo!" 
            : "🎉 Plano Mensal ativado - Acesso básico!";
          toast.success(levelMsg);
        } else if (subscriptionEnded && previousStatus && (previousStatus === "paid" || previousStatus === "active")) {
          toast.error("⚠️ Assinatura Encerrada - Acesso aos documentos bloqueado.");
        }
      }

      // Log for debugging
      console.log("[usePurchaseStatus] Check complete:", {
        userId: user.id,
        profileIsPaid, // New debug log
        purchaseStatus: currentPurchaseStatus,
        priceId: purchaseData?.price_id,
        accessLevel: currentAccessLevel,
        hasAccess, // This is now profileIsPaid
        subscriptionEnded,
        isPaymentFailed,
        isCanceled,
        hasAnyPurchaseRecord: hasPurchaseRecord
      });

    } catch (err) {
      console.error("Error checking purchase status:", err);
      setHasCompliancePack(false);
      setPurchaseStatus(null);
      setAccessLevel(null);
      setIsSubscriptionEnded(false);
      setHasAnyPurchaseRecord(null);
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
      // Cleanup existing channel if user logs out
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      return;
    }

    // Cleanup previous channel if effect re-runs (e.g., user data update)
    if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
    }

    let connectionAttempted = false;

    const setupRealtime = () => {
      try {
        const channel = supabase
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
          
        channelRef.current = channel; // Store the channel in the ref
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
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      stopPolling();
    };
  }, [user, authLoading, checkPurchaseStatus, startPolling, stopPolling]);

  const isPaymentFailed = purchaseStatus === "payment_failed";
  const isCanceled = purchaseStatus === "canceled";
  
  // Derived access checks
  const hasPremiumAccess = hasCompliancePack && accessLevel === "premium";
  const hasBasicAccess = hasCompliancePack && accessLevel === "basic";

  return { 
    hasCompliancePack, 
    purchaseStatus,
    accessLevel,
    hasPremiumAccess,
    hasBasicAccess,
    isPaymentFailed,
    isCanceled,
    isSubscriptionEnded,
    hasAnyPurchaseRecord,
    isRealtimeConnected,
    loading,
    error,
    refresh: () => checkPurchaseStatus(true)
  };
};