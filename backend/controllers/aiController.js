// @desc AI Assistant for engineering project guidance, component selection & debugging
// @route POST /api/ai/chat
const chatAssistant = async (req, res) => {
  try {
    const { message, projectContext, selectedComponents } = req.body;
    const userMsg = (message || '').toLowerCase();

    let reply = '';
    let suggestedComponents = [];
    let circuitTip = '';

    if (userMsg.includes('esp32') || userMsg.includes('wifi') || userMsg.includes('iot')) {
      reply =
        'The ESP32 is an excellent dual-core microcontroller with built-in Wi-Fi and Bluetooth. For IoT projects, pair it with MQTT or HTTP endpoints. Ensure your power supply provides at least 500mA at 3.3V during RF transmission bursts!';
      suggestedComponents = [
        { name: 'ESP32 NodeMCU Development Board', price: 349 },
        { name: 'DHT11 Temperature & Humidity Sensor', price: 99 },
        { name: '0.96 inch I2C OLED Display', price: 189 },
      ];
      circuitTip = 'Connect VCC to 3.3V pin of ESP32 and SDA to GPIO21, SCL to GPIO22.';
    } else if (userMsg.includes('arduino') || userMsg.includes('robot') || userMsg.includes('motor')) {
      reply =
        'For building a robot, Arduino UNO or Nano combined with an L298N Motor Driver operates dual DC motors reliably. Always connect common ground (GND) between the motor driver and Arduino!';
      suggestedComponents = [
        { name: 'Arduino UNO R3 Board', price: 449 },
        { name: 'L298N Dual H-Bridge Motor Driver', price: 149 },
        { name: 'HC-SR04 Ultrasonic Distance Sensor', price: 89 },
        { name: 'Dual Shaft BO Motors (2x)', price: 120 },
      ];
      circuitTip = 'Do not power BO Motors directly from Arduino 5V pin! Use external 7.4V / 9V battery into L298N VMS terminal.';
    } else if (userMsg.includes('code') || userMsg.includes('error') || userMsg.includes('debug')) {
      reply =
        'Common electronics debugging check:\n1. Check baud rate matches Serial.begin(9600 or 115200)\n2. Verify pull-up resistors on I2C lines (SDA/SCL)\n3. Check GPIO pin definitions in code match physical wiring.';
      suggestedComponents = [{ name: 'Logic Analyzer 8-CH 24MHz', price: 599 }];
    } else {
      reply = `Hello Engineer! I am TechCrate AI. I can assist you with component selection, circuit pinouts, code snippets, and kit recommendations for your project. How can I assist you with "${message}"?`;
      suggestedComponents = [
        { name: 'Smart Home Automation Kit', price: 1499 },
        { name: 'Obstacle Avoiding Robot Kit', price: 1299 },
      ];
    }

    res.json({
      reply,
      suggestedComponents,
      circuitTip,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { chatAssistant };
