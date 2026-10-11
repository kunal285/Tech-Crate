import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import SafeImage from '../../components/common/SafeImage';
import { useCartStore } from '../../store/cartStore';

export default function ProjectDetailScreen({ route, navigation }) {
  const { project } = route.params || {};
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'BOM' | 'Circuit' | 'Code'
  const addToCart = useCartStore((state) => state.addToCart);

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Project Details" showBack />
      </SafeAreaView>
    );
  }

  const handleBuyKit = async () => {
    await addToCart({
      projectKitId: project._id,
      itemType: 'kit',
      quantity: 1,
      price: project.price,
      title: project.title,
      image: project.images?.[0],
    });
    Alert.alert('Kit Added to Cart', `${project.title} kit added with all required components!`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={project.title} showBack />
      
      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        {['Overview', 'BOM', 'Circuit', 'Code'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === 'Overview' && (
          <View style={styles.section}>
            <SafeImage source={project.images?.[0] || 'https://via.placeholder.com/300'} style={styles.heroImage} />
            <Text style={styles.title}>{project.title}</Text>
            <Text style={styles.description}>{project.description}</Text>

            <Text style={styles.sectionHeading}>Step-by-Step Guide</Text>
            {project.stepByStepGuide?.map((step, idx) => (
              <View key={idx} style={styles.stepCard}>
                <Text style={styles.stepNum}>Step {step.stepNumber || idx + 1}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepContent}>{step.content}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'BOM' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Bill of Materials (BOM)</Text>
            {project.componentsRequired?.map((comp, idx) => (
              <View key={idx} style={styles.bomRow}>
                <View>
                  <Text style={styles.compName}>{comp.name}</Text>
                  <Text style={styles.compQty}>Quantity: x{comp.quantity}</Text>
                </View>
                <Text style={styles.compPrice}>₹{comp.unitPrice || 149}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'Circuit' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>Schematic & Pinout Diagram</Text>
            <SafeImage
              source={project.circuitDiagramUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80'}
              style={styles.circuitImage}
            />
            <Text style={styles.circuitNote}>Ensure 3.3V / 5V voltage rails match component ratings before powering on.</Text>
          </View>
        )}

        {activeTab === 'Code' && (
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>C++ Firmware Source Code</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{project.codeSnippet || '// C++ Code loading...'}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Buy Kit Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.kitPriceLabel}>Complete Project Kit</Text>
          <Text style={styles.kitPriceVal}>₹{project.price}</Text>
        </View>
        <Button title="Buy Complete Kit" onPress={handleBuyKit} style={{ paddingHorizontal: 20 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  tabBar: { flexDirection: 'row', backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: colors.primary },
  tabText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' },
  tabTextActive: { color: colors.primary, fontWeight: '800' },
  scrollContent: { padding: 16, paddingBottom: 100 },
  section: { gap: 12 },
  heroImage: { width: '100%', height: 200, borderRadius: 12, resizeMode: 'cover' },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  description: { fontSize: 14, color: colors.textSecondary, lineHeight: 20 },
  sectionHeading: { fontSize: 16, fontWeight: '800', color: colors.text, marginTop: 12 },
  stepCard: { backgroundColor: colors.surface, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  stepNum: { color: colors.primary, fontSize: 11, fontWeight: '800', uppercase: true },
  stepTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginTop: 2 },
  stepContent: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 18 },
  bomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  compName: { fontSize: 14, fontWeight: '700', color: colors.text },
  compQty: { fontSize: 12, color: colors.textTertiary, marginTop: 2 },
  compPrice: { fontSize: 14, fontWeight: '800', color: colors.primary },
  circuitImage: { width: '100%', height: 240, borderRadius: 12, resizeMode: 'contain', backgroundColor: colors.surface },
  circuitNote: { fontSize: 12, color: colors.warning, backgroundColor: colors.warning + '15', padding: 10, borderRadius: 8 },
  codeBox: { backgroundColor: '#0f172a', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  codeText: { color: '#38bdf8', fontFamily: 'monospace', fontSize: 12 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, padding: 16, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  kitPriceLabel: { color: colors.textSecondary, fontSize: 11 },
  kitPriceVal: { color: colors.primary, fontSize: 20, fontWeight: '900' },
});
