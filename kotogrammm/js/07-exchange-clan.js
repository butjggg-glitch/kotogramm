// ============================================================
// 07-exchange-clan.js — Обмен, Кланы, Вин-Топ, История вайпов
// ============================================================

// ============ 🔄 ОБМЕН ============
window.rExchange = function() {
    if (!currentUser) return;
    db.ref('users').once('value').then(s => {
        const users = s.val() || {};
        const me = users[currentUser.username] || {};
        const myCoins = currentUser.coins === Infinity ? Infinity : (me.coins || 0);
        const myTokens = (me.tokens === Infinity || me.tokens === "Infinity") ? Infinity : (me.tokens || 0);
        const myCases = me.freeCase || 0;
        let h = '<div class="divider">🔄 ОБМЕН</div>';
        h += `<div class="text-sm" style="text-align:center; margin-bottom:10px;">Переводи 🐾, 💎 и 🎁 другим игрокам. Комиссия 0%.</div>`;
        h += `<div class="card" style="padding:14px;"><div class="text-bold" style="margin-bottom:8px;">💼 Твои ресурсы</div><div class="row-between" style="padding:4px 0;"><span>🐾 Монеты:</span><b>${fc(myCoins)}</b></div><div class="row-between" style="padding:4px 0;"><span>💎 Токены:</span><b>${ft(myTokens)}</b></div><div class="row-between" style="padding:4px 0;"><span>🎁 Донат-кейсы:</span><b>${myCases}</b></div></div>`;
        h += `<div class="card" style="margin-top:10px;"><div class="text-bold" style="margin-bottom:10px;">💸 Перевести</div><div class="row-wrap" style="margin-bottom:10px;"><div class="filter-chip active" data-res="coins" id="resCoins">🐾 Монеты</div><div class="filter-chip" data-res="tokens" id="resTokens">💎 Токены</div><div class="filter-chip" data-res="cases" id="resCases">🎁 Кейсы</div></div><div style="margin-bottom:8px;"><div class="text-sm" style="margin-bottom:4px;">Кому:</div><select class="select-sm" id="exTo" style="width:100%;"><option value="">— Выбери игрока —</option>${Object.keys(users).filter(k => k !== currentUser.username).map(k => `<option value="${esc(k)}">${esc(k)}</option>`).join('')}</select></div><div style="margin-bottom:8px;"><div class="text-sm" style="margin-bottom:4px;">Сумма:</div><input class="input-sm" id="exAmount" type="number" placeholder="Сколько" min="1" style="width:100%;"></div><div class="row-wrap" style="margin-bottom:10px;" id="quickBtns"></div><div style="margin-bottom:10px;"><div class="text-sm" style="margin-bottom:4px;">Комментарий:</div><input class="input-sm" id="exComment" placeholder="Спасибо!" maxlength="50" style="width:100%;"></div><button class="btn btn-success" id="exSend" style="width:100%;">💸 Перевести</button></div>`;
        h += '<div class="divider">📜 МОИ ПЕРЕВОДЫ</div><div id="exHistory"><div class="empty-state">📭 Загрузка...</div></div>';
        h += `<button class="btn-sm btn-green" id="refreshEx" style="margin:8px 0;">🔄 Обновить</button>`;
        $('feedContainer').innerHTML = h;
        let currentRes = 'coins';
        const updateQuickBtns = () => {
            const qb = $('quickBtns'); if (!qb) return;
            if (currentRes === 'coins') qb.innerHTML = `<button class="btn-sm btn-orange quick-ex" data-amount="100">+100</button><button class="btn-sm btn-orange quick-ex" data-amount="500">+500</button><button class="btn-sm btn-orange quick-ex" data-amount="1000">+1000</button><button class="btn-sm btn-orange quick-ex" data-amount="5000">+5000</button>`;
            else if (currentRes === 'tokens') qb.innerHTML = `<button class="btn-sm btn-orange quick-ex" data-amount="1">+1</button><button class="btn-sm btn-orange quick-ex" data-amount="5">+5</button><button class="btn-sm btn-orange quick-ex" data-amount="10">+10</button><button class="btn-sm btn-orange quick-ex" data-amount="50">+50</button>`;
            else qb.innerHTML = `<button class="btn-sm btn-orange quick-ex" data-amount="1">+1</button><button class="btn-sm btn-orange quick-ex" data-amount="2">+2</button><button class="btn-sm btn-orange quick-ex" data-amount="3">+3</button>`;
            document.querySelectorAll('.quick-ex').forEach(b => { b.onclick = () => { $('exAmount').value = parseInt(b.dataset.amount); }; });
        };
        updateQuickBtns();
        document.querySelectorAll('[data-res]').forEach(chip => { chip.onclick = () => { document.querySelectorAll('[data-res]').forEach(c => c.classList.remove('active')); chip.classList.add('active'); currentRes = chip.dataset.res; updateQuickBtns(); }; });
        $('exSend').onclick = () => doTransfer(currentRes);
        $('refreshEx').onclick = () => rExchange();
        loadTransferHistory();
    });
};

window.loadTransferHistory = function() {
    db.ref('transfers').orderByChild('time').limitToLast(50).once('value').then(s => {
        const all = s.val() ? Object.values(s.val()) : [];
        const my = all.filter(t => t.from === currentUser.username || t.to === currentUser.username).sort((a, b) => (b.time || 0) - (a.time || 0)).slice(0, 15);
        const el = $('exHistory'); if (!el) return;
        if (!my.length) { el.innerHTML = '<div class="empty-state">📭 Пока нет переводов</div>'; return; }
        el.innerHTML = my.map(t => {
            const incoming = t.to === currentUser.username;
            const icon = t.res === 'coins' ? '🐾' : t.res === 'tokens' ? '💎' : '🎁';
            const color = incoming ? '#4caf50' : '#c62828';
            const arrow = incoming ? '⬅️' : '➡️';
            const other = incoming ? t.from : t.to;
            return `<div class="card" style="margin-bottom:6px; border-left: 3px solid ${color};"><div class="row-between"><div><div class="text-bold">${arrow} ${incoming ? 'от' : 'для'} ${esc(other)}</div><div class="text-sm">${icon} ${t.amount} ${t.comment ? '• ' + esc(t.comment) : ''}</div></div><div class="text-sm" style="opacity:0.6;">${timeAgo(t.time)}</div></div></div>`;
        }).join('');
    });
};

window.doTransfer = function(res) {
    const to = $('exTo').value;
    const amount = Number($('exAmount').value);
    const comment = $('exComment').value.trim();
    if (!to) { toast('❌ Выбери игрока'); return; }
    if (!amount || amount < 1) { toast('❌ Введи сумму'); return; }
    if (to === currentUser.username) { toast('❌ Нельзя себе'); return; }
    db.ref('users/' + currentUser.username).once('value').then(s => {
        const me = s.val();
        const isInfiniteCoins = me.coins === Infinity || me.coins === "Infinity";
        const isInfiniteTokens = me.tokens === Infinity || me.tokens === "Infinity";
        let ok = true, err = '';
        if (res === 'coins') { if (currentUser.username !== 'Филипп' && !isInfiniteCoins && (me.coins || 0) < amount) { ok = false; err = '❌ Недостаточно 🐾'; } }
        else if (res === 'tokens') { if (currentUser.username !== 'Филипп' && !isInfiniteTokens && (me.tokens || 0) < amount) { ok = false; err = '❌ Недостаточно 💎'; } }
        else if (res === 'cases') { if ((me.freeCase || 0) < amount) { ok = false; err = '❌ Недостаточно 🎁 кейсов'; } }
        if (!ok) { toast(err); return; }
        const icon = res === 'coins' ? '🐾' : res === 'tokens' ? '💎' : '🎁';
        const label = res === 'coins' ? 'монет' : res === 'tokens' ? 'токенов' : 'кейсов';
        if (!confirm(`Перевести ${amount} ${icon} ${label} игроку ${to}?`)) return;
        db.ref('users/' + to).once('value').then(ts => {
            const target = ts.val();
            const updates = {};
            if (res === 'coins') {
                if (currentUser.username !== 'Филипп' && !isInfiniteCoins) updates['users/' + currentUser.username + '/coins'] = (me.coins || 0) - amount;
                const tc = target.coins === Infinity || target.coins === "Infinity" ? Infinity : (target.coins || 0);
                if (tc !== Infinity) updates['users/' + to + '/coins'] = tc + amount;
            } else if (res === 'tokens') {
                if (currentUser.username !== 'Филипп' && !isInfiniteTokens) updates['users/' + currentUser.username + '/tokens'] = (me.tokens || 0) - amount;
                const tt = target.tokens === Infinity || target.tokens === "Infinity" ? Infinity : (target.tokens || 0);
                if (tt !== Infinity) updates['users/' + to + '/tokens'] = tt + amount;
            } else if (res === 'cases') {
                updates['users/' + currentUser.username + '/freeCase'] = (me.freeCase || 0) - amount;
                updates['users/' + to + '/freeCase'] = (target.freeCase || 0) + amount;
            }
            db.ref().update(updates).then(() => {
                const ref = db.ref('transfers').push();
                ref.set({ id: ref.key, from: currentUser.username, to: to, res: res, amount: amount, comment: comment, time: Date.now() });
                addAuditLog('transfer_' + res, to, amount);
                toast(`✅ Переведено ${amount} ${icon} → ${to}`);
                if (res === 'coins' && currentUser.username !== 'Филипп' && !isInfiniteCoins) currentUser.coins = (me.coins || 0) - amount;
                if (res === 'tokens' && currentUser.username !== 'Филипп' && !isInfiniteTokens) currentUser.tokens = (me.tokens || 0) - amount;
                rExchange();
            });
        });
    });
};

// ============ 🏰 КЛАНЫ ============
window.rClan = function() {
    if (!currentUser) return;
    db.ref('users/' + currentUser.username + '/clanId').once('value').then(cIdSnap => {
        const clanId = cIdSnap.val();
        if (!clanId) rClanNoClan();
        else db.ref('clans/' + clanId).once('value').then(s => { if (!s.exists()) { db.ref('users/' + currentUser.username + '/clanId').remove(); rClanNoClan(); return; } rClanView(clanId); });
    });
};

window.rClanNoClan = function() {
    db.ref('clans').once('value').then(s => {
        const clans = s.val() || {};
        const clanList = Object.entries(clans).sort((a, b) => (b[1].level || 0) - (a[1].level || 0));
        let h = '<div class="divider">🏰 КЛАНЫ</div>';
        h += `<div class="text-sm" style="text-align:center; margin-bottom:10px;">Вступи в клан (макс. ${CLAN_MAX_MEMBERS} человек) или создай свой!</div>`;
        h += `<div class="card card-glow"><div class="text-bold" style="margin-bottom:8px; color:var(--accent);">➕ Создать клан (500 🐾)</div><input class="clan-create-input" id="clanName" placeholder="Название клана" maxlength="20"><input class="clan-create-input" id="clanTag" placeholder="Тег (2-4 символа)" maxlength="4"><div class="text-sm" style="margin:8px 0;">Выбери эмблему:</div><div class="clan-emoji-grid" id="clanEmojiGrid">${CLAN_EMOJIS.map((e, i) => `<div class="clan-emoji-pick${i === 0 ? ' selected' : ''}" data-emoji="${e}">${e}</div>`).join('')}</div><button class="btn-sm btn-gold" id="createClanBtn" style="width:100%; padding:12px;">🏰 Создать</button></div>`;
        h += '<div class="divider">🏆 ТОП КЛАНОВ</div>';
        if (!clanList.length) h += '<div class="empty-state">📭 Кланов пока нет — создай первый!</div>';
        else clanList.slice(0, 20).forEach(([id, c], i) => {
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
            const memberCount = Object.keys(c.members || {}).length;
            const isFull = memberCount >= CLAN_MAX_MEMBERS;
            h += `<div class="card" style="margin-bottom:6px; display:flex; align-items:center; gap:10px;"><div style="font-size: 22px; width: 36px; text-align: center;">${medal}</div><div style="font-size: 32px;">${c.emoji || '🏰'}</div><div style="flex:1;"><div class="text-bold">[${esc(c.tag || '???')}] ${esc(c.name)}</div><div class="text-sm">Ур. ${c.level || 1} • ${memberCount}/${CLAN_MAX_MEMBERS} 👥</div></div><button class="btn-sm ${isFull ? 'btn-red' : 'btn-green'}" onclick="window.joinClan('${id}')" ${isFull ? 'disabled' : ''}>${isFull ? 'Полон' : 'Вступить'}</button></div>`;
        });
        h += `<button class="btn-sm btn-green" id="refreshClan" style="margin:8px 0;">🔄 Обновить</button>`;
        $('feedContainer').innerHTML = h;
        let selectedEmoji = CLAN_EMOJIS[0];
        document.querySelectorAll('.clan-emoji-pick').forEach(el => { el.onclick = () => { document.querySelectorAll('.clan-emoji-pick').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); selectedEmoji = el.dataset.emoji; }; });
        $('createClanBtn').onclick = () => createClan(selectedEmoji);
        $('refreshClan').onclick = () => rClan();
    });
};

window.createClan = function(emoji) {
    const name = $('clanName').value.trim();
    const tag = $('clanTag').value.trim().toUpperCase();
    if (!name || name.length < 3) { toast('❌ Название минимум 3 символа'); return; }
    if (!tag || tag.length < 2) { toast('❌ Тег минимум 2 символа'); return; }
    const COST = 500;
    if (currentUser.coins !== Infinity && currentUser.coins < COST) { toast('❌ Нужно 500 🐾'); return; }
    db.ref('clans').once('value').then(s => {
        const clans = s.val() || {};
        if (Object.values(clans).some(c => c.name.toLowerCase() === name.toLowerCase())) { toast('❌ Такое название уже есть'); return; }
        if (Object.values(clans).some(c => c.tag === tag)) { toast('❌ Такой тег уже есть'); return; }
        const ref = db.ref('clans').push();
        const clanData = { id: ref.key, name, tag, emoji, leader: currentUser.username, members: { [currentUser.username]: { role: 'leader', joinedAt: Date.now() } }, bank: 0, totalInvest: 0, level: 1, createdAt: Date.now() };
        ref.set(clanData).then(() => {
            const newCoins = currentUser.coins === Infinity ? Infinity : currentUser.coins - COST;
            db.ref('users/' + currentUser.username).update({ clanId: ref.key, coins: newCoins === Infinity ? "Infinity" : newCoins });
            addAuditLog('clan_create', currentUser.username, COST);
            unlockAchievement('clan_leader');
            toast('🏰 Клан создан!');
            rClan();
        });
    });
};

window.joinClan = function(clanId) {
    db.ref('clans/' + clanId).once('value').then(s => {
        const c = s.val();
        if (!c) return;
        const memberCount = Object.keys(c.members || {}).length;
        if (memberCount >= CLAN_MAX_MEMBERS) { toast(`❌ Клан полон (${CLAN_MAX_MEMBERS} человек)`); return; }
        db.ref('clans/' + clanId + '/members/' + currentUser.username).set({ role: 'member', joinedAt: Date.now() }).then(() => {
            db.ref('users/' + currentUser.username + '/clanId').set(clanId);
            toast(`🏰 Вступил в [${c.tag}] ${c.name}`);
            rClan();
        });
    });
};

window.rClanView = function(clanId) {
    db.ref('clans/' + clanId).once('value').then(s => {
        const c = s.val();
        if (!c) { db.ref('users/' + currentUser.username + '/clanId').remove(); rClan(); return; }
        const members = c.members || {};
        const memberCount = Object.keys(members).length;
        const isLeader = c.leader === currentUser.username;
        const isOfficer = members[currentUser.username]?.role === 'officer';
        const canManage = isLeader || isOfficer;
        const levelProgress = ((c.totalInvest || 0) % CLAN_INVEST_PER_LEVEL) / CLAN_INVEST_PER_LEVEL * 100;
        let h = '<div class="divider">🏰 МОЙ КЛАН</div>';
        h += `<div class="clan-card"><div class="clan-emblem">${c.emoji || '🏰'}</div><div class="clan-name">${esc(c.name)}</div><div class="clan-tag">[${esc(c.tag || '???')}]</div><div style="margin-top:12px; font-size: 14px;">Уровень <b>${c.level || 1}</b> • ${memberCount}/${CLAN_MAX_MEMBERS} 👥</div><div class="clan-level-bar"><div class="clan-level-fill" style="width:${levelProgress}%"></div></div><div class="text-sm" style="margin-top:4px;">До след. уровня: ${(CLAN_INVEST_PER_LEVEL - ((c.totalInvest || 0) % CLAN_INVEST_PER_LEVEL)).toLocaleString('ru-RU')} 🐾</div><div style="margin-top:12px; font-size: 16px;">💰 Банк: <b style="color:#ffd700;">${(c.bank || 0).toLocaleString('ru-RU')} 🐾</b></div></div>`;
        h += `<div class="card" style="margin-top:10px;"><div class="text-bold" style="margin-bottom:8px;">💎 Вложить в клан</div><div class="row-wrap"><input class="input-sm" id="clanInvestAmt" type="number" placeholder="Сумма 🐾" min="100" step="100" style="flex:1;"><button class="clan-invest-btn" id="clanInvestBtn">💰 Вложить</button></div><div class="text-sm" style="margin-top:6px;">Каждые ${CLAN_INVEST_PER_LEVEL.toLocaleString('ru-RU')} 🐾 = +1 уровень клана</div></div>`;
        const lvl = c.level || 1;
        h += `<div class="card" style="margin-top:10px;"><div class="text-bold" style="margin-bottom:8px;">🎁 Бонусы клана (ур. ${lvl})</div><div class="text-sm">⚡ +${lvl * 5}% койнов во всех играх</div><div class="text-sm">🎰 ${lvl >= 3 ? 'Доступ к клан-кейсу' : 'Клан-кейс с 3 ур.'}</div></div>`;
        h += '<div class="divider">👥 УЧАСТНИКИ</div>';
        Object.entries(members).sort((a, b) => { const rank = { leader: 0, officer: 1, member: 2 }; return (rank[a[1].role] || 2) - (rank[b[1].role] || 2); }).forEach(([name, m]) => {
            const roleIcon = m.role === 'leader' ? '👑' : m.role === 'officer' ? '⚔️' : '🛡️';
            const roleText = m.role === 'leader' ? 'Лидер' : m.role === 'officer' ? 'Офицер' : 'Участник';
            h += `<div class="clan-member ${m.role}"><div style="font-size: 22px;">${roleIcon}</div><div style="flex:1;"><div class="text-bold">${esc(name)} ${name === currentUser.username ? '<span class="badge-you">(вы)</span>' : ''}</div><div class="text-sm">${roleText}</div></div>${canManage && name !== c.leader && name !== currentUser.username && m.role !== 'officer' ? `<button class="btn-sm btn-orange" onclick="window.promoteClanMember('${ea(name)}')">⬆️</button>` : ''}${isLeader && name !== c.leader ? `<button class="btn-sm btn-red" onclick="window.kickClanMember('${ea(name)}')">🚫</button>` : ''}</div>`;
        });
        if (isLeader) { h += '<div class="divider">⚙️ УПРАВЛЕНИЕ</div>'; h += `<div class="card"><button class="btn-sm btn-red" id="disbandClanBtn">💥 Распустить клан</button></div>`; }
        h += `<div class="card" style="margin-top:10px; border: 1px solid var(--red);"><button class="clan-leave-btn" id="leaveClanBtn" style="width:100%;">🚪 Покинуть клан</button></div>`;
        h += `<button class="btn-sm btn-green" id="refreshClanView" style="margin:8px 0;">🔄 Обновить</button>`;
        $('feedContainer').innerHTML = h;
        $('clanInvestBtn').onclick = () => investToClan(clanId);
        $('leaveClanBtn').onclick = () => leaveClan(clanId, isLeader);
        if ($('disbandClanBtn')) $('disbandClanBtn').onclick = () => disbandClan(clanId);
        $('refreshClanView').onclick = () => rClanView(clanId);
    });
};

window.investToClan = function(clanId) {
    const amount = Number($('clanInvestAmt').value);
    if (!amount || amount < 100) { toast('❌ Минимум 100 🐾'); return; }
    if (currentUser.coins !== Infinity && currentUser.coins < amount) { toast('❌ Недостаточно 🐾'); return; }
    db.ref('clans/' + clanId).once('value').then(s => {
        const c = s.val();
        const newBank = (c.bank || 0) + amount;
        const newTotal = (c.totalInvest || 0) + amount;
        const newLevel = Math.floor(newTotal / CLAN_INVEST_PER_LEVEL) + 1;
        const updates = {};
        updates['clans/' + clanId + '/bank'] = newBank;
        updates['clans/' + clanId + '/totalInvest'] = newTotal;
        updates['clans/' + clanId + '/level'] = newLevel;
        if (currentUser.coins !== Infinity) updates['users/' + currentUser.username + '/coins'] = currentUser.coins - amount;
        db.ref().update(updates).then(() => {
            if (newLevel > (c.level || 1)) toast(`🎉 Клан поднялся до ур. ${newLevel}!`);
            else toast(`✅ Вложено ${amount} 🐾`);
            addAuditLog('clan_invest', clanId, amount);
            rClanView(clanId);
        });
    });
};

window.leaveClan = function(clanId, isLeader) {
    if (isLeader) { if (!confirm('Ты лидер. Если уйдёшь — клан распустится! Уверен?')) return; disbandClan(clanId); return; }
    if (!confirm('Покинуть клан?')) return;
    db.ref('clans/' + clanId + '/members/' + currentUser.username).remove().then(() => { db.ref('users/' + currentUser.username + '/clanId').remove(); toast('🚪 Покинул клан'); rClan(); });
};

window.disbandClan = function(clanId) {
    if (!confirm('РАСПУСТИТЬ КЛАН? Это необратимо!')) return;
    db.ref('clans/' + clanId).once('value').then(s => {
        const c = s.val();
        const updates = {};
        Object.keys(c.members || {}).forEach(name => { updates['users/' + name + '/clanId'] = null; });
        updates['clans/' + clanId] = null;
        db.ref().update(updates).then(() => { toast('💥 Клан распущен'); rClan(); });
    });
};

window.promoteClanMember = function(username) {
    db.ref('users/' + currentUser.username + '/clanId').once('value').then(s => { const clanId = s.val(); if (!clanId) return; db.ref('clans/' + clanId + '/members/' + username + '/role').set('officer').then(() => { toast(`⚔️ ${username} теперь офицер`); rClanView(clanId); }); });
};

window.kickClanMember = function(username) {
    if (!confirm(`Кикнуть ${username} из клана?`)) return;
    db.ref('users/' + currentUser.username + '/clanId').once('value').then(s => { const clanId = s.val(); if (!clanId) return; db.ref('clans/' + clanId + '/members/' + username).remove().then(() => { db.ref('users/' + username + '/clanId').remove(); toast(`🚫 ${username} кикнут`); rClanView(clanId); }); });
};

// ============ 💎 ВИН-ТОП ============
window.rWinTop = function() {
    if (!currentUser) return;
    db.ref('users').once('value').then(s => {
        const users = s.val() || {};
        const me = users[currentUser.username] || {};
        const today = new Date().toLocaleDateString('ru-RU');
        const myInvestToday = (me.wipeInvestDate === today) ? (me.wipeInvestToday || 0) : 0;
        const myInvest = me.wipeInvest || 0;
        const remaining = Math.max(0, WIN_TOP_DAILY_LIMIT - myInvestToday);
        const investList = Object.entries(users).filter(([name, u]) => name !== 'Филипп' && (u.wipeInvest || 0) > 0).sort((a, b) => (b[1].wipeInvest || 0) - (a[1].wipeInvest || 0));
        let h = '<div class="divider">💎 ВИН-ТОП</div>';
        h += `<div class="text-sm" style="text-align:center; margin-bottom:10px;">Вкладывай 🐾 в банк — забирай токены и кейсы в следующем сезоне!</div>`;
        h += `<div style="background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460); border: 3px solid #ffd700; border-radius: 20px; padding: 18px; color: white; box-shadow: 0 0 40px rgba(255,215,0,0.5);"><div style="text-align:center; margin-bottom:12px;"><div style="font-size: 40px;">🏦</div><div style="font-weight: 900; font-size: 18px; color: #ffd700;">КОТО-БАНК</div><div class="text-sm" style="opacity:0.8;">Лимит: ${WIN_TOP_DAILY_LIMIT.toLocaleString('ru-RU')} 🐾 в день</div></div><div class="row-between" style="padding:10px 0; border-bottom: 1px solid rgba(255,255,255,0.15);"><span>Мой вклад за сезон:</span><b style="color:#ffd700; font-size:18px;">${myInvest.toLocaleString('ru-RU')} 🐾</b></div><div class="row-between" style="padding:10px 0; border-bottom: 1px solid rgba(255,255,255,0.15);"><span>Вложено сегодня:</span><b>${myInvestToday.toLocaleString('ru-RU')} / ${WIN_TOP_DAILY_LIMIT.toLocaleString('ru-RU')} 🐾</b></div><div class="row-between" style="padding:10px 0;"><span>Доступно сегодня:</span><b style="color:#4caf50;">${remaining.toLocaleString('ru-RU')} 🐾</b></div></div>`;
        h += `<div class="card" style="margin-top:10px;"><div class="text-bold" style="margin-bottom:8px;">💰 Сделать вклад</div><div class="row-wrap"><input class="input-sm" id="winTopAmount" type="number" placeholder="Сумма 🐾" min="100" max="${remaining}" step="100" style="flex:1;"><button class="btn-sm btn-gold" id="winTopInvest" ${remaining <= 0 ? 'disabled' : ''}>${remaining <= 0 ? '⛔ Лимит' : '💎 Вложить'}</button></div><div class="text-sm" style="margin-top:8px;">🎁 Награды в конце сезона:<br>1 место — <b>-1 Донат-Кейс + 150 💎</b><br>2 место — <b>100 💎</b><br>3 место — <b>50 💎</b></div></div>`;
        h += `<div class="divider">🏆 ТОП ИНВЕСТОРОВ</div>`;
        if (!investList.length) h += '<div class="empty-state">📭 Пока никто не вкладывал</div>';
        else {
            const medals = ['🥇', '🥈', '🥉'];
            investList.slice(0, 10).forEach(([name, u], i) => {
                const isMe = name === currentUser.username;
                const medal = i < 3 ? medals[i] : `#${i + 1}`;
                h += `<div class="card${isMe ? ' card-glow' : ''}" style="margin-bottom:6px; display:flex; align-items:center; gap:12px;"><div style="font-size: 26px; width: 36px; text-align:center;">${medal}</div><div style="flex:1;"><div class="text-bold">${nickHTML(name, u)} ${isMe ? '<span class="badge-you">(вы)</span>' : ''}</div><div class="text-sm">Вклад: ${(u.wipeInvest || 0).toLocaleString('ru-RU')} 🐾</div></div></div>`;
            });
        }
        h += `<button class="btn-sm btn-green" id="refreshWinTop" style="margin:8px 0;">🔄 Обновить</button>`;
        $('feedContainer').innerHTML = h;
        if ($('refreshWinTop')) $('refreshWinTop').onclick = () => rWinTop();
        if ($('winTopInvest')) $('winTopInvest').onclick = () => investToWinTop();
    });
};

window.investToWinTop = function() {
    const amount = Number($('winTopAmount').value);
    if (!amount || amount < 100) { toast('❌ Минимум 100 🐾'); return; }
    if (currentUser.username === 'Филипп') { toast('👑 У тебя ∞ монет'); return; }
    if (currentUser.coins !== Infinity && currentUser.coins < amount) { toast('❌ Недостаточно 🐾'); return; }
    db.ref('users/' + currentUser.username).once('value').then(s => {
        const me = s.val();
        const today = new Date().toLocaleDateString('ru-RU');
        const investedToday = (me.wipeInvestDate === today) ? (me.wipeInvestToday || 0) : 0;
        const remaining = WIN_TOP_DAILY_LIMIT - investedToday;
        if (amount > remaining) { toast(`❌ Лимит: ещё ${remaining} 🐾`); return; }
        const newCoins = me.coins === Infinity ? Infinity : (me.coins || 0) - amount;
        const updates = { coins: newCoins === Infinity ? "Infinity" : newCoins, wipeInvest: (me.wipeInvest || 0) + amount, wipeInvestToday: investedToday + amount, wipeInvestDate: today };
        db.ref('users/' + currentUser.username).update(updates).then(() => { toast(`✅ Вложено ${amount} 🐾 в Кото-Банк`); addAuditLog('win_top_invest', currentUser.username, amount); unlockAchievement('investor'); rWinTop(); });
    });
};

// ============ 📜 ИСТОРИЯ ВАЙПОВ ============
window.rWipeHistory = function() {
    if (!currentUser) return;
    db.ref('users/' + currentUser.username).once('value').then(s => {
        const me = s.val() || {};
        const history = me.wipeHistory || [];
        let h = '<div class="divider">📜 ИСТОРИЯ ВАЙПОВ</div>';
        h += `<div class="text-sm" style="margin-bottom:8px;">Твои результаты за все сезоны</div>`;
        if (!history.length) h += '<div class="empty-state">📭 Пока нет истории — ты новичок!</div>';
        else {
            h += `<div class="card" style="background: linear-gradient(135deg, #1a1a2e, #16213e); color: white; padding: 16px;"><div class="text-bold" style="font-size: 16px; margin-bottom: 10px; color: #ffd700;">🏆 Твой прогресс</div>`;
            history.slice().reverse().forEach(w => {
                const medalColor = w.rank === 1 ? '#ffd700' : w.rank === 2 ? '#c0c0c0' : w.rank === 3 ? '#cd7f32' : '#666';
                h += `<div class="row-between" style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.1);"><div><div class="text-bold" style="color: ${medalColor};">${w.topText || '—'}</div><div class="text-sm" style="opacity:0.7;">Вайп #${w.wipe} • ${new Date(w.date).toLocaleDateString('ru-RU')}</div></div><div style="text-align:right;"><div class="text-bold">🐾 ${(w.coins || 0).toLocaleString('ru-RU')}</div><div class="text-sm" style="opacity:0.7;">💎 ${w.tokens || 0}</div></div></div>`;
            });
            h += `</div>`;
            const totalCoins = history.reduce((sum, w) => sum + (w.coins || 0), 0);
            const bestRank = Math.min(...history.map(w => w.rank || 999));
            const medals = ['🥇', '🥈', '🥉'];
            const bestText = bestRank <= 3 ? medals[bestRank - 1] + ' Топ-' + bestRank : 'Топ-' + bestRank;
            h += `<div class="card" style="margin-top:10px;"><div class="row-between" style="padding:4px 0;"><span class="text-sm">Всего заработано за все сезоны:</span><b>🐾 ${totalCoins.toLocaleString('ru-RU')}</b></div><div class="row-between" style="padding:4px 0;"><span class="text-sm">Лучшее место:</span><b>${bestText}</b></div><div class="row-between" style="padding:4px 0;"><span class="text-sm">Пережито вайпов:</span><b>💀 ${me.totalWipes || 0}</b></div></div>`;
        }
        h += `<button class="btn-sm btn-green" id="refreshHistory" style="margin:8px 0;">🔄 Обновить</button>`;
        $('feedContainer').innerHTML = h;
        if ($('refreshHistory')) $('refreshHistory').onclick = () => rWipeHistory();
    });
};