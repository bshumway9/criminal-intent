import { HeaderIconLink } from '@/components/header-icon-link';
import { ThemeProviderCustom, useAppTheme } from '@/context/theme-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export default function RootLayout() {
  return (
    <ThemeProviderCustom>
      <AppStack />
    </ThemeProviderCustom>
  );
}

function AppStack() {
  const { theme } = useAppTheme();
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Crimes',
            headerRight: () => (
              <>
                <HeaderIconLink
                  href={{ pathname: '/details' }}
                  iconName="plus-circle"
                  color={theme.colors.tint}
                  size={28}
                  accessibilityLabel="Add new crime"
                  paddingHorizontal={20}
                />
                <HeaderIconLink
                  href="/settings"
                  iconName="cog-outline"
                  color={theme.colors.icon}
                  size={24}
                  accessibilityLabel="Open settings"
                  paddingHorizontal={14}
                />
              </>
            ),
          }}
        />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen
          name="details"
          options={{
            title: 'Crime Detail',
            headerBackTitle: 'Back',
            headerRight: () => (
              <HeaderIconLink
                href="/settings"
                iconName="cog-outline"
                color={theme.colors.icon}
                size={24}
                accessibilityLabel="Open settings"
                paddingHorizontal={14}
              />
            ),
          }}
        />
      </Stack>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
