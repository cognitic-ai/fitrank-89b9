import { View } from 'react-native';
import * as AC from '@bacons/apple-colors';

export function Separator() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: AC.separator,
      }}
    />
  );
}
