import { Alert } from 'react-native';
import { KitchenMessages, Messages } from '../../../constants/messages';
import type { ItemStatus } from '../../../types';

type SetItemStatus = (itemId: string, status: ItemStatus, message?: string) => Promise<void>;

export function confirmMarkUnavailable(setItemStatus: SetItemStatus, itemId: string): void {
  Alert.alert(KitchenMessages.markUnavailableTitle, KitchenMessages.markUnavailableMessage, [
    { text: Messages.common.cancel, style: 'cancel' },
    {
      text: Messages.common.confirm,
      onPress: () => {
        void setItemStatus(itemId, 'unavailable', KitchenMessages.itemUnavailable);
      },
    },
  ]);
}
