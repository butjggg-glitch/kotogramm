// ============================================================
// 09-mod-audit.js — Модерация, Роли-Админ, Заявки, Античит, Аудит
// ВАЖНО: автобаны ОТКЛЮЧЕНЫ. Банит только Филипп руками.
// ============================================================

// ============ 🛡️ МОДЕРАЦИЯ ============
window.rModPanel = function() {
    if (currentUser.role!=='admin') { $('feedContainer').innerHTML = '<div class="empty-state">⛔ Доступ запрещён</div>'; return; }
    if (!isMasterKeyValid) {
        let h = '<div class="divider">🛡️ Модерация</div>';
        h += `<div class="card"><span class="text-bold">🔑 Настройка</span><p class="text-sm">Введите мастер-ключ один раз.</p><input type="password" id="masterKeySetup" class="input-sm" placeholder="K0t0gr@mM@sterKey2024!" style="margin-top:6px;"><button class="btn-sm btn-purple" onclick="window.saveMasterKey()" style="margin-top:6px;">Сохранить</button></div>`;
        $('feedContainer').innerHTML = h;
        return;
    }
    db.ref('users').once('value').then(s => {
        const users = s.val()||{};
        let h = '<div class="divider">🛡️ Модерация</div>';
        Object.keys(users).forEach(k => {
            h+=`<div class="card" style="margin-bottom:6px;"><div class="row-between"><span class="text-bold">${esc(k)}</span><div class="row-wrap">`;
            h+=`<button class="btn-sm btn-red" onclick="window.banUser('${ea(k)}')">🔨 Бан</button>`;
            h+=`<button class="btn-sm btn-orange" onclick="window.muteUser('${ea(k)}')">🔇 Мут</button>`;
            h+=`<button class="btn-sm btn-green" onclick="window.unbanUser('${ea(k)}')">🔓 Разбан</button>`;
            h+=`<button class="btn-sm btn-purple" onclick="window.loginAsUser('${ea(k)}')">👤 Войти как</button>`;
            h+=`<button class="btn-sm btn-orange" onclick="window.setRole('${ea(k)}', 'admin')">👑 Админ</button>`;
            h+=`<button class="btn-sm btn-purple" onclick="window.setRole('${ea(k)}', 'tester')">🔬 Тестер</button>`;
            h+=`<button class="btn-sm" style="background:var(--text2);color:white;" onclick="window.setRole('${ea(k)}', 'user')">👤 Юзер</button>`;
            h+=`</div></div></div>`;
        });
        $('feedContainer').innerHTML = h;
    });
};

window.banUser = function(username) {
    const duration = prompt('Минут, 0 = навсегда:');
    if (duration===null) return;
    const reason = prompt('Причина бана:', 'Нарушение правил');
    if (reason===null) return;
    const until = duration==='0'?'forever':Date.now()+parseInt(duration)*60000;
    db.ref('bans/'+username).set({ until, reason: reason || 'Нарушение правил' });
    addAuditLog('ban', username, 0);
    toast('🚫 '+username+' забанен');
};

window.muteUser = function(username) {
    const duration = prompt('Минут мута:');
    if (!duration) return;
    db.ref('mutes/'+username).set({ until: Date.now()+parseInt(duration)*60000 });
    addAuditLog('mute', username, 0);
    toast('🔇 '+username+' замьючен');
};

window.unbanUser = function(username) { db.ref('bans/' + username).remove().then(() => { addAuditLog('unban', username, 0); toast('🔓 разбанен'); }); };

window.setRole = function(username, role) {
    if (!isMasterKeyValid) return toast('Ключ не задан');
    db.ref('users/' + username + '/role').set(role).then(() => { toast(`✅ ${username} теперь ${role}`); rModPanel(); });
};

window.loginAsUser = function(username) {
    if (currentUser.role !== 'admin') return;
    db.ref('users/' + username).once('value').then(snap => { const userData = snap.val(); if (!userData) return; login(username, userData.password, true); toast(`👤 Вошли как ${username}`); });
};

// ============ 👑 УПРАВЛЕНИЕ РОЛЯМИ ============
window.rRoleManager = function() {
    if (currentUser.role !== 'admin') { $('feedContainer').innerHTML = '<div class="empty-state">⛔ Только для админа</div>'; return; }
    db.ref('users').once('value').then(s => {
        const users = s.val() || {};
        let h = '<div class="divider">👑 УПРАВЛЕНИЕ РОЛЯМИ</div>';
        h += '<div class="text-sm" style="margin-bottom:8px;">Меняй VIP-роль любому игроку</div>';
        Object.entries(users).forEach(([name, u]) => {
            const currentVip = getCurrentVipRole(u);
            const currentVipName = currentVip ? ROLES[currentVip].name : '—';
            const expiresText = currentVip ? (u.vipExpiresAt === -1 ? '♾️' : 'до ' + new Date(u.vipExpiresAt).toLocaleDateString('ru-RU')) : '';
            h += `<div class="card" style="margin-bottom:8px;"><div class="row-between" style="margin-bottom:8px;"><div class="text-bold">${esc(name)}</div><div class="text-sm">${currentVip ? roleIcon(currentVip) + ' ' + currentVipName + ' ' + expiresText : '🎮 Игрок'}</div></div><div class="row-wrap"><select class="select-sm" id="roleSel_${ea(name)}" style="flex:1; min-width:140px;"><option value="">— Без роли (Игрок) —</option>${Object.entries(ROLES).filter(([k]) => k !== 'igrok').map(([k, r]) => `<option value="${k}">${r.emoji} ${r.name}</option>`).join('')}</select><select class="select-sm" id="roleDur_${ea(name)}" style="width:120px;"><option value="30">30 дней</option><option value="90">90 дней</option><option value="-1">♾️ Навсегда</option></select><button class="btn-sm btn-green" onclick="window.setPlayerRole('${ea(name)}')">✅ Выдать</button><button class="btn-sm btn-red" onclick="window.removePlayerRole('${ea(name)}')">🗑️ Снять</button></div></div>`;
        });
        h += `<button class="btn-sm btn-green" id="refreshRoleMgr" style="margin:8px 0;">🔄 Обновить</button>`;
        $('feedContainer').innerHTML = h;
        if ($('refreshRoleMgr')) $('refreshRoleMgr').onclick = () => rRoleManager();
        Object.entries(users).forEach(([name, u]) => {
            const cur = getCurrentVipRole(u);
            if (cur) {
                const sel = $('roleSel_' + name); if (sel) sel.value = cur;
                const dur = $('roleDur_' + name);
                if (dur) { if (u.vipExpiresAt === -1) dur.value = '-1'; else { const daysLeft = Math.round((u.vipExpiresAt - Date.now()) / 86400000); dur.value = daysLeft <= 30 ? '30' : '90'; } }
            }
        });
    });
};

window.setPlayerRole = function(username) {
    const sel = $('roleSel_' + username);
    const dur = $('roleDur_' + username);
    const role = sel.value;
    const days = parseInt(dur.value, 10);
    if (!role) { toast('❌ Выбери роль'); return; }
    const r = ROLES[role];
    const label = days === -1 ? 'навсегда' : days + ' дней';
    if (!confirm(`Выдать ${r.name} (${label}) игроку ${username}?`)) return;
    const expiresAt = days === -1 ? -1 : Date.now() + days * 86400000;
    db.ref('users/' + username).update({ vipRole: role, vipExpiresAt: expiresAt }).then(() => { toast(`✅ ${username} теперь ${r.name} (${label})`); addAuditLog('role_change', username, 0); rRoleManager(); });
};

window.removePlayerRole = function(username) {
    if (!confirm(`Снять VIP-роль у ${username}?`)) return;
    db.ref('users/' + username).update({ vipRole: null, vipExpiresAt: null }).then(() => { toast(`🗑️ Роль снята у ${username}`); addAuditLog('role_change', username, 0); rRoleManager(); });
};

// ============ 📋 ЗАЯВКИ ============
window.rRequests = function() {
    if (currentUser.role !== 'admin') { $('feedContainer').innerHTML = '<div class="empty-state">⛔ Только для админа</div>'; return; }
    db.ref('tokenRequests').once('value').then(s => {
        const all = s.val() ? Object.values(s.val()) : [];
        const pending = all.filter(r => r.status === 'pending');
        let h = '<div class="divider">📋 ЗАЯВКИ НА ОДОБРЕНИЕ</div>';
        h += `<div class="text-sm" style="margin-bottom:8px;">Всего: <b>${pending.length}</b> ожидают решения</div>`;
        if (!pending.length) h += '<div class="empty-state">✅ Все заявки обработаны!</div>';
        else pending.sort((a, b) => (b.time || 0) - (a.time || 0)).forEach(r => {
            let typeLabel = '', detail = '', actions = '';
            if (r.type === 'buy') { typeLabel = '💳 ПОКУПКА ТОКЕНОВ'; detail = `Игрок <b>${esc(r.username)}</b> хочет купить <b>${r.tokens}💎</b> за <b>${r.amount}₽</b>`; actions = `<button class="btn-sm btn-green" onclick="window.approveReq('${r.id}','buy')">✅ Выдать токены</button><button class="btn-sm btn-red" onclick="window.rejectReq('${r.id}')">❌ Отклонить</button>`; }
            else if (r.type === 'withdraw') { typeLabel = '💸 ВЫВОД ТОКЕНОВ'; detail = `Игрок <b>${esc(r.username)}</b> хочет вывести <b>${r.amount}💎</b> = <b>${r.rubles}₽</b>`; actions = `<button class="btn-sm btn-green" onclick="window.approveReq('${r.id}','withdraw')">✅ Списать токены</button><button class="btn-sm btn-red" onclick="window.rejectReq('${r.id}')">❌ Отклонить</button>`; }
            else if (r.type === 'buy_role') { typeLabel = '🎭 ПОКУПКА РОЛИ'; const roleName = ROLES[r.role] ? ROLES[r.role].name : r.role; const days = r.days === -1 ? 'навсегда' : r.days + ' дней'; detail = `Игрок <b>${esc(r.username)}</b> покупает <b>${roleName}</b> (${days}) за <b>${r.priceRub}₽</b>`; actions = `<button class="btn-sm btn-green" onclick="window.approveReq('${r.id}','buy_role')">✅ Выдать роль</button><button class="btn-sm btn-red" onclick="window.rejectReq('${r.id}')">❌ Отклонить</button>`; }
            else if (r.type === 'shop_item') { typeLabel = '🖌️ КОТОСТЬ НА ЗАКАЗ'; detail = `Игрок <b>${esc(r.username)}</b> заказал: <b>${esc(r.itemName)}</b> (${r.price}💎)`; actions = `<button class="btn-sm btn-green" onclick="window.approveReq('${r.id}','shop_item')">✅ Выполнено</button><button class="btn-sm btn-red" onclick="window.rejectReq('${r.id}')">❌ Отклонить</button>`; }
            else if (r.type === 'nick_change') { typeLabel = '✏️ СМЕНА НИКА'; detail = `Игрок <b>${esc(r.username)}</b> хочет сменить ник на <b>${esc(r.newNick || '')}</b>`; actions = `<button class="btn-sm btn-green" onclick="window.approveReq('${r.id}','nick_change')">✅ Одобрить</button><button class="btn-sm btn-red" onclick="window.rejectReq('${r.id}')">❌ Отклонить</button>`; }
            else if (r.type === 'promo_own') { typeLabel = '🔑 СВОЙ ПРОМОКОД'; detail = `Игрок <b>${esc(r.username)}</b> хочет создать промокод <b>${esc(r.promoCode || '')}</b>`; actions = `<button class="btn-sm btn-green" onclick="window.approveReq('${r.id}','promo_own')">✅ Одобрить</button><button class="btn-sm btn-red" onclick="window.rejectReq('${r.id}')">❌ Отклонить</button>`; }
            else { typeLabel = r.type; detail = JSON.stringify(r); }
            h += `<div class="card" style="margin-bottom:8px; border-left: 4px solid #ffb300;"><div class="text-bold" style="color:#ffb300;">${typeLabel}</div><div class="text-sm" style="margin:6px 0;">${detail}</div><div class="text-sm" style="opacity:0.6; margin-bottom:8px;">⏰ ${r.time ? new Date(r.time).toLocaleString('ru-RU') : '—'}</div><div class="row-wrap">${actions}</div></div>`;
        });
        h += `<button class="btn-sm btn-green" id="refreshReq" style="margin:8px 0;">🔄 Обновить</button>`;
        $('feedContainer').innerHTML = h;
        if ($('refreshReq')) $('refreshReq').onclick = () => rRequests();
    });
};

window.approveReq = function(id, type) {
    db.ref('tokenRequests/' + id).once('value').then(s => {
        const r = s.val();
        if (!r || r.status !== 'pending') { toast('❌ Уже обработана'); return; }
        if (type === 'buy') {
            db.ref('users/' + r.username + '/tokens').once('value').then(ts => {
                const cur = ts.val() || 0;
                const newT = (cur === Infinity || cur === "Infinity") ? cur : cur + (r.tokens || r.amount * 20);
                db.ref('users/' + r.username + '/tokens').set(newT).then(() => { db.ref('tokenRequests/' + id + '/status').set('approved'); addAuditLog('admin_grant_tokens', r.username, r.tokens || r.amount * 10); toast(`✅ ${r.tokens}💎 выдано игроку ${r.username}`); rRequests(); });
            });
        } else if (type === 'withdraw') {
            db.ref('users/' + r.username + '/tokens').once('value').then(ts => {
                const cur = ts.val() || 0;
                if (cur !== Infinity && cur !== "Infinity") db.ref('users/' + r.username + '/tokens').set(Math.max(0, cur - r.amount));
                db.ref('tokenRequests/' + id + '/status').set('approved');
                addAuditLog('withdraw_tokens', r.username, r.amount);
                toast(`✅ Списано ${r.amount}💎 у ${r.username}`);
                rRequests();
            });
        } else if (type === 'buy_role') {
            const expiresAt = r.days === -1 ? -1 : Date.now() + r.days * 86400000;
            db.ref('users/' + r.username).update({ vipRole: r.role, vipExpiresAt: expiresAt }).then(() => { db.ref('tokenRequests/' + id + '/status').set('approved'); addAuditLog('role_change', r.username, 0); toast(`✅ Роль выдана игроку ${r.username}`); rRequests(); });
        } else if (type === 'shop_item') {
            db.ref('tokenRequests/' + id + '/status').set('approved');
            toast(`✅ Заявка ${r.username} одобрена`);
            rRequests();
        } else if (type === 'nick_change') {
            db.ref('tokenRequests/' + id + '/status').set('approved');
            toast(`✅ Ник изменён (вручную): ${r.username} → ${r.newNick}`);
        } else if (type === 'promo_own') {
            // Сохраняем промокод в базу, чтобы он заработал
            db.ref('customPromos/' + r.promoCode).set({ reward: 100, creator: r.username }).then(() => {
                db.ref('tokenRequests/' + id + '/status').set('approved');
                toast(`✅ Промокод ${r.promoCode} одобрен и добавлен в систему!`);
                rRequests();
            });
        }
    });
};

window.rejectReq = function(id) {
    db.ref('tokenRequests/' + id + '/status').set('rejected');
    toast('❌ Заявка отклонена');
    rRequests();
};

// ============ 🤖 ИИ-АНТИЧИТ (ПАНЕЛЬ) ============
window.rAiAnticheat = function() {
    if (currentUser.role !== 'admin') { $('feedContainer').innerHTML = '<div class="empty-state">⛔ Только для админа</div>'; return; }
    let h = '<div class="divider">🤖 ИИ-АНТИЧИТ</div>';
    h += '<div class="text-sm" style="margin-bottom:8px;">⚠️ Автобан ОТКЛЮЧЁН. ИИ только записывает подозрительное в лог. Банит Филипп руками.</div>';
    h += '<div class="text-sm" style="margin-bottom:8px;">Отслеживает: бесконечность, скачок койнов > 100 000 за 10 сек, скачок токенов > 100 за 10 сек (кроме легального обмена).</div>';
    h += `<div class="anticheat-stat"><div><div class="num" style="color:#4caf50;">${Object.keys(aiLastBalances).length}</div><div class="lbl">👥 Отслеживается</div></div><div><div class="num" style="color:#ff9800;">10 сек</div><div class="lbl">⏱️ Интервал</div></div><div><div class="num" style="color:#c62828;">Только лог</div><div class="lbl">🚨 Режим</div></div></div>`;
    h += '<div class="divider">📊 Последние балансы</div>';
    const entries = Object.entries(aiLastBalances).sort((a, b) => (b[1].coins || 0) - (a[1].coins || 0));
    if (!entries.length) h += '<div class="empty-state">📭 Пока нет данных</div>';
    else entries.slice(0, 20).forEach(([name, b], i) => {
        h += `<div class="card" style="margin-bottom:4px;"><div class="row-between"><span class="text-bold">${i+1}. ${esc(name)}</span><span class="text-sm">🐾 ${b.coins === Infinity || b.coins === "Infinity" ? '∞' : (b.coins || 0).toLocaleString('ru-RU')} • 💎 ${b.tokens === Infinity || b.tokens === "Infinity" ? '∞' : (b.tokens || 0)}</span></div></div>`;
    });
    h += `<button class="btn-sm btn-green" id="refreshAi" style="margin:8px 0;">🔄 Обновить</button>`;
    $('feedContainer').innerHTML = h;
    $('refreshAi').onclick = () => rAiAnticheat();
};

// ============ 🚨 АНТИЧИТ (только показывает, НЕ банит) ============
window.rSuspicious = function() {
    if (currentUser.role !== 'admin') { $('feedContainer').innerHTML = '<div class="empty-state">⛔ Доступ запрещён</div>'; return; }
    let h = '<div class="divider">🚨 АНТИЧИТ</div>';
    h += '<div class="text-sm" style="margin-bottom:8px;">⚠️ Автобан ОТКЛЮЧЁН. Банит только Филипп руками через кнопку в модерации.</div>';
    db.ref('auditLog').orderByChild('time').limitToLast(300).once('value').then(logSnap => {
        const logs = logSnap.val() ? Object.values(logSnap.val()).reverse() : [];
        const suspicious = [];
        const byUser = {};
        logs.forEach(l => { const k = l.actor || 'system'; if (!byUser[k]) byUser[k] = []; byUser[k].push(l); });

        Object.entries(byUser).forEach(([user, lgs]) => {
            const addC = lgs.filter(l => l.action === 'addCoins' || l.action === 'wheel');
            let sum = 0, lastT = 0;
            addC.forEach(l => { const t = typeof l.time === 'number' ? l.time : Date.now(); if (lastT && (t - lastT) < 300000) sum += (l.amount || 0); else sum = l.amount || 0; lastT = t; if (sum > 50000) suspicious.push({ user, type: '🔴 РЕЗКИЙ РОСТ', detail: `+${sum}🐾 за 5 мин`, level: 'red', time: t }); });
            const recent = lgs.filter(l => { const t = typeof l.time === 'number' ? l.time : Date.now(); return Date.now() - t < 300000; });
            if (recent.length >= 10) suspicious.push({ user, type: '🟡 МНОГО ОПЕРАЦИЙ', detail: `${recent.length} за 5 мин`, level: 'yellow', time: Date.now() });
        });

        // ⚠️ АВТОБАН ОТКЛЮЧЁН — раньше здесь банило, теперь НЕ банит.
        // Подозрительные только показываются списком ниже. Банит Филипп руками.

        const redCount = suspicious.filter(s => s.level === 'red').length;
        const yellowCount = suspicious.filter(s => s.level === 'yellow').length;
        h += `<div class="anticheat-stat"><div><div class="num" style="color:#c62828;">${redCount}</div><div class="lbl">🔴 Критичных</div></div><div><div class="num" style="color:#ff9800;">${yellowCount}</div><div class="lbl">🟡 Подозрительных</div></div><div><div class="num" style="color:#4caf50;">${logs.length}</div><div class="lbl">📋 Всего логов</div></div></div>`;
        h += '<div id="suspList" style="margin-top:10px;">';
        if (suspicious.length) suspicious.slice(0, 30).forEach(s => { const cls = s.level === 'red' ? 'suspicious-red' : 'suspicious-yellow'; h += `<div class="card ${cls}" style="margin-bottom:6px;"><div class="row-between"><b>${esc(s.user)}</b><span class="text-sm">${s.type}</span></div><div class="text-sm">${s.detail}</div><div class="text-sm" style="margin-top:4px; opacity:0.7;">${s.level === 'red' ? '🔨 Забанить можешь руками (вкладка Модер)' : '⚠️ Под наблюдением'}</div></div>`; });
        else h += '<div class="empty-state">✅ Подозрительных операций нет</div>';
        h += '</div>';
        h += `<button class="btn-sm btn-green" id="refreshSusp" style="margin:8px 0;">🔄 Обновить</button>`;
        $('feedContainer').innerHTML = h;
        $('refreshSusp').onclick = () => rSuspicious();
    });
};

// ============ 🔍 АУДИТ ============
window.getAuditBadge = function(action) {
    const map = { 'addCoins': { cls: 'audit-addcoins', label: '➕ КОЙНЫ' }, 'removeCoins': { cls: 'audit-removecoins', label: '➖ КОЙНЫ' }, 'wheel': { cls: 'audit-wheel', label: '🎰 КОЛЕСО' }, 'buy': { cls: 'audit-buy', label: '🛒 ПОКУПКА' }, 'role_change': { cls: 'audit-role_change', label: '👑 РОЛЬ' }, 'ban': { cls: 'audit-ban', label: '🔨 БАН' }, 'mute': { cls: 'audit-mute', label: '🔇 МУТ' }, 'unban': { cls: 'audit-role_change', label: '🔓 РАЗБАН' }, 'promo': { cls: 'audit-addcoins', label: '🎁 ПРОМО' }, 'register': { cls: 'audit-role_change', label: '📝 РЕГ' }, 'transfer_tokens': { cls: 'audit-token', label: '💎 ПЕРЕВОД' }, 'transfer_coins': { cls: 'audit-token', label: '🐾 ПЕРЕВОД' }, 'transfer_cases': { cls: 'audit-token', label: '🎁 ПЕРЕВОД' }, 'admin_grant_tokens': { cls: 'audit-token', label: '💎 ВЫДАЧА' }, 'admin_remove_tokens': { cls: 'audit-token', label: '💎 СПИСАНИЕ' }, 'withdraw_tokens': { cls: 'audit-token', label: '💸 ВЫВОД' }, 'broadcast': { cls: 'audit-role_change', label: '📢 BROADCAST' }, 'case_open': { cls: 'audit-buy', label: '🎁 КЕЙС' }, 'token_shop_buy': { cls: 'audit-buy', label: '🛍️ ТОКЕН-ШОП' }, 'quest_reward': { cls: 'audit-addcoins', label: '🎯 КВЕСТ' }, 'daily_bonus': { cls: 'audit-addcoins', label: '🎁 БОНУС' }, 'exchange': { cls: 'audit-token', label: '🔄 ОБМЕН' }, 'slot_bet': { cls: 'audit-wheel', label: '🎰 СТАВКА' }, 'slot_win': { cls: 'audit-addcoins', label: '🎰 ВЫИГРЫШ' }, 'fishing_cast': { cls: 'audit-wheel', label: '🎣 ЗАБРОС' }, 'fishing_catch': { cls: 'audit-addcoins', label: '🐟 УЛОВ' }, 'fishing_fail': { cls: 'audit-default', label: '😢 СОРВАЛАСЬ' }, 'win_top_invest': { cls: 'audit-token', label: '💎 ВКЛАД' }, 'clan_create': { cls: 'audit-role_change', label: '🏰 КЛАН' }, 'clan_invest': { cls: 'audit-token', label: '🏰 ВКЛАД' }, 'bj_bet': { cls: 'audit-wheel', label: '🃏 СТАВКА' }, 'bj_double': { cls: 'audit-wheel', label: '🃏 ×2' }, 'bj_win': { cls: 'audit-addcoins', label: '🃏 ПОБЕДА' }, 'bj_bj': { cls: 'audit-addcoins', label: '🃏 БЛЭКДЖЕК' }, 'bj_lose': { cls: 'audit-removecoins', label: '🃏 ПРОИГРЫШ' }, 'bj_push': { cls: 'audit-default', label: '🃏 НИЧЬЯ' }, 'stickman_win': { cls: 'audit-addcoins', label: '🥊 ПОБЕДА' }, 'stickman_lose': { cls: 'audit-removecoins', label: '🥊 ПРОИГРЫШ' } };
    return map[action] || { cls: 'audit-default', label: action };
};

let auditFilter = 'all'; let auditSearch = ''; let auditPage = 0; const AUDIT_PER_PAGE = 20;

window.timeAgo = function(timestamp) { if (!timestamp) return '--'; const diff = Date.now() - timestamp; if (diff < 60000) return 'только что'; if (diff < 3600000) return Math.floor(diff / 60000) + ' мин'; if (diff < 86400000) return Math.floor(diff / 3600000) + ' ч'; return Math.floor(diff / 86400000) + ' дн'; };

window.rAudit = function() {
    if (currentUser.role !== 'admin') { $('feedContainer').innerHTML = '<div class="empty-state">⛔ Доступ запрещён</div>'; return; }
    db.ref('auditLog').orderByChild('time').limitToLast(300).once('value').then(logSnap => {
        const logs = logSnap.val() ? Object.values(logSnap.val()).reverse() : [];
        let h = '<div class="divider">🔍 АУДИТ</div>';
        h += `<div class="row-wrap" style="margin-bottom:8px;"><input class="input-sm" id="auditSearchInput" placeholder="🔍 Поиск по нику..." style="flex:1;" value="${esc(auditSearch)}"></div>`;
        h += '<div class="row-wrap" style="margin-bottom:10px;">';
        const filters = [ { id: 'all', label: '📋 Все' }, { id: 'coins', label: '💰 Койны' }, { id: 'tokens', label: '💎 Токены' }, { id: 'moderation', label: '🔨 Модерация' }, { id: 'shop', label: '🛒 Покупки' } ];
        filters.forEach(f => { h += `<div class="filter-chip${auditFilter === f.id ? ' active' : ''}" data-audit-filter="${f.id}">${f.label}</div>`; });
        h += '</div>';
        let filtered = logs;
        if (auditFilter === 'coins') filtered = logs.filter(l => ['addCoins','removeCoins','wheel','quest_reward','daily_bonus','promo','slot_win','fishing_catch','bj_win','bj_bj','stickman_win'].includes(l.action));
        else if (auditFilter === 'tokens') filtered = logs.filter(l => ['transfer_tokens','transfer_coins','transfer_cases','admin_grant_tokens','admin_remove_tokens','exchange','withdraw_tokens','win_top_invest','clan_invest'].includes(l.action));
        else if (auditFilter === 'moderation') filtered = logs.filter(l => ['ban','mute','unban'].includes(l.action));
        else if (auditFilter === 'shop') filtered = logs.filter(l => ['buy','case_open','token_shop_buy'].includes(l.action));
        if (auditSearch) { const q = auditSearch.toLowerCase(); filtered = filtered.filter(l => (l.actor && l.actor.toLowerCase().includes(q)) || (l.target && l.target.toLowerCase().includes(q))); }
        h += `<div class="text-sm" style="margin-bottom:8px;">Найдено: <b>${filtered.length}</b></div>`;
        h += '<div id="auditList">';
        if (filtered.length) {
            const start = auditPage * AUDIT_PER_PAGE;
            const pageItems = filtered.slice(start, start + AUDIT_PER_PAGE);
            pageItems.forEach(l => {
                const badge = getAuditBadge(l.action);
                h += `<div class="audit-row"><div class="audit-time">${timeAgo(l.time)}</div><div style="flex:1;"><div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:2px;"><span class="audit-badge ${badge.cls}">${badge.label}</span><span class="text-bold" style="font-size:13px;">${esc(l.actor || 'system')}</span>${l.target ? `<span class="text-sm">→ ${esc(l.target)}</span>` : ''}</div>${l.amount ? `<div class="text-sm">💠 ${l.amount}</div>` : ''}</div></div>`;
            });
            const totalPages = Math.ceil(filtered.length / AUDIT_PER_PAGE);
            if (totalPages > 1) h += `<div class="row-wrap" style="margin-top:10px; justify-content:center;"><button class="btn-sm btn-purple" id="auditPrev" ${auditPage === 0 ? 'disabled style="opacity:0.4;"' : ''}>← Назад</button><span class="text-sm" style="padding:8px 12px;">${auditPage + 1} / ${totalPages}</span><button class="btn-sm btn-purple" id="auditNext" ${auditPage >= totalPages - 1 ? 'disabled style="opacity:0.4;"' : ''}>Вперёд →</button></div>`;
        } else h += '<div class="empty-state">🔍 Ничего не найдено</div>';
        h += '</div>';
        h += `<button class="btn-sm btn-green" id="refreshAudit" style="margin:8px 0;">🔄 Обновить</button>`;
        $('feedContainer').innerHTML = h;
        const si = $('auditSearchInput');
        if (si) { let db2; si.oninput = () => { clearTimeout(db2); db2 = setTimeout(() => { auditSearch = si.value.trim(); auditPage = 0; rAudit(); }, 400); }; }
        document.querySelectorAll('[data-audit-filter]').forEach(chip => { chip.onclick = () => { auditFilter = chip.dataset.auditFilter; auditPage = 0; rAudit(); }; });
        const pb = $('auditPrev'); if (pb) pb.onclick = () => { if (auditPage > 0) { auditPage--; rAudit(); } };
        const nb = $('auditNext'); if (nb) nb.onclick = () => { auditPage++; rAudit(); };
        $('refreshAudit').onclick = () => rAudit();
    });
};