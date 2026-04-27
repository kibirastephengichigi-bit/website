"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Clock, RefreshCw } from "lucide-react";
import { api } from "@/components/api/client";

export function SessionTimeoutWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [warningTimer, setWarningTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const checkSessionExpiry = () => {
      const expiry = api.getSessionExpiry();
      if (!expiry) return;

      const now = new Date();
      const timeUntilExpiry = expiry.getTime() - now.getTime();
      const warningThreshold = 5 * 60 * 1000; // 5 minutes

      if (timeUntilExpiry <= warningThreshold && timeUntilExpiry > 0) {
        setShowWarning(true);
        setTimeRemaining(Math.ceil(timeUntilExpiry / 1000));
      } else if (timeUntilExpiry <= 0) {
        setShowWarning(false);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkSessionExpiry, 30000);
    checkSessionExpiry(); // Initial check

    return () => {
      clearInterval(interval);
      if (warningTimer) clearTimeout(warningTimer);
    };
  }, [warningTimer]);

  useEffect(() => {
    if (showWarning && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      setWarningTimer(timer);
      return () => clearInterval(timer);
    }
  }, [showWarning, timeRemaining]);

  const handleRefresh = async () => {
    try {
      await api.refreshSession();
      setShowWarning(false);
    } catch (error) {
      console.error("Failed to refresh session:", error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (!showWarning) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert className="bg-amber-50 border-amber-200">
        <Clock className="h-4 w-4 text-amber-600" />
        <AlertDescription className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium text-amber-900">Session Expiring Soon</p>
            <p className="text-sm text-amber-700">
              Your session will expire in {formatTime(timeRemaining)}. Refresh to continue working.
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleRefresh}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
