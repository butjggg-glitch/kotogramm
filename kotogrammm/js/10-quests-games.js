// ============================================================
// 10-quests-games.js — Квесты, Аукцион, Слоты, Рыбалка, Stickman, Марио, Колесо
// ============================================================

// ============ 🎯 КВЕСТЫ ============
window.getQuestResetKey = function(type) {
    if (type === 'daily') return new Date().toLocaleDateString('ru-RU');
    if (type === 'weekly') { const now = new Date(); const start = new Date(now.getFullYear(), 0, 1); const week = Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7); return `${now.getFullYear()}-W${week}`; }
    return '';
};

window.updateQuestProgress = async function(questId, amount = 1) {
    if (!currentUser) return;
    const quest = DAILY_QUESTS.find(q => q.id === questId) || WEEKLY_QUESTS.find(q => q.id === questId);
    if (!quest) return;
    const resetKey = getQuestResetKey(quest.type);
    const storageKey = `quest_reset_${currentUser.username}_${quest.id}`;
    if (localStorage.getItem(storageKey) !== resetKey) { await db.ref('questProgress/' + currentUser.username + '/' + questId).set(0); localStorage.setItem(storageKey, resetKey); }
    const snap = await db.ref('questProgress/' + currentUser.username + '/' + questId).once('value');
    await db.ref('questProgress/' + currentUser.username + '/' + questId).set((snap.val() || 0) + amount);
};

window.claimQuest = async function(questId) {
    const quest = DAILY_QUESTS.find(q => q.id === questId) || WEEKLY_QUESTS.find(q => q.id === questId);
    if (!quest) return;
    const snap = await db.ref('questProgress/' + currentUser.username + '/' + questId).once('value');
    if ((snap.val() || 0) >= quest.target) {
        if (currentUser.coins !== Infinity) await db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins + quest.reward);
        await db.ref('questProgress/' + currentUser.username + '/' + questId).set(0);
        toast(`✅ +${quest.reward}🐾`);
        addAuditLog('quest_reward', currentUser.username, quest.reward);
        rQuests();
    }
};

window.rQuests = function() {
    const dailyReset = getQuestResetKey('daily');
    const weeklyReset = getQuestResetKey('weekly');
    DAILY_QUESTS.forEach(q => { const key = `quest_reset_${currentUser.username}_${q.id}`; if (localStorage.getItem(key) !== dailyReset) { localStorage.setItem(key, dailyReset); db.ref('questProgress/' + currentUser.username + '/' + q.id).set(0); } });
    WEEKLY_QUESTS.forEach(q => { const key = `quest_reset_${currentUser.username}_${q.id}`; if (localStorage.getItem(key) !== weeklyReset) { localStorage.setItem(key, weeklyReset); db.ref('questProgress/' + currentUser.username + '/' + q.id).set(0); } });
    db.ref('questProgress/' + currentUser.username).once('value').then(snap => {
        const progress = snap.val() || {};
        const today = new Date().toLocaleDateString('ru-RU');
        let dailyClaimed = localStorage.getItem('daily_bonus_' + today) === currentUser.username;
        const annivClaimed = localStorage.getItem('anniversary_2024') === 'true';
        const summerClaimed = localStorage.getItem('kotogram_summer_2024') === 'true';
        let h = '';
        h += '<div class="divider">☀️ Летний Котопад 350🐾</div>';
        h += '<div class="card" style="background: linear-gradient(135deg, #FFF5E1, #FFE0B2); border: 1px solid #FF8C00; text-align: center; padding: 20px;">';
        h += '<div style="font-size: 40px;">🏖️🐱☀️</div><div class="text-bold" style="font-size: 18px; color: #D84315;">Летний фестиваль!</div>';
        if (!summerClaimed) h += '<div style="margin-top: 12px;"><button class="summer-btn" id="claimSummer">🎁 Забрать 350🐾</button></div>';
        else h += '<div class="text-sm">✅ Получено</div>';
        h += '</div>';
        h += '<div class="divider">🎂 Годовщина!</div>';
        h += '<div class="card" style="background: linear-gradient(135deg, #1a1a2e, #16213e); border: 1px solid #ffb300; text-align: center; padding: 20px;">';
        h += '<div style="font-size: 40px;">🎉🐱🎉</div><div class="text-bold" style="font-size: 18px;">Спасибо, что с нами!</div>';
        if (!annivClaimed) h += '<div style="margin-top: 12px;"><button class="anniversary-btn" id="claimAnniversary">🎂 Забрать 400🐾</button></div>';
        else h += '<div class="text-sm">✅ Получено</div>';
        h += '</div>';
        h += '<div class="divider">🎁 Ежедневный бонус</div>';
        if (!dailyClaimed) h += `<button class="btn btn-green" id="claimDaily">Забрать 50🐾</button>`;
        else h += '<div class="text-sm">✅ Уже получен</div>';
        h += '<div class="divider">🎯 Ежедневные</div>';
        DAILY_QUESTS.forEach(q => { const cur = progress[q.id] || 0; h += `<div class="quest-item"><span>${q.desc} (${cur}/${q.target})</span><span>${cur >= q.target ? `<button class="btn-sm btn-purple" onclick="window.claimQuest('${q.id}')">${q.reward}🐾</button>` : '🔒'}</span></div>`; });
        h += '<div class="divider">📆 Еженедельные</div>';
        WEEKLY_QUESTS.forEach(q => { const cur = progress[q.id] || 0; h += `<div class="quest-item"><span>${q.desc} (${cur}/${q.target})</span><span>${cur >= q.target ? `<button class="btn-sm btn-purple" onclick="window.claimQuest('${q.id}')">${q.reward}🐾</button>` : '🔒'}</span></div>`; });
        $('feedContainer').innerHTML = h;
        const cD = document.getElementById('claimDaily'); if (cD) cD.onclick = () => { if (currentUser.coins !== Infinity) db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins + 50); localStorage.setItem('daily_bonus_' + today, currentUser.username); toast('✅ +50🐾'); addAuditLog('daily_bonus', currentUser.username, 50); rQuests(); };
        const cA = document.getElementById('claimAnniversary'); if (cA) cA.onclick = () => { if (currentUser.coins !== Infinity) db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins + 400); localStorage.setItem('anniversary_2024', 'true'); toast('🎉 +400🐾'); rQuests(); };
        const cS = document.getElementById('claimSummer'); if (cS) cS.onclick = () => { if (currentUser.coins !== Infinity) db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins + 350); localStorage.setItem('kotogram_summer_2024', 'true'); toast('☀️ +350🐾'); rQuests(); };
    });
};

// ============ 🔨 АУКЦИОН ============
window.rAuction = function() {
    db.ref('auction').once('value').then(snap => {
        const a = snap.val() || {};
        const isAdmin = currentUser.role === 'admin';
        let h = '<div class="divider">🔨 Аукцион</div>';
        h += `<div class="auction-card"><div class="text-bold">Лот: ${a.item || '🎁 Приз'}</div><div class="text-sm">Ставка: <b>${a.highestBid || 0}🐾</b> (${a.highestBidder || 'нет'})</div><div class="row-wrap" style="margin-top:8px;"><input class="bid-input" id="bidAmount" type="number" min="${(a.highestBid||0)+1}" placeholder="Ставка"><button class="btn-sm btn-orange" id="placeBid">Сделать ставку</button></div>`;
        if (isAdmin) h += `<div class="row-wrap" style="margin-top:8px;"><button class="btn-sm btn-red" id="resetAuction">Сбросить</button><button class="btn-sm btn-green" id="closeAuction">Завершить</button></div>`;
        h += `</div>`;
        $('feedContainer').innerHTML = h;
        document.getElementById('placeBid').onclick = () => {
            const amount = parseInt(document.getElementById('bidAmount').value);
            if (!amount || amount <= (a.highestBid||0)) return toast('Ставка выше?');
            if (currentUser.coins !== Infinity && currentUser.coins < amount) return toast('Недостаточно');
            if (currentUser.coins !== Infinity) db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins - amount);
            db.ref('auction').update({ highestBid: amount, highestBidder: currentUser.username });
            toast(`✅ ${amount}🐾`);
            unlockAchievement('auctioneer');
            rAuction();
        };
        if (isAdmin) {
            document.getElementById('resetAuction').onclick = () => { db.ref('auction').set({ status: 'active', item: '🎁 Таинственный приз', highestBid: 0, highestBidder: '', bids: {} }); toast('🔄 Сброшен'); rAuction(); };
            document.getElementById('closeAuction').onclick = () => { const w = a.highestBidder; if (w) toast(`🏆 ${w}`); db.ref('auction/status').set('closed'); rAuction(); };
        }
    });
};

// ============ 🎰 СЛОТЫ ============
const SLOT_SYMBOLS = [
    { id: 'cat',    img: '42c74cd5c7d77eb787bce7223dfb8dc1.webp', emoji: '🐱', weight: 29, name: 'Кот' },
    { id: 'fish',   img: '2001123007516_1.jpg', emoji: '🐟', weight: 29, name: 'Рыба' },
    { id: 'cherry', img: 'i (19).webp', emoji: '🍒', weight: 12, name: 'Вишня' },
    { id: 'lemon',  img: 'i (20).webp', emoji: '🍋', weight: 12, name: 'Лимон' },
    { id: 'bell',   img: 'i (21).webp', emoji: '🔔', weight: 8, name: 'Колокол' },
    { id: 'diamond',img: '70.png', emoji: '💎', weight: 5, name: 'Бриллиант' },
    { id: 'crown',  img: 'realistic-vector-golden-crown-isolated-w...avif', emoji: '👑', weight: 3, name: 'Корона' },
    { id: 'paw',    img: 'pngtree-two-brown-color-raised-cat-paws-png-image_15815995.png', emoji: '🐾', weight: 2, name: 'Лапка (WILD)' }
];
// 🟢 НЕРФ КАЗИНО: Уменьшили множители
const SLOT_MULTIPLIERS = { paw: 25, crown: 15, diamond: 8, bell: 5, cherry: 3, lemon: 3, cat: 2, fish: 2 };

window.pickSlotSymbol = function() {
    const total = SLOT_SYMBOLS.reduce((s, x) => s + x.weight, 0);
    let rand = Math.random() * total;
    for (const s of SLOT_SYMBOLS) { rand -= s.weight; if (rand <= 0) return s; }
    return SLOT_SYMBOLS[0];
};
window.slotSymbolHTML = function(sym) { return sym.img ? `<img src="${sym.img}" alt="${sym.name}" onerror="this.outerHTML='<span style=\\'font-size:52px;\\'>${sym.emoji}</span>'">` : `<span style="font-size:52px;">${sym.emoji}</span>`; };

window.calcSlotWin = function(ids) {
    const isPaw = id => id === 'paw';
    if (ids.every(isPaw)) return { mult: SLOT_MULTIPLIERS.paw, combo: '🐾🐾🐾 MEGA JACKPOT!' };
    if (ids.filter(isPaw).length === 2) return { mult: 3, combo: '🐾🐾 + любой' };
    if (ids.filter(isPaw).length === 1) { const rest = ids.filter(x => !isPaw(x)); if (rest[0] === rest[1]) return { mult: 2, combo: `🐾 + ${rest[0]}×2` }; return { mult: 0, combo: '' }; }
    if (ids[0] === ids[1] && ids[1] === ids[2]) return { mult: SLOT_MULTIPLIERS[ids[0]] || 2, combo: `${ids[0]} ×3` };
    if (ids[0] === ids[1] || ids[1] === ids[2] || ids[0] === ids[2]) return { mult: 1.2, combo: 'Пара' };
    return { mult: 0, combo: '' };
};

window.rSlots = function() {
    if (!currentUser) return;
    const coins = fc(currentUser.coins);
    let h = '<div class="divider">🎰 СЛОТЫ</div>';
    h += `<div class="slot-machine"><div class="slot-title">🐱 КОТО-СЛОТЫ 🎰</div><div class="slot-reels"><div class="slot-payline"></div><div class="slot-reel" id="reel0"></div><div class="slot-reel" id="reel1"></div><div class="slot-reel" id="reel2"></div></div><div class="slot-controls"><input class="slot-bet-input" id="slotBet" type="number" value="100" min="10" step="10"><button class="slot-spin-btn" id="slotSpinBtn">🎰 КРУТИТЬ</button></div><div class="slot-result" id="slotResult"></div><div class="slot-stats"><div>💰 Баланс: <b id="slotBalance">${coins}</b> 🐾</div><div>🎰 Спинов: <b id="slotSpins">0</b></div><div>🏆 Выигрыш: <b id="slotWin">0</b> 🐾</div></div><div class="slot-paytable"><div><span>🐾🐾🐾 Три лапки</span><span class="x">×25</span></div><div><span>👑👑👑 Корона</span><span class="x">×15</span></div><div><span>💎💎💎 Бриллиант</span><span class="x">×8</span></div><div><span>🔔🔔🔔 Колокол</span><span class="x">×5</span></div><div><span>🍒🍒🍒 / 🍋🍋🍋</span><span class="x">×3</span></div><div><span>🐱🐱🐱 / 🐟🐟🐟</span><span class="x">×2</span></div><div><span>🐾🐾 + любой</span><span class="x">×3</span></div><div><span>🐾 + 2 одинаковых</span><span class="x">×2</span></div><div><span>Любая пара</span><span class="x">×1.2</span></div></div></div>`;
    $('feedContainer').innerHTML = h;
    for (let i = 0; i < 3; i++) { const reel = $('reel' + i); let stripHTML = '<div class="slot-strip">'; for (let j = 0; j < 6; j++) stripHTML += slotSymbolHTML(pickSlotSymbol()); stripHTML += '</div>'; reel.innerHTML = stripHTML; }
    slotSessionSpins = 0; slotSessionWin = 0;
    $('slotSpinBtn').onclick = spinSlots;
};

window.spinSlots = function() {
    if (slotSpinning) return;
    const bet = parseInt($('slotBet').value, 10);
    if (!bet || bet < 10) { toast('❌ Минимум 10 🐾'); return; }
    if (currentUser.coins !== Infinity && currentUser.coins < bet) { toast('❌ Недостаточно 🐾'); return; }
    slotSpinning = true; $('slotSpinBtn').disabled = true; $('slotResult').textContent = '🎰 Крутим...';
    if (currentUser.coins !== Infinity) { currentUser.coins -= bet; db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins); addAuditLog('slot_bet', currentUser.username, bet); }
    const reels = [$('reel0'), $('reel1'), $('reel2')];
    const finalSyms = [pickSlotSymbol(), pickSlotSymbol(), pickSlotSymbol()];
    const stopTimes = [1200, 1700, 2200];
    reels.forEach((reel, i) => {
        reel.classList.add('spinning');
        let stripHTML = '<div class="slot-strip">';
        for (let j = 0; j < 8; j++) stripHTML += slotSymbolHTML(pickSlotSymbol());
        stripHTML += slotSymbolHTML(finalSyms[i]);
        stripHTML += '</div>';
        reel.innerHTML = stripHTML;
        setTimeout(() => { reel.classList.remove('spinning'); reel.innerHTML = `<div class="slot-strip" style="justify-content:center; height:100%;">${slotSymbolHTML(finalSyms[i])}</div>`; }, stopTimes[i]);
    });
    setTimeout(() => {
        const ids = finalSyms.map(s => s.id);
        const res = calcSlotWin(ids);
        const winAmount = Math.floor(bet * res.mult);
        if (res.mult > 0) {
            reels.forEach(r => r.classList.add('win'));
            if (currentUser.coins !== Infinity) { currentUser.coins += winAmount; db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins); }
            addAuditLog('slot_win', currentUser.username, winAmount);
            $('slotResult').innerHTML = `🎉 ${res.combo} — ВЫИГРЫШ ${winAmount} 🐾!`;
            toast(`🎉 +${winAmount} 🐾!`);
            unlockAchievement('slots_player');
            if (res.mult >= 25) unlockAchievement('slot_jackpot');
            slotSessionWin += winAmount;
        } else $('slotResult').textContent = '😢 Не повезло...';
        slotSessionSpins++;
        if ($('slotBalance')) $('slotBalance').textContent = fc(currentUser.coins);
        if ($('slotSpins')) $('slotSpins').textContent = slotSessionSpins;
        if ($('slotWin')) $('slotWin').textContent = slotSessionWin;
        $('slotSpinBtn').disabled = false;
        slotSpinning = false;
        updateQuestProgress('slot1'); updateQuestProgress('slot5');
    }, 2400);
};

// ============ 🎣 РЫБАЛКА ============
// 🟢 БАФФ РЫБАЛКИ: Цены увеличены
const FISH_LIST = [
    { id: 'perch',     name: 'Окунь',            img: '640px-Perca_fluviatilis-female_Siverskiy_...jpg', emoji: '🐟', price: 20,   chance: 30,   rarity: 'Обычная' },
    { id: 'goldfish',  name: 'Золотая рыбка',    img: 'istockphoto-509910394-612x612.jpg', emoji: '🐠', price: 40,   chance: 25,   rarity: 'Обычная' },
    { id: 'pike',      name: 'Щука',             img: 'Esox_lucius1.jpg', emoji: '🐡', price: 80,   chance: 18,   rarity: 'Средняя' },
    { id: 'catfish',   name: 'Сом',              img: 'a032218fcdc1f3fe0c362314627b9843.jpg', emoji: '🐈', price: 150,  chance: 12,   rarity: 'Средняя' },
    { id: 'octopus',   name: 'Осьминог',         img: 'i (22).webp', emoji: '🐙', price: 300,  chance: 6,    rarity: 'Редкая' },
    { id: 'squid',     name: 'Кальмар',          img: 'i (23).webp', emoji: '🦑', price: 500,  chance: 4,    rarity: 'Редкая' },
    { id: 'whale',     name: 'Кит',              img: 'clipart-watercolor-humpback-whale_454...avif', emoji: '🐋', price: 1000, chance: 2.5,  rarity: 'Очень редкая' },
    { id: 'legendary', name: 'Легендарная рыба', img: 'i (24).webp', emoji: '🐉', price: 3000, chance: 1.5,  rarity: 'Легендарная' },
    { id: 'kotoriba',  name: 'Кото-Рыба',        img: 'i (25).webp', emoji: '👑', price: 8000, chance: 1,    rarity: 'Мифическая' }
];
const FISHING_COST = 100, FISHING_BITE_MIN = 1500, FISHING_BITE_MAX = 4500, FISHING_CATCH_WINDOW = 3000, FISHING_ESCAPE_CHANCE = 10;

window.pickFish = function() {
    const total = FISH_LIST.reduce((s, f) => s + f.chance, 0);
    let rand = Math.random() * total;
    for (const f of FISH_LIST) { rand -= f.chance; if (rand <= 0) return f; }
    return FISH_LIST[0];
};
window.fishHTML = function(f) { return f.img ? `<img src="${f.img}" alt="${f.name}" style="width:64px;height:64px;object-fit:contain;" onerror="this.outerHTML='<span style=\\'font-size:48px;\\'>${f.emoji}</span>'">` : `<span style="font-size:48px;">${f.emoji}</span>`; };

window.rFishing = function() {
    if (!currentUser) return;
    const coins = fc(currentUser.coins);
    let h = '<div class="divider">🎣 КОТО-РЫБАЛКА</div>';
    h += `<div class="text-sm" style="text-align:center; margin-bottom:8px;">Забрось удочку, дождись поклёвки и жми <b>«ПОДСЕЧЬ!»</b> за 3 секунды!</div>`;
    h += `<div class="fish-pond" id="fishPond"><div class="fish-float" id="fishFloat"></div></div><button class="fish-catch-btn" id="fishCatchBtn">🪝 ПОДСЕЧЬ!</button>`;
    h += `<div class="fish-controls"><button class="fish-cast-btn" id="fishCastBtn">🎣 Забросить (${FISHING_COST} 🐾)</button></div><div class="fish-result" id="fishResult"></div>`;
    h += `<div class="fish-sadok"><div class="fish-sadok-title">🪣 САДОК (последние 5)</div><div class="fish-sadok-list" id="fishSadok"></div></div>`;
    h += `<div class="fish-table"><div style="font-weight:800;color:#ffd700;text-align:center;margin-bottom:6px;">🐟 РЫБЫ И ЦЕНЫ</div>${FISH_LIST.map(f => `<div><span>${f.emoji} ${f.name} <span class="chance">(${f.chance}%)</span></span><span class="price">${f.price} 🐾</span></div>`).join('')}<div style="margin-top:6px;font-size:11px;opacity:0.7;text-align:center;">💰 Баланс: <b id="fishBalance">${coins}</b> 🐾</div></div>`;
    $('feedContainer').innerHTML = h;
    renderSadok();
    $('fishCastBtn').onclick = castRod;
    $('fishCatchBtn').onclick = tryCatch;
    fishingActive = false;
};

window.renderSadok = function() {
    const sadok = JSON.parse(localStorage.getItem('fish_sadok_' + currentUser.username) || '[]');
    const el = $('fishSadok'); if (!el) return;
    if (!sadok.length) { el.innerHTML = '<div class="text-sm" style="text-align:center;">Пусто</div>'; return; }
    el.innerHTML = sadok.slice(-5).map(f => { const fish = FISH_LIST.find(x => x.id === f.id); if (!fish) return ''; return `<div class="fish-sadok-item">${fishHTML(fish)}<div>${fish.name}</div></div>`; }).join('');
};

window.castRod = function() {
    if (fishingActive) return;
    if (currentUser.coins !== Infinity && currentUser.coins < FISHING_COST) { toast('❌ Недостаточно 🐾'); return; }
    fishingActive = true;
    if (currentUser.coins !== Infinity) { currentUser.coins -= FISHING_COST; db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins); addAuditLog('fishing_cast', currentUser.username, FISHING_COST); }
    if ($('fishBalance')) $('fishBalance').textContent = fc(currentUser.coins);
    $('fishCastBtn').disabled = true;
    $('fishResult').textContent = '🎣 Заброшено... ждём поклёвки';
    const float = $('fishFloat');
    float.style.top = '45%';
    float.classList.add('waiting'); float.classList.remove('bite', 'gone');
    const delay = FISHING_BITE_MIN + Math.random() * (FISHING_BITE_MAX - FISHING_BITE_MIN);
    fishingTimeout = setTimeout(() => {
        if (!fishingActive) return;
        float.classList.remove('waiting'); float.classList.add('bite');
        $('fishResult').innerHTML = '❗ <b style="color:#ff0000;">КЛЮЁТ! ЖМИ «ПОДСЕЧЬ»!</b>';
        $('fishCatchBtn').classList.add('show');
        playBeep();
        if (navigator.vibrate) navigator.vibrate(200);
        fishingCatchTimeout = setTimeout(() => {
            if (fishingActive) {
                float.classList.remove('bite'); float.classList.add('gone');
                fishingActive = false; $('fishCatchBtn').classList.remove('show');
                $('fishResult').textContent = '😢 Сорвалась! Опоздал...';
                $('fishCastBtn').disabled = false;
                addAuditLog('fishing_fail', currentUser.username, 0);
                setTimeout(() => { float.classList.remove('gone'); float.style.top = '45%'; }, 500);
            }
        }, FISHING_CATCH_WINDOW);
    }, delay);
};

window.tryCatch = function() {
    if (!fishingActive) return;
    const float = $('fishFloat');
    const btn = $('fishCatchBtn');
    if (!float.classList.contains('bite')) {
        if (fishingTimeout) clearTimeout(fishingTimeout);
        if (fishingCatchTimeout) clearTimeout(fishingCatchTimeout);
        float.classList.remove('waiting', 'bite'); float.classList.add('gone');
        fishingActive = false; btn.classList.remove('show');
        $('fishResult').textContent = '😢 Сорвалась! Поспешил...';
        $('fishCastBtn').disabled = false;
        addAuditLog('fishing_fail', currentUser.username, 0);
        setTimeout(() => { float.classList.remove('gone'); float.style.top = '45%'; }, 500);
        return;
    }
    if (fishingCatchTimeout) clearTimeout(fishingCatchTimeout);
    fishingActive = false;
    float.classList.remove('bite', 'waiting'); float.classList.add('gone');
    btn.classList.remove('show');
    if (Math.random() * 100 < FISHING_ESCAPE_CHANCE) {
        $('fishResult').textContent = '😢 Сорвалась! Кажется, там было что-то большое...';
        $('fishCastBtn').disabled = false;
        addAuditLog('fishing_fail', currentUser.username, 0);
        setTimeout(() => { float.classList.remove('gone'); float.style.top = '45%'; }, 500);
        return;
    }
    const fish = pickFish();
    const winAmount = fish.price;
    if (currentUser.coins !== Infinity) { currentUser.coins += winAmount; db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins); }
    addAuditLog('fishing_catch', currentUser.username, winAmount);
    $('fishResult').innerHTML = `🎉 Поймал: ${fish.emoji} <b>${fish.name}</b>! +${winAmount} 🐾`;
    $('fishBalance').textContent = fc(currentUser.coins);
    const sadok = JSON.parse(localStorage.getItem('fish_sadok_' + currentUser.username) || '[]');
    sadok.push({ id: fish.id, time: Date.now() });
    localStorage.setItem('fish_sadok_' + currentUser.username, JSON.stringify(sadok));
    renderSadok();
    db.ref('fishingStats/' + currentUser.username + '/caught/' + fish.id).transaction(c => (c || 0) + 1);
    db.ref('fishingStats/' + currentUser.username + '/total').transaction(c => (c || 0) + 1);
    updateQuestProgress('fish1'); updateQuestProgress('fish10');
    db.ref('fishingStats/' + currentUser.username + '/total').once('value').then(s => { const total = s.val() || 0; if (total >= 10) unlockAchievement('fisher'); if (total >= 100) unlockAchievement('master_fisher'); });
    if (fish.id === 'kotoriba') unlockAchievement('legend_fisher');
    $('fishCastBtn').disabled = false;
    setTimeout(() => { float.classList.remove('gone'); float.style.top = '45%'; }, 500);
};

// ============ 🥊 STICKMAN FIGHT ============
const STICKMAN_ARENA_W = 600, STICKMAN_ARENA_H = 300;
const STICKMAN_GROUND = 260;
let stickmanMode = null;
let stickmanState = null;
let stickmanAnimId = null;
let stickmanKeys = {};
let stickmanBetAmount = 100;
let stickmanWeapon = null;
let stickmanMap = 0;
let stickmanLastWeaponSpawn = 0;
let stickmanLastMapChange = 0;

window.drawStickman = function(ctx, x, y, facing, color, state, blocking) {
    ctx.save(); ctx.translate(x, y); ctx.scale(facing, 1);
    ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -80, 14, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -66); ctx.lineTo(0, -20); ctx.stroke();
    const legPhase = state === 'walk' ? Math.sin(Date.now() / 150) * 8 : 0;
    ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(-12 + legPhase, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(12 - legPhase, 0); ctx.stroke();
    if (blocking) {
        ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(-15, -70); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(15, -70); ctx.stroke();
    } else if (state === 'punch') {
        ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(35, -55); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(-15, -45); ctx.stroke();
    } else if (state === 'kick') {
        ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(35, -10); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(-15, -45); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(15, -45); ctx.stroke();
    } else {
        ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(-15, -45); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -55); ctx.lineTo(15, -45); ctx.stroke();
    }
    ctx.restore();
};

window.initStickman = function(mode, difficulty = 'normal') {
    stickmanMode = mode;
    stickmanState = {
        p1: { x: 150, y: STICKMAN_GROUND, hp: 100, facing: 1, state: 'idle', blocking: false, cooldown: 0, vx: 0, vy: 0, onGround: true, combo: 0, lastHitTime: 0 },
        p2: { x: 450, y: STICKMAN_GROUND, hp: 100, facing: -1, state: 'idle', blocking: false, cooldown: 0, vx: 0, vy: 0, onGround: true },
        difficulty: difficulty, bet: 0, finished: false, winner: null
    };
    stickmanKeys = {};
    stickmanWeapon = null;
    stickmanMap = 0;
    stickmanLastWeaponSpawn = Date.now();
    stickmanLastMapChange = Date.now();
    renderStickmanArena();
};

window.renderStickmanArena = function() {
    const el = $('stickmanArena'); if (!el) return;
    el.innerHTML = `
        <div class="stickman-hp"><span>🐱 P1</span><div class="stickman-hp-bar"><div class="stickman-hp-fill" id="hp1" style="width:100%"></div></div><span id="hp1num">100</span></div>
        <div class="stickman-hp"><span>${stickmanMode === 'bot' ? '🤖 Бот' : '🐱 P2'}</span><div class="stickman-hp-bar"><div class="stickman-hp-fill p2" id="hp2" style="width:100%"></div></div><span id="hp2num">100</span></div>
        <div class="stickman-arena"><canvas class="stickman-canvas" id="stickmanCanvas" width="600" height="300"></canvas></div>
        <div class="stickman-controls" id="stickmanControls"></div>
        <div id="stickmanResult" style="text-align:center; font-weight:800; margin-top:8px; min-height:24px;"></div>
    `;
    const canvas = $('stickmanCanvas'); const ctx = canvas.getContext('2d');
    renderStickmanControls();
    if (stickmanAnimId) cancelAnimationFrame(stickmanAnimId);
    function loop() {
        if (!stickmanState || stickmanState.finished) return;
        updateStickman();
        drawStickmanArena(ctx);
        stickmanAnimId = requestAnimationFrame(loop);
    }
    loop();
};

window.renderStickmanControls = function() {
    const el = $('stickmanControls'); if (!el) return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (!isTouch) {
        if (stickmanMode === 'bot' || stickmanMode === 'online') el.innerHTML = `<div style="text-align:center; font-size:13px; opacity:0.8; padding:10px;">⌨️ Управление:<br><b>← →</b> — движение, <b>↑</b> — прыжок, <b>A</b> — удар, <b>S</b> — нога, <b>D</b> — блок</div>`;
        else el.innerHTML = `<div style="text-align:center; font-size:13px; opacity:0.8; padding:10px;">⌨️ <b>P1</b>: ← → ↑ A S D<br>⌨️ <b>P2</b>: J L I K O P</div>`;
        document.addEventListener('keydown', (e) => {
            if (!stickmanState || stickmanState.finished) return;
            const k = e.key.toLowerCase();
            if (k === 'arrowleft') stickmanKeys['1_left'] = true;
            if (k === 'arrowright') stickmanKeys['1_right'] = true;
            if (k === 'arrowup') stickmanKeys['1_jump'] = true;
            if (k === 'a') stickmanKeys['1_punch'] = true;
            if (k === 's') stickmanKeys['1_kick'] = true;
            if (k === 'd') stickmanKeys['1_block'] = true;
            if (stickmanMode === 'local') { if (k === 'j') stickmanKeys['2_left'] = true; if (k === 'l') stickmanKeys['2_right'] = true; if (k === 'i') stickmanKeys['2_jump'] = true; if (k === 'k') stickmanKeys['2_punch'] = true; if (k === 'o') stickmanKeys['2_kick'] = true; if (k === 'p') stickmanKeys['2_block'] = true; }
        });
        document.addEventListener('keyup', (e) => {
            if (!stickmanState || stickmanState.finished) return;
            const k = e.key.toLowerCase();
            if (k === 'arrowleft') stickmanKeys['1_left'] = false;
            if (k === 'arrowright') stickmanKeys['1_right'] = false;
            if (k === 'arrowup') stickmanKeys['1_jump'] = false;
            if (k === 'a') stickmanKeys['1_punch'] = false;
            if (k === 's') stickmanKeys['1_kick'] = false;
            if (k === 'd') stickmanKeys['1_block'] = false;
            if (stickmanMode === 'local') { if (k === 'j') stickmanKeys['2_left'] = false; if (k === 'l') stickmanKeys['2_right'] = false; if (k === 'i') stickmanKeys['2_jump'] = false; if (k === 'k') stickmanKeys['2_punch'] = false; if (k === 'o') stickmanKeys['2_kick'] = false; if (k === 'p') stickmanKeys['2_block'] = false; }
        });
    } else {
        if (stickmanMode === 'bot' || stickmanMode === 'online') el.innerHTML = `<div style="display:flex; gap:4px; justify-content:center; flex-wrap:wrap;"><button class="stickman-btn" data-act="left">←</button><button class="stickman-btn jump" data-act="jump">↑</button><button class="stickman-btn" data-act="right">→</button><button class="stickman-btn punch" data-act="punch">👊</button><button class="stickman-btn kick" data-act="kick">🦶</button><button class="stickman-btn block" data-act="block">🛡️</button></div>`;
        else el.innerHTML = `<div style="display:flex; gap:10px; width:100%; justify-content:space-between; flex-wrap:wrap;"><div style="text-align:center; flex:1;"><div style="font-size:11px; color:#ffd700; margin-bottom:4px;">P1</div><button class="stickman-btn" data-p="1" data-act="left">←</button><button class="stickman-btn jump" data-p="1" data-act="jump">↑</button><button class="stickman-btn" data-p="1" data-act="right">→</button><button class="stickman-btn punch" data-p="1" data-act="punch">👊</button><button class="stickman-btn kick" data-p="1" data-act="kick">🦶</button><button class="stickman-btn block" data-p="1" data-act="block">🛡️</button></div><div style="text-align:center; flex:1;"><div style="font-size:11px; color:#ff5252; margin-bottom:4px;">P2</div><button class="stickman-btn" data-p="2" data-act="left">←</button><button class="stickman-btn jump" data-p="2" data-act="jump">↑</button><button class="stickman-btn" data-p="2" data-act="right">→</button><button class="stickman-btn punch" data-p="2" data-act="punch">👊</button><button class="stickman-btn kick" data-p="2" data-act="kick">🦶</button><button class="stickman-btn block" data-p="2" data-act="block">🛡️</button></div></div>`;
        el.querySelectorAll('.stickman-btn').forEach(btn => {
            const p = btn.dataset.p || '1'; const act = btn.dataset.act;
            btn.addEventListener('pointerdown', (e) => { e.preventDefault(); stickmanKeys[p + '_' + act] = true; });
            btn.addEventListener('pointerup', (e) => { e.preventDefault(); stickmanKeys[p + '_' + act] = false; });
            btn.addEventListener('pointerleave', () => { stickmanKeys[p + '_' + act] = false; });
        });
    }
};

window.updateStickman = function() {
    if (!stickmanState || stickmanState.finished) return;
    const s = stickmanState; const speed = 4; const now = Date.now();
    if (!stickmanLastMapChange) stickmanLastMapChange = now;
    if (now - stickmanLastMapChange > 30000) { stickmanMap = (stickmanMap + 1) % 3; stickmanLastMapChange = now; toast(`🗺️ Карта сменилась!`); }
    if (!stickmanLastWeaponSpawn) stickmanLastWeaponSpawn = now;
    if (now - stickmanLastWeaponSpawn > 10000 && !stickmanWeapon) {
        const weapons = [{ id: 'sword', emoji: '🗡️', dmg: 20, name: 'Меч' },{ id: 'hammer', emoji: '🔨', dmg: 35, name: 'Молот' },{ id: 'star', emoji: '⭐', dmg: 50, name: 'Звезда' }];
        stickmanWeapon = { ...weapons[Math.floor(Math.random() * weapons.length)], x: Math.random() * (STICKMAN_ARENA_W - 60) + 30, y: -50, vy: 2 };
        stickmanLastWeaponSpawn = now;
    }
    if (stickmanWeapon) {
        stickmanWeapon.y += stickmanWeapon.vy;
        if (stickmanWeapon.y > STICKMAN_GROUND - 30) stickmanWeapon.y = STICKMAN_GROUND - 30;
        const distP1 = Math.abs(s.p1.x - stickmanWeapon.x); const distP2 = Math.abs(s.p2.x - stickmanWeapon.x);
        if (distP1 < 40) { s.p1.weapon = stickmanWeapon; toast(`⚔️ P1 подобрал ${stickmanWeapon.name}!`); stickmanWeapon = null; }
        else if (distP2 < 40 && stickmanMode === 'local') { s.p2.weapon = stickmanWeapon; stickmanWeapon = null; }
    }
    if (stickmanKeys['1_left']) s.p1.x -= speed;
    if (stickmanKeys['1_right']) s.p1.x += speed;
    if (stickmanKeys['1_jump'] && s.p1.onGround) { s.p1.vy = -12; s.p1.onGround = false; }
    s.p1.blocking = !!stickmanKeys['1_block'];
    if (stickmanKeys['1_punch'] && s.p1.cooldown <= 0) {
        s.p1.state = 'punch'; s.p1.cooldown = 20;
        const isCombo = (now - s.p1.lastHitTime < 1500); let dmg = isCombo ? 16 : 8; if (s.p1.weapon) dmg += s.p1.weapon.dmg;
        s.p1.combo = isCombo ? s.p1.combo + 1 : 1; s.p1.lastHitTime = now; checkStickmanHit('p1', 'p2', dmg, isCombo);
    }
    if (stickmanKeys['1_kick'] && s.p1.cooldown <= 0) {
        s.p1.state = 'kick'; s.p1.cooldown = 30;
        const isCombo = (now - s.p1.lastHitTime < 1500); let dmg = isCombo ? 28 : 14; if (s.p1.weapon) dmg += s.p1.weapon.dmg;
        s.p1.combo = isCombo ? s.p1.combo + 1 : 1; s.p1.lastHitTime = now; checkStickmanHit('p1', 'p2', dmg, isCombo);
    }
    if (stickmanMode === 'local') {
        if (stickmanKeys['2_left']) s.p2.x -= speed;
        if (stickmanKeys['2_right']) s.p2.x += speed;
        if (stickmanKeys['2_jump'] && s.p2.onGround) { s.p2.vy = -12; s.p2.onGround = false; }
        s.p2.blocking = !!stickmanKeys['2_block'];
        if (stickmanKeys['2_punch'] && s.p2.cooldown <= 0) { s.p2.state = 'punch'; s.p2.cooldown = 20; let dmg = 8; if (s.p2.weapon) dmg += s.p2.weapon.dmg; checkStickmanHit('p2', 'p1', dmg, false); }
        if (stickmanKeys['2_kick'] && s.p2.cooldown <= 0) { s.p2.state = 'kick'; s.p2.cooldown = 30; let dmg = 14; if (s.p2.weapon) dmg += s.p2.weapon.dmg; checkStickmanHit('p2', 'p1', dmg, false); }
    } else if (stickmanMode === 'bot') {
        const dist = s.p1.x - s.p2.x; let botSpeed = speed, botChance = 0.05, botBlockChance = 0.02, botDmgMult = 1;
        if (s.difficulty === 'easy') { botSpeed = 2; botChance = 0.02; botBlockChance = 0.01; botDmgMult = 0.5; }
        if (s.difficulty === 'hard') { botSpeed = 6; botChance = 0.15; botBlockChance = 0.1; botDmgMult = 1.5; }
        if (Math.abs(dist) > 60) s.p2.x += dist > 0 ? botSpeed : -botSpeed;
        if (stickmanWeapon && Math.abs(s.p2.x - stickmanWeapon.x) < 40) { s.p2.weapon = stickmanWeapon; stickmanWeapon = null; }
        if (Math.abs(dist) < 80 && s.p2.cooldown <= 0 && Math.random() < botChance) { s.p2.state = 'punch'; s.p2.cooldown = 25; let dmg = Math.floor(8 * botDmgMult); if (s.p2.weapon) dmg += s.p2.weapon.dmg; checkStickmanHit('p2', 'p1', dmg, false); }
        s.p2.blocking = Math.random() < botBlockChance;
    }
    [s.p1, s.p2].forEach(p => {
        p.vy += 0.6; p.y += p.vy;
        if (p.y >= STICKMAN_GROUND) { p.y = STICKMAN_GROUND; p.vy = 0; p.onGround = true; }
        p.x = Math.max(30, Math.min(STICKMAN_ARENA_W - 30, p.x));
        if (p.cooldown > 0) p.cooldown--;
        if (p.state !== 'idle' && p.cooldown <= 0) p.state = 'idle';
    });
    s.p1.facing = s.p2.x > s.p1.x ? 1 : -1; s.p2.facing = s.p1.x > s.p2.x ? 1 : -1;
    if ($('hp1')) $('hp1').style.width = Math.max(0, s.p1.hp) + '%';
    if ($('hp2')) $('hp2').style.width = Math.max(0, s.p2.hp) + '%';
    if ($('hp1num')) $('hp1num').textContent = Math.max(0, s.p1.hp);
    if ($('hp2num')) $('hp2num').textContent = Math.max(0, s.p2.hp);
    if (s.p1.hp <= 0 && !s.finished) { s.finished = true; s.winner = 'p2'; onStickmanEnd(); }
    if (s.p2.hp <= 0 && !s.finished) { s.finished = true; s.winner = 'p1'; onStickmanEnd(); }
};

window.checkStickmanHit = function(attacker, defender, dmg, isCombo) {
    const s = stickmanState; const a = s[attacker], d = s[defender]; const dist = Math.abs(a.x - d.x);
    if (dist > 70) return;
    let realDmg = dmg; if (d.blocking) realDmg = Math.floor(dmg / 3); d.hp -= realDmg;
    if (isCombo && attacker === 'p1') {
        const resEl = $('stickmanResult');
        if (resEl) { resEl.innerHTML = `<span style="color:#ffd700; font-weight:900; animation: slotWin 0.5s;">🔥 COMBO x${a.combo}!</span>`; setTimeout(() => { if (!s.finished) resEl.innerHTML = ''; }, 1000); }
    }
};

window.drawStickmanArena = function(ctx) {
    const s = stickmanState; ctx.clearRect(0, 0, STICKMAN_ARENA_W, STICKMAN_ARENA_H);
    const grad = ctx.createLinearGradient(0, 0, 0, STICKMAN_ARENA_H);
    if (stickmanMap === 0) { grad.addColorStop(0, '#1a4a1a'); grad.addColorStop(0.6, '#2e7d32'); grad.addColorStop(1, '#1b5e20'); }
    else if (stickmanMap === 1) { grad.addColorStop(0, '#ffcc80'); grad.addColorStop(0.6, '#ff9800'); grad.addColorStop(1, '#e65100'); }
    else { grad.addColorStop(0, '#0a0a2e'); grad.addColorStop(0.6, '#1a1a4e'); grad.addColorStop(1, '#0d0d26'); }
    ctx.fillStyle = grad; ctx.fillRect(0, 0, STICKMAN_ARENA_W, STICKMAN_ARENA_H);
    ctx.fillStyle = stickmanMap === 1 ? '#8b4513' : '#2a2a3a'; ctx.fillRect(0, STICKMAN_GROUND, STICKMAN_ARENA_W, STICKMAN_ARENA_H - STICKMAN_GROUND);
    ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, STICKMAN_GROUND); ctx.lineTo(STICKMAN_ARENA_W, STICKMAN_GROUND); ctx.stroke();
    if (stickmanWeapon) { ctx.font = '30px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(stickmanWeapon.emoji, stickmanWeapon.x, stickmanWeapon.y); }
    drawStickman(ctx, s.p1.x, s.p1.y, s.p1.facing, '#4caf50', s.p1.state, s.p1.blocking);
    drawStickman(ctx, s.p2.x, s.p2.y, s.p2.facing, '#ff5252', s.p2.state, s.p2.blocking);
    if (s.p1.weapon) { ctx.font = '20px sans-serif'; ctx.fillText(s.p1.weapon.emoji, s.p1.x, s.p1.y - 90); }
    if (s.p2.weapon) { ctx.font = '20px sans-serif'; ctx.fillText(s.p2.weapon.emoji, s.p2.x, s.p2.y - 90); }
};

window.onStickmanEnd = function() {
    const s = stickmanState; const resEl= $('stickmanResult'); if (!resEl) return;
    if (s.winner === 'p1') resEl.innerHTML = '🎉 <span style="color:#4caf50;">P1 ПОБЕДИЛ!</span>';
    else resEl.innerHTML = '🎉 <span style="color:#ff5252;">P2 ПОБЕДИЛ!</span>';
    if (s.bet > 0 && stickmanMode !== 'local') {
        if (s.winner === 'p1') {
            if (currentUser.coins !== Infinity) { currentUser.coins += s.bet * 2; db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins); }
            toast(`🥊 Победа! +${s.bet * 2} 🐾`); addAuditLog('stickman_win', currentUser.username, s.bet); unlockAchievement('stickman_fighter');
        } else { toast(`🥊 Проигрыш ${s.bet} 🐾`); addAuditLog('stickman_lose', currentUser.username, s.bet); }
    }
    const el = $('stickmanControls');
    if (el) el.innerHTML = `<button class="stickman-btn punch" id="stickmanRestart" style="width:100%;">🔄 ЕЩЁ РАЗ</button>`;
    if ($('stickmanRestart')) $('stickmanRestart').onclick = () => rStickman();
};

window.rStickman = function() {
    if (!currentUser) return;
    let h = '<div class="divider">🥊 STICKMAN FIGHT</div>';
    h += `<div class="text-sm" style="text-align:center; margin-bottom:8px;">Выбери режим и сложность. Это игра на интерес!</div>`;
    h += `<div class="card"><div class="text-bold" style="margin-bottom:8px;">🎮 Режим</div><div class="row-wrap"><button class="stickman-mode-btn" data-mode="bot">🤖 Офлайн (vs Бот)</button><button class="stickman-mode-btn" data-mode="local">👥 2 на 1 телефоне</button></div></div>`;
    h += `<div class="card" id="difficultyCard" style="margin-top:8px;"><div class="text-bold" style="margin-bottom:8px;">🔥 Сложность бота</div><div class="row-wrap"><button class="stickman-mode-btn diff-btn" data-diff="easy">😴 Легко</button><button class="stickman-mode-btn diff-btn active" data-diff="normal">😐 Средне</button><button class="stickman-mode-btn diff-btn" data-diff="hard">💀 Сложно</button></div></div>`;
    h += `<div id="stickmanArena" style="margin-top:10px;"></div>`;
    h += `<button class="btn-sm btn-green" id="stickmanStart" style="margin-top:10px; width:100%; padding:14px; font-size:16px;">▶️ НАЧАТЬ БОЙ</button>`;
    $('feedContainer').innerHTML = h;
    let selectedMode = 'bot'; let selectedDiff = 'normal';
    document.querySelectorAll('.stickman-mode-btn[data-mode]').forEach(b => {
        b.onclick = () => { document.querySelectorAll('.stickman-mode-btn[data-mode]').forEach(x => x.classList.remove('active')); b.classList.add('active'); selectedMode = b.dataset.mode; document.getElementById('difficultyCard').style.display = selectedMode === 'bot' ? 'block' : 'none'; };
    });
    document.querySelector('.stickman-mode-btn[data-mode="bot"]').classList.add('active');
    document.querySelectorAll('.diff-btn').forEach(b => {
        b.onclick = () => { document.querySelectorAll('.diff-btn').forEach(x => x.classList.remove('active')); b.classList.add('active'); selectedDiff = b.dataset.diff; };
    });
    $('stickmanStart').onclick = () => { initStickman(selectedMode, selectedDiff); stickmanState.bet = 0; $('stickmanStart').style.display = 'none'; toast(`🥊 Бой начался! Сложность: ${selectedDiff === 'easy' ? 'Легко' : selectedDiff === 'hard' ? 'Сложно' : 'Средне'}`); };
};

// ============ 🎮 МАРИО ============
window.resetGame = function() {
    mario = { x: 50, y: 400, w: 30, h: 40, vy: 0, speed: 5, jumpForce: -12, onGround: false };
    platforms = [ { x: 0, y: 450, w: 3000, h: 50, type: 'ground' }, { x: 300, y: 350, w: 150, h: 20, type: 'platform' }, { x: 500, y: 300, w: 150, h: 20, type: 'platform' }, { x: 800, y: 350, w: 150, h: 20, type: 'platform' }, { x: 1100, y: 300, w: 150, h: 20, type: 'platform' }, { x: 1400, y: 250, w: 150, h: 20, type: 'platform' }, { x: 1700, y: 300, w: 150, h: 20, type: 'platform' }, { x: 2000, y: 350, w: 150, h: 20, type: 'platform' }, { x: 2300, y: 300, w: 150, h: 20, type: 'platform' } ];
    coins = [ { x: 350, y: 330, w: 15, h: 15, collected: false }, { x: 550, y: 280, w: 15, h: 15, collected: false }, { x: 850, y: 330, w: 15, h: 15, collected: false }, { x: 1150, y: 280, w: 15, h: 15, collected: false }, { x: 1450, y: 230, w: 15, h: 15, collected: false }, { x: 1750, y: 280, w: 15, h: 15, collected: false }, { x: 2050, y: 330, w: 15, h: 15, collected: false }, { x: 2350, y: 280, w: 15, h: 15, collected: false } ];
    enemies = [ { x: 400, y: 420, w: 30, h: 30, vy: 0, alive: true }, { x: 700, y: 420, w: 30, h: 30, vy: 0, alive: true }, { x: 1000, y: 420, w: 30, h: 30, vy: 0, alive: true }, { x: 1300, y: 420, w: 30, h: 30, vy: 0, alive: true }, { x: 1600, y: 420, w: 30, h: 30, vy: 0, alive: true }, { x: 1900, y: 420, w: 30, h: 30, vy: 0, alive: true }, { x: 2200, y: 420, w: 30, h: 30, vy: 0, alive: true } ];
    bullets = []; gameScore = 0; gameKotocoinBuffer = 0; gameCameraX = 0; gameFrameCount = 0; gameActive = true; gameKeys = {};
    const overlay = document.getElementById('gameOverOverlay'); if (overlay) overlay.classList.add('hidden');
    if (gameCanvas) gameCanvas.focus();
};

window.rGame = function() {
    let h = '<div class="divider">🎮 Супер Марио</div><div class="text-sm">←→/AD – бег | Пробел/W – прыжок | Shift/X – огонь</div>';
    h += '<div class="game-ui"><span class="text-bold">🏆 Очки: <span id="gameScoreDisplay">0</span></span><span class="text-bold">🐾 Буфер: <span id="gameCoinBuffer">0</span></span></div>';
    h += '<div style="position: relative;"><canvas id="gameCanvas" class="game-canvas" width="800" height="500" tabindex="0"></canvas>';
    h += '<div class="game-over-overlay hidden" id="gameOverOverlay"><div style="font-size: 40px;">💀</div><div style="font-size: 24px; font-weight: 800;">Игра окончена!</div><div style="font-size: 18px;">Очки: <span id="gameOverScore">0</span></div><button class="game-restart-btn" id="gameRestartBtn">🔄 Играть снова</button></div></div>';
    h += '<div class="mobile-controls"><div class="ctrl-btn" id="btnLeft">←</div><div class="ctrl-btn" id="btnJump">⬆️</div><div class="ctrl-btn" id="btnRight">→</div><div class="ctrl-btn" id="btnShoot">🔥</div></div>';
    h += '<div class="divider" style="margin-top:12px;">🏅 Лучшие игроки</div><div id="gameLeaderboard"></div>';
    $('feedContainer').innerHTML = h;
    gameCanvas = document.getElementById('gameCanvas'); gameCtx = gameCanvas.getContext('2d');
    if (gameLoopId) cancelAnimationFrame(gameLoopId); resetGame();
    if (keydownHandler) window.removeEventListener('keydown', keydownHandler); if (keyupHandler) window.removeEventListener('keyup', keyupHandler);
    keydownHandler = function(e) { if (activeTab !== 'game' || !gameActive) return; if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); gameKeys['left'] = true; } if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); gameKeys['right'] = true; } if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { e.preventDefault(); gameKeys['jump'] = true; } if (e.key === 'Shift' || e.key === 'x' || e.key === 'X') { e.preventDefault(); gameKeys['shoot'] = true; } };
    keyupHandler = function(e) { if (activeTab !== 'game' || !gameActive) return; if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { e.preventDefault(); gameKeys['left'] = false; } if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { e.preventDefault(); gameKeys['right'] = false; } if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { e.preventDefault(); gameKeys['jump'] = false; } if (e.key === 'Shift' || e.key === 'x' || e.key === 'X') { e.preventDefault(); gameKeys['shoot'] = false; } };
    window.addEventListener('keydown', keydownHandler); window.addEventListener('keyup', keyupHandler);
    const bL = document.getElementById('btnLeft'), bR = document.getElementById('btnRight'), bJ = document.getElementById('btnJump'), bS = document.getElementById('btnShoot');
    if (bL) { bL.onpointerdown = () => gameKeys['left'] = true; bL.onpointerup = bL.onpointerleave = () => gameKeys['left'] = false; }
    if (bR) { bR.onpointerdown = () => gameKeys['right'] = true; bR.onpointerup = bR.onpointerleave = () => gameKeys['right'] = false; }
    if (bJ) { bJ.onpointerdown = () => gameKeys['jump'] = true; bJ.onpointerup = bJ.onpointerleave = () => gameKeys['jump'] = false; }
    if (bS) { bS.onpointerdown = () => gameKeys['shoot'] = true; bS.onpointerup = bS.onpointerleave = () => gameKeys['shoot'] = false; }
    const rB = document.getElementById('gameRestartBtn'); if (rB) rB.onclick = () => { if (gameLoopId) cancelAnimationFrame(gameLoopId); resetGame(); gameLoop(); };
    function updateGame() {
        if (!gameActive) return;
        if (gameKeys['left']) mario.x -= mario.speed;
        if (gameKeys['right']) mario.x += mario.speed;
        if (gameKeys['jump'] && mario.onGround) { mario.vy = mario.jumpForce; mario.onGround = false; }
        if (gameKeys['shoot'] && gameFrameCount % 15 === 0) bullets.push({ x: mario.x + mario.w, y: mario.y + mario.h/2, vx: 10, vy: 0 });
        mario.vy += GRAVITY; mario.y += mario.vy; mario.onGround = false;
        for (let p of platforms) { if (mario.x + mario.w > p.x && mario.x < p.x + p.w && mario.y + mario.h > p.y && mario.y + mario.h - mario.vy <= p.y) { if (mario.vy > 0) { mario.vy = 0; mario.y = p.y - mario.h; mario.onGround = true; } } }
        for (let c of coins) { if (!c.collected && mario.x + mario.w > c.x && mario.x < c.x + c.w && mario.y + mario.h > c.y && mario.y < c.y + c.h) { c.collected = true; gameScore += 100; gameKotocoinBuffer += 1; updateGameScoreDisplay(); } }
        for (let e of enemies) { if (!e.alive) continue; e.vy += GRAVITY; e.y += e.vy; for (let p of platforms) { if (e.x + e.w > p.x && e.x < p.x + p.w && e.y + e.h > p.y && e.y + e.h - e.vy <= p.y) { if (e.vy > 0) { e.vy = 0; e.y = p.y - e.h; } } } if (mario.x + mario.w > e.x && mario.x < e.x + e.w && mario.y + mario.h > e.y && mario.y < e.y + e.h) { if (mario.vy > 0 && mario.y + mario.h - e.y < 25) { e.alive = false; mario.vy = mario.jumpForce * 0.7; gameScore += 200; updateGameScoreDisplay(); } else { endGame(); return; } } }
        for (let b of bullets) { b.x += b.vx; for (let e of enemies) { if (e.alive && b.x > e.x && b.x < e.x + e.w && b.y > e.y && b.y < e.y + e.h) { e.alive = false; b.vx = 0; gameScore += 200; updateGameScoreDisplay(); break; } } }
        bullets = bullets.filter(b => b.x < gameCameraX + CANVAS_WIDTH + 50);
        if (mario.x > gameCameraX + CANVAS_WIDTH * 0.6) gameCameraX = mario.x - CANVAS_WIDTH * 0.6;
        if (mario.x < gameCameraX) gameCameraX = mario.x;
        if (mario.y > CANVAS_HEIGHT + 100) { endGame(); return; }
        gameFrameCount++;
    }
    function endGame() { gameActive = false; if (gameLoopId) cancelAnimationFrame(gameLoopId); document.getElementById('gameOverScore').textContent = gameScore; document.getElementById('gameOverOverlay').classList.remove('hidden'); db.ref('gameScores/' + currentUser.username).set({ score: gameScore + gameKotocoinBuffer * 100, timestamp: firebase.database.ServerValue.TIMESTAMP }); }
    function drawGame() {
        gameCtx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT); gameCtx.fillStyle = '#5c94fc'; gameCtx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        for (let p of platforms) { gameCtx.fillStyle = p.type === 'ground' ? '#8B4513' : '#4CAF50'; gameCtx.fillRect(p.x - gameCameraX, p.y, p.w, p.h); }
        for (let c of coins) { if (!c.collected) { gameCtx.fillStyle = '#FFD700'; gameCtx.beginPath(); gameCtx.arc(c.x - gameCameraX + c.w/2, c.y + c.h/2, 8, 0, 2*Math.PI); gameCtx.fill(); } }
        for (let e of enemies) { if (e.alive) { gameCtx.fillStyle = '#FF0000'; gameCtx.fillRect(e.x - gameCameraX, e.y, e.w, e.h); } }
        gameCtx.fillStyle = '#FFA500'; for (let b of bullets) { gameCtx.beginPath(); gameCtx.arc(b.x - gameCameraX, b.y, 5, 0, 2*Math.PI); gameCtx.fill(); }
        gameCtx.fillStyle = '#FF0000'; gameCtx.fillRect(mario.x - gameCameraX, mario.y, mario.w, mario.h);
        gameCtx.fillStyle = '#FFF'; gameCtx.font = 'bold 20px sans-serif'; gameCtx.fillText('Очки: ' + gameScore, 10, 30);
    }
    function updateGameScoreDisplay() {
        document.getElementById('gameScoreDisplay').textContent = gameScore;
        while (gameKotocoinBuffer >= 10) { gameKotocoinBuffer -= 10; const cc = currentUser.coins === Infinity ? Infinity : (currentUser.coins || 0); if (cc !== Infinity) { db.ref('users/' + currentUser.username + '/coins').set(cc + 1); currentUser.coins = cc + 1; } toast('+1🐾'); }
        document.getElementById('gameCoinBuffer').textContent = gameKotocoinBuffer;
    }
    function gameLoop() { if (!gameActive) return; updateGame(); drawGame(); gameLoopId = requestAnimationFrame(gameLoop); }
    gameLoop();
    db.ref('gameScores').orderByChild('score').limitToLast(5).on('value', snap => {
        const sc = snap.val() || {}; const sorted = Object.entries(sc).sort((a,b) => b[1].score - a[1].score).slice(0,5); let html = '';
        sorted.forEach(([name, data], i) => { html += `<div class="row-between" style="padding:4px 0;"><span>${i+1}. ${esc(name)}</span><span>${data.score} очков</span></div>`; });
        const lb = document.getElementById('gameLeaderboard'); if (lb) lb.innerHTML = html || '<div class="text-sm">Нет рекордов</div>';
    });
};

// ============ 🎰 КОЛЕСО ============
window.drawWheel = function(rotation = 0) {
    const canvas = $('wheelCanvas'); if (!canvas) return;
    const ctx = canvas.getContext('2d'); const cx = 140, cy = 140, r = 130;
    ctx.clearRect(0, 0, 280, 280); let sa = 0;
    for (let i = 0; i < WHEEL_PRIZES.length; i++) {
        const angle = WHEEL_PRIZES[i].prob * 2 * Math.PI, ea2 = sa + angle;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, sa + rotation, ea2 + rotation); ctx.closePath();
        ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length]; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2; ctx.stroke();
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(sa + rotation + angle / 2);
        ctx.textAlign = 'center'; ctx.fillStyle = '#000'; ctx.font = 'bold 13px sans-serif';
        ctx.fillText(WHEEL_PRIZES[i].prize + '🐾', r * 0.65, 5); ctx.restore(); sa = ea2;
    }
    ctx.beginPath(); ctx.arc(cx, cy, 22, 0, 2 * Math.PI); ctx.fillStyle = '#fff'; ctx.fill(); ctx.fillText('🐱', cx, cy);
};

window.spinWheel = function() {
    if (isSpinning) return;
    if (currentUser.coins !== Infinity && currentUser.coins < 100) { $('wheelResult').textContent = '❌ 100🐾'; return; }
    isSpinning = true; $('wheelSpin').disabled = true; $('wheelResult').textContent = '';
    if (currentUser.coins !== Infinity) db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins - 100);
    const rand = Math.random(); let cum = 0, idx = 0;
    for (let i = 0; i < WHEEL_PRIZES.length; i++) { cum += WHEEL_PRIZES[i].prob; if (rand <= cum) { idx = i; break; } }
    let sa = 0; for (let i = 0; i < idx; i++) sa += WHEEL_PRIZES[i].prob * 2 * Math.PI;
    const secA = WHEEL_PRIZES[idx].prob * 2 * Math.PI, off = Math.random() * secA;
    let tgt = -Math.PI / 2 - (sa + off);
    const fs = (5 + Math.floor(Math.random() * 5)) * 2 * Math.PI;
    const total = fs + (tgt > 0 ? tgt : tgt + 2 * Math.PI * 10);
    const dur = 4000, st = Date.now();
    function anim() {
        const el = Date.now() - st, pr = Math.min(el / dur, 1);
        const ea2 = 1 - Math.pow(1 - pr, 3), cr = total * ea2;
        drawWheel(cr);
        if (pr < 1) requestAnimationFrame(anim);
        else {
            const prize = WHEEL_PRIZES[idx].prize;
            db.ref('users/' + currentUser.username + '/coins').once('value').then(s => { const c = s.val() || 0; db.ref('users/' + currentUser.username + '/coins').set(c === Infinity ? "Infinity" : c + prize); addAuditLog('wheel', currentUser.username, prize); });
            $('wheelResult').textContent = `🎉 ${prize}🐾!`; $('wheelSpin').disabled = false; isSpinning = false;
            updateQuestProgress('wheel1'); updateQuestProgress('wheel5');
        }
    }
    requestAnimationFrame(anim);
};

// ============ 💰 buyItem / cp ============
window.buyItem = function(name, price) {
    if (currentUser.coins!==Infinity && currentUser.coins<price) { toast('❌ Не хватает'); return; }
    const nc = currentUser.coins===Infinity?"Infinity":currentUser.coins-price;
    db.ref('users/'+currentUser.username+'/coins').set(nc);
    const ref = db.ref('orders').push();
    ref.set({ id:ref.key, username:currentUser.username, item:name, price, status:'pending', time:new Date().toISOString() });
    toast('🛒 Заказ оформлен'); addAuditLog('buy', currentUser.username, price);
    updateQuestProgress('buy1'); updateQuestProgress('buy3');
};

window.cp = async (t) => { await navigator.clipboard.writeText(t); toast('📋 Скопировано'); };