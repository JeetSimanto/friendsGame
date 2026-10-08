import React, { useState, useEffect } from 'react';
import {
  getPlayersList,
  checkFirestoreHealth,
  adminSignIn,
  adminSignOut,
  onAuthChange,
  auth,
} from '../firebase';
import { sha256Hex } from '../utils/crypto';
import Certificate from './Certificate';
import {
  ShieldCheck,
  Users,
  Gamepad2,
  Award,
  Wallet,
  RefreshCw,
  Search,
  Copy,
  Check,
  X,
  ArrowLeft,
  Lock,
  AlertTriangle,
  ExternalLink,
  Database,
  FileCheck,
  Clock,
  KeyRound,
  LogIn,
} from 'lucide-react';
import { playSelectSound, playCorrectSound, playWrongSound } from '../utils/sound';

export default function AdminPanel({ onExit }) {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(auth.currentUser));

  // Firebase Auth Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authError, setAuthError] = useState('');

  // Emergency offline passkey toggle
  const [showPasskeyFallback, setShowPasskeyFallback] = useState(false);
  const [passkey, setPasskey] = useState('');

  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [relationFilter, setRelationFilter] = useState('all');
  const [dbHealth, setDbHealth] = useState({ status: 'checking', message: 'Checking database...' });

  // Modal states
  const [selectedCertificatePlayer, setSelectedCertificatePlayer] = useState(null);
  const [selectedAuditPlayer, setSelectedAuditPlayer] = useState(null);
  const [copiedBkash, setCopiedBkash] = useState('');

  useEffect(() => {
    // Listen to real Firebase Auth state changes
    const unsubscribe = onAuthChange((user) => {
      setCurrentUser(user);
      if (user) {
        setIsAuthenticated(true);
        loadPlayersData();
      } else {
        const localAuth = sessionStorage.getItem('friends_admin_local_auth') === 'true';
        if (localAuth) {
          setIsAuthenticated(true);
          loadPlayersData();
        } else {
          setIsAuthenticated(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleFirebaseLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsLoggingIn(true);
    setAuthError('');

    try {
      await adminSignIn(email, password);
      playCorrectSound();
      setIsAuthenticated(true);
      await loadPlayersData();
    } catch (err) {
      playWrongSound();
      console.error("Firebase Auth error:", err);
      let userMsg = 'Authentication failed. Please check your email and password.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        userMsg = 'Invalid email or password.';
      } else if (err.code === 'auth/user-not-found') {
        userMsg = 'No admin account found with this email.';
      } else if (err.code === 'auth/too-many-requests') {
        userMsg = 'Too many failed attempts. Please try again later.';
      }
      setAuthError(userMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLocalPasskeyLogin = async (e) => {
    e.preventDefault();
    const cleanKey = passkey.trim().toLowerCase();
    try {
      const hash = await sha256Hex(cleanKey + ':emergency_offline_2026');
      const validHashes = [
        '0bd721b052a8413f89157933b6f48aa51bde101445634eb1be66ca224228c3c7', // simanto2026
        'eecf95c82ca39eb0f29a228be14740ea8f4aeed1d6d483a68871b9adf252cbab', // jeet2026
      ];
      if (validHashes.includes(hash)) {
        playCorrectSound();
        sessionStorage.setItem('friends_admin_local_auth', 'true');
        setIsAuthenticated(true);
        setAuthError('');
        loadPlayersData();
      } else {
        playWrongSound();
        setAuthError('INVALID EMERGENCY PASSKEY');
      }
    } catch {
      setAuthError('AUTHENTICATION ERROR');
    }
  };

  const loadPlayersData = async () => {
    setIsLoading(true);
    const [health, data] = await Promise.all([
      checkFirestoreHealth(),
      getPlayersList(),
    ]);
    setDbHealth(health);
    setPlayers(data);
    setIsLoading(false);
  };

  const handleLogout = async () => {
    playSelectSound();
    sessionStorage.removeItem('friends_admin_local_auth');
    try {
      await adminSignOut();
    } catch (e) {}
    setIsAuthenticated(false);
    setCurrentUser(null);
    onExit();
  };

  const handleCopyBkash = (num) => {
    if (!num) return;
    navigator.clipboard.writeText(num);
    setCopiedBkash(num);
    setTimeout(() => setCopiedBkash(''), 2500);
  };

  // Filter players
  const filteredPlayers = players.filter((p) => {
    const matchesName = (p.playerName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRelation = relationFilter === 'all' || (p.relation || '').toLowerCase() === relationFilter.toLowerCase();
    return matchesName && matchesRelation;
  });

  // Calculate metrics
  const totalPlayers = players.length;
  const totalAttempts = players.reduce((sum, p) => sum + (p.attemptsCount || 1), 0);
  const worthyCount = players.filter((p) => p.isWorthy || (p.bestScore ?? 0) >= 5).length;
  const bkashCount = players.filter((p) => Boolean(p.bkashNumber)).length;

  // 1. Password Protection Modal (Firebase Auth + Emergency Fallback)
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto p-6 sm:p-8 space-y-6 text-center animate-fadeIn">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-retro-yellow shadow-inner">
          <Lock size={32} />
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-pixel text-slate-100 tracking-wider">
            ADMIN CONTROL CENTER
          </h2>
          <p className="font-vt text-slate-400 text-base uppercase tracking-widest mt-1">
            {showPasskeyFallback
              ? 'EMERGENCY OFFLINE AUTHENTICATION'
              : 'ENTER FIREBASE ADMIN CREDENTIALS'}
          </p>
        </div>

        {!showPasskeyFallback ? (
          /* Secure Firebase Auth Login Form */
          <form onSubmit={handleFirebaseLogin} className="space-y-3.5 text-left">
            <div>
              <label className="block text-[10px] font-pixel text-slate-300 mb-1.5 uppercase">
                ADMIN EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (authError) setAuthError('');
                }}
                placeholder="simanto@admin.com"
                className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-retro-yellow shadow-inner"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-pixel text-slate-300 mb-1.5 uppercase">
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (authError) setAuthError('');
                }}
                placeholder="••••••••••••"
                className="w-full px-4 py-3 bg-slate-950 border-2 border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-retro-yellow shadow-inner"
                required
              />
            </div>

            {authError && (
              <p className="font-pixel text-[11px] text-rose-400 tracking-wide text-center pt-1">
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="retro-btn retro-btn-yellow w-full py-3.5 text-xs font-pixel tracking-wider flex items-center justify-center gap-2 mt-2"
            >
              <LogIn size={15} />
              <span>{isLoggingIn ? 'AUTHENTICATING...' : 'SECURE LOGIN'}</span>
            </button>
          </form>
        ) : (
          /* Emergency Passkey Fallback Form */
          <form onSubmit={handleLocalPasskeyLogin} className="space-y-4">
            <input
              type="password"
              value={passkey}
              onChange={(e) => {
                setPasskey(e.target.value);
                if (authError) setAuthError('');
              }}
              placeholder="ENTER EMERGENCY PASSKEY"
              className="w-full px-4 py-4 bg-slate-900 border-[3px] border-slate-950 rounded-xl text-slate-100 placeholder-slate-600 font-mono tracking-widest text-center text-lg focus:outline-none focus:border-retro-yellow shadow-inner"
              autoFocus
              required
            />

            {authError && (
              <p className="font-pixel text-xs text-rose-500 tracking-wide">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="retro-btn retro-btn-yellow w-full py-4 text-sm font-pixel tracking-wider"
            >
              UNLOCK (OFFLINE MODE)
            </button>
          </form>
        )}

        {/* Toggle between Firebase Auth and Emergency Passkey */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              playSelectSound();
              setShowPasskeyFallback(!showPasskeyFallback);
              setAuthError('');
            }}
            className="text-[10px] font-pixel text-retro-blueHeader hover:underline tracking-wide"
          >
            {showPasskeyFallback
              ? '← SWITCH TO FIREBASE AUTH LOGIN'
              : 'OR USE EMERGENCY LOCAL PASSKEY'}
          </button>

          <button
            type="button"
            onClick={() => {
              playSelectSound();
              onExit();
            }}
            className="font-pixel text-[11px] text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1.5 mx-auto pt-2"
          >
            <ArrowLeft size={13} /> BACK TO GAME
          </button>
        </div>
      </div>
    );
  }

  // 2. Authenticated Admin Dashboard
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 animate-fadeIn">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${dbHealth.status === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`}></span>
            <h2 className="font-pixel text-base sm:text-xl text-slate-100 tracking-wider">
              ADMIN CONTROL CENTER
            </h2>
          </div>
          <p className="font-vt text-slate-400 text-sm tracking-wider uppercase">
            SIMANTO'S LIVE GAMEPLAY & WORTHINESS DATABASE
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadPlayersData}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-slate-900 border-2 border-slate-800 hover:border-slate-700 rounded-lg text-xs font-pixel text-slate-200 flex items-center gap-1.5 active:translate-y-0.5"
            title="Refresh Data"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            <span>REFRESH</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3.5 py-2.5 bg-rose-950/60 border-2 border-rose-800 hover:border-rose-600 rounded-lg text-xs font-pixel text-rose-300 flex items-center gap-1.5 active:translate-y-0.5"
          >
            <span>LOGOUT</span>
          </button>
        </div>
      </div>

      {/* Database Warning / Guide Banner */}
      {dbHealth.status === 'not_created' && (
        <div className="p-4 sm:p-5 bg-amber-950/70 border-2 border-amber-500/70 rounded-2xl space-y-2.5 text-slate-100">
          <div className="flex items-center gap-2 text-retro-yellow">
            <AlertTriangle size={20} />
            <h3 className="font-pixel text-xs sm:text-sm tracking-wider">
              ACTION REQUIRED: FIRESTORE DATABASE NOT CREATED YET
            </h3>
          </div>
          <p className="font-vt text-amber-200 text-sm sm:text-base leading-relaxed">
            Your Firebase Web App credentials are registered, but <strong>Cloud Firestore</strong> has not been created yet in the Firebase Console.
            In Firebase Console, click <strong>"Build" → "Firestore Database"</strong> and click <strong>"Create database"</strong> (Start in test mode).
          </p>
          <div className="pt-1 flex items-center gap-3 flex-wrap">
            <a
              href="https://console.firebase.google.com/project/riendsgame/firestore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-retro-yellow text-slate-950 font-pixel text-[11px] rounded-lg shadow hover:bg-amber-400 font-bold active:translate-y-0.5"
            >
              <ExternalLink size={14} /> OPEN FIREBASE CONSOLE TO CREATE DATABASE
            </a>
            <span className="font-vt text-xs text-amber-300">
              (All local gameplay records on this device are safely preserved in browser storage)
            </span>
          </div>
        </div>
      )}

      {dbHealth.status === 'permission_denied' && (
        <div className="p-4 sm:p-5 bg-rose-950/70 border-2 border-rose-500/70 rounded-2xl space-y-2 text-slate-100">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertTriangle size={20} />
            <h3 className="font-pixel text-xs sm:text-sm tracking-wider">
              FIRESTORE SECURITY RULES LOCKED
            </h3>
          </div>
          <p className="font-vt text-rose-200 text-sm sm:text-base leading-relaxed">
            Your Firestore database exists, but rules are blocking read/write access. Go to Rules and enable test mode: <code className="bg-slate-950 px-1 py-0.5 rounded text-retro-pink">allow read, write: if true;</code>
          </p>
          <div className="pt-1">
            <a
              href="https://console.firebase.google.com/project/riendsgame/firestore/rules"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-500 text-slate-950 font-pixel text-[11px] rounded-lg shadow hover:bg-rose-400 font-bold active:translate-y-0.5"
            >
              <ExternalLink size={14} /> OPEN FIRESTORE RULES
            </a>
          </div>
        </div>
      )}

      {dbHealth.status === 'connected' && (
        <div className="px-4 py-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs font-pixel text-emerald-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>CLOUD FIRESTORE: CONNECTED & LIVE</span>
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            PROJECT: riendsgame &bull; REALTIME SYNC ACTIVE
          </span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-slate-900/90 border-2 border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-pixel text-[10px]">TOTAL PLAYERS</span>
            <Users size={16} className="text-retro-blueHeader" />
          </div>
          <div className="font-pixel text-2xl text-slate-100">{totalPlayers}</div>
        </div>

        <div className="p-4 bg-slate-900/90 border-2 border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-pixel text-[10px]">TOTAL ATTEMPTS</span>
            <Gamepad2 size={16} className="text-retro-yellow" />
          </div>
          <div className="font-pixel text-2xl text-retro-yellow">{totalAttempts}</div>
        </div>

        <div className="p-4 bg-slate-900/90 border-2 border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-pixel text-[10px]">WORTHY PLAYERS</span>
            <Award size={16} className="text-emerald-400" />
          </div>
          <div className="font-pixel text-2xl text-emerald-400">{worthyCount}</div>
        </div>

        <div className="p-4 bg-slate-900/90 border-2 border-slate-800 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="font-pixel text-[10px]">BKASH REWARDS</span>
            <Wallet size={16} className="text-retro-pink" />
          </div>
          <div className="font-pixel text-2xl text-retro-pink">{bkashCount}</div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="SEARCH PLAYER BY NAME..."
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border-2 border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 font-bold text-xs sm:text-sm focus:outline-none focus:border-retro-blueHeader"
          />
        </div>

        <select
          value={relationFilter}
          onChange={(e) => setRelationFilter(e.target.value)}
          className="px-4 py-3 bg-slate-900 border-2 border-slate-800 rounded-xl text-slate-200 font-pixel text-xs focus:outline-none focus:border-retro-blueHeader"
        >
          <option value="all">ALL RELATIONS</option>
          <option value="friend">FRIEND</option>
          <option value="brother">BROTHER</option>
          <option value="sister">SISTER</option>
          <option value="well wisher">WELL WISHER</option>
        </select>
      </div>

      {/* Players List Table */}
      <div className="space-y-3">
        {filteredPlayers.length === 0 ? (
          <div className="py-12 text-center bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-xl">
            <p className="font-pixel text-xs text-slate-500">
              {isLoading ? 'LOADING RECORDS FROM FIRESTORE...' : 'NO PLAYER RECORDS FOUND'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredPlayers.map((p) => {
              const attempts = p.attemptsCount || 1;
              const bestScore = p.bestScore ?? p.latestScore ?? 0;
              const isPlayerWorthy = p.isWorthy || bestScore >= 5;
              const lastActive = p.lastPlayedAt?.toDate
                ? p.lastPlayedAt.toDate().toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Just now';

              return (
                <div
                  key={p.id}
                  className="p-4 bg-slate-900/90 border-2 border-slate-800 hover:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  {/* Left: Player Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-pixel text-sm sm:text-base text-white tracking-wider">
                        {p.playerName}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-pixel text-retro-blueHeader uppercase">
                        {p.relation || 'Friend'}
                      </span>
                      {isPlayerWorthy && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-pixel">
                          WORTHY
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-vt text-slate-400 uppercase tracking-wider flex-wrap">
                      <span>ATTEMPTS: <strong className="text-retro-yellow font-bold text-sm">{attempts}</strong></span>
                      <span>&bull;</span>
                      <span>BEST SCORE: <strong className="text-white text-sm">{bestScore}/10</strong> ({bestScore * 10}%)</span>
                      <span>&bull;</span>
                      <span>ACTIVE: {lastActive}</span>
                    </div>

                    {/* bKash Tag */}
                    {p.bkashNumber ? (
                      <div className="pt-1.5 flex items-center gap-2 flex-wrap">
                        <span className="font-pixel text-[10px] text-retro-pink flex items-center gap-1">
                          <Wallet size={12} /> BKASH:
                        </span>
                        <code className="px-2.5 py-1 bg-slate-950 border border-retro-pink/50 rounded font-mono text-xs font-bold text-retro-pink tracking-wider shadow-inner">
                          {p.bkashNumber}
                        </code>
                        <button
                          onClick={() => handleCopyBkash(p.bkashNumber)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 hover:text-white flex items-center gap-1 font-pixel text-[9px] active:translate-y-0.5 border border-slate-700"
                          title="Copy bKash number"
                        >
                          {copiedBkash === p.bkashNumber ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              <span className="text-emerald-400">COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>COPY</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="pt-1 flex items-center gap-2 text-[10px] font-pixel text-slate-500">
                        <span className="flex items-center gap-1">
                          <Wallet size={11} /> BKASH:
                        </span>
                        <span className="font-vt text-slate-500 text-xs tracking-wider uppercase">NOT CLAIMED YET</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Certificate & Audit Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-center flex-wrap">
                    <button
                      onClick={() => {
                        playSelectSound();
                        setSelectedAuditPlayer(p);
                      }}
                      className="px-3.5 py-2.5 bg-blue-500/10 border-2 border-retro-blueHeader/60 hover:border-retro-blueHeader text-retro-blueHeader rounded-lg font-pixel text-[10px] flex items-center gap-1.5 active:translate-y-0.5"
                      title="Inspect submitted answers & cheat audit"
                    >
                      <FileCheck size={14} /> AUDIT ANSWERS
                    </button>

                    <button
                      onClick={() => {
                        playSelectSound();
                        setSelectedCertificatePlayer({
                          playerName: p.playerName,
                          relation: p.relation || 'Friend',
                          score: bestScore,
                          totalQuestions: 10,
                        });
                      }}
                      className="px-3.5 py-2.5 bg-amber-500/10 border-2 border-retro-yellow/60 hover:border-retro-yellow text-retro-yellow rounded-lg font-pixel text-[10px] flex items-center gap-1.5 active:translate-y-0.5"
                    >
                      <Award size={14} /> VIEW CERTIFICATE
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Answer Audit Inspection Modal */}
      {selectedAuditPlayer && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border-4 border-slate-950 rounded-2xl p-5 sm:p-6 space-y-4 my-8 relative animate-fadeIn shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck size={18} className="text-retro-blueHeader" />
                <div>
                  <h3 className="font-pixel text-xs sm:text-sm text-slate-100 tracking-wider">
                    CHEAT VERIFICATION & AUDIT: {selectedAuditPlayer.playerName.toUpperCase()}
                  </h3>
                  <p className="font-vt text-slate-400 text-xs uppercase tracking-wider">
                    RELATION: {selectedAuditPlayer.relation || 'Friend'} &bull; TOTAL ATTEMPTS: {selectedAuditPlayer.attemptsCount || 1}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuditPlayer(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            {/* bKash quick view in audit */}
            {selectedAuditPlayer.bkashNumber && (
              <div className="p-3 bg-pink-950/40 border border-retro-pink/40 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wallet size={16} className="text-retro-pink" />
                  <span className="font-pixel text-[10px] text-retro-pink">REWARD BKASH:</span>
                  <code className="font-mono text-sm font-bold text-white bg-slate-950 px-2.5 py-0.5 rounded border border-slate-800">
                    {selectedAuditPlayer.bkashNumber}
                  </code>
                </div>
                <button
                  onClick={() => handleCopyBkash(selectedAuditPlayer.bkashNumber)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-pixel text-slate-200 flex items-center gap-1 active:translate-y-0.5 border border-slate-700"
                >
                  {copiedBkash === selectedAuditPlayer.bkashNumber ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span className="text-emerald-400">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Audit Content */}
            <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-1">
              {(!selectedAuditPlayer.history || selectedAuditPlayer.history.length === 0) ? (
                <div className="p-6 text-center bg-slate-950/60 border border-slate-800 rounded-xl">
                  <AlertTriangle size={24} className="mx-auto text-amber-400 mb-2" />
                  <p className="font-pixel text-xs text-slate-300">NO AUDIT LOG RECORDED</p>
                  <p className="font-vt text-slate-500 text-sm mt-1">
                    This attempt was recorded prior to audit tracking or submitted without answer logs.
                  </p>
                </div>
              ) : (
                selectedAuditPlayer.history.slice().reverse().map((attempt, attIdx) => {
                  const attemptNumber = selectedAuditPlayer.history.length - attIdx;
                  const timeFormatted = attempt.playedAt
                    ? new Date(attempt.playedAt).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Unknown';

                  const durationText = attempt.durationSeconds != null
                    ? attempt.durationSeconds >= 60
                      ? `${Math.floor(attempt.durationSeconds / 60)}m ${attempt.durationSeconds % 60}s`
                      : `${attempt.durationSeconds}s`
                    : 'N/A';

                  return (
                    <div key={attIdx} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-pixel text-xs text-retro-yellow">
                            ATTEMPT #{attemptNumber}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {timeFormatted}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1 text-xs font-mono text-slate-300">
                            <Clock size={13} className="text-retro-blueHeader" />
                            {durationText}
                          </span>
                          <span className={`font-pixel text-[11px] px-2 py-0.5 rounded ${attempt.isWorthy ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-400'}`}>
                            {attempt.score}/{attempt.totalQuestions || 10} ({attempt.percentage || 0}%)
                          </span>
                        </div>
                      </div>

                      {/* Submitted Answers breakdown */}
                      {(!attempt.submittedAnswers || attempt.submittedAnswers.length === 0) ? (
                        <p className="font-vt text-xs text-slate-500 italic">
                          No per-question answers recorded for this attempt.
                        </p>
                      ) : (
                        <div className="space-y-2 pt-1">
                          {attempt.submittedAnswers.map((ans, qIdx) => (
                            <div
                              key={qIdx}
                              className={`p-2.5 rounded-lg border text-xs flex items-start justify-between gap-3 ${ans.isCorrect ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-200' : 'bg-rose-950/20 border-rose-900/40 text-slate-300'}`}
                            >
                              <div className="space-y-0.5 flex-1">
                                <div className="text-[11px] text-slate-400 font-mono">
                                  Q{qIdx + 1}: {ans.questionText || `Question ${ans.questionId}`}
                                </div>
                                <div className="font-bold text-slate-100 flex items-center gap-1.5">
                                  <span className="text-slate-500 font-normal">Answer:</span>
                                  <span>{ans.answer || '—'}</span>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded font-pixel text-[9px] flex items-center gap-1 flex-shrink-0 ${ans.isCorrect ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}
                              >
                                {ans.isCorrect ? <Check size={10} /> : <X size={10} />}
                                {ans.isCorrect ? 'CORRECT' : 'WRONG'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end">
              <button
                onClick={() => setSelectedAuditPlayer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-pixel text-xs active:translate-y-0.5"
              >
                CLOSE AUDIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Inspection Modal */}
      {selectedCertificatePlayer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border-4 border-slate-950 rounded-2xl p-5 sm:p-6 space-y-4 my-8 relative animate-fadeIn shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-retro-yellow" />
                <h3 className="font-pixel text-xs sm:text-sm text-slate-100 tracking-wider">
                  CERTIFICATE PREVIEW: {selectedCertificatePlayer.playerName.toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCertificatePlayer(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <X size={16} />
              </button>
            </div>

            {/* Certificate Component */}
            <div className="py-2">
              <Certificate
                playerName={selectedCertificatePlayer.playerName}
                relation={selectedCertificatePlayer.relation}
                score={selectedCertificatePlayer.score}
                totalQuestions={selectedCertificatePlayer.totalQuestions}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
