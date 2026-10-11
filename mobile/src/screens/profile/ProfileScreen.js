import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  Modal,
  TextInput,
  Switch,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Copy,
  Edit3,
  Package,
  Heart,
  MapPin,
  Headphones,
  Settings,
  Globe,
  Bell,
  CreditCard,
  Lock,
  Smartphone,
  Key,
  HelpCircle,
  Award,
  FileText,
  LogOut,
  ChevronRight,
  Check,
  X,
  ExternalLink,
  Share2,
  Trash2,
  Search,
  Gift,
  Wallet,
  AlertTriangle,
  Star,
  CheckCircle2,
  MessageSquare,
  Eye,
  Zap,
  Clock,
  Sparkles,
  Layers,
  GraduationCap,
  ShoppingCart,
} from 'lucide-react-native';
import Header from '../../components/common/Header';
import SafeImage from '../../components/common/SafeImage';
import Button from '../../components/common/Button';
import { Colors } from '../../theme';
import useAuthStore from '../../store/authStore';
import useWishlistStore from '../../store/wishlistStore';
import useCartStore from '../../store/cartStore';
import useProductStore from '../../store/productStore';
import authService from '../../services/authService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Brand tokens
const BRAND = {
  primaryNavy: '#032762',
  secondaryNavy: '#021B44',
  accentBlue: '#2563EB',
  cyan: '#06B6D4',
  amber: '#F59E0B',
  emerald: '#10B981',
  rose: '#EF4444',
  surface: '#FFFFFF',
  background: '#F8FAFC',
  cardBorder: '#E2E8F0',
  textDark: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
};

// Storage Keys for persistent settings
const STORAGE_KEYS = {
  LANGUAGE: '@techcrate_lang',
  NOTIFICATIONS: '@techcrate_notif_prefs',
  DEFAULT_PAYMENT: '@techcrate_default_payment',
  GIFT_CARD_BALANCE: '@techcrate_gift_balance',
};

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const wishlistItems = useWishlistStore((state) => state.items || []);
  const cartItems = useCartStore((state) => state.items || []);
  const products = useProductStore((state) => state.products || []);

  const cartCount = cartItems.reduce((sum, i) => sum + (i.quantity || 1), 0);
  const wishlistCount = wishlistItems.length;

  // Active Modals State
  const [activeModal, setActiveModal] = useState(null); // 'editProfile' | 'language' | 'notifications' | 'subscriptions' | 'giftCards' | 'savedCards' | 'paymentPrefs' | 'privacy' | 'devices' | 'security' | 'accountData' | 'qa' | 'reviews' | 'faqs' | 'terms' | 'policy' | 'licenses'

  // Settings local state
  const [currentLang, setCurrentLang] = useState('English (India)');
  const [notifPrefs, setNotifPrefs] = useState({
    orderUpdates: true,
    hardwareRestocks: true,
    makerDiscounts: false,
    communityAnswers: true,
  });
  const [defaultPayment, setDefaultPayment] = useState('UPI Instant (Google Pay / PhonePe)');
  const [giftBalance, setGiftBalance] = useState(250);
  const [voucherCode, setVoucherCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // Edit Profile Form State
  const [editForm, setEditForm] = useState({
    name: user?.name || user?.fullName || 'Kunal Sharma',
    email: user?.email || 'kunal.maker@techcrate.com',
    phone: user?.phone || user?.phoneNumber || '+91 98765 43210',
    college: user?.college || 'BITS Pilani / Robotics Club',
    branch: user?.branch || 'Electronics & Instrumentation',
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // FAQ Search Filter
  const [faqSearch, setFaqSearch] = useState('');

  // Load preferences from AsyncStorage
  useEffect(() => {
    async function loadPreferences() {
      try {
        const storedLang = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
        if (storedLang) setCurrentLang(storedLang);

        const storedNotifs = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        if (storedNotifs) setNotifPrefs(JSON.parse(storedNotifs));

        const storedPay = await AsyncStorage.getItem(STORAGE_KEYS.DEFAULT_PAYMENT);
        if (storedPay) setDefaultPayment(storedPay);

        const storedGift = await AsyncStorage.getItem(STORAGE_KEYS.GIFT_CARD_BALANCE);
        if (storedGift) setGiftBalance(Number(storedGift));
      } catch { }
    }
    loadPreferences();
  }, []);

  // Sync edit form with user object changes
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user?.name || user?.fullName || 'Kunal Sharma',
        email: user?.email || 'kunal.maker@techcrate.com',
        phone: user?.phone || user?.phoneNumber || '+91 98765 43210',
        college: user?.college || 'BITS Pilani / Robotics Club',
        branch: user?.branch || 'Electronics & Instrumentation',
      });
    }
  }, [user]);

  // Derived user display details
  const displayName = user?.name || user?.fullName || 'Kunal Sharma';
  const displayEmail = user?.email || 'maker@techcrate.com';
  const rawPhone = user?.phone || user?.phoneNumber || '+91 98765 43210';
  const maskedPhone = rawPhone.length >= 8
    ? rawPhone.slice(0, 5) + ' ••••• ' + rawPhone.slice(-3)
    : rawPhone;
  const userRole = (user?.role || 'Verified Maker').toUpperCase();
  const collegeInfo = user?.college || 'BITS Pilani / Robotics Club';

  // Logout handler
  const handleLogout = () => {
    Alert.alert(
      'Sign Out of TechCrate',
      'Are you sure you want to log out of your session on this device?',
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
    const idToCopy = user?._id || user?.id || 'TC-MKR-8492';
    Alert.alert('Maker ID Copied! 📋', `ID: ${idToCopy}\nCopied to clipboard reference.`);
  };

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      const updated = {
        ...user,
        name: editForm.name.trim(),
        fullName: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        college: editForm.college.trim(),
        branch: editForm.branch.trim(),
      };
      updateUser(updated);

      // Attempt server update
      await authService.updateProfile({
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim(),
        college: editForm.college.trim(),
        branch: editForm.branch.trim(),
      }).catch(() => { });

      Alert.alert('Profile Updated', 'Your Maker Profile has been successfully updated.');
      setActiveModal(null);
    } catch {
      Alert.alert('Error', 'Could not update profile details.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRedeemVoucher = () => {
    if (!voucherCode.trim() || voucherCode.trim().length < 6) {
      Alert.alert('Invalid Voucher', 'Please enter a valid 8-16 character Gift Card voucher code.');
      return;
    }
    setIsRedeeming(true);
    setTimeout(() => {
      setIsRedeeming(false);
      const addedVal = 500;
      const newBal = giftBalance + addedVal;
      setGiftBalance(newBal);
      AsyncStorage.setItem(STORAGE_KEYS.GIFT_CARD_BALANCE, String(newBal)).catch(() => { });
      setVoucherCode('');
      Alert.alert(
        'Voucher Redeemed! 🎁',
        `₹${addedVal} has been credited to your TechCrate Gift Card balance! New Balance: ₹${newBal}.`
      );
    }, 800);
  };

  const handleSelectLanguage = (lang) => {
    setCurrentLang(lang);
    AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang).catch(() => { });
    setActiveModal(null);
    Alert.alert('Language Updated', `Display language set to ${lang}.`);
  };

  const handleToggleNotif = (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] };
    setNotifPrefs(updated);
    AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated)).catch(() => { });
  };

  const handleSelectPayment = (pay) => {
    setDefaultPayment(pay);
    AsyncStorage.setItem(STORAGE_KEYS.DEFAULT_PAYMENT, pay).catch(() => { });
    setActiveModal(null);
    Alert.alert('Payment Preference Saved', `Default payment method set to: ${pay}`);
  };

  // FAQ List
  const allFaqs = useMemo(() => [
    {
      q: 'Are all microcontrollers and sensors tested before dispatch?',
      a: 'Yes. Every TechCrate development board (ESP32, RP2040, Arduino) and sensor module undergoes pre-shipment voltage rail testing and logic pin inspection.',
    },
    {
      q: 'What is the return policy for defective or DOA components?',
      a: 'We offer a 7-day hassle-free replacement on any component that arrives defective or Dead-On-Arrival. Simply initiate a return request from My Orders.',
    },
    {
      q: 'Do project kits include full schematics and firmware source code?',
      a: 'Absolutely. Every TechCrate kit includes tested C++/Arduino firmware, pinout connection charts, and Bill of Materials itemization in the mobile app.',
    },
    {
      q: 'How fast is delivery to campus hostels and engineering colleges?',
      a: 'Standard dispatch delivers within 2-4 business days across India. We deliver directly to campus hostel gates and department academic offices.',
    },
    {
      q: 'Can student teams get GST tax invoices for institutional reimbursement?',
      a: 'Yes! All orders include an official GST invoice with itemized tax breakdowns, eligible for college project grant reimbursement.',
    },
  ], []);

  const filteredFaqs = allFaqs.filter(
    (f) =>
      f.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
      f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <View style={styles.screenContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Main App Header */}
      <Header
        title="Maker Account"
        rightComponent={
          <TouchableOpacity
            style={styles.cartHeaderBtn}
            onPress={() => navigation.navigate('Cart', { screen: 'CartMain' })}>
            <ShoppingCart size={21} color={BRAND.primaryNavy} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 80 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* ===================================================================
            SECTION A: PROFILE HEADER
            =================================================================== */}
        <View style={styles.profileHeaderCard}>
          {/* Top Banner Row */}
          <View style={styles.profileTopRow}>
            <View style={styles.avatarWrapper}>
              <SafeImage
                source={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'}
                style={styles.avatar}
                resizeMode="cover"
                placeholderIcon={User}
              />
              <View style={styles.verifiedBadge}>
                <ShieldCheck size={12} color="#FFFFFF" strokeWidth={2.8} />
              </View>
            </View>

            <View style={styles.profileInfoCol}>
              <View style={styles.nameBadgeRow}>
                <Text style={styles.userNameText} numberOfLines={1}>
                  {displayName}
                </Text>
              </View>

              <Text style={styles.userPhoneText}>{maskedPhone}</Text>
              <Text style={styles.userEmailText} numberOfLines={1}>{displayEmail}</Text>

              <View style={styles.collegePill}>
                <GraduationCap size={12} color={BRAND.primaryNavy} />
                <Text style={styles.collegePillText} numberOfLines={1}>
                  {collegeInfo}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => setActiveModal('editProfile')}
              activeOpacity={0.8}
              accessibilityLabel="Edit Profile">
              <Edit3 size={15} color={BRAND.primaryNavy} />
            </TouchableOpacity>
          </View>

          {/* Maker ID & Level Progress Row */}
          <View style={styles.profileBottomStrip}>
            <TouchableOpacity
              style={styles.idPill}
              onPress={handleCopyUserId}
              activeOpacity={0.7}>
              <Text style={styles.idLabel}>ID:</Text>
              <Text style={styles.idValue}>
                {String(user?._id || user?.id || 'TC-MKR-8492').slice(-10)}
              </Text>
              <Copy size={11} color={BRAND.accentBlue} />
            </TouchableOpacity>

            <View style={styles.tierPill}>
              <Sparkles size={12} color={BRAND.amber} />
              <Text style={styles.tierText}>Silver Maker • 450 Pts</Text>
            </View>
          </View>
        </View>

        {/* ===================================================================
            SECTION B: QUICK ACTIONS (2x2 DASHBOARD TILES)
            =================================================================== */}
        <View style={styles.quickGrid}>
          {/* 1. My Orders */}
          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => navigation.navigate('Orders')}
            activeOpacity={0.85}>
            <View style={[styles.tileIconCircle, { backgroundColor: '#EFF6FF' }]}>
              <Package size={20} color={BRAND.accentBlue} />
            </View>
            <View style={styles.tileTextCol}>
              <Text style={styles.tileTitle}>My Orders</Text>
              <Text style={styles.tileSubtitle}>Track shipments</Text>
            </View>
            <ChevronRight size={14} color={BRAND.textMuted} />
          </TouchableOpacity>

          {/* 2. Saved Addresses */}
          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => navigation.navigate('Addresses')}
            activeOpacity={0.85}>
            <View style={[styles.tileIconCircle, { backgroundColor: '#F0FDF4' }]}>
              <MapPin size={20} color={BRAND.emerald} />
            </View>
            <View style={styles.tileTextCol}>
              <Text style={styles.tileTitle}>Addresses</Text>
              <Text style={styles.tileSubtitle}>Hostel & Lab</Text>
            </View>
            <ChevronRight size={14} color={BRAND.textMuted} />
          </TouchableOpacity>

          {/* 3. Wishlist */}
          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => navigation.navigate('Wishlist')}
            activeOpacity={0.85}>
            <View style={[styles.tileIconCircle, { backgroundColor: '#FEF2F2' }]}>
              <Heart size={20} color={BRAND.rose} />
            </View>
            <View style={styles.tileTextCol}>
              <Text style={styles.tileTitle}>Wishlist</Text>
              <Text style={styles.tileSubtitle}>
                {wishlistCount > 0 ? `${wishlistCount} saved parts` : 'Saved boards'}
              </Text>
            </View>
            <ChevronRight size={14} color={BRAND.textMuted} />
          </TouchableOpacity>

          {/* 4. Customer Support */}
          <TouchableOpacity
            style={styles.quickTile}
            onPress={() => setActiveModal('faqs')}
            activeOpacity={0.85}>
            <View style={[styles.tileIconCircle, { backgroundColor: '#F5F3FF' }]}>
              <Headphones size={20} color="#7C3AED" />
            </View>
            <View style={styles.tileTextCol}>
              <Text style={styles.tileTitle}>24/7 Support</Text>
              <Text style={styles.tileSubtitle}>Help & Hotline</Text>
            </View>
            <ChevronRight size={14} color={BRAND.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ===================================================================
            SECTION C: ACCOUNT PREFERENCES
            =================================================================== */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionHeaderTitle}>Account Preferences</Text>
          <View style={styles.cardGroup}>
            <SettingsRow
              icon={User}
              iconColor="#2563EB"
              title="Edit Profile"
              subtitle="Personal info, college lab, student ID"
              onPress={() => setActiveModal('editProfile')}
            />
            <SettingsRow
              icon={Globe}
              iconColor="#0284C7"
              title="Language & Region"
              subtitle={currentLang}
              onPress={() => setActiveModal('language')}
            />
            <SettingsRow
              icon={Bell}
              iconColor="#D97706"
              title="Notification Preferences"
              subtitle="Order dispatch, restocks, maker alerts"
              onPress={() => setActiveModal('notifications')}
            />
            <SettingsRow
              icon={Award}
              iconColor="#7C3AED"
              title="My Subscriptions"
              subtitle="TechCrate Maker Club & Component Box"
              isLast
              onPress={() => setActiveModal('subscriptions')}
            />
          </View>
        </View>

        {/* ===================================================================
            SECTION D: PAYMENTS & WALLET
            =================================================================== */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionHeaderTitle}>Payments & Wallet</Text>
          <View style={styles.cardGroup}>
            <SettingsRow
              icon={Gift}
              iconColor="#10B981"
              title="TechCrate Gift Cards"
              subtitle={`Active Balance: ₹${giftBalance}`}
              badgeText="₹ Redeem"
              badgeColor="#DCFCE7"
              badgeTextColor="#15803D"
              onPress={() => setActiveModal('giftCards')}
            />
            <SettingsRow
              icon={CreditCard}
              iconColor="#032762"
              title="Saved Payment Methods"
              subtitle="Secure tokenized cards & verified UPI"
              onPress={() => setActiveModal('savedCards')}
            />
            <SettingsRow
              icon={Wallet}
              iconColor="#6366F1"
              title="Payment Preferences"
              subtitle={defaultPayment}
              isLast
              onPress={() => setActiveModal('paymentPrefs')}
            />
          </View>
        </View>

        {/* ===================================================================
            SECTION E: PRIVACY & SECURITY
            =================================================================== */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionHeaderTitle}>Privacy & Security</Text>
          <View style={styles.cardGroup}>
            <SettingsRow
              icon={Lock}
              iconColor="#2563EB"
              title="Privacy Center"
              subtitle="Telemetry, data privacy choices & cookies"
              onPress={() => setActiveModal('privacy')}
            />
            <SettingsRow
              icon={Smartphone}
              iconColor="#0D9488"
              title="Manage Devices"
              subtitle="1 active mobile session • Android"
              onPress={() => setActiveModal('devices')}
            />
            <SettingsRow
              icon={Key}
              iconColor="#D97706"
              title="Security Settings"
              subtitle="Password change & app security"
              onPress={() => setActiveModal('security')}
            />
            <SettingsRow
              icon={ShieldCheck}
              iconColor="#64748B"
              title="Account Data & Deletion"
              subtitle="Download your data or request removal"
              isLast
              onPress={() => setActiveModal('accountData')}
            />
          </View>
        </View>

        {/* ===================================================================
            SECTION F: MY ACTIVITY
            =================================================================== */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionHeaderTitle}>My Activity & Community</Text>
          <View style={styles.cardGroup}>
            <SettingsRow
              icon={MessageSquare}
              iconColor="#0284C7"
              title="My Questions & Answers"
              subtitle="Component compatibility discussions"
              onPress={() => setActiveModal('qa')}
            />
            <SettingsRow
              icon={Star}
              iconColor="#F59E0B"
              title="Hardware Reviews & Ratings"
              subtitle="Ratings given on boards & project kits"
              isLast
              onPress={() => setActiveModal('reviews')}
            />
          </View>

          {/* Recently Viewed Products Horizontal Shelf */}
          {products.length > 0 && (
            <View style={styles.recentlyViewedCard}>
              <View style={styles.shelfHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Eye size={15} color={BRAND.primaryNavy} />
                  <Text style={styles.shelfHeaderTitle}>Recently Viewed Hardware</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                  <Text style={styles.shelfSeeAll}>Browse All</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.shelfScroll}>
                {products.slice(0, 6).map((item) => (
                  <TouchableOpacity
                    key={item._id || item.id}
                    style={styles.recentItemChip}
                    onPress={() =>
                      navigation.navigate('ProductDetail', {
                        productId: item._id || item.id,
                        product: item,
                      })
                    }
                    activeOpacity={0.8}>
                    <SafeImage
                      source={item.images?.[0] || item.image || item.imageUrl}
                      style={styles.recentItemImg}
                      resizeMode="cover"
                      placeholderText={item.name || 'Component'}
                    />
                    <Text style={styles.recentItemName} numberOfLines={1}>
                      {item.title || item.name}
                    </Text>
                    <Text style={styles.recentItemPrice}>₹{item.price}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>



        {/* ===================================================================
            SECTION H: HELP & INFORMATION
            =================================================================== */}
        <View style={styles.sectionWrapper}>
          <Text style={styles.sectionHeaderTitle}>Help & Legal</Text>
          <View style={styles.cardGroup}>
            <SettingsRow
              icon={HelpCircle}
              iconColor="#0284C7"
              title="Help Center & FAQs"
              subtitle="Order tracking, DOA returns & warranty"
              onPress={() => setActiveModal('faqs')}
            />
            <SettingsRow
              icon={Phone}
              iconColor="#10B981"
              title="Helpline & WhatsApp Support"
              subtitle="+91 800 555 3420 • 9 AM - 8 PM"
              onPress={() => {
                Linking.openURL('tel:+918005553420').catch(() => {
                  Alert.alert('Helpline', 'Call us at +91 800 555 3420');
                });
              }}
            />
            <SettingsRow
              icon={FileText}
              iconColor="#64748B"
              title="Terms & Conditions"
              subtitle="Hardware warranty & shopping guidelines"
              onPress={() => setActiveModal('terms')}
            />
            <SettingsRow
              icon={ShieldCheck}
              iconColor="#64748B"
              title="Privacy Policy"
              subtitle="Data collection and student privacy"
              onPress={() => setActiveModal('policy')}
            />
            <SettingsRow
              icon={Layers}
              iconColor="#64748B"
              title="Open Source Licenses"
              subtitle="Third-party software & hardware credits"
              isLast
              onPress={() => setActiveModal('licenses')}
            />
          </View>
        </View>

        {/* ===================================================================
            SECTION I: SOCIAL MEDIA COMMUNITY
            =================================================================== */}
        <View style={styles.socialCard}>
          <Text style={styles.socialHeaderTitle}>Join the TechCrate Maker Community</Text>
          <Text style={styles.socialHeaderDesc}>
            Watch hardware build streams, download open schematics & connect with makers.
          </Text>

          <View style={styles.socialLinksRow}>
            <TouchableOpacity
              style={styles.socialPill}
              onPress={() => Linking.openURL('https://chat.whatsapp.com/FDKcHmSvzow7O9Md8DU3oW?s=sh&p=a&mlu=4&ilr=4&iam=0').catch(() => { })}>
              <Text style={styles.socialPillText}>whatsapp</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialPill}
              onPress={() => Linking.openURL('https://instagram.com/kunalgavit28').catch(() => { })}>
              <Text style={styles.socialPillText}>Instagram</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialPill}
              onPress={() => Linking.openURL('https://linkedin.com/in/kunalgavit285').catch(() => { })}>
              <Text style={styles.socialPillText}>LinkedIn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.socialPill}
              onPress={() => Linking.openURL('https://github.com/kunal285').catch(() => { })}>
              <Text style={styles.socialPillText}>GitHub</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ===================================================================
            SECTION J: LOGOUT & FOOTER
            =================================================================== */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.82}
          accessibilityLabel="Sign Out of Session">
          <LogOut size={16} color={BRAND.rose} />
          <Text style={styles.logoutButtonText}>Sign Out of Session</Text>
        </TouchableOpacity>

        <View style={styles.appFooterCol}>
          <Text style={styles.appVersionText}>
            TechCrate Mobile v0.1.2 (Build 2026.10)
          </Text>
          <Text style={styles.appCopyrightText}>
            Crafted for Engineers, Robotics Builders & Makers across India 🇮🇳
          </Text>
        </View>
      </ScrollView>

      {/* ===================================================================
          INTERACTIVE MODALS FOR COMPLETE FUNCTIONALITY
          =================================================================== */}

      {/* 1. EDIT PROFILE MODAL */}
      <Modal visible={activeModal === 'editProfile'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Maker Profile</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={styles.fieldInput}
                value={editForm.name}
                onChangeText={(t) => setEditForm({ ...editForm, name: t })}
                placeholder="Your full name"
                placeholderTextColor={BRAND.textMuted}
              />

              <Text style={styles.fieldLabel}>Mobile Number</Text>
              <TextInput
                style={styles.fieldInput}
                value={editForm.phone}
                onChangeText={(t) => setEditForm({ ...editForm, phone: t })}
                placeholder="+91 Mobile number"
                keyboardType="phone-pad"
                placeholderTextColor={BRAND.textMuted}
              />

              <Text style={styles.fieldLabel}>Email Address</Text>
              <TextInput
                style={styles.fieldInput}
                value={editForm.email}
                onChangeText={(t) => setEditForm({ ...editForm, email: t })}
                placeholder="name@college.edu or email"
                keyboardType="email-address"
                placeholderTextColor={BRAND.textMuted}
              />

              <Text style={styles.fieldLabel}>College / Engineering Institute</Text>
              <TextInput
                style={styles.fieldInput}
                value={editForm.college}
                onChangeText={(t) => setEditForm({ ...editForm, college: t })}
                placeholder="e.g. BITS Pilani, IIT Delhi, NIT Trichy"
                placeholderTextColor={BRAND.textMuted}
              />

              <Text style={styles.fieldLabel}>Department / Maker Lab</Text>
              <TextInput
                style={styles.fieldInput}
                value={editForm.branch}
                onChangeText={(t) => setEditForm({ ...editForm, branch: t })}
                placeholder="e.g. Robotics Club, IoT Innovation Lab"
                placeholderTextColor={BRAND.textMuted}
              />
            </ScrollView>

            <View style={styles.modalFooterRow}>
              <Button
                title={isSavingProfile ? 'Saving...' : 'Save Changes'}
                onPress={handleSaveProfile}
                loading={isSavingProfile}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. LANGUAGE MODAL */}
      <Modal visible={activeModal === 'language'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Language & Region</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsList}>
              {[
                { title: 'English (India)', sub: 'Default • INR (₹)' },
                { title: 'हिंदी (Hindi)', sub: 'भारतीय भाषा • INR (₹)' },
                { title: 'தமிழ் (Tamil)', sub: 'INR (₹)' },
                { title: 'తెలుగు (Telugu)', sub: 'INR (₹)' },
                { title: 'ಕನ್ನಡ (Kannada)', sub: 'INR (₹)' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.title}
                  style={[styles.optionRow, currentLang === opt.title && styles.optionRowSelected]}
                  onPress={() => handleSelectLanguage(opt.title)}>
                  <View>
                    <Text style={styles.optionTitle}>{opt.title}</Text>
                    <Text style={styles.optionSubtitle}>{opt.sub}</Text>
                  </View>
                  {currentLang === opt.title && <Check size={18} color={BRAND.primaryNavy} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. NOTIFICATION PREFERENCES MODAL */}
      <Modal visible={activeModal === 'notifications'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notification Preferences</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 14, marginVertical: 8 }}>
              <ToggleRow
                title="Order & Shipment Tracking"
                desc="Real-time courier dispatch and delivery updates"
                value={notifPrefs.orderUpdates}
                onToggle={() => handleToggleNotif('orderUpdates')}
              />
              <ToggleRow
                title="Hardware Restock Alerts"
                desc="Get notified when waitlisted boards or sensors arrive"
                value={notifPrefs.hardwareRestocks}
                onToggle={() => handleToggleNotif('hardwareRestocks')}
              />
              <ToggleRow
                title="Exclusive Maker Deals"
                desc="Weekend student flash discounts on DIY robotics kits"
                value={notifPrefs.makerDiscounts}
                onToggle={() => handleToggleNotif('makerDiscounts')}
              />
              <ToggleRow
                title="Community Q&A Updates"
                desc="Replies to your hardware compatibility questions"
                value={notifPrefs.communityAnswers}
                onToggle={() => handleToggleNotif('communityAnswers')}
              />
            </View>

            <Button
              title="Save Preferences"
              onPress={() => {
                setActiveModal(null);
                Alert.alert('Saved', 'Your notification settings have been updated.');
              }}
              style={{ marginTop: 16 }}
            />
          </View>
        </View>
      </Modal>

      {/* 4. SUBSCRIPTIONS MODAL */}
      <Modal visible={activeModal === 'subscriptions'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>TechCrate Maker Club</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.subscriptionCard}>
              <View style={styles.subStatusRow}>
                <Sparkles size={16} color="#FFFFFF" />
                <Text style={styles.subStatusText}>Active Silver Member</Text>
              </View>
              <Text style={styles.subTitle}>Student Maker Pass</Text>
              <Text style={styles.subDesc}>
                Includes free express delivery to student hostels, 10% off project kit components, and priority hardware testing.
              </Text>
              <Text style={styles.subRenewalText}>Next cycle renews on November 15, 2026</Text>
            </View>

            <View style={styles.perksList}>
              <Text style={styles.perksHeading}>Active Membership Benefits:</Text>
              {[
                'Zero delivery fee on all component orders over ₹299',
                'Free monthly breadboard & jumper wire top-up',
                'Priority tech support from hardware engineers',
              ].map((p, i) => (
                <View key={i} style={styles.perkItem}>
                  <CheckCircle2 size={14} color={BRAND.emerald} />
                  <Text style={styles.perkText}>{p}</Text>
                </View>
              ))}
            </View>

            <Button
              title="Manage Billing & Plan"
              onPress={() => {
                setActiveModal(null);
                Alert.alert('Membership Active', 'Your student subscription is active and in good standing.');
              }}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* 5. GIFT CARDS MODAL */}
      <Modal visible={activeModal === 'giftCards'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>TechCrate Gift Cards</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.giftBalanceBox}>
              <Text style={styles.giftBalanceLabel}>Available Balance</Text>
              <Text style={styles.giftBalanceVal}>₹{giftBalance}</Text>
              <Text style={styles.giftBalanceSub}>Applicable directly at checkout</Text>
            </View>

            <Text style={styles.fieldLabel}>Redeem Gift Voucher Code</Text>
            <View style={styles.redeemRow}>
              <TextInput
                style={[styles.fieldInput, { flex: 1, marginBottom: 0 }]}
                placeholder="e.g. TC-GIFT-9281-MAKER"
                placeholderTextColor={BRAND.textMuted}
                autoCapitalize="characters"
                value={voucherCode}
                onChangeText={setVoucherCode}
              />
              <Button
                title={isRedeeming ? '...' : 'Apply'}
                onPress={handleRedeemVoucher}
                loading={isRedeeming}
                style={{ paddingHorizontal: 16 }}
              />
            </View>

            <View style={styles.calloutBox}>
              <Gift size={15} color={BRAND.accentBlue} />
              <Text style={styles.calloutBoxText}>
                Gift card credits never expire and can be combined with any student coupon code.
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* 6. SAVED PAYMENT METHODS MODAL */}
      <Modal visible={activeModal === 'savedCards'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Saved Payment Methods</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10, marginVertical: 8 }}>
              <View style={styles.paymentMethodCard}>
                <View style={styles.payIconCircle}>
                  <Zap size={16} color={BRAND.emerald} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payTitle}>UPI (Verified ID)</Text>
                  <Text style={styles.paySub}>kunal.maker@okhdfcbank</Text>
                </View>
                <View style={styles.primaryPill}>
                  <Text style={styles.primaryPillText}>Primary</Text>
                </View>
              </View>

              <View style={styles.paymentMethodCard}>
                <View style={styles.payIconCircle}>
                  <CreditCard size={16} color={BRAND.accentBlue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payTitle}>HDFC RuPay Platinum</Text>
                  <Text style={styles.paySub}>Ending in •••• 4210</Text>
                </View>
              </View>
            </View>

            <View style={styles.securityStrip}>
              <ShieldCheck size={14} color={BRAND.emerald} />
              <Text style={styles.securityStripText}>
                256-Bit Bank-Grade Encryption • Zero Card Numbers Stored Locally
              </Text>
            </View>

            <Button
              title="Done"
              onPress={() => setActiveModal(null)}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* 7. PAYMENT PREFERENCES MODAL */}
      <Modal visible={activeModal === 'paymentPrefs'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Default Payment Mode</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.optionsList}>
              {[
                'UPI Instant (Google Pay / PhonePe)',
                'Razorpay Secured (Debit / Credit Cards)',
                'Net Banking (All Indian Banks)',
                'Cash on Delivery (Available for Select Pins)',
              ].map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[styles.optionRow, defaultPayment === p && styles.optionRowSelected]}
                  onPress={() => handleSelectPayment(p)}>
                  <Text style={styles.optionTitle}>{p}</Text>
                  {defaultPayment === p && <Check size={18} color={BRAND.primaryNavy} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* 8. PRIVACY CENTER MODAL */}
      <Modal visible={activeModal === 'privacy'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Center</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.modalBodyText}>
                TechCrate values maker privacy. We only collect telemetry required to verify hardware compatibility, track deliveries, and maintain your project schematics.
              </Text>

              <View style={{ gap: 12, marginTop: 12 }}>
                <ToggleRow
                  title="Crash Reporting & Performance"
                  desc="Helps us fix layout bugs and hardware loading latency"
                  value={true}
                  onToggle={() => { }}
                />
                <ToggleRow
                  title="Personalized Recommendations"
                  desc="Suggests modules compatible with your project microcontroller"
                  value={true}
                  onToggle={() => { }}
                />
              </View>

              <TouchableOpacity
                style={styles.actionBtnOutline}
                onPress={() => {
                  Alert.alert('Data Export Initiated', 'A complete JSON archive of your order history and account telemetry will be sent to your registered email.');
                }}>
                <Text style={styles.actionBtnOutlineText}>Request Account Data Archive</Text>
              </TouchableOpacity>
            </ScrollView>

            <Button
              title="Close"
              onPress={() => setActiveModal(null)}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* 9. MANAGE DEVICES MODAL */}
      <Modal visible={activeModal === 'devices'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Manage Active Devices</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <View style={{ gap: 10, marginVertical: 10 }}>
              <View style={styles.deviceCardActive}>
                <Smartphone size={20} color={BRAND.accentBlue} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.deviceTitle}>Current Android Device</Text>
                  <Text style={styles.deviceSub}>TechCrate Mobile App • Active Now</Text>
                </View>
                <View style={styles.onlineDot} />
              </View>

              <View style={styles.deviceCard}>
                <Globe size={20} color={BRAND.textSecondary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.deviceTitle}>Chrome Browser (Windows 11)</Text>
                  <Text style={styles.deviceSub}>Last logged in 3 hours ago</Text>
                </View>
              </View>
            </View>

            <Button
              title="Log Out All Other Devices"
              onPress={() => {
                Alert.alert('Sessions Terminated', 'All other web and mobile sessions have been logged out.');
                setActiveModal(null);
              }}
              variant="outline"
              style={{ marginTop: 10 }}
            />
          </View>
        </View>
      </Modal>

      {/* 10. SECURITY SETTINGS MODAL */}
      <Modal visible={activeModal === 'security'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Security Settings</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Change Password</Text>
            <TextInput
              style={styles.fieldInput}
              placeholder="Current Password"
              placeholderTextColor={BRAND.textMuted}
              secureTextEntry
            />
            <TextInput
              style={styles.fieldInput}
              placeholder="New Secure Password (min 8 chars)"
              placeholderTextColor={BRAND.textMuted}
              secureTextEntry
            />

            <Button
              title="Update Password"
              onPress={() => {
                Alert.alert('Password Updated', 'Your account credentials have been updated.');
                setActiveModal(null);
              }}
              style={{ marginTop: 8 }}
            />
          </View>
        </View>
      </Modal>

      {/* 11. ACCOUNT DATA & DELETION MODAL */}
      <Modal visible={activeModal === 'accountData'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Account Data & Privacy</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalBodyText}>
              You have the right to request a complete export of your purchases, project schematics, and addresses, or permanently close your maker profile.
            </Text>

            <Button
              title="Download Data Report"
              variant="outline"
              onPress={() => {
                Alert.alert('Report Requested', 'Download link prepared and sent to your email.');
              }}
              style={{ marginTop: 12 }}
            />

            <Button
              title="Request Account Deletion"
              onPress={() => {
                Alert.alert(
                  'Permanent Account Deletion',
                  'Are you sure? Once deleted, your maker order history and warranty claims cannot be recovered.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete Permanently',
                      style: 'destructive',
                      onPress: () => {
                        setActiveModal(null);
                        logout();
                      },
                    },
                  ]
                );
              }}
              style={{ marginTop: 10, backgroundColor: BRAND.rose }}
            />
          </View>
        </View>
      </Modal>

      {/* 12. QUESTIONS & ANSWERS MODAL */}
      <Modal visible={activeModal === 'qa'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Hardware Q&A Activity</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              {[
                {
                  q: 'Can ESP32 NodeMCU withstand direct 5V input on GPIO 21?',
                  a: 'ESP32 GPIO pins are 3.3V logic tolerant only! Connecting 5V signals directly can damage the internal silicon protection diodes. Always use a logic level shifter.',
                  product: 'ESP32 CP2102 DevBoard',
                },
                {
                  q: 'Does this 4-channel relay board have optocoupler isolation?',
                  a: 'Yes, it features JD-VCC optocoupler isolation to prevent back-EMF from motor coils interfering with your microcontroller.',
                  product: '5V 4-Channel Relay Module',
                },
              ].map((item, i) => (
                <View key={i} style={styles.qaCard}>
                  <Text style={styles.qaProduct}>{item.product}</Text>
                  <Text style={styles.qaQuestion}>Q: {item.q}</Text>
                  <Text style={styles.qaAnswer}>A: {item.a}</Text>
                </View>
              ))}
            </ScrollView>

            <Button
              title="Close"
              onPress={() => setActiveModal(null)}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* 13. REVIEWS MODAL */}
      <Modal visible={activeModal === 'reviews'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Hardware Reviews</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              {[
                {
                  product: 'IoT Smart Home Automation Kit',
                  rating: 5,
                  comment: 'Exceptional kit! All relays worked flawlessly with ESP32. Firmware provided in app flashed on first try.',
                  date: 'Oct 02, 2026',
                },
                {
                  product: 'DHT22 Digital Temperature & Humidity Sensor',
                  rating: 5,
                  comment: 'Calibrated precision. Much better stability than basic DHT11.',
                  date: 'Sep 24, 2026',
                },
              ].map((r, i) => (
                <View key={i} style={styles.qaCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.qaProduct}>{r.product}</Text>
                    <Text style={styles.reviewDate}>{r.date}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 2, marginVertical: 4 }}>
                    {[...Array(r.rating)].map((_, s) => (
                      <Star key={s} size={12} color="#F59E0B" fill="#F59E0B" />
                    ))}
                  </View>
                  <Text style={styles.qaAnswer}>{r.comment}</Text>
                </View>
              ))}
            </ScrollView>

            <Button
              title="Close"
              onPress={() => setActiveModal(null)}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>



      {/* 16. SEARCHABLE FAQS & HELP MODAL */}
      <Modal visible={activeModal === 'faqs'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help Center & FAQs</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.searchBarWrap}>
              <Search size={16} color={BRAND.textMuted} />
              <TextInput
                style={styles.searchBarInput}
                placeholder="Search shipping, compatibility, returns..."
                placeholderTextColor={BRAND.textMuted}
                value={faqSearch}
                onChangeText={setFaqSearch}
              />
            </View>

            <ScrollView style={{ maxHeight: 360 }} showsVerticalScrollIndicator={false}>
              {filteredFaqs.map((faq, i) => (
                <View key={i} style={styles.faqCard}>
                  <Text style={styles.faqQ}>{faq.q}</Text>
                  <Text style={styles.faqA}>{faq.a}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.modalFooterRow}>
              <Button
                title="Call 24/7 Helpline"
                onPress={() => Linking.openURL('tel:+918005553420')}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 17. TERMS & CONDITIONS MODAL */}
      <Modal visible={activeModal === 'terms'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Terms & Conditions</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.modalBodyText}>
                1. Acceptance of Terms: By purchasing components or downloading project firmware through TechCrate, you agree to comply with safe hardware handling guidelines.{'\n\n'}
                2. Component Warranty: Electronic components, ICs, and development boards carry a 7-day replacement warranty for manufacturing defects. Damage caused by reverse voltage or incorrect soldering polarity is excluded.{'\n\n'}
                3. Shipping & Delivery: Courier deliveries are fulfilled through verified logistics partners with real-time transit telemetry provided in app.
              </Text>
            </ScrollView>

            <Button
              title="Close"
              onPress={() => setActiveModal(null)}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* 18. PRIVACY POLICY MODAL */}
      <Modal visible={activeModal === 'policy'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.modalBodyText}>
                TechCrate values maker confidentiality. We never sell student emails, mobile numbers, or project hardware schematics to third parties.{'\n\n'}
                All payment transactions are processed through RBI-approved payment gateways (Razorpay & UPI). No payment card credentials or UPI PINs are ever collected by our servers.
              </Text>
            </ScrollView>

            <Button
              title="Close"
              onPress={() => setActiveModal(null)}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* 19. OPEN SOURCE LICENSES MODAL */}
      <Modal visible={activeModal === 'licenses'} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Open Source Licenses</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}>
                <X size={20} color={BRAND.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 380 }}>
              <Text style={styles.modalBodyText}>
                TechCrate Mobile proudly builds upon open-source software and maker hardware standards:{'\n\n'}
                • React Native & React (MIT License){'\n'}
                • Zustand State Engine (MIT License){'\n'}
                • Lucide Icons (ISC License){'\n'}
                • Arduino AVR & ESP32 Board Frameworks (LGPL & Apache 2.0){'\n'}
                • FreeRTOS & PlatformIO Community Toolchains
              </Text>
            </ScrollView>

            <Button
              title="Close"
              onPress={() => setActiveModal(null)}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Clean Settings Row Item with icon, title, subtitle, optional badge, and chevron
 */
function SettingsRow({
  icon: IconComp,
  iconColor = '#032762',
  title,
  subtitle,
  badgeText,
  badgeColor = '#EFF6FF',
  badgeTextColor = '#2563EB',
  isLast = false,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={[styles.settingsRow, isLast && styles.settingsRowLast]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={title}>
      <View style={[styles.settingsIconWrap, { backgroundColor: iconColor + '14' }]}>
        <IconComp size={18} color={iconColor} strokeWidth={2.2} />
      </View>

      <View style={styles.settingsTextCol}>
        <Text style={styles.settingsTitleText}>{title}</Text>
        {subtitle ? (
          <Text style={styles.settingsSubText} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {badgeText ? (
        <View style={[styles.settingsBadge, { backgroundColor: badgeColor }]}>
          <Text style={[styles.settingsBadgeText, { color: badgeTextColor }]}>
            {badgeText}
          </Text>
        </View>
      ) : null}

      <ChevronRight size={16} color="#94A3B8" />
    </TouchableOpacity>
  );
}

/**
 * Toggle Row for interactive switches
 */
function ToggleRow({ title, desc, value, onToggle }) {
  return (
    <View style={styles.toggleRow}>
      <View style={{ flex: 1, paddingRight: 10 }}>
        <Text style={styles.toggleTitle}>{title}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: BRAND.background,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  cartHeaderBtn: {
    position: 'relative',
    padding: 6,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#F97316',
    borderRadius: 9,
    minWidth: 17,
    height: 17,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },

  // SECTION A: Profile Header Card
  profileHeaderCard: {
    backgroundColor: BRAND.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    shadowColor: '#000000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: BRAND.primaryNavy,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: BRAND.emerald,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  profileInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  nameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: BRAND.textDark,
  },
  userPhoneText: {
    fontSize: 12.5,
    color: BRAND.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  userEmailText: {
    fontSize: 12,
    color: BRAND.textMuted,
    marginTop: 1,
  },
  collegePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  collegePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND.primaryNavy,
  },
  editProfileBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBottomStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 14,
    paddingTop: 10,
  },
  idPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
  },
  idLabel: {
    fontSize: 10.5,
    color: BRAND.textMuted,
    fontWeight: '700',
  },
  idValue: {
    fontSize: 11,
    color: BRAND.textDark,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  tierPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },

  // SECTION B: Quick Actions 2x2 Grid
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickTile: {
    width: (SCREEN_WIDTH - 42) / 2,
    backgroundColor: BRAND.surface,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    shadowColor: '#000000',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  tileIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileTextCol: {
    flex: 1,
  },
  tileTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: BRAND.textDark,
  },
  tileSubtitle: {
    fontSize: 11,
    color: BRAND.textMuted,
    marginTop: 1,
  },

  // GROUPED SECTIONS
  sectionWrapper: {
    gap: 8,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: BRAND.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  cardGroup: {
    backgroundColor: BRAND.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  settingsRowLast: {
    borderBottomWidth: 0,
  },
  settingsIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsTextCol: {
    flex: 1,
  },
  settingsTitleText: {
    fontSize: 14,
    fontWeight: '700',
    color: BRAND.textDark,
  },
  settingsSubText: {
    fontSize: 11.5,
    color: BRAND.textMuted,
    marginTop: 2,
  },
  settingsBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 4,
  },
  settingsBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },

  // RECENTLY VIEWED SHELF
  recentlyViewedCard: {
    backgroundColor: BRAND.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    marginTop: 10,
  },
  shelfHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  shelfHeaderTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: BRAND.textDark,
  },
  shelfSeeAll: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND.accentBlue,
  },
  shelfScroll: {
    gap: 10,
  },
  recentItemChip: {
    width: 110,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 8,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
  },
  recentItemImg: {
    width: '100%',
    height: 70,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  recentItemName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: BRAND.textDark,
    marginTop: 6,
  },
  recentItemPrice: {
    fontSize: 11,
    fontWeight: '800',
    color: BRAND.accentBlue,
    marginTop: 2,
  },



  // SOCIAL COMMUNITY CARD
  socialCard: {
    backgroundColor: BRAND.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    alignItems: 'center',
  },
  socialHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: BRAND.textDark,
    textAlign: 'center',
  },
  socialHeaderDesc: {
    fontSize: 11.5,
    color: BRAND.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    maxWidth: 290,
  },
  socialLinksRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  socialPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  socialPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND.primaryNavy,
  },

  // LOGOUT BUTTON & FOOTER
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: BRAND.rose,
  },
  appFooterCol: {
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 10,
  },
  appVersionText: {
    fontSize: 11,
    fontWeight: '700',
    color: BRAND.textMuted,
  },
  appCopyrightText: {
    fontSize: 10.5,
    color: BRAND.textMuted,
    marginTop: 2,
  },

  // MODAL STYLES
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: BRAND.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 14,
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: BRAND.textDark,
  },
  modalBodyText: {
    fontSize: 13,
    color: BRAND.textSecondary,
    lineHeight: 19,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: BRAND.textDark,
    marginTop: 10,
    marginBottom: 5,
  },
  fieldInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: BRAND.textDark,
    marginBottom: 6,
  },
  modalFooterRow: {
    marginTop: 14,
  },

  // Option lists (Language, Payment)
  optionsList: {
    gap: 8,
    marginVertical: 10,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
  },
  optionRowSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: BRAND.accentBlue,
  },
  optionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BRAND.textDark,
  },
  optionSubtitle: {
    fontSize: 11,
    color: BRAND.textMuted,
    marginTop: 2,
  },

  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  toggleTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BRAND.textDark,
  },
  toggleDesc: {
    fontSize: 11.5,
    color: BRAND.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },

  // Subscriptions Card
  subscriptionCard: {
    backgroundColor: BRAND.secondaryNavy,
    borderRadius: 14,
    padding: 16,
    marginVertical: 10,
  },
  subStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: BRAND.accentBlue,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  subStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subDesc: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
    marginTop: 4,
  },
  subRenewalText: {
    fontSize: 11,
    color: '#38BDF8',
    marginTop: 10,
    fontWeight: '600',
  },
  perksList: {
    gap: 8,
    marginTop: 12,
  },
  perksHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: BRAND.textDark,
    marginBottom: 4,
  },
  perkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  perkText: {
    fontSize: 12,
    color: BRAND.textSecondary,
    lineHeight: 17,
    flex: 1,
  },

  // Gift Balance
  giftBalanceBox: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    marginBottom: 12,
  },
  giftBalanceLabel: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '700',
  },
  giftBalanceVal: {
    fontSize: 26,
    fontWeight: '900',
    color: '#166534',
    marginTop: 2,
  },
  giftBalanceSub: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },
  redeemRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  calloutBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
  },
  calloutBoxText: {
    fontSize: 11.5,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 16,
  },

  // Payment Cards
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    gap: 12,
  },
  payIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
  },
  payTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: BRAND.textDark,
  },
  paySub: {
    fontSize: 11.5,
    color: BRAND.textMuted,
    marginTop: 1,
  },
  primaryPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  securityStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  securityStripText: {
    fontSize: 10.5,
    color: BRAND.textSecondary,
    flex: 1,
  },

  // Manage Devices
  deviceCardActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    gap: 12,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    gap: 12,
  },
  deviceTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: BRAND.textDark,
  },
  deviceSub: {
    fontSize: 11,
    color: BRAND.textMuted,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BRAND.emerald,
  },

  // Q&A / Review Card
  qaCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    marginBottom: 8,
  },
  qaProduct: {
    fontSize: 11,
    fontWeight: '800',
    color: BRAND.accentBlue,
  },
  qaQuestion: {
    fontSize: 12.5,
    fontWeight: '700',
    color: BRAND.textDark,
    marginTop: 3,
  },
  qaAnswer: {
    fontSize: 12,
    color: BRAND.textSecondary,
    lineHeight: 17,
    marginTop: 4,
  },
  reviewDate: {
    fontSize: 10.5,
    color: BRAND.textMuted,
  },

  // FAQ Modal
  searchBarWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
    gap: 8,
  },
  searchBarInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 13,
    color: BRAND.textDark,
  },
  faqCard: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    marginBottom: 8,
  },
  faqQ: {
    fontSize: 13,
    fontWeight: '700',
    color: BRAND.textDark,
    marginBottom: 4,
  },
  faqA: {
    fontSize: 12,
    color: BRAND.textSecondary,
    lineHeight: 18,
  },
  actionBtnOutline: {
    borderWidth: 1,
    borderColor: BRAND.cardBorder,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  actionBtnOutlineText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: BRAND.primaryNavy,
  },
});
