import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useOnlineMoms = () => {
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOnlineCount = async () => {
      try {
        // Count users active in the last 15 minutes
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
        
        const { count, error } = await supabase
          .from('user_activity')
          .select('*', { count: 'exact', head: true })
          .gte('last_activity_at', fifteenMinutesAgo);

        if (error) {
          console.error('Error fetching online count:', error);
          setOnlineCount(0);
        } else {
          setOnlineCount(count || 0);
        }
      } catch (err) {
        console.error('Error in fetchOnlineCount:', err);
        setOnlineCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchOnlineCount();

    // Refresh every 2 minutes
    const interval = setInterval(fetchOnlineCount, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return { onlineCount, loading };
};
