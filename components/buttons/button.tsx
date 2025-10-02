import { useAppTheme } from "@/context/theme-context";
import { Pressable } from "react-native";
import { ThemedText } from "../themed-text";

export default function Button({ title, onPress }: { title: string; onPress: () => void }) {
    const { theme } = useAppTheme();
    return (
        <Pressable style={[{
            marginTop: 12,
            backgroundColor: '#2563eb',
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center'
        }, { backgroundColor: theme.colors.tint }]} onPress={onPress} accessibilityRole="button">
            <ThemedText type="defaultSemiBold" style={{ color: theme.colors.buttonText }}>{title}</ThemedText>
        </Pressable>
    );
}