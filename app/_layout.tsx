import { ThemeProviderCustom, useAppTheme } from '@/context/theme-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Link, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable } from 'react-native';
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
                <Link
                  href={{ pathname: '/details', params: { id: 'new' } }}
                  asChild
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Add new crime"
                    style={{ paddingHorizontal: 12, flexDirection: 'row' }}
                  >
                    <MaterialCommunityIcons name={'plus-circle'} size={28} color={theme.colors.tint} />
                  </Pressable>
                </Link>
                <Link href="/settings" asChild>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Open settings"
                    style={{ paddingHorizontal: 14 }}
                  >
                    <MaterialCommunityIcons name={'cog-outline'} size={24} color={theme.colors.icon} />
                  </Pressable>
                </Link>
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
              <Link href="/settings" asChild>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Open settings"
                  style={{ paddingHorizontal: 14 }}
                >
                  <MaterialCommunityIcons name={'cog-outline'} size={24} color={theme.colors.icon} />
                </Pressable>
              </Link>
            ),
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
