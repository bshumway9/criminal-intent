import { useAppTheme } from "@/context/theme-context";
import MaterialCommunityIcons from "@expo/vector-icons/build/MaterialCommunityIcons";
import * as ExpoImagePicker from 'expo-image-picker';
import { Alert, Image, Pressable } from "react-native";




export default function ImagePicker({ photoUri, setPhotoUri }: { photoUri: string | null; setPhotoUri: (uri: string | null) => void }) {
    const { theme } = useAppTheme();

    async function handlePickImage() {
        const libPerm = await ExpoImagePicker.getMediaLibraryPermissionsAsync();
        let status = libPerm.status;
        if (status !== 'granted') {
            const req = await ExpoImagePicker.requestMediaLibraryPermissionsAsync();
            status = req.status;
        }
        if (status !== 'granted') {
            Alert.alert('Permission required', 'Media library permission is needed to select a photo.');
            return;
        }
        try {
            const result = await ExpoImagePicker.launchImageLibraryAsync({
                mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
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

    return (
        <Pressable onPress={() => {
            handlePickImage()
        }} accessibilityLabel="Pick photo" style={{ alignSelf: 'flex-start' }}>
            {photoUri ? (
                <Image source={{ uri: photoUri }} style={{ width: 80, height: 80, borderRadius: 8, marginBottom: 4 }} />
            ) : (
                <MaterialCommunityIcons name={'camera'} size={32} color={theme.colors.icon} />
            )}
        </Pressable>
    );
}