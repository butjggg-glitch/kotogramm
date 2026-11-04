// ============================================================
// 04-admin.js — Админ-панель (60+ функций)
// ============================================================

window.rAdminPanel = function() {
    if (!currentUser || currentUser.role !== 'admin') {
        $('feedContainer').innerHTML = '<div class="empty-state">⛔ Только для админа</div>';
        return;
    }
    if (!isMasterKeyValid) {
        let h = '<div class="divider">⚙️ АДМИН-ПАНЕЛЬ</div>';
        h += `<div class="card"><span class="text-bold">🔑 Мастер-ключ</span><p class="text-sm">Введите мастер-ключ один раз для доступа к админке.</p><input type="password" id="masterKeySetup" class="input-sm" placeholder="K0t0gr@mM@sterKey2024!" style="margin-top:6px; width:100%;"><button class="btn-sm btn-purple" onclick="window.saveMasterKey()" style="margin-top:6px; width:100%;">Сохранить</button></div>`;
        $('feedContainer').innerHTML = h;
        return;
    }

    let h = '<div class="divider">⚙️ АДМИН-ПАНЕЛЬ</div>';
    h += `<div class="card" style="background:linear-gradient(135deg,#4f46e5,#7c3aed); color:white; text-align:center;"><div style="font-size:36px;">👑</div><div style="font-weight:900; font-size:18px; margin-top:4px;">Админ: ${esc(currentUser.username)}</div><div style="font-size:12px; opacity:0.9; margin-top:4px;">60+ функций управления</div></div>`;

    // 1. КОЙНЫ (6 функций)
    h += '<div class="admin-section">💰 Койны</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admCoins('add')"><div class="admin-action-icon">➕</div><div class="admin-action-name">Выдать</div></div>`;
    h += `<div class="admin-action" onclick="window.admCoins('remove')"><div class="admin-action-icon">➖</div><div class="admin-action-name">Списать</div></div>`;
    h += `<div class="admin-action" onclick="window.admCoins('set')"><div class="admin-action-icon">📝</div><div class="admin-action-name">Установить</div></div>`;
    h += `<div class="admin-action" onclick="window.admCoins('zero')"><div class="admin-action-icon">0️⃣</div><div class="admin-action-name">Обнулить</div></div>`;
    h += `<div class="admin-action" onclick="window.admCoins('x2all')"><div class="admin-action-icon">⚡</div><div class="admin-action-name">×2 всем</div></div>`;
    h += `<div class="admin-action" onclick="window.admCoins('resetAll')"><div class="admin-action-icon">🔄</div><div class="admin-action-name">Сброс всем</div></div>`;
    h += '</div>';

    // 2. ТОКЕНЫ (4 функции)
    h += '<div class="admin-section">💎 Токены</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admTokens('add')"><div class="admin-action-icon">➕</div><div class="admin-action-name">Выдать</div></div>`;
    h += `<div class="admin-action" onclick="window.admTokens('remove')"><div class="admin-action-icon">➖</div><div class="admin-action-name">Списать</div></div>`;
    h += `<div class="admin-action" onclick="window.admTokens('set')"><div class="admin-action-icon">📝</div><div class="admin-action-name">Установить</div></div>`;
    h += `<div class="admin-action" onclick="window.admTokens('zero')"><div class="admin-action-icon">0️⃣</div><div class="admin-action-name">Обнулить</div></div>`;
    h += '</div>';

    // 3. РОЛИ (4 функции)
    h += '<div class="admin-section">🎭 Роли</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admRole('give')"><div class="admin-action-icon">👑</div><div class="admin-action-name">Выдать</div></div>`;
    h += `<div class="admin-action" onclick="window.admRole('take')"><div class="admin-action-icon">🗑️</div><div class="admin-action-name">Снять</div></div>`;
    h += `<div class="admin-action" onclick="window.admRole('giveAll')"><div class="admin-action-icon">🎁</div><div class="admin-action-name">Всем выдать</div></div>`;
    h += `<div class="admin-action" onclick="window.admRole('takeAll')"><div class="admin-action-icon">🚫</div><div class="admin-action-name">У всех снять</div></div>`;
    h += '</div>';

    // 4. БАНЫ И МУТЫ (6 функций)
    h += '<div class="admin-section">🚫 Баны и Муты</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admBan('ban')"><div class="admin-action-icon">🔨</div><div class="admin-action-name">Забанить</div></div>`;
    h += `<div class="admin-action" onclick="window.admBan('unban')"><div class="admin-action-icon">🔓</div><div class="admin-action-name">Разбанить</div></div>`;
    h += `<div class="admin-action" onclick="window.admBan('banAll')"><div class="admin-action-icon">🚨</div><div class="admin-action-name">Бан всех</div></div>`;
    h += `<div class="admin-action" onclick="window.admMute('mute')"><div class="admin-action-icon">🔇</div><div class="admin-action-name">Замутить</div></div>`;
    h += `<div class="admin-action" onclick="window.admMute('unmute')"><div class="admin-action-icon">🔊</div><div class="admin-action-name">Размутить</div></div>`;
    h += `<div class="admin-action" onclick="window.admMute('muteAll')"><div class="admin-action-icon">📢</div><div class="admin-action-name">Мут всем</div></div>`;
    h += '</div>';

    // 5. ЭКОНОМИКА И КЕЙСЫ (5 функций)
    h += '<div class="admin-section">🎁 Кейсы и Экономика</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admCase('giveAll')"><div class="admin-action-icon">🎁</div><div class="admin-action-name">Выдать кейсы</div></div>`;
    h += `<div class="admin-action" onclick="window.admCase('freeAll')"><div class="admin-action-icon">🆓</div><div class="admin-action-name">Бесплатно всем</div></div>`;
    h += `<div class="admin-action" onclick="window.admCase('openAll')"><div class="admin-action-icon">📦</div><div class="admin-action-name">Открыть всем</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('orders')"><div class="admin-action-icon">📦</div><div class="admin-action-name">Очистить заказы</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('auction')"><div class="admin-action-icon">⚖️</div><div class="admin-action-name">Сброс аукциона</div></div>`;
    h += '</div>';

    // 6. ИВЕНТЫ И ТУРНИРЫ (4 функции)
    h += '<div class="admin-section">🎉 Ивенты и Турниры</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admEvent('start')"><div class="admin-action-icon">🚀</div><div class="admin-action-name">Запустить ивент</div></div>`;
    h += `<div class="admin-action" onclick="window.admEvent('stop')"><div class="admin-action-icon">⏹️</div><div class="admin-action-name">Остановить ивент</div></div>`;
    h += `<div class="admin-action" onclick="window.admEvent('clear')"><div class="admin-action-icon">🗑️</div><div class="admin-action-name">Очистить ивент</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('tournaments')"><div class="admin-action-icon">🏆</div><div class="admin-action-name">Очистить турниры</div></div>`;
    h += '</div>';

    // 7. КЛАНЫ (3 функции)
    h += '<div class="admin-section">🏰 Кланы</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admClan('disbandAll')"><div class="admin-action-icon">💥</div><div class="admin-action-name">Распустить все</div></div>`;
    h += `<div class="admin-action" onclick="window.admClan('resetBank')"><div class="admin-action-icon">🏦</div><div class="admin-action-name">Сброс банков</div></div>`;
    h += `<div class="admin-action" onclick="window.admClan('clear')"><div class="admin-action-icon">🗑️</div><div class="admin-action-name">Удалить кланы</div></div>`;
    h += '</div>';

    // 8. ТЕХ. РАБОТЫ (3 функции)
    h += '<div class="admin-section">🛠️ Тех. работы</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admMaint('on')"><div class="admin-action-icon">🛠️</div><div class="admin-action-name">Включить</div></div>`;
    h += `<div class="admin-action" onclick="window.admMaint('off')"><div class="admin-action-icon">✅</div><div class="admin-action-name">Выключить</div></div>`;
    h += `<div class="admin-action" onclick="window.admMaint('quick')"><div class="admin-action-icon">⚡</div><div class="admin-action-name">На 5 минут</div></div>`;
    h += '</div>';

    // 9. ОЧИСТКА И СБРОСЫ (8 функций)
    h += '<div class="admin-section">🗑️ Очистка и Сбросы</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admClear('chat')"><div class="admin-action-icon">💬</div><div class="admin-action-name">Чат</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('audit')"><div class="admin-action-icon">📋</div><div class="admin-action-name">Аудит</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('requests')"><div class="admin-action-icon">📋</div><div class="admin-action-name">Заявки</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('private')"><div class="admin-action-icon">📩</div><div class="admin-action-name">ЛС</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('craftAuction')"><div class="admin-action-icon">⚖️</div><div class="admin-action-name">Аукцион крафта</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('pvp_queue')"><div class="admin-action-icon">⚔️</div><div class="admin-action-name">Очередь PvP</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('active_battles')"><div class="admin-action-icon">💥</div><div class="admin-action-name">Бои PvP</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('all')"><div class="admin-action-icon">🔥</div><div class="admin-action-name">Всё сразу</div></div>`;
    h += '</div>';

    // 10. ПРОЧЕЕ (5 функций)
    h += '<div class="admin-section">⚙️ Прочее</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admWipe('run')"><div class="admin-action-icon">🚨</div><div class="admin-action-name">Запустить вайп</div></div>`;
    h += `<div class="admin-action" onclick="window.admWipe('reset')"><div class="admin-action-icon">🔄</div><div class="admin-action-name">Сброс вайпов</div></div>`;
    h += `<div class="admin-action" onclick="window.admKey('reset')"><div class="admin-action-icon">🔑</div><div class="admin-action-name">Сброс ключа</div></div>`;
    h += `<div class="admin-action" onclick="window.admView('suspicious')"><div class="admin-action-icon">🚨</div><div class="admin-action-name">Античит</div></div>`;
    h += `<div class="admin-action" onclick="window.admStats()"><div class="admin-action-icon">📊</div><div class="admin-action-name">Статистика</div></div>`;
    h += '</div>';

    h += '<div class="admin-section">📊 Статистика сервера</div>';
    h += `<div class="card" id="admStatsCard"><div class="text-sm">Загрузка...</div></div>`;

    $('feedContainer').innerHTML = h;

    // Функция обновления статистики
    window.admStats = function() {
        db.ref('users').once('value').then(s => {
            const u = s.val() || {};
            const total = Object.keys(u).length;
            const online = Object.keys(onlineUsers).length;
            const topCoins = Object.entries(u).filter(([n, x]) => x.coins !== Infinity && x.coins !== "Infinity").sort((a, b) => (b[1].coins || 0) - (a[1].coins || 0)).slice(0, 3);
            const el = $('admStatsCard');
            if (el) el.innerHTML = `<div class="row-between" style="padding:4px 0;"><span>👥 Всего игроков:</span><b>${total}</b></div><div class="row-between" style="padding:4px 0;"><span>🟢 Онлайн:</span><b>${online}</b></div><div class="text-sm" style="margin-top:8px;">💰 Топ койнов:</div>${topCoins.map(([n, x], i) => `<div class="text-sm">${i + 1}. ${esc(n)} — ${x.coins}🐾</div>`).join('')}`;
        });
    };
    window.admStats();
};

// ============ ОСТАЛЬНЫЕ ФУНКЦИИ ============
window.saveMasterKey = function() {
    const key = document.getElementById('masterKeySetup').value.trim();
    if (key === HARDCODED_MASTER_KEY) {
        localStorage.setItem('kotogram_master_key', key);
        MASTER_KEY = key; isMasterKeyValid = true;
        toast('✅ Ключ сохранён!'); rAdminPanel();
    } else toast('❌ Неверный ключ');
};

window.admCoins = function(op) {
    const target = prompt('Ник игрока (или "all" для всех):');
    if (!target) return;
    const amount = op === 'x2all' || op === 'resetAll' ? 0 : parseInt(prompt('Сумма:') || '0');
    db.ref('users').once('value').then(s => {
        const u = s.val() || {};
        const updates = {};
        if (target === 'all' || op === 'x2all' || op === 'resetAll') {
            Object.entries(u).forEach(([n, x]) => {
                if (n === 'Филипп' || x.coins === Infinity || x.coins === "Infinity") return;
                if (op === 'x2all') updates['users/' + n + '/coins'] = (x.coins || 0) * 2;
                else if (op === 'resetAll') updates['users/' + n + '/coins'] = 100;
                else if (op === 'add') updates['users/' + n + '/coins'] = (x.coins || 0) + amount;
                else if (op === 'remove') updates['users/' + n + '/coins'] = Math.max(0, (x.coins || 0) - amount);
                else if (op === 'set') updates['users/' + n + '/coins'] = amount;
                else if (op === 'zero') updates['users/' + n + '/coins'] = 0;
            });
        } else {
            if (!u[target]) return toast('❌ Нет такого игрока');
            const cur = u[target].coins === Infinity || u[target].coins === "Infinity" ? Infinity : (u[target].coins || 0);
            if (cur === Infinity) return toast('Нельзя изменить ∞');
            if (op === 'add') updates['users/' + target + '/coins'] = cur + amount;
            else if (op === 'remove') updates['users/' + target + '/coins'] = Math.max(0, cur - amount);
            else if (op === 'set') updates['users/' + target + '/coins'] = amount;
            else if (op === 'zero') updates['users/' + target + '/coins'] = 0;
        }
        db.ref().update(updates).then(() => { toast('✅ Готово'); addAuditLog('admin_' + op + '_coins', target, amount); });
    });
};

window.admTokens = function(op) {
    const target = prompt('Ник игрока (или "all"):');
    if (!target) return;
    const amount = parseInt(prompt('Сумма:') || '0');
    db.ref('users').once('value').then(s => {
        const u = s.val() || {};
        const updates = {};
        if (target === 'all') {
            Object.entries(u).forEach(([n, x]) => {
                if (n === 'Филипп') return;
                const cur = x.tokens === Infinity || x.tokens === "Infinity" ? Infinity : (x.tokens || 0);
                if (cur === Infinity) return;
                if (op === 'add') updates['users/' + n + '/tokens'] = cur + amount;
                else if (op === 'remove') updates['users/' + n + '/tokens'] = Math.max(0, cur - amount);
                else if (op === 'set') updates['users/' + n + '/tokens'] = amount;
                else if (op === 'zero') updates['users/' + n + '/tokens'] = 0;
            });
        } else {
            if (!u[target]) return toast('❌ Нет такого игрока');
            const cur = u[target].tokens === Infinity || u[target].tokens === "Infinity" ? Infinity : (u[target].tokens || 0);
            if (cur === Infinity) return toast('Нельзя изменить ∞');
            if (op === 'add') updates['users/' + target + '/tokens'] = cur + amount;
            else if (op === 'remove') updates['users/' + target + '/tokens'] = Math.max(0, cur - amount);
            else if (op === 'set') updates['users/' + target + '/tokens'] = amount;
            else if (op === 'zero') updates['users/' + target + '/tokens'] = 0;
        }
        db.ref().update(updates).then(() => { toast('✅ Готово'); addAuditLog('admin_' + op + '_tokens', target, amount); });
    });
};

window.admRole = function(op) {
    const target = prompt('Ник игрока (или "all"):');
    if (!target) return;
    const role = prompt('Роль (baron, strazh, geroy, aspid, skvid, glava, elita, titan, prints, knyaz, gertsog):');
    if (!role || !ROLES[role]) return toast('❌ Неверная роль');
    db.ref('users').once('value').then(s => {
        const u = s.val() || {};
        const updates = {};
        const expiresAt = -1;
        if (target === 'all' || op === 'giveAll' || op === 'takeAll') {
            Object.entries(u).forEach(([n]) => {
                if (n === 'Филипп') return;
                if (op === 'giveAll') { updates['users/' + n + '/vipRole'] = role; updates['users/' + n + '/vipExpiresAt'] = expiresAt; }
                else if (op === 'takeAll') { updates['users/' + n + '/vipRole'] = null; updates['users/' + n + '/vipExpiresAt'] = null; }
            });
        } else {
            if (!u[target]) return toast('❌ Нет такого игрока');
            if (op === 'give') { updates['users/' + target + '/vipRole'] = role; updates['users/' + target + '/vipExpiresAt'] = expiresAt; }
            else if (op === 'take') { updates['users/' + target + '/vipRole'] = null; updates['users/' + target + '/vipExpiresAt'] = null; }
        }
        db.ref().update(updates).then(() => { toast('✅ Готово'); addAuditLog('admin_role_' + op, target, 0); });
    });
};

window.admBan = function(op) {
    if (op === 'banAll') {
        if (!confirm('Забанить ВСЕХ кроме админов?')) return;
        db.ref('users').once('value').then(s => {
            const u = s.val() || {};
            const updates = {};
            Object.entries(u).forEach(([n, x]) => { if (x.role !== 'admin' && n !== 'Филипп') updates['bans/' + n] = { until: 'forever' }; });
            db.ref().update(updates).then(() => toast('🚨 Все забанены'));
        });
        return;
    }
    const target = prompt('Ник игрока:');
    if (!target) return;
    if (op === 'ban') {
        const duration = prompt('Минут, 0 = навсегда:', '60');
        if (duration === null) return;
        const until = duration === '0' ? 'forever' : Date.now() + parseInt(duration) * 60000;
        db.ref('bans/' + target).set({ until }).then(() => { toast('🚫 ' + target + ' забанен'); addAuditLog('ban', target, 0); });
    } else if (op === 'unban') {
        db.ref('bans/' + target).remove().then(() => { toast('🔓 ' + target + ' разбанен'); addAuditLog('unban', target, 0); });
    }
};

window.admMute = function(op) {
    if (op === 'muteAll') {
        if (!confirm('Замутить ВСЕХ?')) return;
        db.ref('users').once('value').then(s => {
            const u = s.val() || {};
            const updates = {};
            const until = Date.now() + 60 * 60000;
            Object.entries(u).forEach(([n, x]) => { if (x.role !== 'admin' && n !== 'Филипп') updates['mutes/' + n] = { until }; });
            db.ref().update(updates).then(() => toast('🔇 Все замучены на 1 час'));
        });
        return;
    }
    const target = prompt('Ник игрока:');
    if (!target) return;
    if (op === 'mute') {
        const duration = prompt('Минут мута:', '60');
        if (!duration) return;
        db.ref('mutes/' + target).set({ until: Date.now() + parseInt(duration) * 60000 }).then(() => { toast('🔇 ' + target + ' замьючен'); addAuditLog('mute', target, 0); });
    } else if (op === 'unmute') {
        db.ref('mutes/' + target).remove().then(() => toast('🔊 ' + target + ' размьючен'));
    }
};

window.admCase = function(op) {
    db.ref('users').once('value').then(s => {
        const u = s.val() || {};
        const updates = {};
        Object.entries(u).forEach(([n, x]) => {
            if (n === 'Филипп') return;
            if (op === 'giveAll') updates['users/' + n + '/freeCase'] = (x.freeCase || 0) + 1;
            else if (op === 'freeAll') updates['users/' + n + '/freeCase'] = 0;
            else if (op === 'openAll') {
                const roles = Object.keys(ROLES).filter(k => k !== 'igrok');
                const r = roles[Math.floor(Math.random() * roles.length)];
                updates['users/' + n + '/vipRole'] = r;
                updates['users/' + n + '/vipExpiresAt'] = Date.now() + 30 * 86400000;
            }
        });
        db.ref().update(updates).then(() => toast('✅ Готово'));
    });
};

window.admEvent = function(op) {
    if (op === 'start') {
        window.forceStartEvent();
    } else if (op === 'stop') {
        db.ref('events/active').update({ status: 'ended' }).then(() => toast('⏹️ Ивент остановлен'));
    } else if (op === 'clear') {
        db.ref('events/active').remove();
        db.ref('events/lastEventTime').set(0);
        toast('🗑️ Ивент очищен');
    }
};

window.admClan = function(op) {
    if (op === 'disbandAll' || op === 'clear') {
        if (!confirm('Удалить все кланы?')) return;
        db.ref('clans').remove().then(() => {
            db.ref('users').once('value').then(s => {
                const updates = {};
                Object.keys(s.val() || {}).forEach(n => { updates['users/' + n + '/clanId'] = null; });
                db.ref().update(updates).then(() => toast('💥 Все кланы удалены'));
            });
        });
    } else if (op === 'resetBank') {
        db.ref('clans').once('value').then(s => {
            const updates = {};
            Object.keys(s.val() || {}).forEach(id => { updates['clans/' + id + '/bank'] = 0; });
            db.ref().update(updates).then(() => toast('🏦 Банки сброшены'));
        });
    }
};

window.admMaint = function(op) {
    if (op === 'on') db.ref('config/maintenance').set({ active: true, reason: 'Тех. работы', endAt: Date.now() + 30 * 60000 });
    else if (op === 'off') db.ref('config/maintenance').set({ active: false });
    else if (op === 'quick') db.ref('config/maintenance').set({ active: true, reason: 'Перезагрузка', endAt: Date.now() + 5 * 60000 });
    toast('🛠️ Режим обновлён');
};

window.admClear = function(what) {
    if (what === 'all') {
        if (!confirm('ОЧИСТИТЬ ВСЁ?')) return;
        const map = { chat: 'messages', audit: 'auditLog', requests: 'tokenRequests', private: 'privateChats', orders: 'orders', craftAuction: 'craftAuction', pvp_queue: 'pvp_queue', active_battles: 'active_battles', tournaments: 'tournaments' };
        const updates = {};
        Object.values(map).forEach(path => updates[path] = null);
        updates['auction'] = { status: 'active', item: '🎁 Таинственный приз', highestBid: 0, highestBidder: '', bids: {} };
        db.ref().update(updates).then(() => toast('🔥 Всё очищено'));
        return;
    }
    if (!confirm(`Очистить ${what}?`)) return;
    const map = { chat: 'messages', audit: 'auditLog', requests: 'tokenRequests', private: 'privateChats', orders: 'orders', craftAuction: 'craftAuction', pvp_queue: 'pvp_queue', active_battles: 'active_battles', tournaments: 'tournaments' };
    db.ref(map[what]).set(what === 'private' ? {} : []).then(() => toast('🗑️ Очищено'));
};

window.admView = function(what) { if (what === 'suspicious') switchTab('suspicious'); };
window.admWipe = function(op) {
    if (op === 'run') { if (confirm('ЗАПУСТИТЬ ВАЙП?')) db.ref('config/wipeCount').once('value').then(s => runWipe(s.val() || 0)); }
    else if (op === 'reset') { db.ref('config/wipeCount').set(0).then(() => toast('🔄 Счётчик сброшен')); }
};
window.admKey = function(op) {
    if (op === 'reset') { localStorage.removeItem('kotogram_master_key'); MASTER_KEY = ''; isMasterKeyValid = false; toast('🔑 Ключ сброшен'); rAdminPanel(); }
};