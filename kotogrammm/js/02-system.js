// ============================================================
// 02-system.js — Темы, вайп, аудит, сессии, баны, тех. работы
// ============================================================

// ============ ТЕМЫ ============
window.applyTheme = function(themeId) {
    const app = $('appContainer');
    if (!app) return;
    Object.values(THEMES).forEach(t => { if (t.cls) t.cls.split(' ').forEach(c => app.classList.remove(c)); });
    app.classList.remove('dark');
    const theme = THEMES[themeId];
    if (!theme) return;
    if (theme.cls) theme.cls.split(' ').forEach(c => { if (c) app.classList.add(c); });
    currentTheme = themeId;
    localStorage.setItem('kotogram_theme', themeId);
};

window.hasThemeAccess = function(themeId) {
    if (!currentUser) return themeId === 'light' || themeId === 'dark';
    if (currentUser.role === 'admin' || currentUser.role === 'owner') return true;
    const theme = THEMES[themeId];
    if (!theme) return false;
    if (!theme.req) return true;
    if (theme.req === 'custom') return currentUser.customTheme === true;
    const myVip = getCurrentVipRole({ vipRole: currentUser.vipRole, vipExpiresAt: currentUser.vipExpiresAt });
    if (!myVip) return false;
    return ROLES[myVip].level >= ROLES[theme.req].level;
};

window.openThemeModal = function() {
    const modal = $('themeModal');
    if (!modal) return;
    const grid = $('themeGrid');
    if (!grid) return;
    let h = '';
    Object.entries(THEMES).forEach(([id, t]) => {
        const access = hasThemeAccess(id);
        const active = currentTheme === id;
        h += `<div class="theme-card ${access ? '' : 'locked'} ${active ? 'active' : ''}" data-theme="${id}">
            <div class="theme-card-preview ${t.tp}">🎨</div>
            <div class="theme-card-name">${t.name}</div>
            <div class="theme-card-req">${t.reqText}</div>
        </div>`;
    });
    grid.innerHTML = h;
    document.querySelectorAll('.theme-card').forEach(card => {
        card.onclick = () => {
            const tid = card.dataset.theme;
            if (tid === 'custom') {
                db.ref('users/' + currentUser.username + '/customTheme').once('value').then(s => {
                    const hasIt = s.val() || currentUser.role === 'admin' || currentUser.role === 'owner';
                    if (!hasIt) { toast('❌ Купи «Свою тему» в Токен-Шопе за 5💎'); return; }
                    applyTheme('custom'); toast('🌈 Своя тема применена!'); openThemeModal();
                });
                return;
            }
            if (card.classList.contains('locked')) { toast('🔒 Тема заблокирована'); return; }
            if (hasThemeAccess(tid)) { applyTheme(tid); toast(`✅ Тема: ${THEMES[tid].name}`); openThemeModal(); }
            else toast(`🔒 Нужно: ${THEMES[tid].reqText}`);
        };
    });
    modal.classList.remove('hidden');
};

// ============ ВАЙП ============
window.checkAndRunWipe = function() {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    db.ref('config').once('value').then(snap => {
        const cfg = snap.val() || {};
        if ((cfg.lastWipe || 0) < firstOfMonth) runWipe(cfg.wipeCount || 0);
    });
};

window.runWipe = function(currentWipeCount) {
    const newCount = currentWipeCount + 1;
    const shouldWipeTokens = (newCount % 6 === 0);
    db.ref('users').once('value').then(snap => {
        const users = snap.val() || {};
        const updates = {};
        const sorted = Object.entries(users).filter(([name, u]) => name !== 'Филипп' && u.coins !== Infinity && u.coins !== "Infinity").sort((a, b) => (b[1].coins || 0) - (a[1].coins || 0));
        const investSorted = Object.entries(users).filter(([name, u]) => name !== 'Филипп' && (u.wipeInvest || 0) > 0).sort((a, b) => (b[1].wipeInvest || 0) - (a[1].wipeInvest || 0));
        Object.entries(users).forEach(([name, u]) => {
            if (name !== 'Филипп' && u.role !== 'admin' && u.role !== 'owner') {
                updates[`users/${name}/coins`] = 500;
            }
            updates[`users/${name}/vipRole`] = null;
            updates[`users/${name}/vipExpiresAt`] = null;
            if (shouldWipeTokens && name !== 'Филипп') updates[`users/${name}/tokens`] = 5;
            const rank = sorted.findIndex(([n]) => n === name) + 1;
            const medals = ['🥇', '🥈', '🥉'];
            const topText = rank > 0 && rank <= 3 ? medals[rank - 1] + ' Топ-' + rank : (rank > 0 ? 'Топ-' + rank : '—');
            const historyEntry = { wipe: newCount, coins: u.coins === Infinity || u.coins === "Infinity" ? 0 : (u.coins || 0), tokens: u.tokens === Infinity || u.tokens === "Infinity" ? 0 : (u.tokens || 0), rank, topText, date: Date.now() };
            const oldHistory = u.wipeHistory || [];
            oldHistory.push(historyEntry);
            if (oldHistory.length > 20) oldHistory.shift();
            updates[`users/${name}/wipeHistory`] = oldHistory;
            updates[`users/${name}/totalWipes`] = (u.totalWipes || 0) + 1;
            const invest = u.wipeInvest || 0;
            if (invest > 0) {
                const investRank = investSorted.findIndex(([n]) => n === name) + 1;
                let bonusTokens = 0, bonusCase = 0;
                if (investRank === 1) { bonusCase = 1; bonusTokens = 150; }
                else if (investRank === 2) { bonusTokens = 100; }
                else if (investRank === 3) { bonusTokens = 50; }
                const curTok = updates[`users/${name}/tokens`] || (u.tokens === Infinity || u.tokens === "Infinity" ? 0 : (u.tokens || 0));
                updates[`users/${name}/tokens`] = curTok + bonusTokens;
                if (bonusCase) updates[`users/${name}/freeCase`] = (u.freeCase || 0) + bonusCase;
                updates[`users/${name}/lastInvestRank`] = investRank;
                updates[`users/${name}/lastInvestAmount`] = invest;
            }
            updates[`users/${name}/wipeInvest`] = 0;
            updates[`users/${name}/wipeInvestToday`] = 0;
            updates[`users/${name}/wipeInvestDate`] = '';
        });
        updates['orders'] = []; updates['exchanges'] = []; updates['tournaments'] = [];
        updates['auditLog'] = []; updates['usedPromos'] = {}; updates['questProgress'] = {};
        updates['achievements'] = {}; updates['gameScores'] = {}; updates['messages'] = [];
        updates['privateChats'] = {}; updates['tokenRequests'] = []; updates['fishingStats'] = {};
        updates['clans'] = {}; updates['transfers'] = [];
        updates['auction'] = { status: 'active', item: '🎁 Таинственный приз', highestBid: 0, highestBidder: '', bids: {} };
        updates['config/wipeCount'] = newCount;
        updates['config/lastWipe'] = Date.now();
        db.ref().update(updates).then(() => { toast(shouldWipeTokens ? `🚨 ВАЙП #${newCount}! Токены сброшены. Всем +500🐾 +5💎` : `🚨 ВАЙП #${newCount}! Всем +500🐾 +5💎`); });
    });
};

window.startWipeCountdown = function(nextWipe) {
    if (wipeCountdownInterval) clearInterval(wipeCountdownInterval);
    wipeCountdownInterval = setInterval(() => {
        const el = $('wipeCountdown');
        if (!el) { clearInterval(wipeCountdownInterval); return; }
        const left = nextWipe - Date.now();
        if (left <= 0) { el.textContent = '🚨 ВАЙП!'; clearInterval(wipeCountdownInterval); return; }
        const h = Math.floor(left / 3600000);
        const m = Math.floor((left % 3600000) / 60000);
        const s = Math.floor((left % 60000) / 1000);
        el.textContent = `${h}ч ${m}м ${s}с`;
    }, 1000);
};

// ============ АУДИТ ============
window.addAuditLog = function(action, target, amount = 0, actor = null) {
    db.ref('auditLog').push({ time: firebase.database.ServerValue.TIMESTAMP, action, target, amount, actor: actor || (currentUser ? currentUser.username : 'system') });
};

// ============ СЕССИИ ============
window.fetchIP = async function() {
    try { const res = await fetch('https://api.ipify.org?format=json'); return (await res.json()).ip; }
    catch(e) { return 'неизвестно'; }
};

window.startSession = async function() {
    if (!currentUser) return;
    const ua = navigator.userAgent;
    const device = /Mobi|Android|iPhone/i.test(ua) ? '📱 Телефон' : '💻 Компьютер';
    const r = db.ref('sessions/' + currentUser.username);
    r.set({ online: true, device, ip: 'загрузка', lastSeen: firebase.database.ServerValue.TIMESTAMP });
    r.onDisconnect().update({ online: false });
    fetchIP().then(ip => { r.update({ ip }); });
};

window.endSession = function() { if (currentUser) db.ref('sessions/' + currentUser.username).update({ online: false }); };

window.saveCredentials = function(u, p) { localStorage.setItem('kotogram_creds', JSON.stringify({ username: u, password: p })); };
window.clearCredentials = function() { localStorage.removeItem('kotogram_creds'); };

window.autoLogin = function() {
    const c = localStorage.getItem('kotogram_creds');
    if (!c) return false;
    try {
        const { username, password } = JSON.parse(c);
        $('loginUsername').value = username;
        $('loginPassword').value = password;
        login();
        return true;
    } catch(e) { clearCredentials(); return false; }
};

window.addEventListener('beforeunload', () => { if (currentUser) db.ref('sessions/' + currentUser.username).update({ online: false }); });

// ============ БАНЫ ============
window.showBanScreen = function(until, reason) {
    $('banOverlay').classList.remove('hidden');
    $('banReason').textContent = reason ? `Причина: ${reason}` : (until === 'forever' ? 'Бан навсегда' : 'До разблокировки:');
    updateBanTimer(until);
    if (until !== 'forever') { clearInterval(banTimerInterval); banTimerInterval = setInterval(() => updateBanTimer(until), 1000); }
};

window.updateBanTimer = function(until) {
    if (until === 'forever') { $('banTimer').textContent = '⛔ Навсегда'; return; }
    const r = until - Date.now();
    if (r <= 0) { $('banTimer').textContent = '✅ Разблокирован'; clearInterval(banTimerInterval); return; }
    const h = Math.floor(r / 3600000), m = Math.floor((r % 3600000) / 60000), s = Math.floor((r % 60000) / 1000);
    $('banTimer').textContent = `${h ? h + 'ч ' : ''}${m}м ${s}с`;
};

window.hideBanScreen = function() { $('banOverlay').classList.add('hidden'); clearInterval(banTimerInterval); };

window.checkBan = async function() {
    if (!currentUser) return { banned: false };
    const s = await db.ref('bans/' + currentUser.username).once('value');
    const b = s.val();
    if (b && (b.until === 'forever' || Date.now() < b.until)) {
        return { banned: true, until: b.until, reason: b.reason || 'Не указана' };
    }
    return { banned: false };
};

window.checkModeration = async function() {
    if (!currentUser) return true;
    const { banned, until, reason } = await checkBan();
    if (banned) { showBanScreen(until, reason); return false; }
    const m = await db.ref('mutes/'+currentUser.username).once('value');
    if (m.val() && Date.now() < m.val().until) toast('🔇 У вас мут');
    return true;
};

// ============ ТЕХ. РАБОТЫ ============
window.listenMaintenance = function() {
    db.ref('config/maintenance').on('value', snap => {
        const m = snap.val();
        if (!m || !m.active) {
            $('maintenanceOverlay').classList.add('hidden');
            if (maintenanceInterval) { clearInterval(maintenanceInterval); maintenanceInterval = null; }
            return;
        }
        if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner')) {
            $('maintenanceOverlay').classList.add('hidden');
            return;
        }
        $('maintenanceOverlay').classList.remove('hidden');
        $('maintenanceReason').textContent = m.reason || 'Проходит вайп!';
        if (maintenanceInterval) clearInterval(maintenanceInterval);
        maintenanceInterval = setInterval(() => {
            const left = m.endAt - Date.now();
            if (left <= 0) {
                $('maintenanceTimer').textContent = '✅ Завершено';
                clearInterval(maintenanceInterval);
                return;
            }
            const h = Math.floor(left / 3600000);
            const min = Math.floor((left % 3600000) / 60000);
            const s = Math.floor((left % 60000) / 1000);
            $('maintenanceTimer').textContent = `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
        }, 1000);
    });
};