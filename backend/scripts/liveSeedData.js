/**
 * ProjectKart Live Catalog Data
 * Real, authentic electronics components, DIY engineering project kits, categories, sellers, banners, coupons, and orders.
 */

const liveUsers = [
  {
    _id: '65f1a0010000000000000001',
    name: 'Admin Controller',
    email: 'admin@projectkart.com',
    password: 'password123',
    role: 'admin',
    college: 'IIT Bombay',
    branch: 'Electrical Engineering',
  },
  {
    _id: '65f1a0010000000000000002',
    name: 'RoboTech Components Pvt Ltd',
    email: 'seller@projectkart.com',
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
    password: 'password123',
    role: 'seller',
    isVerifiedSeller: true,
    college: 'NIT Trichy',
    branch: 'Electronics & Communication',
  },
  {
    _id: '65f1a0010000000000000005',
    name: 'Rahul Sharma',
    email: 'student@projectkart.com',
    password: 'password123',
    role: 'customer',
    college: 'BITS Pilani',
    branch: 'Computer Science',
  },
  {
    _id: '65f1a0010000000000000006',
    name: 'Priya Verma',
    email: 'priya@gmail.com',
    password: 'password123',
    role: 'customer',
    college: 'IIT Delhi',
    branch: 'Mechatronics',
  },
  {
    _id: '65f1a0010000000000000007',
    name: 'Rohit Mehta',
    email: 'rohit@gmail.com',
    password: 'password123',
    role: 'customer',
    college: 'DTU Delhi',
    branch: 'Robotics & Automation',
  }
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
    totalSales: 1420,
    totalRevenue: 485000,
    rating: 4.9,
  },
  {
    _id: '65f1b0010000000000000002',
    user: '65f1a0010000000000000003',
    storeName: 'Embedded Micro Hub',
    storeDescription: 'Specialized supplier of ARM Cortex development boards, wireless transceivers & ICs.',
    gstNumber: '24BBBBB1111B2Z9',
    bankAccount: {
      accountNumber: '881230491823',
      ifscCode: 'ICIC0000456',
      bankName: 'ICICI Bank',
      accountHolder: 'Embedded Micro Hub',
    },
    isApproved: true,
    totalSales: 890,
    totalRevenue: 312000,
    rating: 4.8,
  },
  {
    _id: '65f1b0010000000000000003',
    user: '65f1a0010000000000000004',
    storeName: 'CircuitCrafters India',
    storeDescription: 'High-precision sensor modules, OLED/TFT displays & motor drivers for engineering students.',
    gstNumber: '33CCCCC2222C3Z2',
    bankAccount: {
      accountNumber: '772391023841',
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India',
      accountHolder: 'CircuitCrafters India',
    },
    isApproved: true,
    totalSales: 640,
    totalRevenue: 195000,
    rating: 4.7,
  }
];

const liveProducts = [
  // Microcontrollers
  {
    _id: '65f1c0010000000000000101',
    title: 'Arduino UNO R3 Development Board (CH340G)',
    description: 'ATmega328P Microcontroller Board with USB cable. 16 MHz Crystal Oscillator, 14 Digital I/O Pins, 6 Analog Inputs. Perfect for beginners and advanced engineering projects.',
    price: 449,
    originalPrice: 650,
    discountPercentage: 30,
    category: 'Microcontrollers',
    stock: 150,
    images: [
      'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      operatingVoltage: '5V DC',
      inputVoltage: '7-12V DC via DC Barrel Jack',
      pinCount: '14 Digital I/O (6 PWM), 6 Analog Input',
      flashMemory: '32 KB (ATmega328P)',
      clockSpeed: '16 MHz',
      dimensions: '68.6 x 53.4 mm',
    },
    compatibilityTags: ['Arduino', 'Sensors', 'Relays', 'Motors', 'LCD Displays'],
    seller: '65f1a0010000000000000002',
    rating: 4.9,
    reviewCount: 124,
    isFeatured: true,
  },
  {
    _id: '65f1c0010000000000000102',
    title: 'ESP32 NodeMCU Wi-Fi + Bluetooth Dev Board (WROOM-32U)',
    description: 'Dual-core Tensilica LX6 Microprocessor, 240MHz, 4MB Flash, Integrated 802.11b/g/n Wi-Fi & BLE 4.2. Ideal for IoT, Cloud Telemetry & Home Automation projects.',
    price: 349,
    originalPrice: 499,
    discountPercentage: 30,
    category: 'Wireless & IoT',
    stock: 200,
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      operatingVoltage: '3.3V DC',
      pinCount: '30 Pins (18 ADC, 2 DAC, 3 SPI, 2 I2C, 2 UART)',
      wifiStandard: '802.11 b/g/n (up to 150Mbps)',
      bluetooth: 'v4.2 BR/EDR and BLE',
      clockSpeed: '240 MHz',
    },
    compatibilityTags: ['ESP32', 'IoT', 'MQTT', 'Blynk', 'Smart Home', 'HTTP/REST'],
    seller: '65f1a0010000000000000002',
    rating: 4.9,
    reviewCount: 210,
    isFeatured: true,
  },
  {
    _id: '65f1c0010000000000000103',
    title: 'Raspberry Pi 4 Model B (4GB RAM Quad Core ARM Cortex-A72)',
    description: 'High-performance Single Board Computer featuring 1.5GHz Quad-Core 64-bit ARM Cortex-A72, 4GB LPDDR4 RAM, Dual 4K Micro-HDMI display outputs, Gigabit Ethernet & USB 3.0.',
    price: 4899,
    originalPrice: 5999,
    discountPercentage: 18,
    category: 'Microcontrollers',
    stock: 45,
    images: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      processor: 'Broadcom BCM2711, Quad-core Cortex-A72 64-bit @ 1.5GHz',
      memory: '4GB LPDDR4-3200 SDRAM',
      connectivity: '2.4 GHz & 5.0 GHz IEEE 802.11ac, Bluetooth 5.0, Gigabit Ethernet',
      usbPorts: '2 USB 3.0 ports; 2 USB 2.0 ports',
      gpioHeader: 'Standard 40-pin GPIO header',
    },
    compatibilityTags: ['Raspberry Pi', 'Python', 'OpenCV', 'AI Machine Learning', 'Linux'],
    seller: '65f1a0010000000000000003',
    rating: 5.0,
    reviewCount: 96,
    isFeatured: true,
  },
  {
    _id: '65f1c0010000000000000104',
    title: 'Raspberry Pi Pico W with Pre-Soldered Headers (RP2040 Wi-Fi)',
    description: 'Powered by RP2040 dual-core ARM Cortex-M0+ processor @ 133MHz, 264KB SRAM, 2MB Flash with Infineon CYW43439 Wi-Fi chip pre-installed.',
    price: 499,
    originalPrice: 699,
    discountPercentage: 28,
    category: 'Microcontrollers',
    stock: 120,
    images: [
      'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      microcontroller: 'RP2040 (Dual-core ARM Cortex M0+)',
      clockSpeed: '133 MHz',
      sram: '264 KB',
      onboardWireless: 'Single-band 2.4GHz Wi-Fi (802.11n)',
      gpio: '26 Multi-Function GPIO Pins',
    },
    compatibilityTags: ['MicroPython', 'C/C++', 'Raspberry Pi Pico', 'IoT'],
    seller: '65f1a0010000000000000003',
    rating: 4.8,
    reviewCount: 64,
    isFeatured: false,
  },
  {
    _id: '65f1c0010000000000000105',
    title: 'STM32F103C8T6 ARM Cortex-M3 Blue Pill Board',
    description: '32-bit ARM Cortex-M3 MCU with 72MHz CPU clock speed, 64KB Flash, 20KB SRAM. Ultra fast performance for DSP and industrial control projects.',
    price: 199,
    originalPrice: 299,
    discountPercentage: 33,
    category: 'Microcontrollers',
    stock: 90,
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      operatingVoltage: '3.3V DC',
      core: 'ARM 32-bit Cortex-M3',
      maxFrequency: '72 MHz',
      flashMemory: '64 Kbytes',
      sram: '20 Kbytes',
    },
    compatibilityTags: ['STM32', 'Keil', 'STM32CubeIDE', 'Arduino Core STM32'],
    seller: '65f1a0010000000000000003',
    rating: 4.7,
    reviewCount: 41,
    isFeatured: false,
  },

  // Sensors
  {
    _id: '65f1c0010000000000000106',
    title: 'HC-SR04 Ultrasonic Distance Sensor Module',
    description: 'Non-contact ultrasonic range measuring sensor module. Range: 2cm to 400cm with high measurement accuracy of up to 3mm.',
    price: 89,
    originalPrice: 150,
    discountPercentage: 40,
    category: 'Sensors',
    stock: 300,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      operatingVoltage: '5V DC',
      workingCurrent: '15mA',
      measuringAngle: '15 degrees',
      triggerInputSignal: '10us TTL pulse',
      echoOutputSignal: 'TTL PWL signal',
    },
    compatibilityTags: ['Arduino', 'Raspberry Pi', 'ESP32', 'Robotics', 'Obstacle Avoidance'],
    seller: '65f1a0010000000000000004',
    rating: 4.8,
    reviewCount: 156,
    isFeatured: true,
  },
  {
    _id: '65f1c0010000000000000107',
    title: 'DHT22 / AM2302 Digital Temperature & Humidity Sensor',
    description: 'Capacitive humidity sensor & thermistor with calibrated digital signal output. Temperature range: -40 to 80°C (±0.5°C), Humidity range: 0-100% RH (±2% RH).',
    price: 249,
    originalPrice: 380,
    discountPercentage: 34,
    category: 'Sensors',
    stock: 140,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      operatingVoltage: '3.3V to 5V DC',
      temperatureAccuracy: '±0.5 °C',
      humidityAccuracy: '±2% RH',
      samplingPeriod: '2 Seconds',
    },
    compatibilityTags: ['Arduino', 'ESP32', 'Weather Station', 'IoT'],
    seller: '65f1a0010000000000000004',
    rating: 4.9,
    reviewCount: 88,
    isFeatured: true,
  },
  {
    _id: '65f1c0010000000000000108',
    title: 'MPU6050 6-DoF 3-Axis Gyroscope + Accelerometer Module (I2C)',
    description: 'Combines 3-axis gyroscope and 3-axis accelerometer on a single chip with on-board Digital Motion Processor (DMP) via I2C interface.',
    price: 149,
    originalPrice: 249,
    discountPercentage: 40,
    category: 'Sensors',
    stock: 180,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      operatingVoltage: '3V - 5V DC',
      gyroscopeRange: '±250 500 1000 2000 °/s',
      accelerometerRange: '±2 ±4 ±8 ±16 g',
      communication: 'Standard I2C protocol',
    },
    compatibilityTags: ['Self Balancing Robot', 'Drone Flight Controller', 'Arduino', 'ESP32'],
    seller: '65f1a0010000000000000004',
    rating: 4.8,
    reviewCount: 112,
    isFeatured: false,
  },
  {
    _id: '65f1c0010000000000000109',
    title: 'MQ-135 Air Quality & Hazardous Gas Sensor Module',
    description: 'Detects NH3, NOx, Alcohol, Benzene, Smoke, and CO2 gases in ambient air. Includes digital threshold out and analog voltage out pins.',
    price: 179,
    originalPrice: 280,
    discountPercentage: 36,
    category: 'Sensors',
    stock: 95,
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      operatingVoltage: '5V DC',
      targetGases: 'Ammonia, Sulfide, Benzene, Smoke, CO2',
      outputs: 'Analog Voltage + Digital TTL Switch',
    },
    compatibilityTags: ['Pollution Monitor', 'Air Purifier', 'Arduino', 'ESP32'],
    seller: '65f1a0010000000000000004',
    rating: 4.6,
    reviewCount: 52,
    isFeatured: false,
  },

  // Motors & Drivers
  {
    _id: '65f1c0010000000000000110',
    title: 'L298N Dual H-Bridge DC Motor Driver Board',
    description: 'High power dual motor driver module for driving up to 2 DC motors or 1 bipolar stepper motor with peak current of 2A per bridge.',
    price: 149,
    originalPrice: 220,
    discountPercentage: 32,
    category: 'Motors & Drivers',
    stock: 160,
    images: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      driverChip: 'L298N Dual H-Bridge',
      motorVoltage: '5V to 35V DC',
      peakCurrent: '2A per channel',
      logicVoltage: '5V DC',
    },
    compatibilityTags: ['Arduino', 'BO Motors', '2WD / 4WD Chassis', 'Robotics'],
    seller: '65f1a0010000000000000002',
    rating: 4.7,
    reviewCount: 145,
    isFeatured: true,
  },
  {
    _id: '65f1c0010000000000000111',
    title: 'SG90 Micro Servo Motor 9g (180 Degree Rotation)',
    description: 'Tiny lightweight micro servo motor ideal for RC planes, robotic arms, gripper mechanisms, and steering systems.',
    price: 95,
    originalPrice: 160,
    discountPercentage: 40,
    category: 'Motors & Drivers',
    stock: 250,
    images: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      operatingVoltage: '4.8V to 6V DC',
      stallTorque: '1.8 kg/cm',
      operatingSpeed: '0.12 sec / 60 degrees',
      gearType: 'Nylon Gear Set',
    },
    compatibilityTags: ['Robotic Arm', 'Pan-Tilt Sonar', 'Arduino Servo library'],
    seller: '65f1a0010000000000000002',
    rating: 4.8,
    reviewCount: 198,
    isFeatured: false,
  },
  {
    _id: '65f1c0010000000000000112',
    title: 'NEMA 17 Bipolar Stepper Motor (1.8 Deg, 42Ncm, 1.5A)',
    description: 'High torque hybrid bipolar stepper motor for 3D printers, CNC routers, automated camera sliders, and high accuracy positioning.',
    price: 699,
    originalPrice: 999,
    discountPercentage: 30,
    category: 'Motors & Drivers',
    stock: 65,
    images: [
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      stepAngle: '1.8 degrees (200 steps/rev)',
      holdingTorque: '42 Ncm (60 oz-in)',
      ratedCurrent: '1.5A per phase',
      frameSize: '42 x 42 mm (NEMA 17)',
    },
    compatibilityTags: ['3D Printers', 'CNC', 'A4988 Driver', 'DRV8825 Driver'],
    seller: '65f1a0010000000000000003',
    rating: 4.9,
    reviewCount: 74,
    isFeatured: true,
  },

  // Displays
  {
    _id: '65f1c0010000000000000113',
    title: '0.96 inch I2C OLED Display Module (128x64 SSD1306 Yellow-Blue)',
    description: 'Self-luminous monochrome display with high contrast, 178 degree wide viewing angle, fast refresh rate via I2C interface.',
    price: 189,
    originalPrice: 299,
    discountPercentage: 36,
    category: 'Displays',
    stock: 140,
    images: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      operatingVoltage: '3.3V - 5V DC',
      resolution: '128 x 64 pixels',
      driverIC: 'SSD1306',
      interface: 'I2C (Address 0x3C / 0x3D)',
    },
    compatibilityTags: ['Arduino', 'ESP32', 'Raspberry Pi Pico', 'Adafruit GFX'],
    seller: '65f1a0010000000000000004',
    rating: 4.9,
    reviewCount: 160,
    isFeatured: true,
  },
  {
    _id: '65f1c0010000000000000114',
    title: '16x2 Character LCD Module with PCF8574 I2C Backpack Interface',
    description: 'HD44780 compatible 16x2 alphanumeric display module fitted with I2C adapter backpack to reduce pin usage from 16 pins down to 2 wire I2C.',
    price: 199,
    originalPrice: 320,
    discountPercentage: 37,
    category: 'Displays',
    stock: 175,
    images: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      operatingVoltage: '5V DC',
      characters: '16 Columns x 2 Rows',
      backlight: 'Blue with White Text',
      interface: 'I2C Bus (Default Address 0x27)',
    },
    compatibilityTags: ['LiquidCrystal_I2C', 'Arduino', 'ESP32', 'Pi Pico'],
    seller: '65f1a0010000000000000004',
    rating: 4.8,
    reviewCount: 120,
    isFeatured: false,
  },

  // Power & Passives
  {
    _id: '65f1c0010000000000000115',
    title: 'TP4056 1S 5V 1A Li-ion Battery Charger Module with Protection',
    description: 'Micro USB / Type-C 1S 3.7V Lithium battery charging board with dual DW01A overcharge, over-discharge, and current protection.',
    price: 45,
    originalPrice: 85,
    discountPercentage: 47,
    category: 'Power & Battery',
    stock: 500,
    images: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      chargingCurrent: '1A Programmable',
      inputVoltage: '4.5V to 5.5V DC',
      fullChargeVoltage: '4.2V ± 1%',
      protection: 'DW01A + 8205A MOSFET',
    },
    compatibilityTags: ['18650 Battery', 'Lithium Polymer', 'Portable IoT Power'],
    seller: '65f1a0010000000000000002',
    rating: 4.9,
    reviewCount: 230,
    isFeatured: false,
  },
  {
    _id: '65f1c0010000000000000116',
    title: '18650 3.7V 2600mAh Rechargeable Li-ion Battery Cell',
    description: 'High drain grade-A lithium-ion rechargeable cell for powering microcontrollers, robotics motors, and portable IoT devices.',
    price: 185,
    originalPrice: 280,
    discountPercentage: 34,
    category: 'Power & Battery',
    stock: 220,
    images: [
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    ],
    specifications: {
      nominalVoltage: '3.7V DC',
      capacity: '2600 mAh',
      maxDischargeCurrent: '5A Continuous',
      cycleLife: '>500 Charge Cycles',
    },
    compatibilityTags: ['TP4056 Charger', 'Robotics', 'Battery Shield'],
    seller: '65f1a0010000000000000002',
    rating: 4.8,
    reviewCount: 140,
    isFeatured: false,
  }
];

const liveProjectKits = [
  {
    _id: '65f1d0010000000000000001',
    title: 'IoT Smart Home Automation System Kit',
    subtitle: 'Control lights, appliances, and monitor room temperature via Smartphone App using ESP32.',
    description: 'A complete end-to-end kit containing ESP32 development board, 4-Channel 5V Relay module, DHT11 Temperature & Humidity Sensor, 0.96 inch OLED display, breadboard, and premium jumper wires.',
    category: 'IoT',
    difficulty: 'Intermediate',
    estimatedTimeHours: 5,
    price: 1499,
    originalPrice: 1999,
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
    ],
    componentsRequired: [
      { name: 'ESP32 NodeMCU Board', quantity: 1, productId: '65f1c0010000000000000102', unitPrice: 349 },
      { name: '4-Channel 5V Relay Module', quantity: 1, unitPrice: 199 },
      { name: 'DHT22 Sensor', quantity: 1, productId: '65f1c0010000000000000107', unitPrice: 249 },
      { name: '0.96 OLED Display', quantity: 1, productId: '65f1c0010000000000000113', unitPrice: 189 },
    ],
    circuitDiagramUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    codeSnippet: `// ESP32 Smart Home IoT Starter Code
#include <WiFi.h>
#include <DHT.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASS";

#define DHTPIN 4
#define RELAY1_PIN 12

void setup() {
  Serial.begin(115200);
  pinMode(RELAY1_PIN, OUTPUT);
  digitalWrite(RELAY1_PIN, LOW);
  WiFi.begin(ssid, password);
}

void loop() {
  // Handles MQTT & Sensor reading loop
}`,
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'Mount components on Breadboard',
        content: 'Insert ESP32 NodeMCU gently in center lane. Connect 3.3V rail to positive power strip and GND rail to ground strip.',
      },
      {
        stepNumber: 2,
        title: 'Wire the Relay Module',
        content: 'Connect IN1 of 4-Channel Relay to GPIO pin 12 on ESP32, and VCC to 5V (VIN) pin.',
      },
      {
        stepNumber: 3,
        title: 'Flash Firmware Sketch',
        content: 'Upload Arduino C++ firmware sketch using Arduino IDE with ESP32 board manager installed.',
      },
    ],
    rating: 4.9,
    buildCount: 142,
    isFeatured: true,
  },
  {
    _id: '65f1d0010000000000000002',
    title: 'Autonomous Obstacle Avoiding Robot Kit',
    subtitle: 'Self-driving 2WD chassis robot powered by Arduino & Ultrasonic distance sensor.',
    description: 'Build a smart mobile robot that navigates around obstacles automatically using HC-SR04 ultrasonic sonar sensor mounted on a SG90 Servo motor.',
    category: 'Robotics',
    difficulty: 'Beginner',
    estimatedTimeHours: 3,
    price: 1299,
    originalPrice: 1699,
    images: [
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80',
    ],
    componentsRequired: [
      { name: 'Arduino UNO R3 Board', quantity: 1, productId: '65f1c0010000000000000101', unitPrice: 449 },
      { name: 'L298N Motor Driver', quantity: 1, productId: '65f1c0010000000000000110', unitPrice: 149 },
      { name: 'HC-SR04 Ultrasonic Sensor', quantity: 1, productId: '65f1c0010000000000000106', unitPrice: 89 },
      { name: '2WD Acrylic Robot Chassis + Motors', quantity: 1, unitPrice: 450 },
    ],
    circuitDiagramUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    codeSnippet: `// Obstacle Avoiding Robot C++ Code
#include <Servo.h>
#define TRIG_PIN A0
#define ECHO_PIN A1

void setup() {
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
}

void loop() {
  long distance = readDistance();
  if (distance < 20) {
    turnRight();
  } else {
    moveForward();
  }
}`,
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'Assemble 2WD Robot Chassis',
        content: 'Attach dual BO motors to acrylic base plate using screws. Fit wheels and front caster wheel.',
      },
      {
        stepNumber: 2,
        title: 'Connect Motors to L298N Driver',
        content: 'Connect Left Motor wires to OUT1/OUT2 terminals and Right Motor to OUT3/OUT4.',
      },
    ],
    rating: 4.8,
    buildCount: 98,
    isFeatured: true,
  },
  {
    _id: '65f1d0010000000000000003',
    title: 'AI Smart Plant Irrigation & Soil Moisture Monitor Kit',
    subtitle: 'Automated plant watering system with capacitive soil moisture sensor and OLED display.',
    description: 'Keep your house plants alive automatically! Monitors soil moisture levels using a corrosion-resistant capacitive sensor and triggers a mini 5V DC water pump when soil gets dry.',
    category: 'IoT',
    difficulty: 'Beginner',
    estimatedTimeHours: 2,
    price: 1199,
    originalPrice: 1599,
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
    ],
    componentsRequired: [
      { name: 'ESP32 NodeMCU Board', quantity: 1, productId: '65f1c0010000000000000102', unitPrice: 349 },
      { name: 'Capacitive Soil Moisture Sensor v1.2', quantity: 1, unitPrice: 120 },
      { name: '5V Submersible Water Pump + Hose', quantity: 1, unitPrice: 180 },
      { name: '0.96 OLED Display Module', quantity: 1, productId: '65f1c0010000000000000113', unitPrice: 189 },
    ],
    circuitDiagramUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    codeSnippet: `// Soil Moisture Irrigation Code
#define SOIL_PIN 34
#define PUMP_RELAY 26

void setup() {
  pinMode(PUMP_RELAY, OUTPUT);
}

void loop() {
  int moisture = analogRead(SOIL_PIN);
  if (moisture > 2800) {
    digitalWrite(PUMP_RELAY, HIGH); // Water plant
  } else {
    digitalWrite(PUMP_RELAY, LOW);
  }
}`,
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'Calibrate Soil Sensor',
        content: 'Place sensor in dry air, then submerge in water glass to note min/max ADC values.',
      },
      {
        stepNumber: 2,
        title: 'Setup Pump Tubing',
        content: 'Submerge 5V water pump in water reservoir and route silicone tube to plant pot soil.',
      },
    ],
    rating: 4.9,
    buildCount: 88,
    isFeatured: true,
  },
  {
    _id: '65f1d0010000000000000004',
    title: 'Air Quality & Pollution Monitoring Station Kit',
    subtitle: 'Real-time AQI & CO2 level logger with OLED telemetry screen and web dashboard.',
    description: 'Measure indoor air quality, hazardous gases, and ambient humidity. Logs data live to cloud server with smartphone notification alerts when air quality degrades.',
    category: 'IoT',
    difficulty: 'Intermediate',
    estimatedTimeHours: 4,
    price: 1099,
    originalPrice: 1499,
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80',
    ],
    componentsRequired: [
      { name: 'ESP32 NodeMCU Board', quantity: 1, productId: '65f1c0010000000000000102', unitPrice: 349 },
      { name: 'MQ-135 Gas Sensor', quantity: 1, productId: '65f1c0010000000000000109', unitPrice: 179 },
      { name: 'DHT22 Sensor', quantity: 1, productId: '65f1c0010000000000000107', unitPrice: 249 },
      { name: '0.96 OLED Display', quantity: 1, productId: '65f1c0010000000000000113', unitPrice: 189 },
    ],
    circuitDiagramUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    codeSnippet: `// AQI Station Code
#include <Adafruit_SSD1306.h>
void setup() {
  Serial.begin(115200);
}`,
    stepByStepGuide: [
      {
        stepNumber: 1,
        title: 'Pre-heat MQ-135 Sensor',
        content: 'Allow gas sensor 24-hour burn-in period for accurate chemical sensing output.',
      }
    ],
    rating: 4.7,
    buildCount: 62,
    isFeatured: false,
  }
];

const liveOrders = [
  {
    _id: '65f1e0010000000000000001',
    user: '65f1a0010000000000000005',
    orderItems: [
      {
        title: 'Arduino UNO R3 Development Board (CH340G)',
        quantity: 2,
        price: 449,
        product: '65f1c0010000000000000101',
        itemType: 'product',
      },
      {
        title: 'IoT Smart Home Automation System Kit',
        quantity: 1,
        price: 1499,
        projectKit: '65f1d0010000000000000001',
        itemType: 'kit',
      },
    ],
    shippingAddress: {
      fullName: 'Rahul Sharma',
      phone: '9876543210',
      street: 'Hostel 12, BITS Pilani Campus',
      city: 'Pilani',
      state: 'Rajasthan',
      pincode: '333031',
      country: 'India',
    },
    paymentMethod: 'UPI',
    itemsPrice: 2397,
    taxPrice: 120,
    shippingPrice: 50,
    totalPrice: 2567,
    isPaid: true,
    paidAt: new Date('2026-10-04T10:00:00Z'),
    orderStatus: 'Shipped',
    createdAt: new Date('2026-10-04T09:30:00Z'),
  },
  {
    _id: '65f1e0010000000000000002',
    user: '65f1a0010000000000000006',
    orderItems: [
      {
        title: 'ESP32 NodeMCU Wi-Fi + Bluetooth Dev Board (WROOM-32U)',
        quantity: 1,
        price: 349,
        product: '65f1c0010000000000000102',
        itemType: 'product',
      },
      {
        title: '0.96 inch I2C OLED Display Module (128x64 SSD1306 Yellow-Blue)',
        quantity: 1,
        price: 189,
        product: '65f1c0010000000000000113',
        itemType: 'product',
      },
    ],
    shippingAddress: {
      fullName: 'Priya Verma',
      phone: '9988776655',
      street: 'Kailash Colony, Near Metro Station',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110048',
      country: 'India',
    },
    paymentMethod: 'Card',
    itemsPrice: 538,
    taxPrice: 28,
    shippingPrice: 40,
    totalPrice: 606,
    isPaid: true,
    paidAt: new Date('2026-10-03T14:20:00Z'),
    orderStatus: 'Delivered',
    createdAt: new Date('2026-10-03T14:00:00Z'),
  }
];

const liveCategories = [
  { _id: 'cat_1', name: 'Microcontrollers', icon: 'Cpu', count: 42, active: true },
  { _id: 'cat_2', name: 'Sensors', icon: 'Radio', count: 68, active: true },
  { _id: 'cat_3', name: 'Motors & Drivers', icon: 'Settings', count: 28, active: true },
  { _id: 'cat_4', name: 'Wireless & IoT', icon: 'Wifi', count: 35, active: true },
  { _id: 'cat_5', name: 'Displays', icon: 'Tv', count: 19, active: true },
  { _id: 'cat_6', name: 'Power Management', icon: 'Battery', count: 15, active: true },
  { _id: 'cat_7', name: 'Project Kits', icon: 'Box', count: 18, active: true },
];

const liveCoupons = [
  { _id: 'cp_1', code: 'FIRSTBUY', discountType: 'percentage', discountValue: 15, minOrder: 500, active: true, usageCount: 142 },
  { _id: 'cp_2', code: 'STUDENT10', discountType: 'percentage', discountValue: 10, minOrder: 200, active: true, usageCount: 520 },
  { _id: 'cp_3', code: 'MAKER500', discountType: 'flat', discountValue: 500, minOrder: 2500, active: true, usageCount: 45 },
];

const liveBanners = [
  { _id: 'b_1', title: 'Build Your First IoT Project', subtitle: 'Get complete starter kits with ESP32 & sensors', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1200&q=80', active: true },
  { _id: 'b_2', title: 'Robotics Component Sale', subtitle: 'Flat 20% OFF on L298N drivers & stepper motors', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', active: true },
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
