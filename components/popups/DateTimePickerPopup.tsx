import { useAppTheme } from "@/context/theme-context";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Modal, Platform, Pressable, View } from "react-native";
import { ThemedText } from "../themed-text";




export default function DateTimePickerPopup({ showDatePicker, setShowDatePicker, date, setDate }: { showDatePicker: boolean; setShowDatePicker: React.Dispatch<React.SetStateAction<boolean>>; date: Date; setDate: React.Dispatch<React.SetStateAction<Date>> }) {
    const { theme } = useAppTheme();
    return (
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
                    <ThemedText style={{ color: theme.colors.buttonText }}>Select Date</ThemedText>
                </Pressable>
            </View>
        </Modal>
    );
}