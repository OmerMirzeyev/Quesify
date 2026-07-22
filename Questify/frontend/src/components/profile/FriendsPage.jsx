import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { getRegisteredUsers, getUserProgress } from '../../utils/storage';
import { apiFetch } from '../../utils/api';

export default function FriendsPage() {
  const {
    sessionEmail,
    friends,
    friendRequests,
    chats,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    sendChatMessage,
    markChatAsRead,
    t
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState(null); // friend email for chat drawer
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Mark selected friend's chat as read when opened or updated
  useEffect(() => {
    if (selectedFriend && markChatAsRead) {
      markChatAsRead(selectedFriend);
    }
  }, [selectedFriend, chats, markChatAsRead]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, selectedFriend]);

  // Retrieve friends full details dynamically
  const registeredUsers = getRegisteredUsers();

  // Pull each friend's *current* DB-persisted avatar so a friend's profile picture/avatar
  // change is visible here too, not just in whichever browser they set it from.
  const [dbAvatars, setDbAvatars] = useState({});
  useEffect(() => {
    if (friends.length === 0) return;
    let cancelled = false;
    apiFetch('/api/users/avatars', { method: 'POST', auth: true, body: { emails: friends } })
      .then(({ ok, data }) => {
        if (!cancelled && ok && Array.isArray(data)) {
          const map = {};
          data.forEach((u) => { map[u.email] = u; });
          setDbAvatars(map);
        }
      })
      .catch(() => { /* offline — fall back to locally-cached emoji below */ });
    return () => { cancelled = true; };
  }, [friends]);

  const friendsList = friends.map(email => {
    const userReg = registeredUsers.find(u => u.email === email.toLowerCase());
    const userProg = getUserProgress(email);
    const dbAvatar = dbAvatars[email.toLowerCase()];
    return {
      email,
      name: userReg?.username || userProg?.user?.username || email,
      emoji: dbAvatar?.emoji || userProg?.user?.emoji || '🎮',
      avatarUrl: dbAvatar?.avatarUrl || null,
      level: userProg?.user?.level || 1,
      xp: userProg?.user?.xp || 0,
      role: userReg?.role || 'İstifadəçi',
    };
  });

  // Filter list of pending requests sent to us
  const incomingRequests = friendRequests.filter(r => r.toEmail.toLowerCase() === sessionEmail.toLowerCase() && r.status === 'pending');
  const outgoingRequests = friendRequests.filter(r => r.fromEmail.toLowerCase() === sessionEmail.toLowerCase() && r.status === 'pending');

  // Search users pool to add as friend
  const searchResults = searchQuery.trim() !== ''
    ? registeredUsers.filter(usr => {
        const matchesQuery = usr.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             usr.email.toLowerCase().includes(searchQuery.toLowerCase());
        const isSelf = usr.email.toLowerCase() === sessionEmail.toLowerCase();
        const isAlreadyFriend = friends.includes(usr.email.toLowerCase());
        return matchesQuery && !isSelf && !isAlreadyFriend;
      })
    : [];

  const handleSendRequest = (email) => {
    const success = sendFriendRequest(email);
    if (success) {
      setSearchQuery('');
    }
  };

  const activeFriendData = selectedFriend
    ? friendsList.find(f => f.email === selectedFriend)
    : null;

  const chatMessages = selectedFriend && chats[selectedFriend.toLowerCase()]
    ? chats[selectedFriend.toLowerCase()]
    : [];

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendChatMessage(selectedFriend, chatInput);
    setChatInput('');
  };

  return (
    <div className="friends-page-container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', animation: 'fadeIn 0.4s ease' }}>
      
      {/* Page Header */}
      <div className="section-header">
        <div>
          <div className="section-title">Dostluq Mərkəzi 👥</div>
          <div className="section-subtitle">Digər proqramlaşdırma tələbələri ilə əlaqə saxlayın və söhbət edin</div>
        </div>
      </div>

      <div className="friends-grid-layout" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
        
        {/* Left Column: Search & Friend Requests */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Search Users Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-purple-light)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>🔍</span> Tələbə Axtar
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              İstifadəçi adı və ya e-poçt yazaraq digər proqramçıları tapın.
            </p>
            
            <input
              type="text"
              className="input-field"
              placeholder="Məs: Alice, admin@questify.az..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', marginBottom: searchQuery ? '1rem' : 0 }}
            />

            {searchQuery && (
              <div className="search-results-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                {searchResults.length === 0 ? (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                    Uyğun tələbə tapılmadı.
                  </div>
                ) : (
                  searchResults.map(usr => {
                    const reqSent = outgoingRequests.some(r => r.toEmail.toLowerCase() === usr.email.toLowerCase());
                    return (
                      <div key={usr.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0.75rem', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.4rem' }}>🎮</span>
                          <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{usr.username}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{usr.email}</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={`btn btn-sm ${reqSent ? 'btn-outline' : 'btn-primary'}`}
                          disabled={reqSent}
                          onClick={() => handleSendRequest(usr.email)}
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                        >
                          {reqSent ? 'Göndərildi' : 'Əlavə Et'}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Pending Requests Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>✉️</span> Gözləyən İstəklər
            </h3>
            
            {incomingRequests.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', padding: '1rem 0', textAlign: 'center' }}>
                Gözləyən dostluq istəyi yoxdur.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {incomingRequests.map(req => (
                  <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'rgba(34, 211, 238, 0.04)', borderRadius: '8px', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>{req.fromEmoji || '🎮'}</span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{req.fromUsername}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{req.fromEmail}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => acceptFriendRequest(req.id)}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', background: 'var(--accent-green)', borderColor: 'var(--accent-green)' }}
                      >
                        Qəbul Et
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => rejectFriendRequest(req.id)}
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', color: 'var(--accent-red)', borderColor: 'rgba(239,68,68,0.3)' }}
                      >
                        Rədd Et
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {outgoingRequests.length > 0 && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Göndərilmiş Sorğular ({outgoingRequests.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {outgoingRequests.map(req => (
                    <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', padding: '0.3rem 0.5rem', background: 'var(--bg-input)', borderRadius: '4px' }}>
                      <span>✉️ {req.toEmail}</span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--accent-gold)', fontStyle: 'italic' }}>Gözlənilir...</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Friends List Directory */}
        <div className="card" style={{ padding: '1.25rem', height: '100%', minHeight: '350px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-gold-light)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>👥</span> Dostlarım ({friendsList.length})
          </h3>
          
          {friendsList.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🕸️</div>
              <p style={{ margin: 0, fontWeight: 600 }}>Dostluq siyahınız boşdur.</p>
              <p style={{ margin: '0.35rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '250px' }}>
                Yuxarıdakı axtarış panelindən digər istifadəçilərə dostluq sorğusu göndərin!
              </p>
            </div>
          ) : (
            <div className="friends-cards-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {friendsList.map(fr => (
                <div
                  key={fr.email}
                  className="friend-item-card"
                  onClick={() => setSelectedFriend(fr.email)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = 'var(--accent-purple)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139,92,246,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.05)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem',
                      overflow: 'hidden'
                    }}>
                      {fr.avatarUrl
                        ? <img src={fr.avatarUrl} alt={fr.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : fr.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{fr.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Lv. {fr.level} · {fr.role}
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-purple-light)' }}>⚡ {fr.xp} XP</div>
                      <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Xal</div>
                    </div>
                    <span style={{ fontSize: '1.25rem', color: 'var(--accent-purple-light)' }}>💬</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Direct Messages Chat Drawer Popup ── */}
      {selectedFriend && activeFriendData && (
        <div className="chat-modal-overlay" style={{
          position: 'fixed', inset: 0, background: 'rgba(7,7,26,0.7)',
          backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex',
          justifyContent: 'flex-end', animation: 'fadeIn 0.3s ease'
        }} onClick={() => setSelectedFriend(null)}>
          
          <div className="chat-drawer" style={{
            width: '100%', maxWidth: '420px', height: '100vh',
            background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)',
            display: 'flex', flexDirection: 'column', padding: '1.25rem',
            animation: 'slideInRight 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
            boxShadow: 'var(--shadow-modal)'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', marginBottom: '0.85rem' }}>
              <div style={{ fontSize: '2.2rem', width: '2.2rem', height: '2.2rem', borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeFriendData.avatarUrl
                  ? <img src={activeFriendData.avatarUrl} alt={activeFriendData.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : activeFriendData.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>{activeFriendData.name}</h4>
                <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Lv. {activeFriendData.level} · {activeFriendData.role}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFriend(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem', cursor: 'pointer', padding: '0.2rem' }}
              >
                ✕
              </button>
            </div>

            {/* Chats messages panel */}
            <div className="chat-messages-container" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '0.25rem', marginBottom: '1rem' }}>
              {chatMessages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)', maxWidth: '240px' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                  <p style={{ fontSize: '0.78rem', margin: 0 }}>Söhbət boşdur. Dostunuza salam yazaraq söhbətə başlayın!</p>
                </div>
              ) : (
                chatMessages.map((msg) => {
                  const isMe = msg.sender.toLowerCase() === sessionEmail.toLowerCase();
                  return (
                    <div
                      key={msg.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={{
                        padding: '0.6rem 0.85rem',
                        borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        background: isMe ? 'var(--gradient-primary)' : 'var(--bg-input)',
                        color: isMe ? 'white' : 'var(--text-primary)',
                        border: isMe ? 'none' : '1px solid var(--border-color)',
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                      }}>
                        {msg.text}
                      </div>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Dynamic input form */}
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                className="input-field"
                placeholder="Mesaj yazın..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                style={{ flex: 1 }}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ padding: '0 1.25rem', fontFamily: 'var(--font-display)', fontSize: '0.82rem' }}
              >
                GÖNDƏR
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
