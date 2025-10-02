import { CrimeRecord, loadCrimes } from '@/code/storage';
import CrimeButton from '@/components/buttons/crimeButton';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

export default function RootCrimeListScreen() {
    const [crimes, setCrimes] = useState<CrimeRecord[]>([]);
    const [refreshing, setRefreshing] = useState(false);

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
                            <CrimeButton item={item} />
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
    emptyContainer: { padding: 24, alignItems: 'center' },
});
