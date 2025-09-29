import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/context/theme-context';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

export default function SettingsScreen() {
    const { themes, theme, setThemeKey } = useAppTheme();

    return (
        <>
            <ThemedView style={styles.container}>
                <ThemedText type="title" style={styles.header}>Themes</ThemedText>
                <View style={styles.grid}>
                    {themes.map(t => {
                        const active = t.key === theme.key;
                        return (
                            <Pressable
                                key={t.key}
                                onPress={() => setThemeKey(t.key)}
                                style={({ pressed }) => [styles.themeButton, active && styles.activeButton, pressed && { opacity: 0.6 }]}>
                                <ThemedText type="defaultSemiBold" style={active && styles.activeText}>{t.label}</ThemedText>
                                <View style={styles.swatchRow}>
                                    <View style={[styles.swatch, { backgroundColor: t.colors.background }]} />
                                    <View style={[styles.swatch, { backgroundColor: t.colors.tint }]} />
                                    <View style={[styles.swatch, { backgroundColor: t.colors.text }]} />
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, gap: 16 },
    header: { marginBottom: 8 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    themeButton: {
        width: '47%',
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 12,
        padding: 12,
        gap: 8,
    },
    activeButton: {
        borderColor: '#2563eb',
    },
    activeText: { color: '#2563eb' },
    swatchRow: { flexDirection: 'row', gap: 6 },
    swatch: { width: 18, height: 18, borderRadius: 4, borderWidth: 1, borderColor: '#888' },
});
