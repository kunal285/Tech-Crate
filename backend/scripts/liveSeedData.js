/**
 * TechCrate Authentication & Seed Accounts
 * Preserves user accounts, credentials, and passwords for Admin, Seller, and Customer.
 * All dummy catalog products, kits, orders, coupons, and banners are removed.
 */

const liveUsers = [
  {
    _id: '65f1a0010000000000000001',
    name: 'Admin Controller',
    email: 'admin@techcrate.com',
    phone: '+919999999999',
    password: 'password123',
    role: 'admin',
    college: 'IIT Bombay',
    branch: 'Electrical Engineering',
  },
  {
    _id: '65f1a0010000000000000002',
    name: 'RoboTech Components Pvt Ltd',
    email: 'seller@TechCrate.com',
    phone: '+919820011223',
    password: 'password123',
    role: 'seller',
    isVerifiedSeller: true,
    college: 'VJTI Mumbai',
    branch: 'Electronics & Telecommunication',
  },
  {
    _id: '65f1a0010000000000000003',
    name: 'Embedded Micro Hub',
    email: 'seller2@embeddedhub.in',
    phone: '+919820044556',
    password: 'password123',
    role: 'seller',
    isVerifiedSeller: true,
    college: 'IIT Bombay',
    branch: 'Electrical Engineering',
  },
  {
    _id: '65f1a0010000000000000004',
    name: 'CircuitCrafters India',
    email: 'seller3@circuitcrafters.in',
    phone: '+919820077889',
    password: 'password123',
    role: 'seller',
    isVerifiedSeller: true,
    college: 'NIT Trichy',
    branch: 'Electronics & Communication',
  },
  {
    _id: '65f1a0010000000000000005',
    name: 'Rahul Sharma',
    email: 'student@TechCrate.com',
    phone: '+919876543210',
    password: 'password123',
    role: 'customer',
    college: 'BITS Pilani',
    branch: 'Computer Science',
  },
  {
    _id: '65f1a0010000000000000006',
    name: 'Priya Verma',
    email: 'priya@gmail.com',
    phone: '+919876543211',
    password: 'password123',
    role: 'customer',
    college: 'IIT Delhi',
    branch: 'Mechatronics',
  },
  {
    _id: '65f1a0010000000000000007',
    name: 'Rohit Mehta',
    email: 'rohit@gmail.com',
    phone: '+919876543212',
    password: 'password123',
    role: 'customer',
    college: 'DTU Delhi',
    branch: 'Robotics & Automation',
  },
];

const liveSellers = [
  {
    _id: '65f1b0010000000000000001',
    user: '65f1a0010000000000000002',
    storeName: 'RoboTech Components Pvt Ltd',
    storeDescription: 'Authorized distributor for Arduino, ESP32, Sensors & Robotics Hardware across India.',
    gstNumber: '27AAAAA0000A1Z5',
    bankAccount: {
      accountNumber: '918273645012',
      ifscCode: 'HDFC0000123',
      bankName: 'HDFC Bank',
      accountHolder: 'RoboTech Components Pvt Ltd',
    },
    isApproved: true,
    totalSales: 0,
    totalRevenue: 0,
    rating: 5.0,
  },
];

// Real Hardware Catalog Products
const liveProducts = [
  {
    _id: '65f1c0010000000000000001',
    title: 'ESP32 Wi-Fi & Bluetooth Dual-Core Development Board',
    description: 'High performance ESP-WROOM-32 30-pin microcontroller board with integrated Wi-Fi, Bluetooth BLE, and rich GPIO peripherals for IoT and robotics.',
    price: 349,
    originalPrice: 499,
    discountedPrice: 349,
    discountPercentage: 30,
    category: 'Microcontrollers',
    stock: 45,
    sku: 'TC-ESP32-DEV',
    features: [
      'Dual-Core Tensilica LX6 240 MHz microcontroller',
      'Integrated 802.11 b/g/n Wi-Fi & Bluetooth 4.2 BR/EDR/BLE',
      '520 KB SRAM with 4 MB SPI Flash Memory',
      'Operating Voltage: 3.3V / 5V DC via Micro-USB',
    ],
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      operatingVoltage: '3.3V - 5V DC',
      pinCount: '30 Pins',
      interface: 'SPI / I2C / UART / PWM',
      dimensions: '51mm x 28mm',
      weight: '12g',
    },
    rating: 4.8,
    reviewCount: 38,
  },
  {
    _id: '65f1c0010000000000000002',
    title: 'Arduino Uno R3 Compatible Development Board (CH340G)',
    description: 'Classic ATmega328P based microcontroller board perfect for engineering college coursework, DIY robotics, and electronic prototyping.',
    price: 299,
    originalPrice: 420,
    discountedPrice: 299,
    discountPercentage: 29,
    category: 'Microcontrollers',
    stock: 60,
    sku: 'TC-ARD-UNO-R3',
    features: [
      'ATmega328P Microcontroller running at 16 MHz',
      '14 Digital I/O Pins (6 PWM outputs) & 6 Analog Inputs',
      '32 KB Flash memory (0.5 KB used by bootloader)',
      'USB Interface with Type-B programming port',
    ],
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      operatingVoltage: '5V DC',
      pinCount: '28 Pins',
      interface: 'UART / SPI / I2C',
      dimensions: '68.6mm x 53.4mm',
      weight: '25g',
    },
    rating: 4.7,
    reviewCount: 52,
  },
  {
    _id: '65f1c0010000000000000003',
    title: 'HC-SR04 Ultrasonic Distance Sensor Module',
    description: 'Non-contact distance measuring module providing 2cm to 400cm precision range measurement for robotics obstacle avoidance.',
    price: 65,
    originalPrice: 99,
    discountedPrice: 65,
    discountPercentage: 34,
    category: 'Sensors',
    stock: 120,
    sku: 'TC-SENS-HCSR04',
    features: [
      'Measurement Range: 2cm to 400cm (Accuracy: 3mm)',
      'Trigger Input Signal: 10uS TTL pulse',
      'Echo Output Signal: TTL pulse proportional to distance',
      'Operating Voltage: 5V DC',
    ],
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      operatingVoltage: '5V DC',
      pinCount: '4 Pins (VCC, Trig, Echo, GND)',
      interface: 'Digital I/O Pulse',
      dimensions: '45mm x 20mm',
      weight: '8.5g',
    },
    rating: 4.6,
    reviewCount: 29,
  },
];

const liveProjectKits = [];
const liveOrders = [];
const liveCoupons = [
  {
    code: 'WELCOME10',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 199,
    maxDiscount: 100,
    usageLimit: 500,
    active: true,
  },
];
const liveBanners = [
  {
    title: 'Winter Engineering Mega Sale',
    subtitle: 'Flat 20% Off on IoT Microcontrollers',
    badgeText: 'LIMITED TIME',
    customText: 'Special Student Discount on Robotics & Microcontrollers',
    buttonText: 'Shop Now',
    buttonLink: '',
    linkType: 'category',
    linkValue: 'Microcontrollers',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    displayOrder: 1,
  },
  {
    title: 'Next-Gen Sensors & Modules',
    subtitle: 'Precision Measurement & Prototyping',
    badgeText: 'NEW ARRIVALS',
    customText: 'Ultrasonic, IMU, Temperature & Gas Sensors in stock',
    buttonText: 'Explore Sensors',
    buttonLink: '',
    linkType: 'category',
    linkValue: 'Sensors',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    isActive: true,
    displayOrder: 2,
  },
];

// Clean category taxonomy for dropdowns and filters
const liveCategories = [
  { _id: 'cat_1', name: 'Microcontrollers', icon: 'Cpu', count: 0, active: true },
  { _id: 'cat_2', name: 'Sensors', icon: 'Radio', count: 0, active: true },
  { _id: 'cat_3', name: 'Motors & Drivers', icon: 'Settings', count: 0, active: true },
  { _id: 'cat_4', name: 'Wireless & IoT', icon: 'Wifi', count: 0, active: true },
  { _id: 'cat_5', name: 'Displays', icon: 'Tv', count: 0, active: true },
  { _id: 'cat_6', name: 'Power Management', icon: 'Battery', count: 0, active: true },
  { _id: 'cat_7', name: 'Project Kits', icon: 'Box', count: 0, active: true },
];

module.exports = {
  liveUsers,
  liveSellers,
  liveProducts,
  liveProjectKits,
  liveOrders,
  liveCategories,
  liveCoupons,
  liveBanners,
};
