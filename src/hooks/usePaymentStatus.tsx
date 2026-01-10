import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const usePaymentStatus = () => {
  const { user } = useAuth();
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkPaymentStatus = useCallback(async () => {
    if (!user) {
      setIsPaid(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("is_paid")
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Error checking payment status:", error);
        setIsPaid(false);
      } else {
        setIsPaid(data?.is_paid || false);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setIsPaid(false);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsPaid = useCallback(async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_paid: true })
        .eq("user_id", user.id);

      if (error) {
        console.error("Error updating payment status:", error);
        return false;
      }

      setIsPaid(true);
      return true;
    } catch (error) {
      console.error("Error updating payment status:", error);
      return false;
    }
  }, [user]);

  useEffect(() => {
    checkPaymentStatus();
  }, [checkPaymentStatus]);

  return { isPaid, loading, refresh: checkPaymentStatus, markAsPaid };
};
