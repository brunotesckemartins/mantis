// mobile/src/components/CustomSelect.tsx
import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, FlatList, SafeAreaView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import { ThemeContext } from '../contexts/ThemeContext';
import { SPACING } from '../theme';

interface Option {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export default function CustomSelect({ options, selectedValue, onValueChange, placeholder = "Selecione..." }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, colors } = useContext(ThemeContext);

  const selectedOption = options.find(o => o.value === selectedValue);

  return (
    <>
      <TouchableOpacity 
        style={[styles.inputButton, { backgroundColor: colors.backgroundDeep, borderColor: colors.border }]} 
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={{ color: selectedOption ? colors.textPrimary : colors.textMuted, fontSize: 16 }}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Feather name="chevron-down" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal visible={isOpen} transparent animationType="slide">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setIsOpen(false)}>
          <View style={styles.bottomSheetContainer}>
            <BlurView intensity={isDark ? 50 : 80} tint={isDark ? 'dark' : 'light'} style={styles.blurView}>
              <SafeAreaView style={{ maxHeight: 400 }}>
                <View style={styles.dragHandleContainer}>
                  <View style={[styles.dragHandle, { backgroundColor: colors.textMuted }]} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Selecione uma opção</Text>
                
                <FlatList
                  data={options}
                  keyExtractor={(item) => item.value}
                  contentContainerStyle={{ paddingBottom: 20 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity 
                      style={[styles.optionItem, { borderBottomColor: colors.border }]} 
                      onPress={() => { onValueChange(item.value); setIsOpen(false); }}
                    >
                      <Text style={[
                        styles.optionText, 
                        { color: item.value === selectedValue ? colors.accentSilver : colors.textPrimary, fontWeight: item.value === selectedValue ? 'bold' : '400' }
                      ]}>
                        {item.label}
                      </Text>
                      {item.value === selectedValue && <Feather name="check" size={20} color={colors.accentSilver} />}
                    </TouchableOpacity>
                  )}
                />
              </SafeAreaView>
            </BlurView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  inputButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheetContainer: { borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
  blurView: { width: '100%' },
  dragHandleContainer: { alignItems: 'center', paddingTop: 12, paddingBottom: 8 },
  dragHandle: { width: 40, height: 4, borderRadius: 2 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
  optionText: { fontSize: 16 }
});