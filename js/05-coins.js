// ============================================================
// 05-coins.js — Койны (главная) и Возможности ролей
// ============================================================

// ============ 🐾 rCoins ============
window.rCoins = function() {
    if (!currentUser) return;
    $('feedContainer').innerHTML = '<div class="divider">🐾 КОЙНЫ</div><div class="card" style="text-align:center; padding:40px;"><div style="font-size:36px;">⏳</div><div class="text-bold" style="margin-top:8px;">Загрузка...</div></div>';
    db.ref('users').once('value').then(s => {
        const u = s.val() || {};
        db.ref('config').once('value').then(cfgSnap => {
            const cfg = cfgSnap.val() || {};
            const nextWipe = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).getTime();
            const daysLeft = Math.ceil((nextWipe - Date.now()) / 86400000);
            const hoursLeft = Math.floor((nextWipe - Date.now()) / 3600000);
            let grad, emoji, warning, pulseStyle = '';
            if (daysLeft > 10) { grad = 'linear-gradient(135deg, #2e7d32, #66bb6a)'; emoji = '🟢'; warning = 'Спокойный сезон'; }
            else if (daysLeft > 5) { grad = 'linear-gradient(135deg, #f9a825, #ffd54f)'; emoji = '🟡'; warning = 'Скоро вайп!'; }
            else if (daysLeft > 1) { grad = 'linear-gradient(135deg, #e65100, #ff9800)'; emoji = '🟠'; warning = 'Готовься!'; }
            else { grad = 'linear-gradient(135deg, #b71c1c, #ff0000)'; emoji = '🔴'; warning = 'ПОСЛЕДНИЙ ДЕНЬ!'; pulseStyle = 'animation: celebrateGlow 1s infinite;'; }
            const timerText = daysLeft <= 1 ? `${hoursLeft} ч` : `${daysLeft} дн.`;
            let banner = `<div class="card" style="background: ${grad}; border: none; text-align: center; padding: 20px; color: white; box-shadow: 0 10px 40px rgba(0,0,0,0.4); ${pulseStyle}"><div style="font-size: 36px; margin-bottom: 6px;">${emoji}🐱💎</div><div style="font-weight: 900; font-size: 18px; letter-spacing: 1px;">${warning}</div><div style="font-size: 13px; opacity: 0.95; margin-top: 8px;">Койны сбрасываются, <b>токены остаются!</b></div><div style="font-weight: 700; font-size: 14px; margin-top: 10px;">⏳ До вайпа: <b id="wipeCountdown">${timerText}</b></div><div style="font-size: 11px; opacity: 0.8; margin-top: 4px;">Всего вайпов: ${cfg.wipeCount || 0} • Токены сгорят через ${6 - ((cfg.wipeCount || 0) % 6)} вайп(ов)</div></div>`;
            renderCoinsBody(banner, u);
            if (daysLeft <= 1) startWipeCountdown(nextWipe);
        });
    });
};

window.renderCoinsBody = function(banner, u) {
    if (!currentUser) return;
    const me = u[currentUser.username] || {};
    const myTokens = me.tokens;
    const isInfiniteTok = myTokens === Infinity || myTokens === "Infinity" || currentUser.username === 'Филипп';
    const currentVip = getCurrentVipRole(me);
    let h = banner;

    h += `<div class="row-between"><div class="row">${avatarHTML(currentUser.username, me, 44)}<div><div class="text-bold">${nickHTML(currentUser.username, me)}</div>`;
    if (currentUser.role==='admin') h+='<span class="badge badge-admin">АДМИН</span>';
    if (currentUser.role==='tester') h+='<span class="badge badge-tester">ТЕСТЕР</span>';
    if (currentVip && ROLES[currentVip]) h += `<span class="role-badge ${ROLES[currentVip].cls}" style="padding:2px 8px;">${roleIcon(currentVip)} ${ROLES[currentVip].name}</span>`;
    h+=`</div></div><div class="row"><span class="text-bold">🐾 ${fc(currentUser.coins)}</span>`;
    if (currentUser.coins===Infinity) h+='<span class="badge-infinity">∞</span>';
    h+='</div></div>';

    h += `<div class="token-card"><div>${tokenIcon(48)}</div><div class="token-balance">${isInfiniteTok ? '∞' : (myTokens || 0)}</div><div style="font-size: 12px; font-weight: 700; margin-top: 4px;">ТОКЕНОВ</div>${isInfiniteTok ? '<div style="font-size: 11px; margin-top: 4px;">♾️ БЕСКОНЕЧНО</div>' : `<div style="font-size: 11px; margin-top: 4px;">≈ ${((myTokens || 0) * 100).toLocaleString('ru-RU')} 🐾</div>`}</div>`;

    if (me.freeCase && me.freeCase > 0) {
        h += `<div class="card" style="background: linear-gradient(135deg, #9c27b0, #4a148c); color: white; text-align: center; padding: 14px; margin-top: 8px;"><div style="font-size: 36px;">🎁</div><div style="font-weight: 900; font-size: 16px; margin-top: 4px;">ДОНАТ-КЕЙСЫ: ${me.freeCase}</div><div style="font-size: 11px; opacity: 0.9; margin-top: 4px;">Открой в 🎭Роли или подари в 🔄Обмен</div></div>`;
    }

    if (originalAdmin) h += '<div style="margin:8px 0; font-size:12px; color:var(--text2);">🔑 Пароль: скрыто</div>';
    else h+=`<div style="margin:8px 0;"><span class="password-chip" onclick="window.cp('${ea(currentUser.password)}')">🔑 ${esc(currentUser.password)} 📋</span></div>`;

    const vipLevel = currentVip ? ROLES[currentVip].level : 0;
    const canSetAvatar = currentUser.role === 'admin' || vipLevel >= 2 || me.canSetAvatar === true;
    h += '<div class="divider">🖼️ МОЯ АВАТАРКА</div>';
    h += `<div class="card"><div class="text-sm" style="margin-bottom:8px;">${canSetAvatar ? 'Вставь ссылку на картинку' : '🔒 Купи «Свой аватар» в Токен-Шопе или получи Барона+'}</div><div class="row-wrap"><input class="input-sm" id="avatarUrlInput" placeholder="https://..." style="flex:1;" value="${me.avatarUrl ? esc(me.avatarUrl) : ''}" ${canSetAvatar ? '' : 'disabled'}><button class="btn-sm btn-blue" id="setAvatarBtn" ${canSetAvatar ? '' : 'disabled'}>🖼️ Установить</button>${me.avatarUrl ? '<button class="btn-sm btn-red" id="removeAvatarBtn">🗑️ Убрать</button>' : ''}</div></div>`;

    h+=`<div class="card" style="margin-bottom:8px;"><div style="font-weight:700;font-size:13px;color:var(--accent);">🎁 Промокод</div><div class="row-wrap"><input class="input-sm" id="pi" placeholder="Код"><button class="btn-sm btn-purple" id="pa">Применить</button></div><div class="text-sm">KOTOSTART, BIGKOT, MEOW50, GOLDEN100, LUCKY777</div></div>`;

    if (currentUser.role==='admin') {
        h+=`<div class="card card-glow"><div style="font-weight:700;font-size:13px;color:var(--accent);">⚡ Управление</div><div class="row-wrap"><select class="select-sm" id="rs">`;
        Object.entries(u).forEach(([k,v]) => { if (v.coins !== Infinity && v.coins !== "Infinity" && k !== 'Филипп') h+=`<option value="${esc(k)}">${esc(k)} (${fc(v.coins)}🐾)</option>`; });
        h+=`</select><input class="input-sm" id="ai" type="number" value="50"><button class="btn-sm btn-green" id="ab">➕</button><button class="btn-sm btn-red" id="rb">➖</button></div></div>`;
        h+=`<div class="card" style="border:1px solid var(--red);"><div style="font-weight:700;font-size:13px;color:var(--red);">🚨 ВАЙП</div><button class="btn-sm btn-red" id="forceWipeBtn" style="margin-top:8px;">🚨 ЗАПУСТИТЬ ВАЙП ВРУЧНУЮ</button></div>`;
    }

    h+=`<button class="btn-sm btn-green" id="refreshCoins" style="margin-bottom:8px;">🔄 Обновить</button>`;

    h+='<div class="divider">👥 Аккаунты</div>';
    Object.entries(u).forEach(([k,v]) => {
        const ic = k===currentUser.username;
        const vip = getCurrentVipRole(v);
        h+=`<div class="card${ic?' card-glow':''}" style="margin-bottom:6px;"><div class="row-between"><div class="row">${avatarHTML(k, v, 44)}<div><div class="text-bold">${nickHTML(k, v)}`;
        if (v.role==='admin') h+=' <span class="badge badge-admin">админ</span>';
        if (v.role==='tester') h+=' <span class="badge badge-tester">тестер</span>';
        if (vip && ROLES[vip]) h += ` <span class="role-badge ${ROLES[vip].cls}" style="padding:2px 6px;">${roleIcon(vip)}</span>`;
        if (ic) h+=' <span class="badge-you">(вы)</span>';
        h+=`</div><div class="text-sm">🐾 ${fc(v.coins)} • ${tokenIcon(14)} ${ft(v.tokens)}`;
        if (v.coins===Infinity||v.coins==="Infinity") h+=' <span class="badge-infinity">∞</span>';
        h+='</div></div></div><div style="margin-top:4px;">';
        if (ic) h+=`<span class="password-chip" onclick="window.cp('${ea(v.password)}')">🔐 ${esc(v.password)} 📋</span>`;
        else h+='<span style="color:var(--text2)">🔐 ••••••••</span>';
        h+='</div></div></div>';
    });

    $('feedContainer').innerHTML = h;

    $('refreshCoins').onclick = () => rCoins();

    if ($('setAvatarBtn')) $('setAvatarBtn').onclick = () => {
        const url = $('avatarUrlInput').value.trim();
        if (!url) { toast('Вставь ссылку'); return; }
        if (!url.startsWith('http')) { toast('❌ Ссылка должна начинаться с http'); return; }
        db.ref('users/' + currentUser.username + '/avatarUrl').set(url).then(() => { toast('✅ Аватарка установлена'); rCoins(); });
    };
    if ($('removeAvatarBtn')) $('removeAvatarBtn').onclick = () => {
        db.ref('users/' + currentUser.username + '/avatarUrl').remove().then(() => { toast('🗑️ Аватарка убрана'); rCoins(); });
    };

    $('pa').onclick = () => {
        const c = $('pi').value.trim().toUpperCase();
        if (!c) return;
        db.ref('usedPromos/'+currentUser.username).once('value').then(async s => {
            const used = s.val()||[];
            if (used.includes(c)) { toast('❌ Уже использован'); return; }
            let reward = PROMO[c];
            if (!reward) {
                const snap = await db.ref('customPromos/' + c).once('value');
                if (snap.exists()) reward = snap.val().reward;
            }
            if (!reward) { toast('❌ Неверный код'); return; }
            if (currentUser.coins!==Infinity) db.ref('users/'+currentUser.username+'/coins').set(currentUser.coins+reward);
            used.push(c); db.ref('usedPromos/'+currentUser.username).set(used);
            toast('✅ +'+reward+'🐾');
            addAuditLog('promo', currentUser.username, reward);
            $('pi').value = '';
        });
    };

    if ($('ab')) $('ab').onclick = () => chCoins('add');
    if ($('rb')) $('rb').onclick = () => chCoins('remove');
    if ($('forceWipeBtn')) $('forceWipeBtn').onclick = () => {
        if (confirm('🚨 ЗАПУСТИТЬ ВАЙП?')) db.ref('config/wipeCount').once('value').then(s => runWipe(s.val() || 0));
    };
};

window.chCoins = function(op) {
    const s = $('rs'); const a = Number($('ai').value);
    if (!s || s.value === '' || isNaN(a) || a <= 0) { toast('Выбери пользователя и сумму'); return; }
    const t = s.value;
    if (t === 'Филипп') { toast('Нельзя изменить баланс Филиппа'); return; }
    db.ref('users/' + t + '/coins').once('value').then(x => {
        let c = x.val() || 0;
        if (c === Infinity || c === "Infinity") { toast('Нельзя изменить ∞'); return; }
        c = op === 'add' ? c + a : c - a;
        if (c < 0) c = 0;
        db.ref('users/' + t + '/coins').set(c).then(() => { toast((op === 'add' ? '✅ +' : '❌ -') + a + '🐾 → ' + t); rCoins(); });
    });
};

// ============ ✨ rAbilities ============
window.rAbilities = function() {
    if (!currentUser) return;
    db.ref('users/' + currentUser.username).once('value').then(s => {
        const me = s.val() || {};
        const currentVip = getCurrentVipRole(me);
        let h = '<div class="divider">✨ ВОЗМОЖНОСТИ И ТЕМЫ</div>';
        h += '<div class="text-sm" style="margin-bottom:8px;">Что даёт каждая роль + её тема</div>';
        
        Object.entries(ROLES).forEach(([key, r]) => {
            const isCurrent = currentVip === key;
            const info = ROLE_ABILITIES[key];
            const theme = ROLE_THEMES[key];
            if (!info || !theme) return;
            
            h += `<div class="card${isCurrent ? ' card-glow' : ''}" style="margin-bottom:12px;">`;
            h += `<div class="theme-preview ${theme.cls}"><div class="theme-preview-label"><span class="theme-preview-swatch" style="background:rgba(255,255,255,0.6);"></span>${theme.label}</div><div class="theme-preview-desc">${theme.desc}</div></div>`;
            h += `<div class="row-between" style="margin-bottom:8px;"><div class="row" style="align-items:center;"><div>${r.img ? `<img src="${r.img}" style="width:48px;height:48px;image-rendering:pixelated;" onerror="this.outerHTML='<span style=\\'font-size:36px;\\'>${r.emoji}</span>'">` : `<span style="font-size:36px;">${r.emoji}</span>`}</div><div><div class="text-bold">${r.name}</div><div class="text-sm">${info.subtitle}</div></div></div>${isCurrent ? '<span class="badge badge-admin">АКТИВНА</span>' : ''}</div>`;
            h += `<div>${info.features.map(f => `<div class="ability-item"><div class="ability-icon">${f.icon}</div><div><div class="ability-name">${f.name}</div><div class="ability-desc">${f.desc}</div></div></div>`).join('')}</div>`;
            
            // 🟢 ДОБАВЛЯЕМ РЕАЛЬНЫЕ КНОПКИ ДЛЯ ВЫСОКИХ РОЛЕЙ
            if (key === 'gertsog' || key === 'knyaz') {
                h += `<div class="row-wrap" style="margin-top:10px; justify-content:center;">
                    <button class="btn-sm btn-red" onclick="switchTab('mod')">🔨 Модерация</button>
                    <button class="btn-sm btn-blue" onclick="switchTab('audit')">📋 Аудит</button>
                    <button class="btn-sm btn-purple" onclick="switchTab('requests')">📋 Заявки</button>
                </div>`;
            } else if (key === 'prints' || key === 'titan') {
                h += `<div class="row-wrap" style="margin-top:10px; justify-content:center;">
                    <button class="btn-sm btn-red" onclick="switchTab('mod')">🔨 Мут (тест)</button>
                </div>`;
            }
            
            h += `</div>`;
        });
        $('feedContainer').innerHTML = h;
    });
};