import { CrimeRecord, getCrimeById, upsertCrime } from '@/code/storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppTheme } from '@/context/theme-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Crypto from 'expo-crypto';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

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
        } else if (isNew) {
            // Reset fields for a fresh create (in case of navigating from an existing record)
            // setTitle('');
            // setDetails('');
            // setDate(new Date());
            // setSolved(false);
            // setPhotoUri(null);
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

    async function handlePickImage() {
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
    }

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
            {showDatePicker && (
                <Modal
                    transparent
                    animationType="slide"
                    visible={showDatePicker}
                    onRequestClose={() => setShowDatePicker(false)}
                    style={{ marginVertical: 'auto', height: '100%', justifyContent: 'space-between' }}
                >
                    <View style={{ flex: 1, justifyContent: 'center', height: '100%', width: '100%', backgroundColor: theme.colors.background }} >
                        <DateTimePicker
                            mode="date"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            value={date}
                            textColor={theme.colors.text}
                            style={{ backgroundColor: theme.colors.background, alignSelf: 'center', justifyContent: 'center' }}
                            themeVariant={theme.mode === 'dark' ? 'dark' : 'light'}
                            accentColor={theme.colors.icon}
                            onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                                if (event.type === 'dismissed') {
                                    setShowDatePicker(false);
                                    return;
                                }
                                if (selectedDate) {
                                    setDate(selectedDate);
                                }
                                if (Platform.OS !== 'ios') {
                                    setShowDatePicker(false);
                                }
                            }}
                        />
                        <Pressable
                            onPress={() => setShowDatePicker(false)}
                            style={{ alignSelf: 'center', backgroundColor: theme.colors.tint, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, marginTop: 12 }}
                        >
                            <ThemedText>Select Date</ThemedText>
                        </Pressable>
                    </View>
                </Modal>
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
    // Removed modal-related styles after switching to native DateTimePicker
});
