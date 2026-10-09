export const APP_NAME = 'Tech Crate';
export const APP_TAGLINE = 'Everything You Need to Build.';

export const DELIVERY_FEES = {
  STANDARD: 49,
  EXPRESS: 99,
  FREE_ABOVE: 499,
};

export const FREE_DELIVERY_THRESHOLD = 499;

export const TAX_RATE = 0.18; // 18% GST

export const CATEGORIES = [
  { id: 'all', name: 'All Components', icon: 'Cpu', color: '#0ea5e9' },
  { id: 'Microcontrollers', name: 'Microcontrollers', icon: 'Cpu', color: '#009FAF' },
  { id: 'Sensors', name: 'Sensors & Detectors', icon: 'Eye', color: '#6366F1' },
  { id: 'Motors & Drivers', name: 'Motors & Drivers', icon: 'Settings', color: '#10B981' },
  { id: 'Wireless & IoT', name: 'Wireless & IoT', icon: 'Wifi', color: '#E7322A' },
  { id: 'Displays', name: 'Displays & Screens', icon: 'Monitor', color: '#3B82F6' },
  { id: 'Power & Battery', name: 'Power & Battery', icon: 'Zap', color: '#EF4444' },
  { id: 'Components & Passives', name: 'Components & Passives', icon: 'Box', color: '#F97316' },
  { id: 'Project Kits', name: 'DIY Project Kits', icon: 'Package', color: '#8B5CF6' },
  { id: 'Tools & Prototyping', name: 'Tools & Prototyping', icon: 'Wrench', color: '#64748B' },
];

export const DIFFICULTY_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

export const ORDER_STATUS = {
  placed: { label: 'Order Placed', color: 'blue' },
  confirmed: { label: 'Confirmed', color: 'purple' },
  packed: { label: 'Packed', color: 'yellow' },
  shipped: { label: 'Shipped', color: 'indigo' },
  out_for_delivery: { label: 'Out for Delivery', color: 'amber' },
  delivered: { label: 'Delivered', color: 'emerald' },
  cancelled: { label: 'Cancelled', color: 'rose' },
  returned: { label: 'Returned', color: 'slate' },
};
