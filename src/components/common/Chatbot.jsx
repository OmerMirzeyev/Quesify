import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

export default function Chatbot() {
  const { isChatbotOpen, setIsChatbotOpen, chatbotMessages, setChatbotMessages, chatbotAlert } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatbotMessages, isTyping]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    // Add user message
    const userMsg = { sender: 'user', text: query };
    setChatbotMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      const lower = query.toLowerCase();
      let response = '';

      if (lower.includes('massiv') || lower.includes('array')) {
        response = `💡 Mentor Şərhi:
Massiv (Array) – eyni tipli məlumatları bir ardıcıllıq şəklində yaddaşda saxlamaq üçün istifadə olunan strukturdur.
Məsələn, sinifdəki tələbələrin siyahısı. Yadda saxlayın ki, massivlərin indeksləri həmişə 0-dan başlayır!

Nümunə (C#):
int[] numbers = new int[] { 10, 20, 30 };
Console.WriteLine(numbers[0]); // 10 çap edəcək`;
      } else if (lower.includes('loop') || lower.includes('dövr') || lower.includes('döngü') || lower.includes('for') || lower.includes('while')) {
        response = `💡 Mentor Şərhi:
Dövrlər (Loops) – müəyyən bir şərt ödənilənə qədər eyni kod blokunu təkrar-təkrar işlətmək üçün istifadə olunur.
Ən populyarları 'for' (təkrarlanma sayı əvvəlcədən bəlli olduqda) və 'while' (şərt doğru olduğu müddətcə) dövrləridir.

Nümunə (Python):
for i in range(3):
    print("Salam!") # 3 dəfə Salam çap edəcək`;
      } else if (lower.includes('c#') || lower.includes('csharp')) {
        response = `💡 Mentor Şərhi:
C# – Microsoft tərəfindən yaradılmış, tip təhlükəsizliyi yüksək olan, güclü, obyekt yönümlü proqramlaşdırma dilidir.
Geniş şəkildə veb (ASP.NET), oyun (Unity engine) və Windows masaüstü tətbiqlərində istifadə olunur.`;
      } else if (lower.includes('java')) {
        response = `💡 Mentor Şərhi:
Java – 'Bir dəfə yaz, hər yerdə işlət' (Write Once, Run Anywhere) devizi ilə məşhur olan, class-əsaslı, obyekt yönümlü dilidir.
Böyük korporativ sistemlərdə və Android mobil tətbiq inkişafında geniş istifadə olunur.`;
      } else if (lower.includes('python')) {
        response = `💡 Mentor Şərhi:
Python – oxunaqlılığı çox yüksək olan, sintaksisi sadə, lakin inanılmaz dərəcədə güclü bir dildir.
Süni İntellekt (AI), Data Science, Machine Learning və avtomatlaşdırma skriptləri üçün dünya üzrə #1 seçimdir.`;
      } else if (lower.includes('sintaksis') || lower.includes('syntax') || lower.includes('səhv') || lower.includes('error')) {
        response = `💡 Mentor Şərhi:
Proqramlaşdırmada sintaksis (syntax) – kodun yazılma dil qaydalarıdır. Necə ki Azərbaycan dilində nöqtə-vergül qaydaları var, proqramlaşdırmada da ; və {} simvolları compiler-ə kodu necə oxuyacağını deyir. Bircə dənə ; buraxmaq sintaksis səhvinə yol açır!`;
      } else if (lower.includes('joker')) {
        response = `💡 Mentor Şərhi:
50/50 Jokeri quizlər zamanı istifadə edə bilərsiniz. O sizə kömək olmaq üçün variantlar sırasından 2 yanlış cavabı tamamilə silir və düzgün cavab tapma şansınızı 2 dəfə artırır!`;
      } else if (lower.includes('can') || lower.includes('iksir') || lower.includes('heart')) {
        response = `💡 Mentor Şərhi:
Hər dəfə səhv cavab verəndə 1 Can (❤️) itirirsiniz. Canınız bitəndə suallara cavab verə bilməzsiniz.
Canları bərpa etmək üçün:
1. Hər 5 dəqiqədən bir avtomatik 1 Can bərpa olunur.
2. Qızıl Mağazasından qızıllarınızla 'Can İksiri' ala bilərsiniz (Həftəlik 1 ədəd limiti ilə).`;
      } else {
        response = `💡 Mentor Şərhi:
Maraqlı sualdır! Mentor olaraq sizə tövsiyəm, bu mövzunu praktiki kod yazaraq yoxlamaqdır.
Əlavə olaraq C#, Java və Python yol xəritələrindəki (roadmap) dərsləri bitirməyə çalışın. Hər hansı sintaksis mövzusunu tam dəqiqləşdirmək istəyirsinizsə, mənə yaza bilərsiniz! 🚀`;
      }

      setChatbotMessages(prev => [...prev, { sender: 'bot', text: response }]);
    }, 1000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="chatbot-fab"
        onClick={() => setIsChatbotOpen(!isChatbotOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: chatbotAlert ? 'linear-gradient(135deg, #ef4444, #f59e0b)' : 'var(--gradient-primary)',
          border: chatbotAlert ? '2px solid rgba(239, 68, 68, 0.6)' : 'none',
          boxShadow: chatbotAlert
            ? '0 0 24px rgba(239, 68, 68, 0.55), 0 4px 15px rgba(0,0,0,0.35)'
            : isChatbotOpen
              ? '0 0 20px rgba(139, 92, 246, 0.6)'
              : '0 4px 15px rgba(0,0,0,0.35), var(--glow-purple)',
          color: 'white',
          fontSize: '1.6rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          animation: chatbotAlert
            ? 'pulseWarning 1s ease-in-out infinite'
            : !isChatbotOpen
              ? 'float 3s ease-in-out infinite'
              : 'none',
        }}
        title="AI Proqramlaşdırma Mentoru"
      >
        {isChatbotOpen ? '✕' : chatbotAlert ? '💡' : '🤖'}
      </button>

      {/* Chat Window Panel */}
      {isChatbotOpen && (
        <div
          id="chatbot-window"
          className="card"
          style={{
            position: 'fixed',
            bottom: '88px',
            right: '20px',
            width: '360px',
            height: '480px',
            maxHeight: 'calc(100vh - 120px)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5), var(--glow-purple)',
            border: '1.5px solid var(--accent-purple)',
            animation: 'fadeIn 0.3s ease',
            background: 'var(--bg-card)'
          }}
        >
          {/* Chat Header */}
          <div style={{
            background: 'var(--gradient-primary)',
            padding: '0.85rem 1.2rem',
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.4rem' }}>🤖</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.88rem', letterSpacing: '0.5px' }}>AI MENTOR</div>
                <div style={{ fontSize: '0.65rem', opacity: 0.85, fontWeight: 600 }}>Həmişə aktiv · Proqramlaşdırma Məşqçisi</div>
              </div>
            </div>
            <button
              onClick={() => setIsChatbotOpen(false)}
              style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.1rem', padding: 0 }}
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            background: 'var(--bg-input)'
          }}>
            {chatbotMessages.map((msg, i) => {
              if (msg.sender === 'system') {
                return (
                  <div key={i} style={{
                    alignSelf: 'center',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: 'var(--accent-red)',
                    padding: '0.4rem 0.85rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    maxWidth: '90%',
                    textAlign: 'center',
                    lineHeight: 1.45,
                    animation: 'pulseWarning 2s ease-in-out infinite'
                  }}>
                    {msg.text}
                  </div>
                );
              }

              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={i}
                  style={{
                    alignSelf: isBot ? 'flex-start' : 'flex-end',
                    maxWidth: '82%',
                    background: isBot ? 'var(--bg-card)' : 'var(--gradient-primary)',
                    border: isBot ? '1px solid var(--border-color)' : 'none',
                    borderRadius: isBot ? '12px 12px 12px 2px' : '12px 12px 2px 12px',
                    padding: '0.65rem 0.9rem',
                    boxShadow: isBot ? 'none' : '0 2px 8px rgba(139, 92, 246, 0.15)'
                  }}
                >
                  <p style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                    color: isBot ? 'var(--text-primary)' : 'white',
                    whiteSpace: 'pre-line'
                  }}>
                    {msg.text}
                  </p>
                </div>
              );
            })}

            {isTyping && (
              <div style={{
                alignSelf: 'flex-start',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px 12px 12px 2px',
                padding: '0.5rem 0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem'
              }}>
                <span className="dot-bounce" style={{ width: '6px', height: '6px', background: 'var(--accent-purple-light)', borderRadius: '50%', display: 'inline-block' }} />
                <span className="dot-bounce" style={{ width: '6px', height: '6px', background: 'var(--accent-purple-light)', borderRadius: '50%', display: 'inline-block', animationDelay: '0.2s' }} />
                <span className="dot-bounce" style={{ width: '6px', height: '6px', background: 'var(--accent-purple-light)', borderRadius: '50%', display: 'inline-block', animationDelay: '0.4s' }} />
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '0.75rem 1rem',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '0.5rem',
              background: 'var(--bg-card)'
            }}
          >
            <input
              type="text"
              placeholder="Mentorunuza sual verin..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
              style={{
                flex: 1,
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: '100px',
                padding: '0.45rem 1rem',
                fontSize: '0.8rem',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="btn btn-primary"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                fontSize: '0.9rem',
                boxShadow: 'none'
              }}
            >
              ➔
            </button>
          </form>
        </div>
      )}
    </>
  );
}
