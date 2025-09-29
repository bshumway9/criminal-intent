import { CrimeRecord, loadCrimes } from '@/code/storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/context/theme-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

export default function RootCrimeListScreen() {
    const [crimes, setCrimes] = useState<CrimeRecord[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const { theme } = useAppTheme();

    const refresh = useCallback(async () => {
        setRefreshing(true);
        const stored = await loadCrimes();
        setCrimes(stored);
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [refresh])
    );


    return (
        <>
            <ThemedView style={styles.container}>
                <FlatList
                    data={crimes}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
                    renderItem={({ item }) => {
                        return (
                            <Pressable
                                onPress={() => router.push({ pathname: '/details', params: { id: item.id } })}
                                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                                accessibilityRole="button"
                                accessibilityLabel={`Open details for ${item.title}`}
                            >
                                <View style={styles.rowTextContainer}>
                                    <ThemedText type="defaultSemiBold">{item.title}</ThemedText>
                                    <ThemedText type="default" style={styles.dateText}>
                                        {new Date(item.date).toLocaleDateString()}
                                    </ThemedText>
                                </View>
                                {item.solved && <MaterialCommunityIcons name={'handcuffs'} size={24} color={theme.colors.icon} />}
                            </Pressable>
                        )
                    }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <ThemedText>No crimes recorded.</ThemedText>
                        </View>
                    }
                />
            </ThemedView>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingVertical: 8 },
    listContent: { paddingHorizontal: 16, paddingBottom: 32 },
    separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#ccc' },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        gap: 12,
    },
    rowPressed: { opacity: 0.6 },
    rowTextContainer: { flex: 1 },
    dateText: { fontSize: 12, opacity: 0.6 },
    emptyContainer: { padding: 24, alignItems: 'center' },
});
