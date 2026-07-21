import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LeftPanel from './components/LeftPanel';
import CenterPanel from './components/CenterPanel';
import RightPanel from './components/RightPanel';
import AuthScreen from './components/AuthScreen';
import OptimizeModal from './components/OptimizeModal';
import HistoryDrawer from './components/HistoryDrawer';

const API_BASE = '/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [optimizeModalOpen, setOptimizeModalOpen] = useState(false);

  // Prompt state
  const [promptText, setPromptText] = useState('');
  const [rawPrompt, setRawPrompt] = useState('');
  const [chosenPrompt, setChosenPrompt] = useState('');
  const [promptCategory, setPromptCategory] = useState(null);
  const [suggestions, setSuggestions] = useState([]);

  // Output & History state
  const [currentOutput, setCurrentOutput] = useState(null);
  const [historyList, setHistoryList] = useState([]);

  // Loaders
  const [promptifyLoading, setPromptifyLoading] = useState(false);
  const [generateLoading, setGenerateLoading] = useState(false);

  // Check auth session on startup
  useEffect(() => {
    fetchMe();
  }, []);

  const fetchMe = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        fetchHistory();
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/history`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setHistoryList(data.history || []);
      }
    } catch (e) {
      console.error('Failed to fetch history', e);
    }
  };

  const handleSignup = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    setUser(data.user);
    fetchHistory();
  };

  const handleLogin = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    setUser(data.user);
    fetchHistory();
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    setUser(null);
    setHistoryList([]);
  };

  // Open VibeCheck Optimization Modal
  const handleOpenOptimizeModal = async (inputPrompt) => {
    setRawPrompt(inputPrompt);
    setPromptifyLoading(true);
    try {
      const res = await fetch(`${API_BASE}/promptify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: inputPrompt }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Optimization failed');
        return;
      }

      setPromptCategory(data.category);
      setSuggestions(data.suggestions || []);
      setOptimizeModalOpen(true);
    } catch (err) {
      alert('Network error calling VibeCheck optimizer endpoint');
    } finally {
      setPromptifyLoading(false);
    }
  };

  const handleSelectSuggestion = (sug) => {
    setPromptText(sug.rewrittenPrompt);
    setChosenPrompt(sug.rewrittenPrompt);
    setOptimizeModalOpen(false);
  };

  // Submit Prompt
  const handleSubmitPrompt = async (promptToSubmit) => {
    setGenerateLoading(true);
    try {
      const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSubmit,
          rawPrompt: rawPrompt || promptToSubmit,
          chosenPrompt: chosenPrompt || promptToSubmit,
          category: promptCategory,
        }),
        credentials: 'include',
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Generation failed');
        return;
      }

      setCurrentOutput({
        id: data.id,
        generatedCode: data.generatedCode,
        category: data.category,
        tokensInput: data.tokensInput,
        tokensOutput: data.tokensOutput,
        costUsd: data.costUsd,
        latencyMs: data.latencyMs,
        traceId: data.traceId,
        success: data.success,
      });

      fetchHistory();
    } catch (err) {
      alert('Network error calling generate endpoint');
    } finally {
      setGenerateLoading(false);
    }
  };

  // Feedback Toggle
  const handleFeedbackToggle = async (historyId, newSuccess) => {
    if (!historyId) return;
    try {
      const res = await fetch(`${API_BASE}/history/${historyId}/feedback`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: newSuccess }),
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (currentOutput && currentOutput.id === historyId) {
          setCurrentOutput({ ...currentOutput, success: data.success });
        }
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to update feedback', err);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setCurrentOutput({
      id: item._id,
      generatedCode: item.generatedCode,
      category: item.category,
      tokensInput: item.tokensInput,
      tokensOutput: item.tokensOutput,
      costUsd: item.costUsd,
      latencyMs: item.latencyMs,
      traceId: item.traceId,
      success: item.success,
    });
    setPromptText(item.chosenPrompt);
    setChosenPrompt(item.chosenPrompt);
    setRawPrompt(item.rawPrompt);
  };

  if (authChecking) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading VibeCheck...
      </div>
    );
  }

  // UPFRONT AUTH GATING
  if (!user) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onSignup={handleSignup}
      />
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        user={user}
        onOpenHistory={() => { fetchHistory(); setHistoryOpen(true); }}
        onLogout={handleLogout}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <LeftPanel />

        <CenterPanel
          currentOutput={currentOutput}
          onFeedbackToggle={handleFeedbackToggle}
        />

        <RightPanel
          promptText={promptText}
          setPromptText={setPromptText}
          onOpenOptimizeModal={handleOpenOptimizeModal}
          onSubmitPrompt={handleSubmitPrompt}
          promptifyLoading={promptifyLoading}
          generateLoading={generateLoading}
          promptCategory={promptCategory}
        />
      </div>

      <OptimizeModal
        isOpen={optimizeModalOpen}
        onClose={() => setOptimizeModalOpen(false)}
        rawPrompt={rawPrompt}
        category={promptCategory}
        suggestions={suggestions}
        onSelectSuggestion={handleSelectSuggestion}
      />

      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        historyList={historyList}
        onSelectHistoryItem={handleSelectHistoryItem}
        onFeedbackToggle={handleFeedbackToggle}
      />
    </div>
  );
}
