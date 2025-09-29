/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // Always call hooks unconditionally
  const { theme: appTheme } = useAppTheme();
  const override = props[appTheme.mode];
  const palette = appTheme.colors as any;
  return override ?? palette[colorName] ?? Colors[appTheme.mode][colorName];
}
