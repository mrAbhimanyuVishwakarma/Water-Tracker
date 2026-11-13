import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserHealthProfile } from '../types';
import { feedback } from '../utils/feedback';

interface Props {
  visible: boolean;
  profile: UserHealthProfile;
  onClose: () => void;
  onSave: (profile: UserHealthProfile) => void;
}

const fieldNumber = (value: string, fallback: number, minimum: number, maximum: number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(minimum, Math.min(maximum, parsed)) : fallback;
};

export const UserProfileModal: React.FC<Props> = ({ visible, profile, onClose, onSave }) => {
  const [draft, setDraft] = useState(profile);
  const [weight, setWeight] = useState(String(profile.weight));
  const [height, setHeight] = useState(profile.heightCm ? String(profile.heightCm) : '');

  const save = () => {
    const next = {
      ...draft,
      weight: fieldNumber(weight, profile.weight, 20, 500),
      heightCm: height.trim() ? fieldNumber(height, profile.heightCm || 165, 80, 250) : undefined,
      displayName: draft.displayName?.trim().slice(0, 80),
      healthConditions: draft.healthConditions?.trim().slice(0, 500),
      medicationNotes: draft.medicationNotes?.trim().slice(0, 500),
      appointmentNotes: draft.appointmentNotes?.trim().slice(0, 500),
    };
    onSave(next);
    void feedback.triggerHaptic('success');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.iconButton} onPress={onClose} accessibilityLabel="Close profile">
              <Ionicons name="close" size={24} color="#0F172A" />
            </TouchableOpacity>
            <View style={styles.headerCopy}>
              <Text style={styles.title}>Your profile</Text>
              <Text style={styles.subtitle}>Help Brownie understand your routine</Text>
            </View>
            <TouchableOpacity style={styles.saveHeader} onPress={save}>
              <Text style={styles.saveHeaderText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.privacyNote}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#0369A1" />
              <Text style={styles.privacyText}>This information personalizes hydration guidance. It is not medical advice.</Text>
            </View>

            <Text style={styles.sectionLabel}>ABOUT YOU</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Name</Text>
              <TextInput style={styles.input} value={draft.displayName || ''} onChangeText={displayName => setDraft({ ...draft, displayName })} placeholder="What should Brownie call you?" placeholderTextColor="#94A3B8" />
              <Text style={styles.label}>Gender</Text>
              <View style={styles.choiceRow}>
                {(['female', 'male', 'other'] as const).map(gender => (
                  <TouchableOpacity key={gender} style={[styles.choice, draft.gender === gender && styles.choiceActive]} onPress={() => setDraft({ ...draft, gender })}>
                    <Text style={[styles.choiceText, draft.gender === gender && styles.choiceTextActive]}>{gender[0].toUpperCase() + gender.slice(1)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.twoColumns}>
                <View style={styles.column}>
                  <Text style={styles.label}>Weight ({draft.weightUnit})</Text>
                  <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="decimal-pad" maxLength={6} />
                </View>
                <View style={styles.column}>
                  <Text style={styles.label}>Height (cm)</Text>
                  <TextInput style={styles.input} value={height} onChangeText={setHeight} keyboardType="decimal-pad" placeholder="Optional" placeholderTextColor="#94A3B8" maxLength={6} />
                </View>
              </View>
            </View>

            <Text style={styles.sectionLabel}>HEALTH NOTES</Text>
            <View style={styles.card}>
              <Text style={styles.label}>Conditions or health context</Text>
              <TextInput style={[styles.input, styles.multiline]} value={draft.healthConditions || ''} onChangeText={healthConditions => setDraft({ ...draft, healthConditions })} placeholder="For example: kidney condition, pregnancy, fluid restriction" placeholderTextColor="#94A3B8" multiline maxLength={500} />
              <View style={styles.switchRow}>
                <View style={styles.switchCopy}>
                  <Text style={styles.switchTitle}>I take medication</Text>
                  <Text style={styles.switchSubtitle}>Keep a simple reminder note in your profile</Text>
                </View>
                <Switch value={draft.takesMedication === true} onValueChange={takesMedication => setDraft({ ...draft, takesMedication })} trackColor={{ false: '#CBD5E1', true: '#0284C7' }} />
              </View>
              {draft.takesMedication && (
                <>
                  <Text style={styles.label}>Medication notes</Text>
                  <TextInput style={[styles.input, styles.multiline]} value={draft.medicationNotes || ''} onChangeText={medicationNotes => setDraft({ ...draft, medicationNotes })} placeholder="Medicine name, timing, or reminder note" placeholderTextColor="#94A3B8" multiline maxLength={500} />
                </>
              )}
              <Text style={styles.label}>Medical appointment notes</Text>
              <TextInput style={[styles.input, styles.multiline]} value={draft.appointmentNotes || ''} onChangeText={appointmentNotes => setDraft({ ...draft, appointmentNotes })} placeholder="Upcoming appointment or follow-up note" placeholderTextColor="#94A3B8" multiline maxLength={500} />
              <Text style={styles.calendarHint}>Calendar connection will be added as a separate, permission-based feature.</Text>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={save} activeOpacity={0.85}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>SAVE PROFILE</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E2E8F0', backgroundColor: '#FFFFFF' },
  iconButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F5F9' },
  headerCopy: { flex: 1, marginHorizontal: 12 },
  title: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  subtitle: { fontSize: 12, color: '#64748B', marginTop: 1 },
  saveHeader: { paddingHorizontal: 8, paddingVertical: 10 },
  saveHeaderText: { fontSize: 15, fontWeight: '800', color: '#0284C7' },
  scroll: { padding: 20, paddingBottom: 44 },
  privacyNote: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', backgroundColor: '#E0F2FE', borderRadius: 16, padding: 14, marginBottom: 22 },
  privacyText: { flex: 1, fontSize: 13, lineHeight: 19, color: '#075985', fontWeight: '600' },
  sectionLabel: { fontSize: 12, fontWeight: '900', letterSpacing: 0.8, color: '#64748B', marginBottom: 9, marginLeft: 2 },
  card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 22, padding: 18, marginBottom: 22 },
  label: { fontSize: 13, fontWeight: '800', color: '#334155', marginBottom: 7, marginTop: 6 },
  input: { minHeight: 48, borderRadius: 14, borderWidth: 1.5, borderColor: '#CBD5E1', paddingHorizontal: 14, fontSize: 15, color: '#0F172A', backgroundColor: '#FFFFFF', marginBottom: 12 },
  multiline: { minHeight: 88, paddingTop: 13, textAlignVertical: 'top' },
  choiceRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  choice: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 14, backgroundColor: '#F1F5F9', borderWidth: 1.5, borderColor: '#E2E8F0' },
  choiceActive: { backgroundColor: '#E0F2FE', borderColor: '#0284C7' },
  choiceText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  choiceTextActive: { color: '#0369A1' },
  twoColumns: { flexDirection: 'row', gap: 10 },
  column: { flex: 1 },
  switchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, marginBottom: 8 },
  switchCopy: { flex: 1, paddingRight: 12 },
  switchTitle: { fontSize: 15, fontWeight: '800', color: '#1E293B' },
  switchSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  calendarHint: { fontSize: 12, lineHeight: 18, color: '#64748B', fontStyle: 'italic' },
  saveButton: { minHeight: 54, borderRadius: 18, backgroundColor: '#0284C7', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
});
