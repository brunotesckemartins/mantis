
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
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

export default function CustomSelect({
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Selecione...',
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isDark, colors } = useContext(ThemeContext);

  const selectedOption = options.find(
    option => option.value === selectedValue,
  );

  const handleSelect = (value: string) => {
    onValueChange(value);
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.inputButton,
          {
            backgroundColor: colors.backgroundDeep,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.inputText,
            {
              color: selectedOption
                ? colors.textPrimary
                : colors.textMuted,
            },
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>

        <Feather
          name="chevron-down"
          size={20}
          color={colors.textMuted}
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.overlayDismiss}
            activeOpacity={1}
            onPress={() => setIsOpen(false)}
          />

          <View style={styles.bottomSheetContainer}>
            <BlurView
              intensity={isDark ? 50 : 80}
              tint={isDark ? 'dark' : 'light'}
              style={styles.blurView}
            >
              <SafeAreaView style={styles.safeArea}>
                <View style={styles.dragHandleContainer}>
                  <View
                    style={[
                      styles.dragHandle,
                      { backgroundColor: colors.textMuted },
                    ]}
                  />
                </View>

                <Text
                  style={[
                    styles.modalTitle,
                    { color: colors.textPrimary },
                  ]}
                >
                  Selecione uma opção
                </Text>

                <FlatList
                  data={options}
                  keyExtractor={item => item.value}
                  contentContainerStyle={styles.listContent}
                  renderItem={({ item }) => {
                    const isSelected = item.value === selectedValue;

                    return (
                      <TouchableOpacity
                        style={[
                          styles.optionItem,
                          { borderBottomColor: colors.border },
                        ]}
                        onPress={() => handleSelect(item.value)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            {
                              color: isSelected
                                ? colors.accentSilver
                                : colors.textPrimary,
                              fontWeight: isSelected ? 'bold' : '400',
                            },
                          ]}
                        >
                          {item.label}
                        </Text>

                        {isSelected && (
                          <Feather
                            name="check"
                            size={20}
                            color={colors.accentSilver}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              </SafeAreaView>
            </BlurView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  inputButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderRadius: 12,
  },

  inputText: {
    fontSize: 16,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  overlayDismiss: {
    ...StyleSheet.absoluteFill,
  },

  bottomSheetContainer: {
    borderTopLeftRadius: SPACING.borderRadius,
    borderTopRightRadius: SPACING.borderRadius,
    overflow: 'hidden',
  },

  blurView: {
    width: '100%',
  },

  safeArea: {
    maxHeight: 400,
  },

  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },

  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },

  listContent: {
    paddingBottom: SPACING.lg,
  },

  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
  },

  optionText: {
    fontSize: 16,
  },
});
