import React, { useEffect, useRef, useState } from 'react';
import { Plus, Send, Bot, User, Loader2, Menu, X, Sun, Moon, Monitor, Trash2, Square, Paperclip, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { streamChat, encodeImageAsBase64 } from '../lib/api';
import type { ChatMessage, ImageAttachment } from '../lib/types';
import chatModes from '../lib/chatModes.json';
import { useAuth } from '../lib/auth';
import SignInButtons from '../components/SignInButtons';
import {
  createConversation as createConversationCloud,
  sendMessage as sendMessageCloud,
  listenToConversations,
  listenToMessages,
} from '../lib/chatStore';

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  // Optional fields when using cloud storage
  lastMessage?: string;
  lastMessageAt?: number;
}

export default function App() {
  const { user, loading: authLoading, signOutApp } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachedImages, setAttachedImages] = useState<ImageAttachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [abortCtrl, setAbortCtrl] = useState<AbortController | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [sidebarHovered, setSidebarHovered] = useState(false);
  // Mobile top navbar state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('maatsaab-theme');
      return (saved as 'system' | 'light' | 'dark') || 'system';
    }
    return 'system';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const listRef = useRef<HTMLDivElement>(null);

  // New: chat mode state
  const [modeKey, setModeKey] = useState<string>((chatModes as any)?.defaultMode || 'general');

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const hasMessages = messages.length > 0;

  // Signed-in: subscribe to Firestore conversations
  useEffect(() => {
    if (!user) return;
    const unsub = listenToConversations(user.uid, (convs: any[]) => {
      const mapped: Conversation[] = convs.map((c: any) => ({
        id: c.id,
        title: c.title || 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastMessage: c.lastMessage,
        lastMessageAt: (c.lastMessageAt as any)?.toMillis?.() ?? undefined,
      }));
      setConversations(mapped);
    });
    return () => unsub();
  }, [user]);

  // Signed-in: subscribe to messages for the selected conversation
  useEffect(() => {
    if (!user || !currentConversationId) return;
    const unsub = listenToMessages(user.uid, currentConversationId, (msgs: any[]) => {
      const mapped: ChatMessage[] = msgs.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        images: m.attachments || undefined,
        createdAt: (m.createdAt as any)?.toMillis?.() ?? Date.now(),
      }));
      setMessages(mapped);
    });
    return () => unsub();
  }, [user, currentConversationId]);

  // Clear local chat on opening homepage when not signed in
  useEffect(() => {
    if (!authLoading && !user) {
      localStorage.removeItem('maatsaab-conversations');
      setConversations([]);
      setMessages([]);
    }
  }, [authLoading, user]);

  // Theme toggle function
  const toggleTheme = () => {
    const modes: ('system' | 'light' | 'dark')[] = ['system', 'light', 'dark'];
    const currentIndex = modes.indexOf(themeMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setThemeMode(nextMode);
    localStorage.setItem('maatsaab-theme', nextMode);
    
    // Apply theme immediately
    if (nextMode === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', nextMode);
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    
    // Apply saved theme mode or default to system
    if (themeMode === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', themeMode);
    }
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      // Only auto-update if in system mode
      if (themeMode === 'system') {
        document.documentElement.removeAttribute('data-theme');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  // Reset textarea height when input is cleared
  useEffect(() => {
    if (input === '') {
      const textareas = document.querySelectorAll('.textarea');
      textareas.forEach(textarea => {
        if (textarea instanceof HTMLTextAreaElement) {
          textarea.style.height = 'auto';
        }
      });
    }
  }, [input]);

  // Load conversations from localStorage on mount (signed-out only)
  useEffect(() => {
    if (user) return;
    const saved = localStorage.getItem('maatsaab-conversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConversations(parsed);
      } catch (e) {
        console.error('Failed to load conversations:', e);
      }
    }
  }, [user]);

  // Save current conversation when component unmounts or messages change (signed-out only)
  useEffect(() => {
    if (!currentConversationId || messages.length === 0 || user) return;
    const updatedConversations = conversations.map(c => 
      c.id === currentConversationId 
        ? { ...c, messages, updatedAt: Date.now() }
        : c
    );
    if (JSON.stringify(updatedConversations) !== JSON.stringify(conversations)) {
      saveConversations(updatedConversations);
    }
  }, [messages, currentConversationId, user]);

  // Auto-save on page unload (signed-out only)
  useEffect(() => {
    if (user) return;
    const handleBeforeUnload = () => {
      if (currentConversationId && messages.length > 0) {
        const updatedConversations = conversations.map(c => 
          c.id === currentConversationId 
            ? { ...c, messages, updatedAt: Date.now() }
            : c
        );
        localStorage.setItem('maatsaab-conversations', JSON.stringify(updatedConversations));
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [currentConversationId, messages, conversations, user]);

  // Save conversations to localStorage
  const saveConversations = (convs: Conversation[]) => {
    setConversations(convs);
    localStorage.setItem('maatsaab-conversations', JSON.stringify(convs));
  };

  const generateTitle = (firstMessage: string): string => {
    return firstMessage.length > 50 ? firstMessage.substring(0, 50) + '...' : firstMessage;
  };

  const createNewConversation = async () => {
    // Save current conversation if it has messages
    if (currentConversationId && messages.length > 0 && !user) {
      const updatedConversations = conversations.map(c => 
        c.id === currentConversationId 
          ? { ...c, messages, updatedAt: Date.now() }
          : c
      );
      saveConversations(updatedConversations);
    }

    // Create new conversation
    let newId: string = crypto.randomUUID();
    const title = 'New Chat';
    if (user) {
      try {
        newId = await createConversationCloud(user.uid, title);
      } catch (e) {
        console.error('Failed to create cloud conversation, falling back to local:', e);
      }
    }

    const newConversation: Conversation = {
      id: newId,
      title,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setCurrentConversationId(newConversation.id);
    setMessages([]);
    setAttachedImages([]);
    saveConversations([newConversation, ...conversations]);
  };

  const selectConversation = (conversationId: string) => {
    if (currentConversationId && messages.length > 0 && !user) {
      const updatedConversations = conversations.map(c => 
        c.id === currentConversationId 
          ? { ...c, messages, updatedAt: Date.now() }
          : c
      );
      saveConversations(updatedConversations);
    }

    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setCurrentConversationId(conversationId);
      // In cloud mode, messages are persisted separately; keep local UI state for now
      setMessages(conversation.messages || []);
      setAttachedImages([]);
    }
  };

  const deleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedConversations = conversations.filter(c => c.id !== conversationId);
    saveConversations(updatedConversations);
    if (currentConversationId === conversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
  };

  // Image handling functions
  const handleImageUpload = async (files: FileList | null) => {
    if (!files) return;
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    
    for (const file of Array.from(files)) {
      if (!validTypes.includes(file.type)) {
        alert(`Unsupported file type: ${file.type}. Please use JPEG, PNG, GIF, or WebP.`);
        continue;
      }
      
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        continue;
      }
      
      try {
        const base64Data = await encodeImageAsBase64(file);
        const imageAttachment: ImageAttachment = {
          id: crypto.randomUUID(),
          data: base64Data,
          mimeType: file.type,
          name: file.name,
          size: file.size
        };
        
        setAttachedImages(prev => [...prev, imageAttachment]);
      } catch (error) {
        console.error('Failed to process image:', error);
        alert(`Failed to process ${file.name}. Please try again.`);
      }
    }
  };

  const removeImage = (imageId: string) => {
    setAttachedImages(prev => prev.filter(img => img.id !== imageId));
  };

  const onSend = async () => {
    if ((!input.trim() && attachedImages.length === 0) || loading) return;

    const modePrompt = (chatModes as any)?.modes?.[modeKey]?.prompt?.trim?.() || '';
    const baseContent = input.trim();
    const effectiveContent = modePrompt ? `${modePrompt}\n\n${baseContent}` : baseContent;
    const titleSource = baseContent || 'Image conversation';

    const capturedImages = [...attachedImages];

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: baseContent,
      images: capturedImages.length > 0 ? capturedImages : undefined,
      createdAt: Date.now()
    };
    const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: 'assistant', content: '', createdAt: Date.now() };

    // If no current conversation, create one (cloud if signed in)
    let convId = currentConversationId;
    if (!convId) {
      let newId: string = crypto.randomUUID();
      const newTitle = generateTitle(titleSource);
      if (user) {
        try {
          newId = await createConversationCloud(user.uid, newTitle);
        } catch (e) {
          console.error('Failed to create cloud conversation, falling back to local id:', e);
        }
      }
      const newConversation: Conversation = {
        id: newId,
        title: newTitle,
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      setCurrentConversationId(newId);
      saveConversations([newConversation, ...conversations]);
      convId = newId;
    }

    const newMessages = [...messages, userMsg, assistantMsg];
    setMessages(newMessages);
    setInput('');
    setAttachedImages([]);

    const textareas = document.querySelectorAll('.textarea');
    textareas.forEach(textarea => {
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.style.height = 'auto';
      }
    });

    if (messages.length === 0 && convId) {
      const updatedConversations = conversations.map(c => 
        c.id === convId 
          ? { ...c, title: generateTitle(titleSource), updatedAt: Date.now() }
          : c
      );
      saveConversations(updatedConversations);
    }

    const ctrl = new AbortController();
    setAbortCtrl(ctrl);
    setLoading(true);

    let assistantText = '';

    try {
      await streamChat({
        messages: [...messages, { ...userMsg, content: effectiveContent }].map(({ role, content, images }) => ({ role, content, images })),
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        max_tokens: 512,
      }, (delta) => {
        assistantText += delta;
        setMessages((m) => m.map((msg) => (msg.id === assistantMsg.id ? { ...msg, content: msg.content + delta } : msg)));
      }, ctrl.signal);

      // After successful stream, persist to Firestore if signed in
      if (user && convId) {
        try {
          await sendMessageCloud(user.uid, convId, 'user', baseContent, capturedImages);
          await sendMessageCloud(user.uid, convId, 'assistant', assistantText);
        } catch (e) {
          console.error('Failed to persist messages to Firestore:', e);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setAbortCtrl(null);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
    if (e.key === 'Escape') {
      abortCtrl?.abort();
    }
  };

  // Auto-resize textarea function
  const handleTextareaResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setInput(textarea.value);
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Calculate new height based on content, with min and max limits
    const minHeight = 20; // Minimum height in pixels
    const maxHeight = 120; // Maximum height before scrolling
    const newHeight = Math.min(Math.max(textarea.scrollHeight - 16, minHeight), maxHeight); // Subtract padding
    
    textarea.style.height = `${newHeight}px`;
  };

  const prevUidRef = useRef<string | null>(null);

  // First sign-in migration and logout clear behavior
  useEffect(() => {
    const prevUid = prevUidRef.current;

    // Handle first sign-in (prev null -> now user)
    if (!prevUid && user) {
      const migratedKey = `maatsaab-migrated-${user.uid}`;
      if (!localStorage.getItem(migratedKey)) {
        const saved = localStorage.getItem('maatsaab-conversations');
        if (saved) {
          (async () => {
            try {
              const parsed: Conversation[] = JSON.parse(saved);
              for (const conv of parsed) {
                const convId = await createConversationCloud(user.uid, conv.title || 'New Chat');
                for (const m of conv.messages) {
                  const attachments = (m as any).images && (m as any).images.length > 0 ? (m as any).images : undefined;
                  await sendMessageCloud(user.uid, convId, m.role === 'assistant' ? 'assistant' : 'user', m.content, attachments);
                }
              }
              localStorage.setItem(migratedKey, 'true');
              localStorage.removeItem('maatsaab-conversations');
            } catch (e) {
              console.error('Failed to migrate local conversations:', e);
            }
          })();
        }
      }
    }

    // Handle logout (prev user -> now null)
    if (prevUid && !user) {
      localStorage.removeItem('maatsaab-conversations');
    }

    prevUidRef.current = user?.uid ?? null;
  }, [user]);

  // Close mobile menu when navigating/selecting conversation
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className={`app ${conversations.length > 0 ? 'has-conversations' : ''} ${sidebarOpen || sidebarHovered ? 'sidebar-open' : ''}`}>
      {/* Backdrop for closing sidebar */}
      {(sidebarOpen || sidebarHovered) && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar container with hover detection (hidden on mobile via CSS) */}
      <div 
        className="sidebar-container"
        onMouseEnter={() => setSidebarHovered(true)}
        onMouseLeave={() => setSidebarHovered(false)}
      >
        {/* Collapsed sidebar - always visible */}
        <aside className="sidebar-collapsed">
          <div className="collapsed-header">
            <div 
              className="collapsed-logo clickable"
              onClick={() => setSidebarOpen(true)}
              title="Open sidebar"
            >
              <svg width="36" height="36" viewBox="0 0 64 64" fill="none">
                <defs>
                  <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0A84FF"/>
                    <stop offset="100%" stopColor="#64D2FF"/>
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="56" height="56" rx="14" fill="url(#g)"/>
                <path d="M20 32c0-6.627 5.373-12 12-12s12 5.373 12 12-5.373 12-12 12-12-5.373-12-12Z" stroke="white" strokeWidth="4"/>
              </svg>
            </div>
          </div>
          <div className="collapsed-actions">
            <button 
              className="button button-ghost focus-ring collapsed-button" 
              aria-label="New chat" 
              title="New chat" 
              onClick={createNewConversation}
            >
              <Plus size={18} />
            </button>
            <button 
              className="button button-ghost focus-ring collapsed-button" 
              aria-label={`Switch theme (currently ${themeMode})`}
              title={`Switch theme (currently ${themeMode})`}
              onClick={toggleTheme}
            >
              {themeMode === 'system' ? <Monitor size={18} /> : themeMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          {/* Collapsed footer with user/profile icon pinned to bottom */}
          <div className="collapsed-footer">
            <button
              className="avatarBtn focus-ring"
              title={user ? (user.displayName || user.email || 'Account') : 'Sign in'}
              onClick={() => setSidebarOpen(true)}
              aria-label="Open account options"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="avatarImg" />
              ) : (
                <User size={18} />
              )}
            </button>
          </div>
        </aside>
        
        {/* Full sidebar (hidden on mobile via CSS) */}
        <aside className="sidebar">
        <div className="surface headerBar">
            <div className="brand">
            <img src="/favicon.svg" alt="MaatSaab logo" className="brandLogo" />
            <strong>MaatSaab</strong>
            </div>
          <div className="actionRow">
            <button 
              className="button button-ghost focus-ring" 
              aria-label={`Switch theme (currently ${themeMode})`}
              title={`Switch theme (currently ${themeMode})`}
              onClick={toggleTheme}
            >
              {themeMode === 'system' ? <Monitor size={18} /> : themeMode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
        <div className="surface section">
          <button 
            className="button focus-ring newChatButton" 
            aria-label="New chat" 
            title="New chat" 
            onClick={createNewConversation}
          >
            <Plus size={18} /> New Chat
          </button>
          <div className="smallLabel">Conversations</div>
          {conversations.length === 0 ? (
            <div className="smallMuted">No conversations yet</div>
          ) : (
            <div className="conversationList">
              {conversations.map((conversation) => (
                <div 
                  key={conversation.id}
                  className={`conversationItem ${currentConversationId === conversation.id ? 'active' : ''}`}
                  onClick={() => {
                    selectConversation(conversation.id);
                    setSidebarOpen(false); // Close sidebar on mobile after selection
                  }}
                >
                  <div className="conversationContent">
                    <div className="conversationTitle">{conversation.title}</div>
                    <div className="conversationPreview">
                      {conversation.lastMessage
                        ? `${conversation.lastMessage.substring(0, 60)}...`
                        : conversation.messages.length > 0 
                          ? conversation.messages[conversation.messages.length - 1].content.substring(0, 60) + '...'
                          : 'Empty conversation'
                      }
                    </div>
                  </div>
                  <button
                    className="button button-ghost conversationDelete"
                    aria-label="Delete conversation"
                    title="Delete conversation"
                    onClick={(e) => deleteConversation(conversation.id, e)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Sidebar footer with profile and sign-in option when expanded */}
        <div className="surface sidebarFooter">
          <div className="profileRow">
            <div className="avatarBtn static">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="avatarImg" />
              ) : (
                <User size={18} />
              )}
            </div>
            <div className="profileInfo">
              <div className="smallLabel">{user ? 'Signed in' : 'Not signed in'}</div>
              <div className="smallMuted">{user?.displayName || user?.email || '—'}</div>
            </div>
          </div>
          {!user && (
            <div className="signinRow">
              <SignInButtons />
            </div>
          )}
        </div>
      </aside>
      </div>

      <main className={`chat ${!hasMessages ? 'empty' : ''}`}>
        {/* Top mobile navbar */}
        <div className={`chatHeader topNav ${mobileMenuOpen ? 'open' : ''}`}>
          {/* Logo directly (no button wrapper) */}
          <img src="/favicon.svg" alt="MaatSaab" className="topNavLogo" />
          {/* Centered title on mobile */}
          <div className="topNavTitle">MaatSaab</div>
          <div className="spacer"></div>
          <button 
            className="button button-ghost focus-ring topNavToggle" 
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            title={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileMenuOpen(v => !v)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Expanded mobile menu panel */}
        {mobileMenuOpen && (
          <div className="mobileMenuPanel surface" role="region" aria-label="Navigation menu">
            {/* A. Sign in with Google Button / Profile name if Signed in */}
            {user ? (
              <div className="profileRow">
                <div className="avatarBtn static">
                  {user.photoURL ? <img src={user.photoURL} alt="" className="avatarImg" /> : <User size={18} />}
                </div>
                <div className="profileInfo">
                  <div className="smallLabel">Signed in</div>
                  <div className="smallMuted">{user.displayName || user.email}</div>
                </div>
              </div>
            ) : (
              <div className="signinRow">
                <SignInButtons />
              </div>
            )}

            {/* B. Dark / Light / System Theme Button with Label */}
            <div className="themeRow">
              <span className="modeLabel">Theme</span>
              <button 
                className="button button-ghost focus-ring themeToggle" 
                onClick={toggleTheme}
                aria-label={`Switch theme (currently ${themeMode})`}
                title={`Switch theme (currently ${themeMode})`}
              >
                {themeMode === 'system' ? <Monitor size={16} /> : themeMode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                <span className="themeLabelText">{themeMode.charAt(0).toUpperCase() + themeMode.slice(1)}</span>
              </button>
            </div>

            {/* C. Old Chat history box, scrollable */}
            <div className="smallLabel">History</div>
            {conversations.length === 0 ? (
              <div className="smallMuted">No conversations yet</div>
            ) : (
              <div className="conversationList mobileConversations">
                {conversations.map((conversation) => (
                  <div 
                    key={conversation.id}
                    className={`conversationItem ${currentConversationId === conversation.id ? 'active' : ''}`}
                    onClick={() => {
                      selectConversation(conversation.id);
                      closeMobileMenu();
                    }}
                  >
                    <div className="conversationContent">
                      <div className="conversationTitle">{conversation.title}</div>
                      <div className="conversationPreview">
                        {conversation.lastMessage
                          ? `${conversation.lastMessage.substring(0, 60)}...`
                          : conversation.messages.length > 0 
                            ? conversation.messages[conversation.messages.length - 1].content.substring(0, 60) + '...'
                            : 'Empty conversation'
                        }
                      </div>
                    </div>
                    <button
                      className="button button-ghost conversationDelete"
                      aria-label="Delete conversation"
                      title="Delete conversation"
                      onClick={(e) => deleteConversation(conversation.id, e)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state branding */}
        {!hasMessages && (
          <div className="emptyState" role="region" aria-label="App intro">
            <div className="emptyHeader">
              <img src="/favicon.svg" alt="" className="emptyLogo" aria-hidden="true" />
              <div className="emptyTitles">
                <div className="emptyTitle">MaatSaab</div>
                <div className="emptySubtitle">Your personalised AI tutor</div>
              </div>
            </div>
          </div>
        )}

        <div ref={listRef} className="messages" role="log" aria-live="polite" aria-relevant="additions text">
          {messages.map((m) => (
            <MessageItem key={m.id} msg={m} />
          ))}
          {loading && (
            <div className="message assistant" aria-label="maat saab typing">
              <Loader2 className="spin" size={16} />
            </div>
          )}
        </div>

        <div className="composer surface">
          <div className="composerInput">
            <textarea
              className="textarea focus-ring"
              placeholder="Message MaatSaab"
              value={input}
              onChange={handleTextareaResize}
              onKeyDown={onKey}
              aria-label="Message input"
              rows={1}
            />
            <div className="actionRow">
              {loading ? (
                <button 
                  className="button button-stop focus-ring" 
                  onClick={() => abortCtrl?.abort()} 
                  aria-label="Stop generation"
                  title="Stop generation"
                >
                  <Square size={16} /> <span className="btnLabel">Stop</span>
                </button>
              ) : (
                <button 
                  className="button focus-ring" 
                  onClick={onSend} 
                  disabled={!input.trim() && attachedImages.length === 0}
                  aria-label="Send message"
                  title="Send message"
                >
                  <Send size={16} /> <span className="btnLabel">Send</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Attach file button and mode selector on the same line below text input */}
          <div className="attachmentActions">
            <input
              type="file"
              id="imageUpload"
              multiple
              accept="image/*"
              className="hiddenFileInput"
              onChange={(e) => handleImageUpload(e.target.files)}
              aria-label="Upload images"
              title="Upload images"
            />
            <label htmlFor="imageUpload" className="button button-ghost focus-ring attachButton" title="Attach images">
              <Paperclip size={16} /> <span className="btnLabel">Attach</span>
            </label>

            <select
              className="modeSelect focus-ring"
              value={modeKey}
              onChange={(e) => setModeKey(e.target.value)}
              aria-label="Select chat mode"
              title={(() => {
                const label = (chatModes as any)?.modes?.[modeKey]?.label || 'General Question';
                return `Chat mode: ${label}`;
              })()}
            >
              {Object.entries((chatModes as any)?.modes || {}).map(([key, cfg]: any) => (
                <option key={key} value={key}>{cfg?.label || key}</option>
              ))}
            </select>
          </div>
          
          {/* Image attachments preview - moved below the attach button */}
          {attachedImages.length > 0 && (
            <div className="imageAttachments">
              {attachedImages.map((image) => (
                <div key={image.id} className="imageAttachment">
                  <img 
                    src={`data:${image.mimeType};base64,${image.data}`}
                    alt={image.name}
                    className="attachmentPreview"
                  />
                  <button 
                    className="removeImageButton"
                    onClick={() => removeImage(image.id)}
                    aria-label={`Remove ${image.name}`}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function MessageItem({ msg }: { msg: ChatMessage }) {
  const Icon = msg.role === 'user' ? User : Bot;
  const roleLabel = msg.role === 'assistant' ? 'maat saab' : 'you';
  return (
    <div className={`message ${msg.role}`}>
      <div className="metaRow">
        <Icon size={14} /> {roleLabel}
      </div>
      <div className="messageContent">
        {/* Display attached images for user messages */}
        {msg.role === 'user' && msg.images && msg.images.length > 0 && (
          <div className="messageImages">
            {msg.images.map((image) => (
              <div key={image.id} className="messageImage">
                <img 
                  src={`data:${image.mimeType};base64,${image.data}`}
                  alt={image.name}
                  className="messageImageDisplay"
                />
                <div className="messageImageInfo">
                  <span className="messageImageName">{image.name}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {msg.role === 'assistant' ? (
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Custom component overrides for better styling
              code: ({ className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');
                const isCodeBlock = className && className.includes('language-');
                return isCodeBlock ? (
                  <pre className="codeBlock">
                    <code className={className} {...props}>
                      {children}
                    </code>
                  </pre>
                ) : (
                  <code className="inlineCode" {...props}>
                    {children}
                  </code>
                );
              },
              blockquote: ({ children }) => (
                <blockquote className="markdownBlockquote">{children}</blockquote>
              ),
              table: ({ children }) => (
                <div className="tableWrapper">
                  <table className="markdownTable">{children}</table>
                </div>
              ),
              ul: ({ children }) => <ul className="markdownList">{children}</ul>,
              ol: ({ children }) => <ol className="markdownList">{children}</ol>,
              h1: ({ children }) => <h1 className="markdownHeading h1">{children}</h1>,
              h2: ({ children }) => <h2 className="markdownHeading h2">{children}</h2>,
              h3: ({ children }) => <h3 className="markdownHeading h3">{children}</h3>,
              h4: ({ children }) => <h4 className="markdownHeading h4">{children}</h4>,
              h5: ({ children }) => <h5 className="markdownHeading h5">{children}</h5>,
              h6: ({ children }) => <h6 className="markdownHeading h6">{children}</h6>,
              p: ({ children }) => <p className="markdownParagraph">{children}</p>,
              a: ({ href, children }) => (
                <a href={href} className="markdownLink" target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
              // Task list items
              // Removed custom 'li' renderer to satisfy a11y lint rules
              // Input checkboxes for task lists
              input: ({ type, checked, ...props }: any) => {
                if (type === 'checkbox') {
                  return <input type="checkbox" checked={checked} readOnly className="markdownCheckbox" {...props} />;
                }
                return <input type={type} checked={checked} {...props} />;
              },
            }}
          >
            {msg.content || ''}
          </ReactMarkdown>
        ) : (
          <div className="userMessage">{msg.content}</div>
        )}
      </div>
    </div>
  );
}
