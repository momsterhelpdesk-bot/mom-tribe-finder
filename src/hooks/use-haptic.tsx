import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type HapticIntensity = 'light' | 'medium' | 'heavy' | 'error';

// Haptic patterns for different actions
const HAPTIC_PATTERNS: Record<HapticIntensity, { duration: number; pattern?: number[] }> = {
  light: { duration: 10 }, // Very subtle - reactions, swipe delete
  medium: { duration: 25 }, // Matches, send message
  heavy: { duration: 50 }, // Major success
  error: { duration: 100, pattern: [30, 50, 30] }, // Sharp error feedback
};

export function useHaptic() {
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);

  useEffect(() => {
    loadHapticPreference();
  }, []);

  const loadHapticPreference = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('profiles')
        .select('haptic_enabled')
        .eq('id', user.id)
        .single();

      if (data?.haptic_enabled !== undefined) {
        setHapticEnabled(data.haptic_enabled);
      }
    } catch (error) {
      console.error('Error loading haptic preference:', error);
    }
  };

  const triggerHaptic = useCallback((intensity: HapticIntensity = 'light') => {
    if (!hapticEnabled) return;

    // Check if Vibration API is supported
    if (!navigator.vibrate) return;

    const pattern = HAPTIC_PATTERNS[intensity];

    try {
      if (pattern.pattern) {
        navigator.vibrate(pattern.pattern);
      } else {
        navigator.vibrate(pattern.duration);
      }
    } catch (error) {
      // Silently fail - not critical
      console.debug('Haptic feedback not available:', error);
    }
  }, [hapticEnabled]);

  const toggleHaptic = useCallback(async (enabled: boolean) => {
    setHapticEnabled(enabled);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('profiles')
        .update({ haptic_enabled: enabled })
        .eq('id', user.id);
    } catch (error) {
      console.error('Error saving haptic preference:', error);
    }
  }, []);

  return {
    hapticEnabled,
    triggerHaptic,
    toggleHaptic,
    loadHapticPreference,
  };
}

// Convenience functions for common haptic patterns
export const hapticFeedback = {
  // Light - for reactions, swipe confirmations
  light: () => navigator.vibrate?.(10),
  // Medium - for successful matches, sending messages
  medium: () => navigator.vibrate?.(25),
  // Heavy - for major success events
  heavy: () => navigator.vibrate?.(50),
  // Error - sharp pattern for errors/restrictions
  error: () => navigator.vibrate?.([30, 50, 30]),
};
