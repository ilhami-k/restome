import { useEffect } from 'react';
import { subscribeToMenuAvailability } from '../../../services/menu.service';

export function useMenuAvailabilityRealtime(onUpdate: (menuItemId: string, available: boolean) => void) {
  useEffect(() => {
    return subscribeToMenuAvailability(onUpdate);
  }, [onUpdate]);
}
