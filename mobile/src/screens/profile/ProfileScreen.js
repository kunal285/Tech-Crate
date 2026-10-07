import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Package,
  Heart,
  Zap,
  Store,
  GraduationCap,
  ChevronRight,
  LogOut,
  Phone,
  Mail,
  Copy,
  ShieldCheck,
  Bell,
  MapPin,
  HelpCircle,
  User,
} from 'lucide-react-native';
import Header from '../../components/common/Header';
import SafeImage from '../../components/common/SafeImage';
import { Colors } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to log out of your session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (err) {
              console.warn('Logout error:', err);
            }
          },
        },
      ]
    );
  };

  const handleCopyUserId = () => {
    const idToCopy = user?._id || user?.id || 'PK-USER-7492';
    Alert.alert('Maker ID Copied', `ID: ${idToCopy}\n(Copied to clipboard reference)`);
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+918005553420').catch(() => {
      Alert.alert('TechCrate Helpline', 'Contact us at: +91 800 555 3420');
    });
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:support@TechCrate.com?subject=TechCrate Mobile App Inquiry').catch(() => {
      Alert.alert('TechCrate Support', 'Email us at: support@TechCrate.com');
    });
  };

  const menuSections = [
    {
      title: 'Orders & Shopping',
      items: [
        {
          title: 'My Orders & Shipments',
          subtitle: 'Track live status & past hardware orders',
          IconComp: Package,
          action: () => navigation.navigate('Orders'),
        },
        {
          title: 'My Saved Wishlist',
          subtitle: 'Components, boards & kits saved for later',
          IconComp: Heart,
          action: () => navigation.navigate('Wishlist'),
        },
        {
          title: 'Saved Addresses',
          subtitle: 'Campus, hostel & home delivery addresses',
          IconComp: MapPin,
          action: () => navigation.navigate('Addresses'),
        },
      ],
    },
    {
      title: 'Maker & Developer Tools',
      items: [
        {
          title: 'Engineering Project Hub',
          subtitle: 'IoT, Robotics & Embedded systems builders',
          IconComp: Zap,
          action: () => navigation.navigate('ProjectsTab', { screen: 'ProjectHub' }),
        },
        {
          title: 'Notifications & Alerts',
          subtitle: 'Order tracking & exclusive maker deals',
          IconComp: Bell,
          action: () => navigation.navigate('Notifications'),
        },
      ],
    },
  ];

  const displayName = user?.name || user?.fullName || 'Maker Engineer';
  const displayEmail = user?.email || 'maker@TechCrate.com';
  const displayPhone = user?.phone || user?.phoneNumber || '+91 98765 43210';
  const userRole = (user?.role || 'Customer').toUpperCase();

  return (
    <View style={styles.container}>
      <Header title="Maker Account" />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 60 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <SafeImage
              source={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'}
              style={styles.avatar}
              resizeMode="cover"
              placeholderIcon={User}
            />
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{userRole}</Text>
            </View>
          </View>

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>

          {/* User ID copy row */}
          <TouchableOpacity
            style={styles.idCopyPill}
            onPress={handleCopyUserId}
            activeOpacity={0.7}
            accessibilityLabel="Copy User ID"
          >
            <Text style={styles.idCopyText}>
              ID: {String(user?._id || user?.id || 'PK-USR-9281').slice(-10)}
            </Text>
            <Copy size={12} color="#0284C7" />
          </TouchableOpacity>

          {/* College / Organization Tag */}
          <View style={styles.collegeBadge}>
            <GraduationCap size={14} color="#1E3A5F" style={styles.collegeIcon} />
            <Text style={styles.collegeText}>
              {user?.college || 'BITS Pilani / Engineering Institute'}
            </Text>
          </View>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sIdx) => (
          <View key={sIdx} style={styles.sectionContainer}>
            <Text style={styles.sectionHeading}>{section.title}</Text>
            <View style={styles.menuBox}>
              {section.items.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.menuRow,
                    idx === section.items.length - 1 && styles.menuRowLast,
                  ]}
                  activeOpacity={0.7}
                  onPress={item.action}
                  accessibilityLabel={item.title}
                >
                  <View style={styles.menuIconCircle}>
                    <item.IconComp size={18} color="#1E3A5F" />
                  </View>
                  <View style={styles.menuTextCol}>
                    <Text style={styles.menuTitle}>{item.title}</Text>
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  </View>
                  <ChevronRight size={17} color="#94A3B8" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Direct Contact Support Strip with clickable phone and email */}
        <View style={styles.supportCard}>
          <View style={styles.supportHeader}>
            <HelpCircle size={17} color="#0284C7" />
            <Text style={styles.supportTitle}>Customer Support Hotline</Text>
          </View>
          <Text style={styles.supportSubtitle}>
            Have questions about component compatibility, specs or shipping?
          </Text>

          <View style={styles.contactRow}>
            <TouchableOpacity
              style={styles.contactBtn}
              onPress={handleCallSupport}
              activeOpacity={0.7}
              accessibilityLabel="Call support phone"
            >
              <Phone size={14} color="#059669" />
              <Text style={styles.contactBtnText}>+91 800 555 3420</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactBtn}
              onPress={handleEmailSupport}
              activeOpacity={0.7}
              accessibilityLabel="Email support"
            >
              <Mail size={14} color="#0284C7" />
              <Text style={styles.contactBtnText}>support@TechCrate.com</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
          accessibilityLabel="Log out of account"
        >
          <LogOut size={16} color="#DC2626" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Sign Out of Session</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2.5,
    borderColor: '#1E3A5F',
  },
  roleBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    backgroundColor: '#1E3A5F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
  },
  email: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  idCopyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 8,
  },
  idCopyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0369A1',
  },
  collegeBadge: {
    marginTop: 10,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  collegeIcon: {
    marginRight: 6,
  },
  collegeText: {
    color: '#1E3A5F',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionContainer: {
    gap: 8,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  menuBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  menuSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  supportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  supportTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  supportSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 8,
  },
  contactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 9,
    borderRadius: 10,
  },
  contactBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#FECACA',
    marginTop: 4,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '800',
  },
});
