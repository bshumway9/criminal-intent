import { CrimeRecord, getCrimeById, upsertCrime } from '@/code/storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/context/theme-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Button, Image, Modal, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';

export default function CrimeDetailScreen() {
    const { theme } = useAppTheme();
    const { id } = useLocalSearchParams<{ id?: string }>();
    const isNew = !id || id === 'new';
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [date, setDate] = useState(new Date());
    const [solved, setSolved] = useState(false);
    const [photoUri, setPhotoUri] = useState<string | undefined | null>(null);
    const [savedFlash, setSavedFlash] = useState(false);
    const [showDateModal, setShowDateModal] = useState(false);

    const loadCrime = useCallback(async () => {
        if (!isNew && id) {
            const found = await getCrimeById(id);
            if (found) {
                setTitle(found.title);
                setDetails(found.details || '');
                setDate(new Date(found.date));
                setSolved(found.solved);
                setPhotoUri(found.photoUri);
            }
        } else if (isNew) {
            // Reset fields for a fresh create (in case of navigating from an existing record)
            setTitle('');
            setDetails('');
            setDate(new Date());
            setSolved(false);
            setPhotoUri(null);
        }
    }, [id, isNew]);

    useFocusEffect(
        useCallback(() => {
            loadCrime();
        }, [loadCrime])
    );

    function formatDate(d: Date) {
        return d.toISOString().slice(0, 10);
    }

    async function handleSave() {
        if (!title.trim()) {
            Alert.alert('Title required', 'Please enter a title before saving.');
            return;
        }
        const record: CrimeRecord = {
            id: isNew ? (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) : id!,
            title: title.trim(),
            details: details.trim(),
            date: formatDate(date),
            solved,
            photoUri: photoUri || undefined,
        };
        await upsertCrime(record);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1800);
        if (isNew) {
            setTimeout(() => router.replace({ pathname: '/details', params: { id: record.id } }), 600);
        }
    }

    const handlePickImage = useCallback(async () => {
        const libPerm = await ImagePicker.getMediaLibraryPermissionsAsync();
        let status = libPerm.status;
        if (status !== 'granted') {
            const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
            status = req.status;
        }
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Media library permission is needed to select a photo.');
            return;
        }
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.9,
            });
            if (!result.canceled && result.assets?.length) {
                setPhotoUri(result.assets[0].uri);
            }
        } catch (e) {
            console.warn('Image picking failed', e);
            Alert.alert('Error', 'Could not open image library.');
        }
    }, []);

    // Header configured centrally in layout. If we want dynamic titles based on new vs existing, that can be lifted later.

    return (
        <>
            <ScrollView contentContainerStyle={styles.scrollContent} style={styles.flex}>
                <ThemedView style={styles.container}>
                    <Pressable onPress={() => {
                        handlePickImage()
                    }} accessibilityLabel="Pick photo" style={{ alignSelf: 'flex-start' }}>
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={styles.photo} />
                        ) : (
                            <MaterialCommunityIcons name={'camera'} size={32} color={theme.colors.icon} />
                        )}
                    </Pressable>
                    <ThemedText type="subtitle" style={styles.label}>Title</ThemedText>
                    <TextInput
                        placeholder="Enter title"
                        value={title}
                        onChangeText={setTitle}
                        style={styles.input}
                    />
                    <ThemedText type="subtitle" style={styles.label}>Details</ThemedText>
                    <TextInput
                        placeholder="Enter details"
                        value={details}
                        onChangeText={setDetails}
                        style={[styles.input, styles.multiline]}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                    <ThemedText type="subtitle" style={styles.label}>Date</ThemedText>
                    <Pressable onPress={() => setShowDateModal(true)} style={styles.dateButton}>
                        <ThemedText>{formatDate(date)}</ThemedText>
                    </Pressable>
                    <ThemedView style={styles.switchRow}>
                        <ThemedText type="subtitle">Solved</ThemedText>
                        <Switch value={solved} onValueChange={setSolved} />
                    </ThemedView>
                    <Pressable style={styles.saveButton} onPress={handleSave} accessibilityRole="button">
                        <ThemedText type="defaultSemiBold" style={styles.saveButtonText}>Save Crime</ThemedText>
                    </Pressable>
                    {savedFlash && (
                        <View style={styles.flash}>
                            <ThemedText type="defaultSemiBold">Saved!</ThemedText>
                        </View>
                    )}
                </ThemedView>
            </ScrollView>
            <Modal visible={showDateModal} transparent animationType="fade" onRequestClose={() => setShowDateModal(false)}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalCard}>
                        <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Select Date</ThemedText>
                        <View style={styles.dateRow}>
                            <TextInput
                                style={styles.datePart}
                                keyboardType="numeric"
                                value={String(date.getFullYear())}
                                onChangeText={(txt) => {
                                    const y = parseInt(txt) || date.getFullYear();
                                    setDate(new Date(y, date.getMonth(), date.getDate()));
                                }}
                            />
                            <TextInput
                                style={styles.datePart}
                                keyboardType="numeric"
                                value={String(date.getMonth() + 1)}
                                onChangeText={(txt) => {
                                    const m = (parseInt(txt) || date.getMonth() + 1) - 1;
                                    setDate(new Date(date.getFullYear(), Math.min(Math.max(m, 0), 11), date.getDate()));
                                }}
                            />
                            <TextInput
                                style={styles.datePart}
                                keyboardType="numeric"
                                value={String(date.getDate())}
                                onChangeText={(txt) => {
                                    const d = parseInt(txt) || date.getDate();
                                    setDate(new Date(date.getFullYear(), date.getMonth(), Math.min(Math.max(d, 1), 31)));
                                }}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
                            <Button title="Cancel" onPress={() => setShowDateModal(false)} />
                            <Button title="Done" onPress={() => setShowDateModal(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    flex: { flex: 1 },
    scrollContent: { paddingBottom: 40 },
    container: { flex: 1, padding: 16, gap: 12 },
    label: { marginTop: 4 },
    input: {
        borderWidth: 1,
        borderColor: '#999',
        padding: 10,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.04)'
    },
    multiline: { minHeight: 120 },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    dateButton: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 8,
        alignItems: 'center'
    },
    saveButton: {
        marginTop: 12,
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center'
    },
    saveButtonText: { color: 'white' },
    flash: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#16a34a',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    photo: { width: 80, height: 80, borderRadius: 8, marginBottom: 4 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 },
    modalCard: { backgroundColor: '#fff', padding: 16, borderRadius: 12 },
    dateRow: { flexDirection: 'row', gap: 8 },
    datePart: { flex: 1, borderWidth: 1, borderColor: '#999', padding: 8, borderRadius: 6, textAlign: 'center' }
});
