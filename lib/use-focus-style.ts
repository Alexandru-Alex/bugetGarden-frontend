import { interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const FOCUS_DURATION = { duration: 150 };

export function useFocusStyle() {
  const sv = useSharedValue(0);
  const style = useAnimatedStyle(() => ({
    borderColor: interpolateColor(sv.value, [0, 1], ["#79AE6F", "#346739"]),
  }));
  const onFocus = () => { sv.value = withTiming(1, FOCUS_DURATION); };
  const onBlur  = () => { sv.value = withTiming(0, FOCUS_DURATION); };
  return { style, onFocus, onBlur };
}
