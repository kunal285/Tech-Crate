import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { CheckCircle2, AlertTriangle, Plus, Check } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { projectService } from '../../services/projectService';

export default function CompatibilityCheckerScreen({ navigation }) {
  const availableComponents = [
    'ESP32 NodeMCU Board (3.3V Logic)',
    'Arduino UNO R3 Board (5V Logic)',
    'L298N Motor Driver Module',
    'HC-SR04 Ultrasonic Sensor',
    '0.96 inch I2C OLED Display',
    'DHT11 Temperature Sensor',
    'SG90 Micro Servo Motor',
    '5V Relay Module',
  ];

  const [selected, setSelected] = useState([
    'ESP32 NodeMCU Board (3.3V Logic)',
    '0.96 inch I2C OLED Display',
  ]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const toggleSelect = (comp) => {
    if (selected.includes(comp)) {
      setSelected(selected.filter((c) => c !== comp));
    } else {
      setSelected([...selected, comp]);
    }
  };

  const handleCheck = async () => {
    if (selected.length < 2) {
      alert('Select at least 2 components to test electrical compatibility');
      return;
    }

    try {
      setLoading(true);
      const res = await projectService.checkCompatibility(selected);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="AI Pin & Voltage Checker" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.heading}>Select Hardware Components</Text>
        <Text style={styles.subheading}>Pick components to verify logic voltage levels & pin conflicts</Text>

        <View style={styles.chipGrid}>
          {availableComponents.map((comp) => {
            const isSelected = selected.includes(comp);
            return (
              <TouchableOpacity
                key={comp}
                style={[styles.chip, isSelected && styles.chipSelected]}
                onPress={() => toggleSelect(comp)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {isSelected ? (
                    <Check size={14} color={colors.primary} style={{ marginRight: 6 }} />
                  ) : (
                    <Plus size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
                  )}
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {comp}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title={loading ? 'Analyzing Pinouts...' : 'Run Compatibility Verification'}
          loading={loading}
          onPress={handleCheck}
          style={{ marginVertical: 20 }}
        />

        {/* Diagnostic Results Box */}
        {result && (
          <View style={[styles.resultCard, result.compatible ? styles.successCard : styles.warningCard]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              {result.compatible ? (
                <CheckCircle2 size={20} color={colors.success} style={{ marginRight: 8 }} />
              ) : (
                <AlertTriangle size={20} color={colors.warning} style={{ marginRight: 8 }} />
              )}
              <Text style={styles.resultTitle}>
                {result.compatible ? '100% Compatible Circuit Design' : 'Potential Voltage / Wiring Issue'}
              </Text>
            </View>
            <Text style={styles.resultScore}>Compatibility Score: {result.score || 95}/100</Text>
            <Text style={styles.resultText}>{result.recommendation}</Text>

            {result.warnings?.map((w, idx) => (
              <Text key={idx} style={styles.warningText}>
                • {w}
              </Text>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollContent: { padding: 16 },
  heading: { fontSize: 18, fontWeight: '800', color: colors.text },
  subheading: { fontSize: 12, color: colors.textSecondary, marginTop: 2, marginBottom: 16 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  chipSelected: { backgroundColor: colors.primary + '20', borderColor: colors.primary },
  chipText: { color: colors.textSecondary, fontSize: 13, fontWeight: '600' },
  chipTextSelected: { color: colors.primary, fontWeight: '800' },
  resultCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginTop: 10 },
  successCard: { backgroundColor: colors.success + '15', borderColor: colors.success },
  warningCard: { backgroundColor: colors.warning + '15', borderColor: colors.warning },
  resultTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 },
  resultScore: { fontSize: 13, fontWeight: '700', color: colors.primary, marginBottom: 8 },
  resultText: { fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 8 },
  warningText: { fontSize: 12, color: colors.warning, marginTop: 4 },
});
