import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CrimeRecord {
    id: string;
    title: string;
    details: string;
    date: string; // ISO date
    solved: boolean;
    photoUri?: string | null;
}

const KEY = 'CRIMES_V1';

export async function loadCrimes(): Promise<CrimeRecord[]> {
    try {
        const raw = await AsyncStorage.getItem(KEY);
        if (!raw) return [];
        return JSON.parse(raw) as CrimeRecord[];
    } catch (e) {
        console.warn('Failed to load crimes', e);
        return [];
    }
}

export async function saveCrimes(crimes: CrimeRecord[]): Promise<void> {
    try {
        await AsyncStorage.setItem(KEY, JSON.stringify(crimes));
    } catch (e) {
        console.warn('Failed to save crimes', e);
    }
}

export async function upsertCrime(record: CrimeRecord): Promise<CrimeRecord[]> {
    const existing = await loadCrimes();
    const idx = existing.findIndex(c => c.id === record.id);
    if (idx >= 0) existing[idx] = record; else existing.push(record);
    await saveCrimes(existing);
    return existing;
}

export async function getCrimeById(id: string): Promise<CrimeRecord | undefined> {
    const all = await loadCrimes();
    return all.find(c => c.id === id);
}
