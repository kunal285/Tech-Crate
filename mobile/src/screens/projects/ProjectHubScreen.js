import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Clock, Wrench, ChevronRight } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/common/Header';
import SafeImage from '../../components/common/SafeImage';
import { projectService } from '../../services/projectService';

export default function ProjectHubScreen({ navigation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'IoT', 'Robotics', 'Embedded Systems', 'Automation'];

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const res = await projectService.getProjects(selectedCategory === 'All' ? '' : selectedCategory);
      const projectList = Array.isArray(res) ? res : (res?.data?.projects || res?.data || []);
      setProjects(Array.isArray(projectList) ? projectList : []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Engineering Project Hub"
        rightAction="Checker"
        onRightActionPress={() => navigation.navigate('CompatibilityChecker')}
      />

      {/* Categories Horizontal Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryPill, selectedCategory === cat && styles.categoryPillActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {projects.map((project) => (
            <TouchableOpacity
              key={project._id}
              style={styles.projectCard}
              onPress={() =>
                navigation.navigate('ProjectDetail', {
                  projectId: project._id || project.id,
                  kitId: project._id || project.id,
                  id: project._id || project.id,
                  project,
                  kit: project,
                })
              }
            >
              <SafeImage
                source={project.images || project.image || project.imageUrl}
                style={styles.projectImage}
                resizeMode="cover"
                placeholderIcon={Wrench}
                placeholderText={project.category || 'Project'}
              />
              <View style={styles.projectBody}>
                <View style={styles.badgeRow}>
                  <Text style={styles.difficultyBadge}>{project.difficulty}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} color={colors.textTertiary} />
                    <Text style={styles.timeBadge}>{project.estimatedTimeHours || 4}h Build</Text>
                  </View>
                </View>
                <Text style={styles.projectTitle}>{project.title}</Text>
                <Text style={styles.projectSubtitle} numberOfLines={2}>{project.subtitle || project.description}</Text>

                <View style={styles.projectFooter}>
                  <Text style={styles.price}>₹{project.price}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.buyKitBtn}>View Kit & Schematic </Text>
                    <ChevronRight size={14} color={colors.primary} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  categoryScroll: { paddingHorizontal: 16, marginVertical: 8, maxHeight: 44 },
  categoryPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.surface, marginRight: 8, borderWidth: 1, borderColor: colors.border },
  categoryPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  categoryText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  categoryTextActive: { color: colors.surface },
  scrollContent: { padding: 16 },
  projectCard: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, marginBottom: 16, overflow: 'hidden' },
  projectImage: { width: '100%', height: 160, resizeMode: 'cover' },
  projectBody: { padding: 16 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  difficultyBadge: { backgroundColor: colors.primary + '20', color: colors.primary, fontSize: 11, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  timeBadge: { color: colors.textTertiary, fontSize: 11, fontWeight: '600' },
  projectTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 4 },
  projectSubtitle: { fontSize: 12, color: colors.textSecondary, lineHeight: 18, marginBottom: 12 },
  projectFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  price: { fontSize: 18, fontWeight: '900', color: colors.primary },
  buyKitBtn: { fontSize: 12, fontWeight: '800', color: colors.primary },
});
