import { CrimeRecord } from "@/code/storage";
import { useAppTheme } from "@/context/theme-context";
import MaterialCommunityIcons from "@expo/vector-icons/build/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { ThemedText } from "../themed-text";


export default function CrimeButton({ item }: { item: CrimeRecord }) {
    const router = useRouter();
    const { theme } = useAppTheme();

    return (
        <Pressable
            onPress={() => router.push({ pathname: '/details', params: { id: item.id } })}
            style={({ pressed }) => [{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 12,
                gap: 12,
            }, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel={`Open details for ${item.title}`}
        >
            <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                <ThemedText type="default" style={{ fontSize: 12, opacity: 0.6 }}>
                    {new Date(item.date).toLocaleDateString()}
                </ThemedText>
            </View>
            {item.solved && <MaterialCommunityIcons name={'handcuffs'} size={24} color={theme.colors.icon} />}
        </Pressable>
    );
}