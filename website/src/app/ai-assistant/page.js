'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Send, Bot, Lightbulb, Sparkles, Loader2, ChevronLeft, ArrowRight } from 'lucide-react';
import api from '@/lib/api';
import { BRAND } from '@/theme/tokens';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello Maker! I am Tech Crate AI. Ask me anything about microcontroller pinouts, sensor wiring, code troubleshooting, or project kit selection!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { sender: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input.trim();
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { prompt: currentInput, message: currentInput });
      const data = res.data;
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: data.reply || data.response || 'Here is what I found for your project setup.',
          suggestedComponents: data.suggestedComponents || [],
          circuitTip: data.circuitTip || null,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: 'For an ESP32 or Arduino project, recommend connecting VCC to 3.3V/5V and checking that your I2C SDA/SCL pins match your board pinout (GPIO 21/22 for ESP32).',
          circuitTip: 'Always use a 4.7kΩ pull-up resistor on I2C communication lines.',
          suggestedComponents: [
            { name: 'ESP32 NodeMCU Wi-Fi + BLE', price: 349 },
            { name: 'OLED Display 0.96 inch I2C', price: 199 },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-16">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center border shadow-xs"
            style={{ backgroundColor: BRAND.primary, borderColor: BRAND.cyan }}
          >
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1
              className="text-lg font-black tracking-tight"
              style={{ color: BRAND.navy }}
            >
              Tech Crate AI Shopping Assistant
            </h1>
            <p className="text-xs text-slate-500">
              Instant hardware recommendations, pinout guides & code assistance
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 min-h-[460px] flex flex-col justify-between">
        <div className="space-y-3.5 overflow-y-auto max-h-[500px] pr-1">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'ml-auto text-white shadow-xs'
                  : 'mr-auto bg-slate-50 border border-slate-200 text-slate-800'
              }`}
              style={{
                backgroundColor: msg.sender === 'user' ? BRAND.primary : undefined,
              }}
            >
              <p className="whitespace-pre-line">{msg.text}</p>

              {msg.circuitTip && (
                <div className="mt-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-semibold">Tip: {msg.circuitTip}</span>
                </div>
              )}

              {msg.suggestedComponents?.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Recommended Parts:
                  </span>
                  <div className="space-y-1">
                    {msg.suggestedComponents.map((c, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 text-xs"
                      >
                        <span className="font-medium text-slate-800">{c.name}</span>
                        <span className="font-bold text-slate-900">₹{c.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="mr-auto bg-slate-50 border border-slate-200 p-3 rounded-2xl flex items-center gap-2 text-xs text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
              <span>Thinking & checking pinouts...</span>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSend} className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI about ESP32 pinouts, motor drivers, sensor wiring..."
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-[#032762] hover:bg-[#034697] text-white shadow-sm transition-all active:scale-95 disabled:opacity-40"
            style={{ backgroundColor: BRAND.navy }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
