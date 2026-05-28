import { Alert } from 'react-native';
import { Messages } from '../../../constants/messages';
import type { ItemStatus } from '../../../types';

interface OrderItemMutations {
  setItemStatus: (itemId: string, status: ItemStatus, message?: string) => Promise<void>;
  sendItemMessage: (itemId: string, message: string) => Promise<void>;
}

/**
 * Wraps the kitchen order mutations with shared error handling so the queue and
 * table-order screens report failures consistently.
 */
export function useOrderItemActions({ setItemStatus, sendItemMessage }: OrderItemMutations) {
  async function updateItemStatus(itemId: string, status: ItemStatus, message?: string) {
    try {
      await setItemStatus(itemId, status, message);
    } catch {
      Alert.alert(Messages.common.error, Messages.kitchen.orderActionError);
    }
  }

  async function sendMessage(itemId: string, message: string): Promise<boolean> {
    try {
      await sendItemMessage(itemId, message);
      return true;
    } catch {
      Alert.alert(Messages.common.error, Messages.kitchen.orderActionError);
      return false;
    }
  }

  return { updateItemStatus, sendMessage };
}
