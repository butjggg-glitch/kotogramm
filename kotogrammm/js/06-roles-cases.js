// ============================================================
// 06-roles-cases.js — Роли, Токен-Шоп, Кейсы, Блэкджек
// ============================================================

// ============ 🎭 rRoles ============
window.rRoles = function() {
    db.ref('users/' + currentUser.username).once('value').then(s => {
        const me = s.val() || {};
        const currentVip = getCurrentVipRole(me);
        let h = '<div class="divider">🎭 МОЯ РОЛЬ</div>';
        h += `<div class="role-card current"><div class="row-between"><div><div class="text-sm" style="opacity:0.8;">Текущий статус:</div><div style="font-size: 20px; font-weight: 800; margin-top: 4px; display:flex; align-items:center; gap:8px;">${currentVip && ROLES[currentVip] ? roleIcon(currentVip, 'lg') + ' ' + ROLES[currentVip].name : '🎮 Игрок'}</div>${me.vipExpiresAt ? `<div class="text-sm" style="margin-top:4px; opacity:0.8;">${me.vipExpiresAt === -1 ? '♾️ Навсегда' : '⏳ До ' + new Date(me.vipExpiresAt).toLocaleDateString('ru-RU')}</div>` : ''}</div><div style="font-size: 48px;">${currentVip && ROLES[currentVip] ? roleIcon(currentVip, 'lg') : '🎮'}</div></div></div>`;

        h += '<div class="divider">🛒 ДОНАТ-ШОП</div>';
        h += '<div class="text-sm" style="margin-bottom:6px;">За рубли (заявка админу) или за токены (мгновенно)</div>';
        Object.entries(ROLE_PRICES).forEach(([roleKey, prices]) => {
            const r = ROLES[roleKey];
            const p30t = prices.d30 * 10, p90t = prices.d90 * 10, pFt = prices.forever * 10;
            h += `<div class="card" style="margin-bottom:8px;"><div class="text-bold" style="display:flex; align-items:center; gap:8px;">${r.img ? `<img src="${r.img}" style="width:32px;height:32px;image-rendering:pixelated;" onerror="this.outerHTML='<span style=\\'font-size:24px;\\'>${r.emoji}</span>'">` : r.emoji} ${r.name}</div><div class="text-sm" style="margin-top:4px;">💳 За рубли</div><div class="row-wrap" style="margin-top:6px;"><button class="btn-sm btn-orange" onclick="window.buyRole('${roleKey}', 30, ${prices.d30})">30 дн. — ${prices.d30}₽</button><button class="btn-sm btn-purple" onclick="window.buyRole('${roleKey}', 90, ${prices.d90})">90 дн. — ${prices.d90}₽</button><button class="btn-sm btn-gold" onclick="window.buyRole('${roleKey}', -1, ${prices.forever})">♾️ Навсегда — ${prices.forever}₽</button></div><div class="text-sm" style="margin-top:8px;">💎 За токены</div><div class="row-wrap" style="margin-top:6px;"><button class="btn-sm btn-green" onclick="window.buyRoleWithTokens('${roleKey}', 30, ${p30t})">30 дн. — ${p30t}💎</button><button class="btn-sm btn-green" onclick="window.buyRoleWithTokens('${roleKey}', 90, ${p90t})">90 дн. — ${p90t}💎</button><button class="btn-sm btn-gold" onclick="window.buyRoleWithTokens('${roleKey}', -1, ${pFt})">♾️ Навсегда — ${pFt}💎</button></div></div>`;
        });

        h += '<div class="divider">🎁 ДОНАТ-КЕЙСЫ</div>';
        if (me.freeCase && me.freeCase > 0) {
            h += `<div class="card" style="background: linear-gradient(135deg, #9c27b0, #4a148c); color: white; text-align: center; padding: 12px; margin-bottom: 8px;"><div style="font-weight: 800;">🎁 У тебя ${me.freeCase} Донат-кейсов!</div></div>`;
        }
        h += `<div class="card" style="background: linear-gradient(135deg, #4a148c, #9c27b0, #ffd700); color: white; text-align: center; padding: 20px;"><div>${caseIcon(72)}</div><div style="font-weight: 900; font-size: 18px; margin-top: 8px;">ДОНАТ-КЕЙС</div><div style="font-size: 13px; opacity: 0.95; margin-top: 6px;">От Барона до Князя на 30 дней!</div><div style="font-size: 12px; opacity: 0.8; margin-top: 4px;">Герцог в кейсе НЕ выпадает</div><div style="margin-top: 14px; display:grid; grid-template-columns: 1fr 1fr; gap:8px; max-width:340px; margin-left:auto; margin-right:auto;"><button class="btn-sm btn-gold" id="case1Btn" style="padding:10px 6px;">📦 Сундуки</button><button class="btn-sm btn-red" id="case2Btn" style="padding:10px 6px;">👹 Мобы</button><button class="btn-sm btn-purple" id="case3Btn" style="padding:10px 6px;">🎡 Рулетка</button><button class="btn-sm btn-orange" id="case4Btn" style="padding:10px 6px;">🃏 Карты</button></div><div style="font-size:11px; opacity:0.75; margin-top:10px;">99💎 за попытку • 🎁 кейсы можно дарить (🔄Обмен)</div></div>`;

        $('feedContainer').innerHTML = h;
        $('case1Btn').onclick = () => openCase('chests');
        $('case2Btn').onclick = () => openCase('mobs');
        $('case3Btn').onclick = () => openCase('roulette');
        $('case4Btn').onclick = () => openCase('cards');
    });
};

// ============ 🛒 rTokenShop ============
window.rTokenShop = function() {
    db.ref('users/' + currentUser.username).once('value').then(s => {
        const me = s.val() || {};
        const isInfinite = me.tokens === Infinity || me.tokens === "Infinity" || currentUser.username === 'Филипп';
        const myTokens = isInfinite ? Infinity : (me.tokens || 0);
        let h = '<div class="divider">🛒 ТОКЕН-ШОП</div>';
        h += `<div class="token-card"><div>${tokenIcon(40)}</div><div class="token-balance">${isInfinite ? '∞' : myTokens}</div><div style="font-size: 12px; font-weight: 700; margin-top: 4px;">ТОКЕНОВ</div><div style="font-size: 10px; opacity:0.8; margin-top:2px;">1💎 = 1 000 🐾 • всё выдаётся сразу</div></div>`;
        const categories = ['Котости', 'Статус', 'Бусты', 'Особое'];
        categories.forEach(cat => {
            h += `<div class="shop-category">${cat === 'Котости' ? '🎨' : cat === 'Статус' ? '👑' : cat === 'Бусты' ? '⚡' : '🎁'} ${cat}</div>`;
            h += '<div class="shop-grid">';
            TOKEN_SHOP_ITEMS.filter(i => i.cat === cat).forEach(item => {
                const iconHTML = item.img ? `<img src="${item.img}" class="shop-slot-img" onerror="this.outerHTML='<div style=\\'font-size:38px;\\'>${item.icon}</div>'">` : `<div style="font-size:38px;">${item.icon}</div>`;
                h += `<div class="shop-slot" onclick="window.openItemModal('${item.id}')"><div class="shop-slot-icon">${iconHTML}</div><div class="shop-slot-name">${item.name}</div><div class="shop-slot-price">${tokenIcon(14)} ${item.price}</div></div>`;
            });
            h += '</div>';
        });
        $('feedContainer').innerHTML = h;
    });
};

window.openItemModal = function(itemId) {
    const item = TOKEN_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    db.ref('users/' + currentUser.username).once('value').then(s => {
        const me = s.val() || {};
        const isInfinite = me.tokens === Infinity || me.tokens === "Infinity" || currentUser.username === 'Филипп';
        const myTokens = isInfinite ? Infinity : (me.tokens || 0);
        const canBuy = isInfinite || myTokens >= item.price;
        $('itemModalIcon').innerHTML = item.img ? `<img src="${item.img}" style="width:96px;height:96px;object-fit:cover;border-radius:12px;" onerror="this.outerHTML='<div style=\\'font-size:72px;\\'>${item.icon}</div>'">` : `<div style="font-size:72px;">${item.icon}</div>`;
        $('itemModalName').textContent = item.name;
        $('itemModalDesc').textContent = item.desc;
        $('itemModalPrice').innerHTML = `${tokenIcon(28)} ${item.price}${isInfinite ? ' (у тебя ∞)' : ' (у тебя ' + myTokens + ')'}`;
        const inputEl = $('itemModalInput');
        if (item.id === 'broadcast') { inputEl.style.display = 'block'; inputEl.placeholder = 'Текст broadcast-сообщения...'; inputEl.value = ''; }
        else if (item.id === 'nick_anim') { inputEl.style.display = 'block'; inputEl.placeholder = 'огонь / вода / молния / радуга'; inputEl.value = ''; }
        else if (item.id === 'status_custom') { inputEl.style.display = 'block'; inputEl.placeholder = 'Твой статус (до 30 символов)'; inputEl.value = ''; }
        else if (item.id === 'nick_change') { inputEl.style.display = 'block'; inputEl.placeholder = 'Новый ник'; inputEl.value = ''; }
        else if (item.id === 'promo_own') { inputEl.style.display = 'block'; inputEl.placeholder = 'Твой промокод'; inputEl.value = ''; }
        else { inputEl.style.display = 'none'; }
        const buyBtn = $('itemModalBuy');
        buyBtn.textContent = canBuy ? 'Купить' : 'Не хватает';
        buyBtn.disabled = !canBuy;
        buyBtn.onclick = () => buyTokenShopItem(item.id);
        $('itemModalCancel').onclick = () => $('itemModal').classList.add('hidden');
        $('itemModal').classList.remove('hidden');
    });
};

window.buyTokenShopItem = function(itemId) {
    const item = TOKEN_SHOP_ITEMS.find(i => i.id === itemId);
    if (!item) return;
    let extraText = '';
    if (item.id === 'broadcast') { extraText = $('itemModalInput').value.trim(); if (!extraText) { toast('❌ Введи текст broadcast'); return; } }
    if (item.id === 'nick_anim') {
        const choice = $('itemModalInput').value.trim().toLowerCase();
        if (!['огонь','вода','молния','радуга'].includes(choice)) { toast('❌ Напиши: огонь, вода, молния или радуга'); return; }
        extraText = choice;
    }
    if (item.id === 'status_custom') { extraText = $('itemModalInput').value.trim(); if (!extraText) { toast('❌ Введи статус'); return; } }
    if (item.id === 'nick_change') { extraText = $('itemModalInput').value.trim(); if (!extraText || extraText.length < 3) { toast('❌ Ник минимум 3 символа'); return; } }
    if (item.id === 'promo_own') { extraText = $('itemModalInput').value.trim().toUpperCase(); if (!extraText) { toast('❌ Введи промокод'); return; } }
    if (!confirm(`Купить "${item.name}" за ${item.price}💎?`)) return;
    db.ref('users/' + currentUser.username).once('value').then(s => {
        const me = s.val() || {};
        const isInfinite = me.tokens === Infinity || me.tokens === "Infinity" || currentUser.username === 'Филипп';
        const myTokens = isInfinite ? Infinity : (me.tokens || 0);
        if (!isInfinite && myTokens < item.price) { toast('❌ Недостаточно токенов'); return; }
        const updates = {};
        if (!isInfinite) updates['tokens'] = myTokens - item.price;
        if (item.id === 'boost_2x') updates['boost2xExpiresAt'] = Date.now() + 24 * 3600000;
        if (item.id === 'boost_fish') updates['boostFishExpiresAt'] = Date.now() + 24 * 3600000;
        if (item.id === 'verified') updates['verified'] = true;
        if (item.id === 'nick_anim') updates['nickAnim'] = extraText;
        if (item.id === 'vip_badge') updates['vipBadge'] = true;
        if (item.id === 'tourn_badge') updates['tournamentBadge'] = true;
        if (item.id === 'legend_badge') updates['legendBadge'] = true;
        if (item.id === 'emoji_custom') updates['customEmoji'] = true;
        if (item.id === 'theme_custom') updates['customTheme'] = true;
        if (item.id === 'avatar_custom') updates['canSetAvatar'] = true;
        if (item.id === 'invite_friend') updates['inviteFriend'] = true;
        if (item.id === 'status_custom') updates['customStatus'] = extraText;
        if (item.id === 'free_case') updates['freeCase'] = (me.freeCase || 0) + 1;
        if (item.id === 'free_spin') updates['freeSpins'] = (me.freeSpins || 0) + 3;
        db.ref('users/' + currentUser.username).update(updates).then(() => {
            if (item.id === 'coins_5000') {
                const cur = me.coins === Infinity || me.coins === "Infinity" ? Infinity : (me.coins || 0);
                if (cur !== Infinity) db.ref('users/' + currentUser.username + '/coins').set(cur + 5000);
            }
            if (item.id === 'unban_self') db.ref('bans/' + currentUser.username).remove();
            if (item.id === 'kotos_custom' || item.id === 'nick_change' || item.id === 'promo_own') {
                const ref = db.ref('tokenRequests').push();
                ref.set({ id: ref.key, username: currentUser.username, type: item.id === 'kotos_custom' ? 'shop_item' : (item.id === 'nick_change' ? 'nick_change' : 'promo_own'), itemId: item.id, itemName: item.name, price: item.price, newNick: extraText, promoCode: extraText, status: 'pending', time: Date.now() });
            }
            if (item.id === 'broadcast') {
                db.ref('messages').push({ username: '📢 SYSTEM', text: `📢 ${currentUser.username} вещает: ${extraText}`, timestamp: firebase.database.ServerValue.TIMESTAMP, isSystem: true });
            }
            const toasts = {
                kotos_custom: '🖌️ Котость заказана — админ нарисует её в ближайшее время',
                broadcast: '📢 Broadcast отправлен!',
                nick_anim: `✨ Анимация "${extraText}" активирована!`,
                avatar_custom: '✅ Аватарка разблокирована!',
                theme_custom: '🌈 Своя тема открыта! Открой 🎨 в шапке',
                emoji_custom: '🎭 Кастомный эмодзи активирован!',
                invite_friend: '🎫 Приглашение друга активировано!',
                boost_2x: '⚡ ×2 койнов на 24 часа!',
                boost_fish: '🎣 ×2 клёва на 24 часа!',
                verified: '⭐ Галочка «Проверенный» установлена!',
                vip_badge: '👑 VIP-бейдж установлен!',
                tourn_badge: '🏆 Бейдж турнира установлен!',
                legend_badge: '🎖️ Бейдж «Легенда» установлен!',
                free_spin: '🎰 +3 бесплатных спина!',
                free_case: '🎁 +1 бесплатный кейс!',
                coins_5000: '💰 +5 000 🐾!',
                unban_self: '🔓 Ты разбанен!',
                status_custom: `🎭 Статус "${extraText}" установлен!`,
                nick_change: '✏️ Заявка на смену ника отправлена админу',
                promo_own: '🔑 Заявка на свой промокод отправлена админу'
            };
            toast(toasts[item.id] || `✅ Куплено: ${item.name}`);
            addAuditLog('token_shop_buy', currentUser.username, item.price);
            $('itemModal').classList.add('hidden');
            rTokenShop();
        });
    });
};

// ============ 🎁 КЕЙСЫ ============
let casePending = null;

window.applyVipRole = function(wonRole, currentVip) {
    const wonLevel = ROLES[wonRole].level;
    const curLevel = currentVip ? ROLES[currentVip].level : 0;
    if (wonLevel > curLevel) return { role: wonRole, note: '', changed: true };
    return { role: currentVip || 'igrok', note: `Выпал ${ROLES[wonRole].name}, но у тебя уже ${currentVip ? ROLES[currentVip].name : 'роль'} — оставили`, changed: false };
};

window.pickCaseRole = function() {
    const rand = Math.random() * 100;
    let cum = 0, won = null;
    for (const drop of CASE_DROP) { cum += drop.chance; if (rand <= cum) { won = drop.role; break; } }
    return won || 'baron';
};

window.chargeCase = async function() {
    const meSnap = await db.ref('users/' + currentUser.username).once('value');
    const me = meSnap.val();
    const isInfinite = me.tokens === Infinity || me.tokens === "Infinity" || currentUser.username === 'Филипп';
    if (me.freeCase && me.freeCase > 0) {
        await db.ref('users/' + currentUser.username + '/freeCase').set(me.freeCase - 1);
        toast('🎁 Использован бесплатный кейс!');
        return { ok: true, me };
    }
    if (!isInfinite && (me.tokens || 0) < 99) return { ok: false, msg: '❌ Нужно 99 токенов' };
    if (!isInfinite) await db.ref('users/' + currentUser.username + '/tokens').set((me.tokens || 0) - 99);
    return { ok: true, me };
};

window.openCase = function(type) {
    const overlay = $('caseOverlay');
    const body = $('caseBody');
    const title = $('caseTitle');
    const hint = $('caseHint');
    $('casePrize').textContent = '';
    overlay.classList.remove('hidden');
    casePending = { type, won: pickCaseRole(), opened: false };
    $('caseClose').onclick = () => { overlay.classList.add('hidden'); rRoles(); };
    if (type === 'chests') {
        title.textContent = '📦 ВЫБЕРИ СУНДУК';
        hint.textContent = 'Нажми на любой из 8 сундуков — внутри привилегия!';
        let html = '<div class="chests-grid">';
        for (let i = 0; i < 8; i++) html += `<div class="chest" data-i="${i}"><img src="${IMG.chest_closed}" alt="Сундук"></div>`;
        html += '</div>';
        body.innerHTML = html;
        document.querySelectorAll('.chest').forEach(c => c.onclick = () => openChest(c));
    } else if (type === 'mobs') {
        title.textContent = '👹 УДАРЬ ПО МОБУ';
        hint.textContent = 'Кликни по мобу — он погибнет, и ты получишь привилегию!';
        const mobs = [IMG.mob1, IMG.mob2, IMG.mob3, IMG.mob4, IMG.mob5, IMG.mob6];
        let html = '<div class="mobs-grid">';
        mobs.forEach((src, i) => html += `<div class="mob" data-i="${i}"><img src="${src}" alt="Моб"></div>`);
        html += '</div>';
        body.innerHTML = html;
        document.querySelectorAll('.mob').forEach(m => m.onclick = () => hitMob(m));
    } else if (type === 'roulette') {
        title.textContent = '🎡 РУЛЕТКА УДАЧИ';
        hint.textContent = 'Нажми — стрелка закрутится и покажет приз!';
        body.innerHTML = `<div class="roulette-wrap"><div class="roulette-arrow">⬇️</div><canvas id="rouletteCanvas" class="roulette-wheel" width="300" height="300"></canvas></div><div style="text-align:center; margin-top:16px;"><button class="btn-gold" id="spinRoulette" style="padding:12px 28px; border-radius:24px; border:none; font-weight:800; font-size:16px; cursor:pointer;">🎡 Крутить!</button></div>`;
        drawRoulette(0);
        $('spinRoulette').onclick = spinRoulette;
    } else if (type === 'cards') {
        title.textContent = '🃏 ВЫБЕРИ КАРТУ';
        hint.textContent = 'Три карты. За одной — привилегия. Интуиция подскажет!';
        body.innerHTML = `<div class="cards-grid"><div class="card-item" data-i="0">🂠</div><div class="card-item" data-i="1">🂠</div><div class="card-item" data-i="2">🂠</div></div>`;
        document.querySelectorAll('.card-item').forEach(c => c.onclick = () => flipCard(c));
    }
};

window.openChest = async function(el) {
    if (casePending.opened) return;
    casePending.opened = true;
    const res = await chargeCase();
    if (!res.ok) { toast(res.msg); $('caseOverlay').classList.add('hidden'); return; }
    el.classList.add('opened');
    el.innerHTML = `<img src="${IMG.chest_open}" alt="Открыт">`;
    document.querySelectorAll('.chest').forEach(c => { if (c !== el) c.classList.add('disabled'); });
    await applyCaseWin(res.me);
};

window.hitMob = async function(el) {
    if (casePending.opened) return;
    casePending.opened = true;
    const res = await chargeCase();
    if (!res.ok) { toast(res.msg); $('caseOverlay').classList.add('hidden'); return; }
    el.classList.add('dead');
    el.innerHTML = '<div style="font-size:48px;">💀</div>';
    document.querySelectorAll('.mob').forEach(m => { if (m !== el) m.style.opacity = '0.2'; });
    await applyCaseWin(res.me);
};

window.flipCard = async function(el) {
    if (casePending.opened) return;
    casePending.opened = true;
    const res = await chargeCase();
    if (!res.ok) { toast(res.msg); $('caseOverlay').classList.add('hidden'); return; }
    el.classList.add('flipped');
    const r = ROLES[casePending.won];
    el.innerHTML = r.img ? `<img src="${r.img}" style="width:60px;height:60px;image-rendering:pixelated;">` : `<span style="font-size:48px;">${r.emoji}</span>`;
    document.querySelectorAll('.card-item').forEach(c => { if (c !== el) c.style.opacity = '0.3'; });
    await applyCaseWin(res.me);
};

window.drawRoulette = function(rotation) {
    const canvas = $('rouletteCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 150, cy = 150, r = 140;
    ctx.clearRect(0, 0, 300, 300);
    const segments = [
        { key: 'geroy',  emoji: '⚔️', name: 'Герой',  color: '#4169e1' },
        { key: 'aspid',  emoji: '🐍', name: 'Аспид',  color: '#2e7d32' },
        { key: 'skvid',  emoji: '🦑', name: 'Сквид',  color: '#9c27b0' },
        { key: 'glava',  emoji: '👑', name: 'Глава',  color: '#ffd700' },
        { key: 'elita',  emoji: '💎', name: 'Элита',  color: '#00bcd4' },
        { key: 'titan',  emoji: '🔱', name: 'Титан',  color: '#ff9800' },
        { key: 'prints', emoji: '🤴', name: 'Принц',  color: '#9c27b0' },
        { key: 'knyaz',  emoji: '👑✨', name: 'Князь', color: '#ff0000' }
    ];
    const seg = 2 * Math.PI / segments.length;
    for (let i = 0; i < segments.length; i++) {
        const a1 = i * seg + rotation;
        const a2 = (i + 1) * seg + rotation;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a1, a2); ctx.closePath();
        ctx.fillStyle = segments[i].color; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(a1 + seg / 2);
        ctx.textAlign = 'right'; ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif';
        ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 4;
        ctx.fillText(segments[i].emoji + ' ' + segments[i].name, r - 12, 5);
        ctx.restore();
    }
    ctx.beginPath(); ctx.arc(cx, cy, 20, 0, 2 * Math.PI); ctx.fillStyle = '#fff'; ctx.fill();
};

window.spinRoulette = async function() {
    if (casePending.opened) return;
    casePending.opened = true;
    const res = await chargeCase();
    if (!res.ok) { toast(res.msg); $('caseOverlay').classList.add('hidden'); return; }
    $('spinRoulette').disabled = true;
    const rouletteRoles = ['geroy','aspid','skvid','glava','elita','titan','prints','knyaz'];
    casePending.won = rouletteRoles[Math.floor(Math.random() * rouletteRoles.length)];
    const totalRot = Math.PI * 2 * (5 + Math.random() * 3);
    const dur = 3500, start = Date.now();
    function anim() {
        const p = Math.min((Date.now() - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        drawRoulette(totalRot * e);
        if (p < 1) requestAnimationFrame(anim);
        else applyCaseWin(res.me);
    }
    requestAnimationFrame(anim);
};

window.applyCaseWin = async function(me) {
    const won = casePending.won;
    const currentVip = getCurrentVipRole(me);
    const result = applyVipRole(won, currentVip);
    const r = ROLES[result.role];
    const expiresAt = Date.now() + 30 * 86400000;
    await db.ref('users/' + currentUser.username).update({ vipRole: result.role, vipExpiresAt: expiresAt });
    const prizeEl = $('casePrize');
    let prizeHtml = '';
    if (result.changed) prizeHtml = `🎉 ВЫПАЛО:<br>${r.img ? `<img src="${r.img}" style="width:64px;height:64px;image-rendering:pixelated;vertical-align:middle;">` : r.emoji} <b>${r.name}</b> на 30 дней!`;
    else prizeHtml = `🎁 ${result.note}`;
    prizeEl.innerHTML = prizeHtml;
    addAuditLog('case_open', currentUser.username, 0);
    toast(result.changed ? `🎉 ${r.name} на 30 дней!` : `🎁 Роль не понижена`);
    if (activeTab === 'abilities') rAbilities();
};

// ============ ПОКУПКА РОЛЕЙ ============
window.buyRole = function(roleKey, days, priceRub) {
    const r = ROLES[roleKey];
    const label = days === -1 ? 'навсегда' : days + ' дней';
    if (confirm(`Купить ${r.name} ${label} за ${priceRub}₽?\n\nЗаявка уйдёт админу.`)) {
        const ref = db.ref('tokenRequests').push();
        ref.set({ id: ref.key, username: currentUser.username, type: 'buy_role', role: roleKey, days: days, priceRub: priceRub, status: 'pending', time: Date.now() });
        toast(`✅ Заявка на ${r.name} отправлена`);
    }
};

window.buyRoleWithTokens = function(roleKey, days, priceTokens) {
    const r = ROLES[roleKey];
    const label = days === -1 ? 'навсегда' : days + ' дней';
    if (confirm(`Купить ${r.name} ${label} за ${priceTokens}💎?`)) {
        db.ref('users/' + currentUser.username).once('value').then(s => {
            const me = s.val();
            const myTokens = me.tokens;
            const isInfinite = myTokens === Infinity || myTokens === "Infinity" || currentUser.username === 'Филипп';
            if (!isInfinite && (myTokens || 0) < priceTokens) { toast('❌ Недостаточно токенов'); return; }
            const newTokens = isInfinite ? "Infinity" : (myTokens - priceTokens);
            const expiresAt = days === -1 ? -1 : Date.now() + days * 86400000;
            db.ref('users/' + currentUser.username).update({ tokens: newTokens, vipRole: roleKey, vipExpiresAt: expiresAt }).then(() => { toast(`✅ Куплено: ${r.name} ${label}!`); rRoles(); });
        });
    }
};

// ============ 🃏 БЛЭКДЖЕК ============
const BJ_SUITS = [
    { sym: '♠', color: 'black' }, { sym: '♥', color: 'red' },
    { sym: '♦', color: 'red' }, { sym: '♣', color: 'black' }
];
const BJ_RANKS = [
    { r: '2', v: 2 }, { r: '3', v: 3 }, { r: '4', v: 4 }, { r: '5', v: 5 },
    { r: '6', v: 6 }, { r: '7', v: 7 }, { r: '8', v: 8 }, { r: '9', v: 9 },
    { r: '10', v: 10 }, { r: 'J', v: 10 }, { r: 'Q', v: 10 }, { r: 'K', v: 10 },
    { r: 'A', v: 11 }
];
let bjDeck = [], bjPlayer = [], bjDealer = [], bjBet = 0, bjPhase = 'idle';
let bjSessionGames = 0, bjSessionWins = 0, bjSessionProfit = 0, bjDoubled = false;

window.bjBuildDeck = function() {
    const deck = [];
    for (let d = 0; d < 4; d++) for (const s of BJ_SUITS) for (const r of BJ_RANKS) deck.push({ suit: s.sym, color: s.color, rank: r.r, value: r.v });
    for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
    return deck;
};
window.bjDraw = function() { if (bjDeck.length < 20) bjDeck = bjBuildDeck(); return bjDeck.pop(); };
window.bjScore = function(hand) { let sum = 0, aces = 0; for (const c of hand) { sum += c.value; if (c.rank === 'A') aces++; } while (sum > 21 && aces > 0) { sum -= 10; aces--; } return sum; };
window.bjIsBlackjack = function(hand) { return hand.length === 2 && bjScore(hand) === 21; };
window.bjCardHTML = function(card, hidden) {
    if (hidden) return `<div class="bj-card back"></div>`;
    return `<div class="bj-card ${card.color}"><div class="suit-top">${card.suit}</div><div class="rank-center">${card.rank}</div><div class="suit-bottom">${card.suit}</div></div>`;
};

window.rBlackjack = function() {
    if (!currentUser) return;
    const coins = fc(currentUser.coins);
    let h = '<div class="divider">🃏 КОТОБЛЭКДЖЕК</div>';
    h += `<div class="text-sm" style="text-align:center; margin-bottom:8px;">Набери 21 или ближе, чем дилер. Блэкджек = ×2.5</div>`;
    h += `<div class="bj-table" id="bjTable">
        <div class="bj-dealer-zone"><div class="bj-zone-label">🎩 ДИЛЕР</div><div class="bj-cards" id="bjDealerCards"></div><div class="bj-score" id="bjDealerScore">—</div></div>
        <div class="bj-player-zone"><div class="bj-zone-label">🐱 ВЫ</div><div class="bj-cards" id="bjPlayerCards"></div><div class="bj-score" id="bjPlayerScore">—</div></div>
        <div class="bj-result" id="bjResult"></div>
    </div>`;
    h += `<div class="bj-bet-row" id="bjBetRow"><input class="bj-bet-input" id="bjBet" type="number" value="100" min="10" step="10"><button class="bj-btn bj-btn-deal" id="bjDealBtn">🎴 РАЗДАТЬ</button></div>
    <div class="bj-controls" id="bjControls" style="display:none;"><button class="bj-btn bj-btn-hit" id="bjHitBtn">🃏 ВЗЯТЬ</button><button class="bj-btn bj-btn-stand" id="bjStandBtn">✋ ХВАТИТ</button><button class="bj-btn bj-btn-double" id="bjDoubleBtn">×2</button></div>
    <div class="bj-stats"><div>💰 Баланс: <b id="bjBalance">${coins}</b> 🐾</div><div>🎮 Игр: <b id="bjGames">${bjSessionGames}</b></div><div>🏆 Побед: <b id="bjWins">${bjSessionWins}</b></div><div>📈 Профит: <b id="bjProfit">${bjSessionProfit >= 0 ? '+' : ''}${bjSessionProfit}</b> 🐾</div></div>`;
    h += `<div class="divider">📖 ПРАВИЛА</div><div class="card"><div class="text-sm">• Блэкджек — <b>×2.5</b></div><div class="text-sm">• Победа — <b>×2</b></div><div class="text-sm">• Ничья — <b>возврат ставки</b></div><div class="text-sm">• Дилер берёт до 17</div><div class="text-sm">• Дилер имеет блэкджек — вы проигрываете (кроме вашего блэкджека → ничья)</div><div class="text-sm">• Можно <b>удвоить</b> — берёте 1 карту, ставка ×2</div></div>`;
    $('feedContainer').innerHTML = h;
    bjPhase = 'idle'; bjPlayer = []; bjDealer = []; bjBet = 0; bjDoubled = false;
    renderBlackjackTable();
    $('bjDealBtn').onclick = bjDeal;
    document.getElementById('bjHitBtn').onclick = bjHit;
    document.getElementById('bjStandBtn').onclick = bjStand;
    document.getElementById('bjDoubleBtn').onclick = bjDouble;
};

window.renderBlackjackTable = function(hideDealer = false) {
    const playerHTML = bjPlayer.map(c => bjCardHTML(c)).join('');
    const dealerHTML = bjDealer.map((c, i) => bjCardHTML(c, hideDealer && i === 1)).join('');
    if ($('bjPlayerCards')) $('bjPlayerCards').innerHTML = playerHTML;
    if ($('bjDealerCards')) $('bjDealerCards').innerHTML = dealerHTML;
    if ($('bjPlayerScore')) {
        if (bjPlayer.length) { const s = bjScore(bjPlayer); const el = $('bjPlayerScore'); el.textContent = s + (s === 21 && bjPlayer.length === 2 ? ' 🎉 BLACKJACK!' : ''); el.className = 'bj-score' + (s > 21 ? ' bust' : bjIsBlackjack(bjPlayer) ? ' bj' : ''); }
        else $('bjPlayerScore').textContent = '—';
    }
    if ($('bjDealerScore')) {
        if (bjDealer.length) { if (hideDealer) $('bjDealerScore').textContent = bjScore([bjDealer[0]]) + ' + ?'; else { const s = bjScore(bjDealer); const el = $('bjDealerScore'); el.textContent = s; el.className = 'bj-score' + (s > 21 ? ' bust' : ''); } }
        else $('bjDealerScore').textContent = '—';
    }
    if ($('bjBalance')) $('bjBalance').textContent = fc(currentUser.coins);
    if ($('bjGames')) $('bjGames').textContent = bjSessionGames;
    if ($('bjWins')) $('bjWins').textContent = bjSessionWins;
    if ($('bjProfit')) $('bjProfit').textContent = (bjSessionProfit >= 0 ? '+' : '') + bjSessionProfit;
};

window.bjDeal = async function() {
    if (bjPhase !== 'idle') return;
    const bet = parseInt($('bjBet').value, 10);
    if (!bet || bet < 10) { toast('❌ Минимум 10 🐾'); return; }
    if (currentUser.coins !== Infinity && currentUser.coins < bet) { toast('❌ Недостаточно 🐾'); return; }
    bjBet = bet; bjDoubled = false;
    if (currentUser.coins !== Infinity) { currentUser.coins -= bet; db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins); addAuditLog('bj_bet', currentUser.username, bet); }
    bjDeck = bjBuildDeck();
    bjPlayer = [bjDraw(), bjDraw()];
    bjDealer = [bjDraw(), bjDraw()];
    bjPhase = 'playing';
    $('bjBetRow').style.display = 'none';
    $('bjControls').style.display = 'flex';
    $('bjBet').disabled = true;
    $('bjResult').textContent = '';
    renderBlackjackTable(true);
    if (bjIsBlackjack(bjPlayer) || bjIsBlackjack(bjDealer)) { bjPhase = 'dealer'; setTimeout(() => bjDealerPlay(), 800); }
    else updateBlackjackControls();
};

window.updateBlackjackControls = function() { const canDouble = bjPlayer.length === 2 && !bjDoubled && (currentUser.coins === Infinity || currentUser.coins >= bjBet); $('bjDoubleBtn').disabled = !canDouble; };

window.bjHit = function() {
    if (bjPhase !== 'playing') return;
    bjPlayer.push(bjDraw());
    renderBlackjackTable(true);
    const s = bjScore(bjPlayer);
    if (s > 21) { bjPhase = 'done'; setTimeout(() => bjEnd('lose', '💥 Перебор! ' + s + ' очков'), 500); }
    else if (s === 21) { bjPhase = 'dealer'; setTimeout(() => bjDealerPlay(), 500); }
    else updateBlackjackControls();
};

window.bjStand = function() { if (bjPhase !== 'playing') return; bjPhase = 'dealer'; bjDealerPlay(); };

window.bjDouble = function() {
    if (bjPhase !== 'playing') return;
    if (bjPlayer.length !== 2) return;
    if (currentUser.coins !== Infinity && currentUser.coins < bjBet) { toast('❌ Недостаточно 🐾'); return; }
    bjDoubled = true;
    if (currentUser.coins !== Infinity) { currentUser.coins -= bjBet; db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins); addAuditLog('bj_double', currentUser.username, bjBet); }
    bjBet *= 2;
    bjPlayer.push(bjDraw());
    bjPhase = 'dealer';
    renderBlackjackTable(true);
    setTimeout(() => bjDealerPlay(), 500);
};

window.bjDealerPlay = function() {
    renderBlackjackTable(false);
    if (bjIsBlackjack(bjDealer) && bjIsBlackjack(bjPlayer)) { bjEnd('push', '🤝 У обоих блэкджек! Ничья'); return; }
    if (bjIsBlackjack(bjDealer)) { bjEnd('lose', '🎩 У дилера блэкджек!'); return; }
    if (bjIsBlackjack(bjPlayer)) { bjEnd('bj', '🎉 БЛЭКДЖЕК! ×2.5'); return; }
    const step = () => {
        const ds = bjScore(bjDealer);
        if (ds < 17) { bjDealer.push(bjDraw()); renderBlackjackTable(false); setTimeout(step, 600); }
        else {
            const ps = bjScore(bjPlayer);
            if (ds > 21) bjEnd('win', `🎩 Дилер перебрал (${ds})! Вы выиграли!`);
            else if (ps > ds) bjEnd('win', `🎉 Вы выиграли! ${ps} против ${ds}`);
            else if (ps < ds) bjEnd('lose', `😢 Дилер выиграл. ${ps} против ${ds}`);
            else bjEnd('push', `🤝 Ничья! У обоих ${ps}`);
        }
    };
    setTimeout(step, 600);
};

window.bjEnd = function(result, message) {
    bjPhase = 'done';
    const resEl = $('bjResult');
    let payout = 0;
    if (result === 'bj') payout = Math.floor(bjBet * 2.5);
    else if (result === 'win') payout = bjBet * 2;
    else if (result === 'push') payout = bjBet;
    const profit = payout - bjBet;
    bjSessionGames++; if (profit > 0) bjSessionWins++;
    bjSessionProfit += profit;
    if (currentUser.coins !== Infinity && payout > 0) { currentUser.coins += payout; db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins); }
    addAuditLog('bj_' + result, currentUser.username, payout);
    resEl.textContent = message;
    resEl.className = 'bj-result ' + (result === 'win' || result === 'bj' ? 'win' : result === 'lose' ? 'lose' : 'push');
    renderBlackjackTable(false);
    updateQuestProgress('bj1'); updateQuestProgress('bj10');
    unlockAchievement('bj_player');
    if (result === 'bj') unlockAchievement('bj_blackjack');
    $('bjControls').style.display = 'none';
    $('bjBetRow').style.display = 'flex';
    $('bjBet').disabled = false;
    $('bjBet').value = 100;
    $('bjDealBtn').textContent = '🎴 ЕЩЁ РАЗ';
    $('bjDealBtn').onclick = () => {
        bjPlayer = []; bjDealer = []; bjPhase = 'idle'; bjDoubled = false; bjBet = 0;
        $('bjBet').value = 100;
        $('bjBet').disabled = false;
        $('bjDealBtn').textContent = '🎴 РАЗДАТЬ';
        $('bjDealBtn').onclick = bjDeal;
        $('bjResult').textContent = '';
        $('bjResult').className = 'bj-result';
        renderBlackjackTable();
    };
    if (result === 'bj') toast('🎉 БЛЭКДЖЕК! +' + payout + ' 🐾');
    else if (result === 'win') toast('🎉 Победа! +' + payout + ' 🐾');
    else if (result === 'push') toast('🤝 Ничья, возврат');
    else toast('😢 Проигрыш ' + bjBet + ' 🐾');
};