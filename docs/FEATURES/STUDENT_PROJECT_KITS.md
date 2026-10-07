# Student Project Kits & Compatibility Checker Feature Specification

This document details the engineering project kit platform, component bundling, and circuit compatibility engine.

---

## 🛠️ Data Model (`models/ProjectKit.js`)

Engineering project kits bundle individual components (microcontrollers, sensors, motor drivers, power modules) into complete DIY project packages for students:

```javascript
{
  title: "Smart Home Automation Kit",
  description: "Complete IoT kit with ESP32, 4-channel relay module, and sensors.",
  category: "IoT",
  price: 1499,
  componentsList: [
    { componentName: "ESP32 NodeMCU Board", quantity: 1 },
    { componentName: "5V 4-Channel Relay Module", quantity: 1 },
    { componentName: "DHT11 Sensor", quantity: 1 }
  ],
  schematicUrl: "https://res.cloudinary.com/schematic.png",
  difficultyLevel: "Intermediate"
}
```

---

## ⚡ Compatibility Engine (`controllers/projectController.js`)

Endpoint `POST /api/projects/check-compatibility` verifies voltage and interface compatibility between selected components (e.g., matching 3.3V logic vs 5V logic level shifting requirements).
