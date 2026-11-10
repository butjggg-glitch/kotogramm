// ============================================================
// 11-auth-init.js — Авторизация, listen, switchTab, init
// ⚠️ ИИ-АНТИЧИТ: автобан ОТКЛЮЧЁН, банит только Филипп руками!
// ============================================================

// ============ 🏅 ДОСТИЖЕНИЯ ============
window.unlockAchievement = async function(id) {
    if (!currentUser) return;
    const a = ACHIEVEMENTS[id]; if (!a) return;
    const snap = await db.ref('achievements/' + currentUser.username + '/' + id).once('value');
    if (snap.val()) return;
    await db.ref('achievements/' + currentUser.username + '/' + id).set(true);
    toast(`🏅 Достижение: ${a.emoji} ${a.name}`);
};

// ============ 🔔 ОНЛАЙН ============
window.listenOnline = function() {
    db.ref('sessions').on('child_added', snap => { const d = snap.val(); if (d && d.online) onlineUsers[snap.key] = true; });
    db.ref('sessions').on('child_changed', snap => { const d = snap.val(); if (d && d.online) onlineUsers[snap.key] = true; else delete onlineUsers[snap.key]; });
    db.ref('sessions').on('child_removed', snap => { delete onlineUsers[snap.key]; });
};
window.isUserOnline = function(u) { return !!onlineUsers[u]; };

// ============ 🎵 ЗВУК ============
window.playBeep = function() {
    try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.connect(g); g.connect(audioCtx.destination);
        o.type = 'sine'; o.frequency.setValueAtTime(800, audioCtx.currentTime);
        g.gain.setValueAtTime(0.3, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        o.start(); o.stop(audioCtx.currentTime + 0.15);
    } catch(e) {}
};

// ============ 🔔 УВЕДОМЛЕНИЯ ЧАТА ============
window.updateTitle = function() { document.title = unreadCount > 0 ? `(${unreadCount}) Котограм` : 'Котограм'; };
window.updateBadge = function() { const b = $('chatBadge'); if (b) { b.textContent = unreadCount; if (unreadCount > 0) b.classList.add('show'); else b.classList.remove('show'); } };
window.resetUnread = function() { unreadCount = 0; updateBadge(); updateTitle(); };

window.startMessageNotifications = function() {
    db.ref('messages').off('child_added');
    db.ref('messages').orderByChild('timestamp').limitToLast(1).on('child_added', snap => {
        const m = snap.val();
        if (!currentUser || m.username === currentUser.username) return;
        if (m.timestamp <= lastMessageTimestamp) return;
        lastMessageTimestamp = m.timestamp;
        if (activeTab !== 'chat') { unreadCount++; updateBadge(); updateTitle(); toast(`💬 ${m.username}`); playBeep(); }
    });
};

// ============ 🔥 listen() — ГЛАВНЫЙ СЛУШАТЕЛЬ + ИИ-АНТИЧИТ ============
window.listen = function() {
    if (!currentUser) return;
    db.ref('users/' + currentUser.username).off();

    // 🤖 ИИ-АНТИЧИТ — БЕЗ АВТОБАНА! Только предупреждения в лог.
    if (aiAnticheatInterval) clearInterval(aiAnticheatInterval);
    aiAnticheatInterval = setInterval(() => {
        if (!currentUser) return;
        db.ref('users').once('value').then(s => {
            const u = s.val() || {};
            Object.entries(u).forEach(([name, data]) => {
                if (name === 'Филипп') return;
                const role = data.role || 'user';
                if (role === 'admin') return;

                const INFINITY_PATTERN = [Infinity, "Infinity", "infinity", "INFINITY", "∞"];
                const hasFakeInfinity = (val) => {
                    if (typeof val === 'number') return val === Infinity || val > 1e15;
                    if (typeof val === 'string') return INFINITY_PATTERN.includes(val) || Number(val) > 1e15;
                    return false;
                };

                const currentCoins = hasFakeInfinity(data.coins) ? Infinity : (data.coins || 0);
                const currentTokens = hasFakeInfinity(data.tokens) ? Infinity : (data.tokens || 0);
                const last = aiLastBalances[name] || { coins: 0, tokens: 0 };

                // 1. Бесконечность — ТОЛЬКО у Филиппа. Остальным откатываем БЕЗ БАНА.
                if (currentCoins === Infinity || currentTokens === Infinity) {
                    db.ref('users/' + name).update({ coins: 0, tokens: 0 });
                    db.ref('messages').push({ username: '📢 SYSTEM', text: `⚠️ ИИ-АНТИЧИТ: у ${name} была бесконечность. Баланс откатан. Банит только Филипп.`, timestamp: firebase.database.ServerValue.TIMESTAMP, isSystem: true });
                    addAuditLog('ai_alert_infinity', name, 0, 'ANTICHEAT');
                    delete aiLastBalances[name];
                    return;
                }

                // 2. Скачок койнов — с учётом легального обмена
                if (last.coins > 0) {
                    const diffCoins = currentCoins - last.coins;
                    const lastExchange = parseInt(localStorage.getItem('last_exchange_' + name) || '0');
                    const isLegitExchange = (Date.now() - lastExchange < 30000);
                    if (diffCoins > 100000 && !isLegitExchange) {
                        db.ref('messages').push({ username: '📢 SYSTEM', text: `⚠️ ИИ-АНТИЧИТ: у ${name} скачок +${diffCoins}🐾 за 10 сек. Банит только Филипп.`, timestamp: firebase.database.ServerValue.TIMESTAMP, isSystem: true });
                        addAuditLog('ai_alert_coins', name, diffCoins, 'ANTICHEAT');
                        delete aiLastBalances[name];
                        return;
                    }
                }

                // 3. Скачок токенов — с учётом легального обмена
                if (last.tokens > 0) {
                    const diffTokens = currentTokens - last.tokens;
                    const lastExchange2 = parseInt(localStorage.getItem('last_exchange_' + name) || '0');
                    const isLegitExchange2 = (Date.now() - lastExchange2 < 30000);
                    if (diffTokens > 100 && !isLegitExchange2) {
                        db.ref('messages').push({ username: '📢 SYSTEM', text: `⚠️ ИИ-АНТИЧИТ: у ${name} скачок +${diffTokens}💎 за 10 сек. Банит только Филипп.`, timestamp: firebase.database.ServerValue.TIMESTAMP, isSystem: true });
                        addAuditLog('ai_alert_tokens', name, diffTokens, 'ANTICHEAT');
                        delete aiLastBalances[name];
                        return;
                    }
                }

                aiLastBalances[name] = { coins: currentCoins, tokens: currentTokens };
            });
            localStorage.setItem('ai_last_balances', JSON.stringify(aiLastBalances));
        });
    }, 10000);

    db.ref('users/' + currentUser.username).on('value', snap => {
        const f = snap.val();
        if (!f) return;
        if (currentUser.username === 'Филипп') { currentUser.coins = Infinity; currentUser.role = 'admin'; }
        else { currentUser.coins = (f.coins === "Infinity") ? Infinity : (f.coins || 0); currentUser.role = f.role; }
        currentUser.avatarUrl = f.avatarUrl; currentUser.nickAnim = f.nickAnim; currentUser.verified = f.verified;
        currentUser.vipRole = f.vipRole; currentUser.vipExpiresAt = f.vipExpiresAt;
        currentUser.customTheme = f.customTheme === true;
        if (activeTab === 'coins') rCoins();
        else if (activeTab === 'shop') rShop();
        else if (activeTab === 'exchange') rExchange();
        else if (activeTab === 'tokens') rTokens();
        else if (activeTab === 'roles') rRoles();
        else if (activeTab === 'abilities') rAbilities();
        else if (activeTab === 'tokenshop') rTokenShop();
        else if (activeTab === 'wintop') rWinTop();
        else if (activeTab === 'clan') rClan();
        else if (t === 'events') rEvents();
    });
};

// ============ 🔀 SWITCH TAB ============
window.switchTab = function(t) {
    if (activeTab === 'game' && t !== 'game') { gameActive = false; if (gameLoopId) cancelAnimationFrame(gameLoopId); if (keydownHandler) window.removeEventListener('keydown', keydownHandler); if (keyupHandler) window.removeEventListener('keyup', keyupHandler); }
    if (activeTab === 'fishing' && t !== 'fishing') { if (fishingTimeout) clearTimeout(fishingTimeout); if (fishingCatchTimeout) clearTimeout(fishingCatchTimeout); fishingActive = false; }
    if (activeTab === 'stickman' && t !== 'stickman') { if (stickmanAnimId) cancelAnimationFrame(stickmanAnimId); stickmanState = null; }
    activeTab = t;
    document.querySelectorAll('.nav-item').forEach(x => x.classList.toggle('active', x.dataset.tab === t));
    if (t === 'coins') rCoins();
    else if (t === 'tokens') rTokens();
    else if (t === 'roles') rRoles();
    else if (t === 'abilities') rAbilities();
    else if (t === 'tokenshop') rTokenShop();
    else if (t === 'shop') rShop();
    else if (t === 'exchange') rExchange();
    else if (t === 'clan') rClan();
    else if (t === 'tournaments') rTournaments();
    else if (t === 'wintop') rWinTop();
    else if (t === 'wipehistory') rWipeHistory();
    else if (t === 'chat') { resetUnread(); rChat(); }
    else if (t === 'private') rPrivateChats();
    else if (t === 'mod') rModPanel();
    else if (t === 'roles_mgr') rRoleManager();
    else if (t === 'requests') rRequests();
    else if (t === 'suspicious') rSuspicious();
    else if (t === 'aianticheat') rAiAnticheat();
    else if (t === 'audit') rAudit();
    else if (t === 'admin') rAdminPanel();
    else if (t === 'quests') rQuests();
    else if (t === 'auction') rAuction();
    else if (t === 'slots') rSlots();
    else if (t === 'blackjack') rBlackjack();
    else if (t === 'fishing') rFishing();
    else if (t === 'stickman') rStickman();
    else if (t === 'game') rGame();
    else if (t === 'events') rEvents();
    else if (t === 'craft') rCraft();
};

// ============ АВТОРИЗАЦИЯ ============
window.switchAuthMode = function(mode) {
    if (mode === 'login') {
        $('tabLoginBtn').classList.add('active'); $('tabRegisterBtn').classList.remove('active');
        $('loginForm').style.display = 'flex'; $('registerForm').style.display = 'none';
        $('loginBtn').style.display = 'block'; $('registerBtn').style.display = 'none';
        $('loginError').textContent = ''; $('registerSuccess').textContent = '';
    } else {
        $('tabLoginBtn').classList.remove('active'); $('tabRegisterBtn').classList.add('active');
        $('loginForm').style.display = 'none'; $('registerForm').style.display = 'flex';
        $('loginBtn').style.display = 'none'; $('registerBtn').style.display = 'block';
        $('loginError').textContent = ''; $('registerSuccess').textContent = '';
    }
};

window.registerAccount = function() {
    const nick = $('regUsername').value.trim();
    const pass = $('regPassword').value;
    const pass2 = $('regPassword2').value;
    const err = $('loginError'); const succ = $('registerSuccess');
    err.textContent = ''; succ.textContent = '';
    if (!nick || !pass || !pass2) { err.textContent = '❌ Заполни все поля'; return; }
    if (nick.length < 3) { err.textContent = '❌ Ник минимум 3 символа'; return; }
    if (nick.length > 20) { err.textContent = '❌ Ник максимум 20 символов'; return; }
    if (/[\/\\<>{}|]/.test(nick)) { err.textContent = '❌ Ник содержит запрещённые символы'; return; }
    if (RESERVED_NAMES.some(r => r.toLowerCase() === nick.toLowerCase())) { err.textContent = '❌ Этот ник занят'; return; }
    if (pass.length < 6) { err.textContent = '❌ Пароль минимум 6 символов'; return; }
    if (pass !== pass2) { err.textContent = '❌ Пароли не совпадают'; return; }
    db.ref('users/' + nick).once('value').then(snap => {
        if (snap.exists()) { err.textContent = '❌ Ник уже занят'; return; }
        const newUser = { password: pass, role: 'user', coins: 100, tokens: 0, vipRole: null, vipExpiresAt: null, createdAt: Date.now(), wipeInvest: 0, wipeInvestToday: 0, wipeInvestDate: '', clanId: null, freeCase: 0 };
        db.ref('users/' + nick).set(newUser).then(() => {
            succ.textContent = `✅ Аккаунт создан! Войди под ником ${nick}`;
            $('loginUsername').value = nick; $('loginPassword').value = pass;
            addAuditLog('register', nick, 100, nick);
            setTimeout(() => switchAuthMode('login'), 1500);
        }).catch(e => { err.textContent = '❌ Ошибка: ' + e.message; });
    });
};

window.login = function(username = null, password = null, isImpersonation = false) {
    const n = username || $('loginUsername').value.trim();
    const p = password || $('loginPassword').value.trim();
    if (!n || !p) { if (!isImpersonation) $('loginError').textContent = 'Введите ник и пароль'; return; }
    db.ref('users/' + n).once('value').then(async s => {
        const u = s.val();
        if (!u || (!isImpersonation && u.password !== p)) { $('loginError').textContent = '❌ Неверный ник или пароль'; return; }
        if (n === 'Филипп') { u.role = 'admin'; u.coins = 'Infinity'; u.tokens = 'Infinity'; }
        if (isImpersonation && currentUser && currentUser.role === 'admin') originalAdmin = { ...currentUser };
        currentUser = { username: n, ...u, coins: (n === 'Филипп') ? Infinity : (u.coins === "Infinity" ? Infinity : (u.coins || 0)) };
        $('loginError').textContent = '';
        if (!isImpersonation) { $('loginUsername').value = ''; $('loginPassword').value = ''; }
        const { banned, until, reason } = await checkBan();
        if (banned) { showBanScreen(until, reason); return; }
        await checkModeration();
        $('loginScreen').classList.add('hidden'); $('mainApp').classList.add('active');
        if (!isImpersonation) saveCredentials(n, p);
        startSession(); listen(); listenOnline(); listenMaintenance(); startMessageNotifications(); listenEvents();
        switchTab(activeTab); updateHeader();
        setTimeout(() => checkAndRunWipe(), 2000);
    });
};

window.logout = function() {
    hideBanScreen(); endSession();
    if (fishingTimeout) clearTimeout(fishingTimeout);
    if (fishingCatchTimeout) clearTimeout(fishingCatchTimeout);
    if (wipeCountdownInterval) clearInterval(wipeCountdownInterval);
    if (maintenanceInterval) clearInterval(maintenanceInterval);
    fishingActive = false;
    db.ref('messages').off('child_added'); db.ref('sessions').off();
    db.ref('config/maintenance').off();
    if (originalAdmin) { currentUser = originalAdmin; originalAdmin = null; startSession(); listen(); listenOnline(); listenMaintenance(); listenEvents(); switchTab(activeTab); updateHeader(); toast('🔙 Вернулись'); return; }
    clearCredentials(); db.ref('users').off();
    onlineUsers = {};
    currentUser = null;
    if (aiAnticheatInterval) clearInterval(aiAnticheatInterval);
    aiLastBalances = {};
    localStorage.removeItem('ai_last_balances');
    if (anticheatInterval) clearInterval(anticheatInterval);
    lastBalances = {};
    $('mainApp').classList.remove('active'); $('loginScreen').classList.remove('hidden');
};

window.updateHeader = function() { if (currentUser) $('headerTitle').textContent = currentUser.username === 'Филипп' ? 'Котограм' : '👤 ' + currentUser.username; };

// ============ 🎬 ИНИЦИАЛИЗАЦИЯ ============
$('tabLoginBtn').onclick = () => switchAuthMode('login');
$('tabRegisterBtn').onclick = () => switchAuthMode('register');
$('registerBtn').onclick = registerAccount;
$('regPassword2').onkeydown = e => { if (e.key === 'Enter') registerAccount(); };
$('wheelSpin').onclick = spinWheel;
$('loginBtn').onclick = () => login();
$('loginPassword').onkeydown = e => { if (e.key==='Enter') login(); };
$('logoutBtn').onclick = logout;
document.querySelectorAll('.nav-item').forEach(x => x.onclick = () => switchTab(x.dataset.tab));
$('themeToggle').onclick = () => {
    const isDark = currentTheme === 'dark';
    applyTheme(isDark ? 'light' : 'dark');
    $('themeToggle').textContent = isDark ? '🌓' : '☀️';
};
$('themeBtn').onclick = () => openThemeModal();
$('themeModalClose').onclick = () => $('themeModal').classList.add('hidden');
$('wheelClose').onclick = () => { $('wheelOverlay').classList.add('hidden'); isSpinning = false; $('wheelSpin').disabled = false; };

applyTheme(currentTheme);
$('themeToggle').textContent = currentTheme === 'dark' ? '☀️' : '🌓';

window.addEventListener('load', () => setTimeout(autoLogin, 600));