import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Send, Bot, Lightbulb } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import Header from '../../components/common/Header';
import { aiService } from '../../services/aiService';

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello Maker! I am TechCrate AI. Ask me anything about microcontroller pinouts, sensor wiring, code troubleshooting, or project kit selection!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      const res = await aiService.chat(currentInput);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: res.reply,
          suggestedComponents: res.suggestedComponents,
          circuitTip: res.circuitTip,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Sorry, could not process request. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="TechCrate AI Assistant" />

      <ScrollView contentContainerStyle={styles.chatContent}>
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={[
              styles.msgBubble,
              msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
            ]}
          >
            <Text style={msg.sender === 'user' ? styles.userText : styles.aiText}>
              {msg.text}
            </Text>

            {msg.circuitTip ? (
              <View style={styles.tipBox}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Lightbulb size={14} color={colors.primary} />
                  <Text style={styles.tipText}>Tip: {msg.circuitTip}</Text>
                </View>
              </View>
            ) : null}

            {msg.suggestedComponents?.length > 0 && (
              <View style={styles.suggestionsBox}>
                <Text style={styles.suggestionTitle}>Recommended Parts:</Text>
                {msg.suggestedComponents.map((c, i) => (
                  <Text key={i} style={styles.suggestionItem}>
                    • {c.name} — ₹{c.price}
                  </Text>
                ))}
              </View>
            )}
          </View>
        ))}

        {loading && (
          <View style={[styles.msgBubble, styles.aiBubble]}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
      </ScrollView>

      {/* Input Field */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Ask AI about ESP32 pinouts, motor drivers..."
          placeholderTextColor={colors.textTertiary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Send size={16} color={colors.surface} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  chatContent: { padding: 16, paddingBottom: 80 },
  msgBubble: { padding: 14, borderRadius: 16, marginBottom: 12, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  aiBubble: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  userText: { color: colors.surface, fontSize: 14, fontWeight: '600' },
  aiText: { color: colors.text, fontSize: 14, lineHeight: 20 },
  tipBox: { marginTop: 8, padding: 8, borderRadius: 8, backgroundColor: colors.primary + '15' },
  tipText: { color: colors.primary, fontSize: 12, fontWeight: '700' },
  suggestionsBox: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border },
  suggestionTitle: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' },
  suggestionItem: { color: colors.text, fontSize: 12, marginTop: 2 },
  inputBar: { flexDirection: 'row', padding: 12, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.background, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: colors.text, fontSize: 14 },
  sendBtn: { marginLeft: 8, backgroundColor: colors.primary, paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  sendBtnText: { color: colors.surface, fontWeight: '800', fontSize: 14 },
});
