// ============================================================
// 04-admin.js — Мега-Админ-Панель (60+ функций)
// ============================================================

window.rAdminPanel = function() {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'owner')) {
        $('feedContainer').innerHTML = '<div class="empty-state">⛔ Только для админа</div>';
        return;
    }
    if (!isMasterKeyValid) {
        let h = '<div class="divider">⚙️ АДМИН-ПАНЕЛЬ</div>';
        h += `<div class="card"><span class="text-bold">🔑 Мастер-ключ</span><p class="text-sm">Введите мастер-ключ один раз.</p><input type="password" id="masterKeySetup" class="input-sm" placeholder="K0t0gr@mM@sterKey2024!" style="margin-top:6px; width:100%;"><button class="btn-sm btn-purple" onclick="window.saveMasterKey()" style="margin-top:6px; width:100%;">Сохранить</button></div>`;
        $('feedContainer').innerHTML = h;
        return;
    }

    let h = '<div class="divider">⚙️ МЕГА-АДМИНКА</div>';
    h += `<div class="card" style="background:linear-gradient(135deg,#4f46e5,#7c3aed); color:white; text-align:center;"><div style="font-size:36px;">👑</div><div style="font-weight:900; font-size:18px; margin-top:4px;">Админ: ${esc(currentUser.username)}</div><div style="font-size:12px; opacity:0.9; margin-top:4px;">60+ функций управления</div></div>`;

    // 1. ЭКОНОМИКА
    h += '<div class="admin-section">💰 ЭКОНОМИКА</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admCoins('add')"><div class="admin-action-icon">➕</div><div class="admin-action-name">Выдать Койны</div></div>`;
    h += `<div class="admin-action" onclick="window.admCoins('remove')"><div class="admin-action-icon">➖</div><div class="admin-action-name">Списать Койны</div></div>`;
    h += `<div class="admin-action" onclick="window.admCoins('set')"><div class="admin-action-icon">📝</div><div class="admin-action-name">Установить Койны</div></div>`;
    h += `<div class="admin-action" onclick="window.admTokens('add')"><div class="admin-action-icon">💎</div><div class="admin-action-name">Выдать Токены</div></div>`;
    h += `<div class="admin-action" onclick="window.admTokens('remove')"><div class="admin-action-icon">💎</div><div class="admin-action-name">Списать Токены</div></div>`;
    h += `<div class="admin-action" onclick="window.admCoins('x2all')"><div class="admin-action-icon">⚡</div><div class="admin-action-name">×2 Всем</div></div>`;
    h += `<div class="admin-action" onclick="window.admCoins('resetAll')"><div class="admin-action-icon">🔄</div><div class="admin-action-name">Сброс Экономики</div></div>`;
    h += `<div class="admin-action" onclick="window.admRes('add')"><div class="admin-action-icon">🪵</div><div class="admin-action-name">Выдать Ресурсы</div></div>`;
    h += '</div>';

    // 2. РОЛИ И СТАТУСЫ
    h += '<div class="admin-section">🎭 РОЛИ И СТАТУСЫ</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admRole('give')"><div class="admin-action-icon">👑</div><div class="admin-action-name">Выдать Роль</div></div>`;
    h += `<div class="admin-action" onclick="window.admRole('take')"><div class="admin-action-icon">🗑️</div><div class="admin-action-name">Снять Роль</div></div>`;
    h += `<div class="admin-action" onclick="window.admRole('giveAll')"><div class="admin-action-icon">🎁</div><div class="admin-action-name">Всем Роль</div></div>`;
    h += `<div class="admin-action" onclick="window.admRole('takeAll')"><div class="admin-action-icon">🚫</div><div class="admin-action-name">Снять у Всех</div></div>`;
    h += '</div>';

    // 3. БАНЫ И МУТЫ
    h += '<div class="admin-section">🚫 БАНЫ И МУТЫ</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admBan('ban')"><div class="admin-action-icon">🔨</div><div class="admin-action-name">Забанить</div></div>`;
    h += `<div class="admin-action" onclick="window.admBan('unban')"><div class="admin-action-icon">🔓</div><div class="admin-action-name">Разбанить</div></div>`;
    h += `<div class="admin-action" onclick="window.admBan('banAll')"><div class="admin-action-icon">🚨</div><div class="admin-action-name">Бан Всех</div></div>`;
    h += `<div class="admin-action" onclick="window.admMute('mute')"><div class="admin-action-icon">🔇</div><div class="admin-action-name">Замутить</div></div>`;
    h += `<div class="admin-action" onclick="window.admMute('unmute')"><div class="admin-action-icon">🔊</div><div class="admin-action-name">Размутить</div></div>`;
    h += `<div class="admin-action" onclick="window.admMute('muteAll')"><div class="admin-action-icon">📢</div><div class="admin-action-name">Мут Всем</div></div>`;
    h += '</div>';

    // 4. ИВЕНТЫ И КЕЙСЫ
    h += '<div class="admin-section">🎉 ИВЕНТЫ И КЕЙСЫ</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admEvent('start')"><div class="admin-action-icon">🚀</div><div class="admin-action-name">Запустить Ивент</div></div>`;
    h += `<div class="admin-action" onclick="window.admEvent('stop')"><div class="admin-action-icon">⏹️</div><div class="admin-action-name">Стоп Ивент</div></div>`;
    h += `<div class="admin-action" onclick="window.admEvent('clear')"><div class="admin-action-icon">🗑️</div><div class="admin-action-name">Очистить Ивент</div></div>`;
    h += `<div class="admin-action" onclick="window.admCase('giveAll')"><div class="admin-action-icon">🎁</div><div class="admin-action-name">Кейсы Всем</div></div>`;
    h += `<div class="admin-action" onclick="window.admCase('freeAll')"><div class="admin-action-icon">🆓</div><div class="admin-action-name">Бесплатные Кейсы</div></div>`;
    h += `<div class="admin-action" onclick="window.admCase('openAll')"><div class="admin-action-icon">📦</div><div class="admin-action-name">Открыть Всем</div></div>`;
    h += '</div>';

    // 5. КЛАНЫ И ТУРНИРЫ
    h += '<div class="admin-section">🏰 КЛАНЫ И ТУРНИРЫ</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admClan('disbandAll')"><div class="admin-action-icon">💥</div><div class="admin-action-name">Распустить Кланы</div></div>`;
    h += `<div class="admin-action" onclick="window.admClan('resetBank')"><div class="admin-action-icon">🏦</div><div class="admin-action-name">Сброс Банков</div></div>`;
    h += `<div class="admin-action" onclick="window.admClan('clear')"><div class="admin-action-icon">🗑️</div><div class="admin-action-name">Удалить Кланы</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('tournaments')"><div class="admin-action-icon">🏆</div><div class="admin-action-name">Очистить Турниры</div></div>`;
    h += '</div>';

    // 6. ЧАТ И ЛС
    h += '<div class="admin-section">💬 ЧАТ И ЛС</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admClear('chat')"><div class="admin-action-icon">💬</div><div class="admin-action-name">Очистить Чат</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('private')"><div class="admin-action-icon">📩</div><div class="admin-action-name">Очистить ЛС</div></div>`;
    h += `<div class="admin-action" onclick="window.admChatLock()"><div class="admin-action-icon">🔒</div><div class="admin-action-name">Блокировать Чат</div></div>`;
    h += '</div>';

    // 7. ТЕХ. РАБОТЫ
    h += '<div class="admin-section">🛠️ ТЕХ. РАБОТЫ</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admMaint('on')"><div class="admin-action-icon">🛠️</div><div class="admin-action-name">Включить</div></div>`;
    h += `<div class="admin-action" onclick="window.admMaint('off')"><div class="admin-action-icon">✅</div><div class="admin-action-name">Выключить</div></div>`;
    h += `<div class="admin-action" onclick="window.admMaint('quick')"><div class="admin-action-icon">⚡</div><div class="admin-action-name">На 5 Минут</div></div>`;
    h += '</div>';

    // 8. ОЧИСТКА И СБРОСЫ
    h += '<div class="admin-section">🗑️ ОЧИСТКА</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admClear('audit')"><div class="admin-action-icon">📋</div><div class="admin-action-name">Очистить Аудит</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('requests')"><div class="admin-action-icon">📋</div><div class="admin-action-name">Очистить Заявки</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('craftAuction')"><div class="admin-action-icon">⚖️</div><div class="admin-action-name">Очистить Аукцион</div></div>`;
    h += `<div class="admin-action" onclick="window.admClear('all')"><div class="admin-action-icon">🔥</div><div class="admin-action-name">Сброс ВСЕГО</div></div>`;
    h += '</div>';

    // 9. ПРОЧЕЕ И СТАТИСТИКА (Добавил Штраф шахте)
    h += '<div class="admin-section">⚙️ ПРОЧЕЕ</div><div class="admin-grid">';
    h += `<div class="admin-action" onclick="window.admWipe('run')"><div class="admin-action-icon">🚨</div><div class="admin-action-name">Запустить Вайп</div></div>`;
    h += `<div class="admin-action" onclick="window.admWipe('reset')"><div class="admin-action-icon">🔄</div><div class="admin-action-name">Сброс Вайпов</div></div>`;
    h += `<div class="admin-action" onclick="window.admKey('reset')"><div class="admin-action-icon">🔑</div><div class="admin-action-name">Сброс Ключа</div></div>`;
    h += `<div class="admin-action" onclick="window.admView('suspicious')"><div class="admin-action-icon">🚨</div><div class="admin-action-name">Античит</div></div>`;
    h += `<div class="admin-action" onclick="window.admView('audit')"><div class="admin-action-icon">📋</div><div class="admin-action-name">Аудит</div></div>`;
    h += `<div class="admin-action" onclick="window.admPwdReset()"><div class="admin-action-icon">🔐</div><div class="admin-action-name">Сброс Пароля</div></div>`;
    h += `<div class="admin-action" onclick="window.admNickAnim()"><div class="admin-action-icon">✨</div><div class="admin-action-name">Анимация Ника</div></div>`;
    h += `<div class="admin-action" onclick="window.admMinePenalty()" style="border-color:#ff5252;"><div class="admin-action-icon">⚠️</div><div class="admin-action-name">Штраф Шахте</div></div>`;
    h += '</div>';

    h += '<div class="admin-section">📊 СТАТИСТИКА СЕРВЕРА</div>';
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

// ============ ФУНКЦИИ ============
window.saveMasterKey = function() {
    const key = document.getElementById('masterKeySetup').value.trim();
    if (key === HARDCODED_MASTER_KEY) {
        localStorage.setItem('kotogram_master_key', key);
        MASTER_KEY = key; isMasterKeyValid = true;
        toast('✅ Ключ сохранён!'); rAdminPanel();
    } else toast('❌ Неверный ключ');
};

window.admCoins = function(op) {
    const target = prompt('Ник игрока (или "all"):');
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
            });
        } else {
            if (!u[target]) return toast('❌ Нет такого игрока');
            const cur = u[target].coins === Infinity || u[target].coins === "Infinity" ? Infinity : (u[target].coins || 0);
            if (cur === Infinity) return toast('Нельзя изменить ∞');
            if (op === 'add') updates['users/' + target + '/coins'] = cur + amount;
            else if (op === 'remove') updates['users/' + target + '/coins'] = Math.max(0, cur - amount);
            else if (op === 'set') updates['users/' + target + '/coins'] = amount;
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
            });
        } else {
            if (!u[target]) return toast('❌ Нет такого игрока');
            const cur = u[target].tokens === Infinity || u[target].tokens === "Infinity" ? Infinity : (u[target].tokens || 0);
            if (cur === Infinity) return toast('Нельзя изменить ∞');
            if (op === 'add') updates['users/' + target + '/tokens'] = cur + amount;
            else if (op === 'remove') updates['users/' + target + '/tokens'] = Math.max(0, cur - amount);
        }
        db.ref().update(updates).then(() => { toast('✅ Готово'); addAuditLog('admin_' + op + '_tokens', target, amount); });
    });
};

window.admRes = function(op) {
    const target = prompt('Ник игрока:');
    if (!target) return;
    const res = prompt('Ресурс (wood, stone, iron, gold, diamond):');
    if (!res) return;
    const amount = parseInt(prompt('Сумма:') || '0');
    db.ref('users/' + target + '/inventory/' + res).transaction(c => (c || 0) + amount).then(() => {
        toast(`✅ Выдано ${amount} ${res} → ${target}`);
        addAuditLog('admin_add_res', target, amount);
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
            Object.entries(u).forEach(([n, x]) => { if (x.role !== 'admin' && x.role !== 'owner' && n !== 'Филипп') updates['bans/' + n] = { until: 'forever' }; });
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
            Object.entries(u).forEach(([n, x]) => { if (x.role !== 'admin' && x.role !== 'owner' && n !== 'Филипп') updates['mutes/' + n] = { until }; });
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
    if (op === 'start') window.forceStartEvent();
    else if (op === 'stop') db.ref('events/active').update({ status: 'ended' }).then(() => toast('⏹️ Ивент остановлен'));
    else if (op === 'clear') { db.ref('events/active').remove(); db.ref('events/lastEventTime').set(0); toast('🗑️ Ивент очищен'); }
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

window.admChatLock = function() {
    db.ref('config/chatLocked').once('value').then(s => {
        const cur = s.val() || false;
        db.ref('config/chatLocked').set(!cur).then(() => toast(cur ? '🔓 Чат разблокирован' : '🔒 Чат заблокирован'));
    });
};

window.admPwdReset = function() {
    const target = prompt('Ник игрока для сброса пароля:');
    if (!target) return;
    const newPwd = prompt('Новый пароль (минимум 6 символов):');
    if (!newPwd || newPwd.length < 6) return toast('❌ Пароль слишком короткий');
    db.ref('users/' + target + '/password').set(newPwd).then(() => {
        toast(`✅ Пароль ${target} изменён на ${newPwd}`);
        addAuditLog('admin_pwd_reset', target, 0);
    });
};

window.admNickAnim = function() {
    const target = prompt('Ник игрока:');
    if (!target) return;
    const anim = prompt('Анимация (fire, water, lightning, rainbow):');
    if (!anim) return;
    db.ref('users/' + target + '/nickAnim').set(anim.toLowerCase()).then(() => {
        toast(`✅ Игроку ${target} выдана анимация ${anim}`);
        addAuditLog('admin_nick_anim', target, 0);
    });
};

window.admMinePenalty = function() {
    const penalty = prompt('На сколько % снизить дроп в шахте? (от 0 до 100)');
    if (penalty === null) return;
    const val = Math.min(100, Math.max(0, parseInt(penalty) || 0));
    db.ref('config/minePenalty').set(val).then(() => {
        toast(`✅ Штраф для шахты: ${val}%`);
        addAuditLog('admin_mine_penalty', 'all', val);
    });
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

window.admView = function(what) { if (what === 'suspicious') switchTab('suspicious'); else if (what === 'audit') switchTab('audit'); };
window.admWipe = function(op) {
    if (op === 'run') { if (confirm('ЗАПУСТИТЬ ВАЙП?')) db.ref('config/wipeCount').once('value').then(s => runWipe(s.val() || 0)); }
    else if (op === 'reset') { db.ref('config/wipeCount').set(0).then(() => toast('🔄 Счётчик сброшен')); }
};
window.admKey = function(op) {
    if (op === 'reset') { localStorage.removeItem('kotogram_master_key'); MASTER_KEY = ''; isMasterKeyValid = false; toast('🔑 Ключ сброшен'); rAdminPanel(); }
};