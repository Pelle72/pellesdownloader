import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock, Wifi } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SupabaseStatus {
  configured: boolean;
  url: string | null;
  keyExists: boolean;
  lastChecked: Date;
}

export const SupabaseStatusChecker = () => {
  const [status, setStatus] = useState<SupabaseStatus>({
    configured: false,
    url: null,
    keyExists: false,
    lastChecked: new Date()
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkSupabaseStatus = () => {
    setIsChecking(true);
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    const newStatus: SupabaseStatus = {
      configured: !!(supabaseUrl && supabaseKey && supabaseUrl.trim() && supabaseKey.trim()),
      url: supabaseUrl || null,
      keyExists: !!supabaseKey,
      lastChecked: new Date()
    };
    
    setStatus(newStatus);
    
    console.log('🔍 Supabase Status Check:', {
      'URL configured': !!supabaseUrl,
      'Key configured': !!supabaseKey,
      'Fully ready': newStatus.configured,
      'Timestamp': newStatus.lastChecked.toLocaleTimeString()
    });
    
    setTimeout(() => setIsChecking(false), 500);
    
    return newStatus.configured;
  };

  useEffect(() => {
    // Initial check
    const isReady = checkSupabaseStatus();
    
    if (isReady) {
      console.log('🎉 Supabase is ready! Real downloads are now available.');
      return; // Don't start interval if already ready
    }

    // Check every minute until configured
    const interval = setInterval(() => {
      console.log('⏰ Checking Supabase configuration...');
      const isNowReady = checkSupabaseStatus();
      
      if (isNowReady) {
        console.log('🎉 Supabase is now ready! Real downloads are available.');
        clearInterval(interval);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  if (status.configured) {
    return (
      <Alert className="border-green-500/50 bg-green-500/10">
        <CheckCircle className="h-4 w-4 text-green-500" />
        <AlertDescription className="text-green-700 dark:text-green-300">
          <strong>Supabase Ready!</strong> Real downloads are now available using your RapidAPI key.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-yellow-500/50 bg-yellow-500/10">
      <div className="flex items-center gap-2">
        {isChecking ? (
          <Wifi className="h-4 w-4 text-yellow-500 animate-pulse" />
        ) : (
          <Clock className="h-4 w-4 text-yellow-500" />
        )}
        <AlertDescription className="text-yellow-700 dark:text-yellow-300">
          <strong>Configuring Supabase...</strong> Currently in demo mode. 
          {isChecking ? " Checking now..." : ` Next check in ~${60 - new Date().getSeconds()} seconds.`}
          <br />
          <span className="text-xs opacity-75">
            Last checked: {status.lastChecked.toLocaleTimeString()} | 
            URL: {status.url ? '✅' : '❌'} | 
            Key: {status.keyExists ? '✅' : '❌'}
          </span>
        </AlertDescription>
      </div>
    </Alert>
  );
};