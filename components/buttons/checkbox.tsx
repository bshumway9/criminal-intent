import { useAppTheme } from "@/context/theme-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Pressable } from "react-native";

export default function Checkbox({ solved, setSolved }: { solved: boolean; setSolved: React.Dispatch<React.SetStateAction<boolean>> }) {
    const { theme } = useAppTheme();
    return (
        <Pressable
            onPress={() => setSolved(prev => !prev)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: solved }}
            accessibilityLabel="Mark crime as solved"
            style={({ pressed }) => [{
                width: 28,
                height: 28,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: solved ? theme.colors.tint : theme.colors.icon,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: solved ? theme.colors.tint : 'transparent',
                opacity: pressed ? 0.6 : 1,
            }]}
        >
            {solved && (
                <MaterialCommunityIcons
                    name="check-bold"
                    size={18}
                    color={theme.colors.background}
                />
            )}
        </Pressable>
    );
}