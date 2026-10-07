# AI Hardware Assistant Feature Specification

This document describes the AI Assistant integration for hardware selection, pinout wiring recommendations, and troubleshooting guidance.

---

## 🤖 Feature Overview

The AI Assistant assists engineering students and makers in selecting compatible electronics components, understanding microcontroller pinouts (ESP32, Arduino, Raspberry Pi), and resolving common circuit wiring errors.

---

## 📡 API Endpoint (`/api/ai/chat`)

- **Method**: `POST`
- **Controller**: `backend/controllers/aiController.js`
- **Request Body**:
  ```json
  {
    "message": "I want to build an IoT temperature monitor using ESP32"
  }
  ```
- **Response**:
  ```json
  {
    "reply": "The ESP32 is an excellent dual-core microcontroller with built-in Wi-Fi and Bluetooth...",
    "suggestedComponents": [
      { "name": "ESP32 NodeMCU Development Board", "price": 349 },
      { "name": "DHT11 Temperature Sensor", "price": 99 }
    ],
    "circuitTip": "Connect VCC to 3.3V pin of ESP32 and SDA to GPIO21, SCL to GPIO22.",
    "timestamp": "2026-10-07T15:00:00.000Z"
  }
  ```

---

## 📱 Mobile Screen (`AIAssistantScreen.js`)

- Dynamic chat bubble interface.
- Interactive component cards allowing users to add suggested items directly into their cart with one tap.
