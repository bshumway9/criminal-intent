import { CrimeRecord, getCrimeById, upsertCrime } from '@/code/storage';
import Button from '@/components/buttons/button';
import Checkbox from '@/components/buttons/checkbox';
import ImagePicker from '@/components/buttons/imagePicker';
import DateTimePickerPopup from '@/components/popups/DateTimePickerPopup';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/context/theme-context';
import * as Crypto from 'expo-crypto';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

export default function CrimeDetailScreen() {
    const { theme } = useAppTheme();
    const [id, setId] = useState(useLocalSearchParams<{ id?: string }>().id);
    const isNew = !id || id === 'new';
    // const router = useRouter();

    const [title, setTitle] = useState('');
    const [details, setDetails] = useState('');
    const [date, setDate] = useState(new Date());
    const [solved, setSolved] = useState(false);
    const [photoUri, setPhotoUri] = useState<string | undefined | null>(null);
    const [savedFlash, setSavedFlash] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);

    async function loadCrime() {
        if (!isNew && id) {
            const found = await getCrimeById(id);
            if (found) {
                setTitle(found.title);
                setDetails(found.details || '');
                setDate(new Date(found.date));
                setSolved(found.solved);
                setPhotoUri(found.photoUri);
            }
        }
    }

    useFocusEffect(() => {
        loadCrime();
    });

    function formatDate(d: Date) {
        return d.toISOString().slice(0, 10);
    }

    async function handleSave() {
        if (!title.trim()) {
            Alert.alert('Title required', 'Please enter a title before saving.');
            return;
        }
        const record: CrimeRecord = {
            id: isNew ? Crypto.randomUUID() : id!,
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
            setId(record.id);
            // setTimeout(() => router.replace({ pathname: '/details', params: { id: record.id } }), 600);
        }
    }



    // Header configured centrally in layout. If we want dynamic titles based on new vs existing, that can be lifted later.

    return (
        <>
            <ScrollView contentContainerStyle={styles.scrollContent} style={styles.flex}>
                <ThemedView style={styles.container}>
                    <ImagePicker photoUri={photoUri || null} setPhotoUri={setPhotoUri} />
                    <ThemedText type="subtitle" style={styles.label}>Title</ThemedText>
                    <TextInput
                        placeholder="Enter title"
                        placeholderTextColor={theme.colors.icon}
                        value={title}
                        onChangeText={setTitle}
                        style={[styles.input, { color: theme.colors.text }]}
                    />
                    <ThemedText type="subtitle" style={styles.label}>Details</ThemedText>
                    <TextInput
                        placeholder="Enter details"
                        value={details}
                        onChangeText={setDetails}
                        placeholderTextColor={theme.colors.icon}
                        style={[styles.input, styles.multiline, { color: theme.colors.text }]}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                    <ThemedText type="subtitle" style={styles.label}>Date</ThemedText>
                    <Pressable onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                        <ThemedText>{formatDate(date)}</ThemedText>
                    </Pressable>
                    <ThemedView style={styles.switchRow}>
                        <ThemedText type="subtitle">Solved</ThemedText>
                        <Checkbox solved={solved} setSolved={setSolved} />
                    </ThemedView>
                    <Button title="Save Crime" onPress={handleSave} />
                    {savedFlash && (
                        <View style={styles.flash}>
                            <ThemedText type="defaultSemiBold">Saved!</ThemedText>
                        </View>
                    )}
                </ThemedView>
            </ScrollView>
            {showDatePicker && (
                <DateTimePickerPopup
                    showDatePicker={showDatePicker}
                    setShowDatePicker={setShowDatePicker}
                    date={date}
                    setDate={setDate}
                />
            )}
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
    flash: {
        position: 'absolute',
        top: 16,
        right: 16,
        backgroundColor: '#16a34a',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
});
