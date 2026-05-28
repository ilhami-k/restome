import { StyleSheet } from 'react-native';
import { Colors } from '../../../constants/colors';

/** Layout styles shared by the kitchen list screens (queue and table order). */
export const kitchenScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.kitchenBackground,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  loader: {
    marginTop: 24,
  },
  errorText: {
    color: Colors.statusUnavailable,
    textAlign: 'center',
    marginTop: 24,
  },
  empty: {
    color: Colors.kitchenTextSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
