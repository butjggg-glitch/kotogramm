// ============================================================
// 13-craft-pvp.js — Кото-Крафт, Шахта (Нерф), Магазин, Аукцион, Киты и PvP
// ============================================================

const CRAFT_RECIPES = [
    { id: 'wood_sword', name: '🗡️ Деревянный меч', type: 'weapon', dmg: 5, res: { wood: 3 } },
    { id: 'stone_sword', name: '⚔️ Каменный меч', type: 'weapon', dmg: 10, res: { stone: 5, wood: 2 } },
    { id: 'iron_sword', name: '⚔️ Железный меч', type: 'weapon', dmg: 20, res: { iron: 5, stone: 2 } },
    { id: 'gold_sword', name: '🌟 Золотой меч', type: 'weapon', dmg: 35, res: { gold: 5, iron: 5 } },
    { id: 'diamond_sword', name: '💎 Алмазный клинок', type: 'weapon', dmg: 60, res: { diamond: 2, gold: 5 } },
    { id: 'leather_armor', name: '🧥 Кожаная броня', type: 'armor', hp: 20, res: { wood: 5 } },
    { id: 'stone_armor', name: '🛡️ Каменная броня', type: 'armor', hp: 50, res: { stone: 10 } },
    { id: 'iron_armor', name: '🛡️ Железная броня', type: 'armor', hp: 100, res: { iron: 10 } },
    { id: 'gold_armor', name: '✨ Золотая броня', type: 'armor', hp: 200, res: { gold: 10 } },
    { id: 'diamond_armor', name: '💎 Алмазная броня', type: 'armor', hp: 350, res: { diamond: 3, gold: 10 } },
    { id: 'wood_ring', name: '💍 Деревянное кольцо', type: 'accessory', dmg: 2, hp: 5, res: { wood: 2 } },
    { id: 'silver_ring', name: '💍 Серебряное кольцо', type: 'accessory', dmg: 5, hp: 15, res: { iron: 3, gold: 1 } },
    { id: 'gold_amulet', name: '📿 Золотой амулет', type: 'accessory', dmg: 10, hp: 50, res: { gold: 5, diamond: 1 } },
    { id: 'cat_totem', name: '🐱 Кото-Тотем', type: 'accessory', dmg: 20, hp: 100, res: { diamond: 5, gold: 20 } }
];

const RESOURCE_PRICES = {
    wood: { name: '🪵 Дерево', buy: 15, sell: 8 },
    stone: { name: '🪨 Камень', buy: 30, sell: 15 },
    iron: { name: '🔩 Железо', buy: 60, sell: 30 },
    gold: { name: '🪙 Золото', buy: 150, sell: 80 },
    diamond: { name: '💎 Алмаз', buy: 500, sell: 250 }
};

window.rCraft = function() {
    if (!currentUser) return;
    db.ref('users/' + currentUser.username).once('value').then(snap => {
        const userData = snap.val() || {};
        const inv = userData.inventory || { wood: 0, stone: 0, iron: 0, gold: 0, diamond: 0, items: {} };
        const items = inv.items || {};
        const myCoins = userData.coins === Infinity || userData.coins === "Infinity" ? Infinity : (userData.coins || 0);
        
        let h = '<div class="divider">⛏️ КОТО-КРАФТ</div>';
        
        // 1. ШАХТА
        h += `<div class="card" style="text-align: center; background: linear-gradient(135deg, #2a2a3a, #1a1a24); color: white;">
            <div class="text-bold" style="font-size: 18px; margin-bottom: 10px;">🏔️ ШАХТА</div>
            <div style="display: flex; justify-content: space-around; font-size: 18px; margin-bottom: 15px; flex-wrap: wrap;">
                <div>🪵 <span id="c_wood">${inv.wood || 0}</span></div>
                <div>🪨 <span id="c_stone">${inv.stone || 0}</span></div>
                <div>🔩 <span id="c_iron">${inv.iron || 0}</span></div>
                <div>🪙 <span id="c_gold">${inv.gold || 0}</span></div>
                <div>💎 <span id="c_diamond">${inv.diamond || 0}</span></div>
            </div>
            <button class="btn-gold" id="mineBtn" style="width: 100%; padding: 15px; font-size: 18px; border-radius: 12px; margin-bottom: 10px;">⛏️ КОПАТЬ</button>
            <div class="text-sm" style="color: #ccc;">💰 Твой баланс: <b>${fc(myCoins)}</b> 🐾</div>
        </div>`;

        // 2. МАГАЗИН РЕСУРСОВ
        h += '<div class="divider">🏪 МАГАЗИН РЕСУРСОВ</div>';
        h += `<div class="card" style="padding: 10px;"><div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px;">`;
        Object.entries(RESOURCE_PRICES).forEach(([key, data]) => {
            h += `<div style="background: rgba(255,255,255,0.05); border-radius: 10px; padding: 8px; text-align: center;">
                <div class="text-bold">${data.name}</div>
                <div class="text-sm" style="margin-bottom:5px; color:#ccc;">Купить: ${data.buy}🐾 | Продать: ${data.sell}🐾</div>
                <div class="row-wrap" style="justify-content:center;">
                    <input type="number" id="amt_${key}" value="10" min="1" class="input-sm" style="width: 60px; padding: 4px; text-align: center;">
                    <button class="btn-sm btn-green" onclick="window.buyResource('${key}')" style="padding: 4px 8px;">Купить</button>
                    <button class="btn-sm btn-orange" onclick="window.sellResource('${key}')" style="padding: 4px 8px;">Продать</button>
                </div>
            </div>`;
        });
        h += `</div></div>`;

        // 3. ВЕРСТАК
        h += '<div class="divider">🔨 ВЕРСТАК</div>';
        CRAFT_RECIPES.forEach(r => {
            const canCraft = Object.entries(r.res).every(([res, amt]) => (inv[res] || 0) >= amt);
            h += `<div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                <div><div class="text-bold">${r.name}</div><div class="text-sm">Нужно: ${Object.entries(r.res).map(([k,v]) => `${v} ${k}`).join(', ')}</div></div>
                <button class="btn-sm ${canCraft ? 'btn-green' : ''}" onclick="window.craftItem('${r.id}')" ${canCraft ? '' : 'disabled'}>Скрафтить</button>
            </div>`;
        });

        // 4. ИНВЕНТАРЬ
        h += '<div class="divider">🎒 ТВОЯ ЭКИПИРОВКА</div>';
        const equippedWeapon = inv.equippedWeapon || 'Нет';
        const equippedArmor = inv.equippedArmor || 'Нет';
        h += `<div class="card"><div class="row-between"><span>🗡️ Оружие:</span><b>${equippedWeapon !== 'Нет' ? CRAFT_RECIPES.find(x => x.id === equippedWeapon)?.name : 'Нет'}</b></div><div class="row-between" style="margin-top:5px;"><span>🛡️ Броня:</span><b>${equippedArmor !== 'Нет' ? CRAFT_RECIPES.find(x => x.id === equippedArmor)?.name : 'Нет'}</b></div></div>`;
        
        h += '<div class="divider">🎒 ТВОИ ПРЕДМЕТЫ</div>';
        let hasItems = false;
        Object.entries(items).forEach(([itemId, count]) => {
            if (count > 0) {
                hasItems = true;
                const recipe = CRAFT_RECIPES.find(x => x.id === itemId);
                if (!recipe) return;
                h += `<div class="card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;"><div>${recipe.name} (${count} шт.)</div><div><button class="btn-sm btn-blue" onclick="window.equipItem('${itemId}')" style="margin-right:4px;">Надеть</button><button class="btn-sm btn-orange" onclick="window.sellItem('${itemId}')">Продать</button></div></div>`;
            }
        });
        if (!hasItems) h += '<div class="text-sm">У тебя пока нет предметов. Скрафти что-нибудь!</div>';

        // 5. АРЕНА PVP
        h += '<div class="divider" style="margin-top:20px;">⚔️ АРЕНА СМЕРТИ</div>';
        h += `<div class="card" style="background: linear-gradient(135deg, #1a1a24, #2a2a3a); color: white; text-align: center; padding: 20px; border: 2px solid #ff5252;"><div class="text-sm">Победитель забирает ресурсы проигравшего!</div><button class="btn-gold" id="pvpQueueBtn" style="margin-top:10px; padding:10px 20px; font-size:16px;">⚔️ КЛАССИЧЕСКИЙ PVP</button><button class="btn-gold" id="kitPvpBtn" style="margin-top:10px; padding:10px 20px; font-size:16px; background: linear-gradient(135deg, #00bcd4, #006064);">🐋 КИТ ПВП</button><div id="pvpStatus" style="margin-top:10px; font-weight:900; font-size:16px;"></div></div>`;

        $('feedContainer').innerHTML = h;

        // Логика кнопок
        let lastMineTime = 0;
        $('mineBtn').onclick = () => {
            const now = Date.now();
            if (now - lastMineTime < 250) { toast('⏳ Слишком быстро!'); return; }
            lastMineTime = now;

            // 🟢 НЕРФ ШАХТЫ: Уменьшены шансы на редкие ресурсы
            const rand = Math.random() * 100;
            let resource = 'wood';
            if (rand > 70 && rand <= 90) resource = 'stone';
            if (rand > 90 && rand <= 97) resource = 'iron';
            if (rand > 97 && rand <= 99.5) resource = 'gold';
            if (rand > 99.5) resource = 'diamond';

            db.ref('users/' + currentUser.username + '/inventory/' + resource).transaction(c => (c || 0) + 1).then(() => {
                if ($('c_' + resource)) $('c_' + resource).textContent = (parseInt($('c_' + resource).textContent) || 0) + 1;
                toast(`⛏️ Ты добыл 1 ${RESOURCE_PRICES[resource].name}`);
            });
        };

        $('pvpQueueBtn').onclick = () => {
            if (inv.equippedWeapon === 'Нет' && inv.equippedArmor === 'Нет') {
                toast('❌ Надень хотя бы меч или броню!');
                return;
            }
            $('pvpQueueBtn').disabled = true;
            $('pvpQueueBtn').textContent = '⏳ Ждем соперника...';
            $('pvpStatus').innerHTML = 'Ищем второго игрока...';

            db.ref('pvp_queue/' + currentUser.username).set({ timestamp: Date.now(), hp: 50 + (CRAFT_RECIPES.find(x => x.id === inv.equippedArmor)?.hp || 0), dmg: 5 + (CRAFT_RECIPES.find(x => x.id === inv.equippedWeapon)?.dmg || 0) });

            let botTimeout = setTimeout(() => {
                db.ref('pvp_queue').once('value').then(s => {
                    if (Object.keys(s.val() || {}).length < 2) {
                        db.ref('pvp_queue').off(); db.ref('pvp_queue').remove(); toast('🤖 Соперников нет, бой с Ботом!');
                        startOnlinePvpFight('🤖 Бот', { hp: 100, dmg: 15 });
                    }
                });
            }, 10000);

            db.ref('pvp_queue').on('value', snap => {
                const queue = snap.val() || {};
                const players = Object.keys(queue);
                if (players.length >= 2) {
                    const opponent = players.find(p => p !== currentUser.username);
                    if (opponent) {
                        clearTimeout(botTimeout); db.ref('pvp_queue').off(); const oppData = queue[opponent]; db.ref('pvp_queue').remove(); startOnlinePvpFight(opponent, oppData);
                    }
                }
            });
        };
        $('kitPvpBtn').onclick = () => startKitPvp();
    });
};

window.buyResource = function(res) {
    const amt = parseInt($('amt_' + res).value);
    if (!amt || amt < 1) return toast('Введи количество');
    const price = RESOURCE_PRICES[res].buy * amt;
    db.ref('users/' + currentUser.username).once('value').then(s => {
        const u = s.val();
        if (u.coins !== Infinity && u.coins !== "Infinity" && (u.coins || 0) < price) return toast('❌ Недостаточно 🐾');
        const updates = {};
        if (u.coins !== Infinity && u.coins !== "Infinity") updates['coins'] = (u.coins || 0) - price;
        db.ref('users/' + currentUser.username + '/inventory/' + res).transaction(c => (c || 0) + amt).then(() => {
            db.ref('users/' + currentUser.username).update(updates).then(() => { toast(`✅ Куплено ${amt} ${RESOURCE_PRICES[res].name}`); rCraft(); });
        });
    });
};

window.sellResource = function(res) {
    const amt = parseInt($('amt_' + res).value);
    if (!amt || amt < 1) return toast('Введи количество');
    const price = RESOURCE_PRICES[res].sell * amt;
    db.ref('users/' + currentUser.username + '/inventory/' + res).once('value').then(s => {
        const have = s.val() || 0;
        if (have < amt) return toast(`❌ У тебя только ${have}`);
        db.ref('users/' + currentUser.username + '/inventory/' + res).transaction(c => (c || 0) - amt).then(() => {
            db.ref('users/' + currentUser.username + '/coins').once('value').then(cs => {
                const cur = cs.val() || 0;
                const newCoins = cur === Infinity || cur === "Infinity" ? "Infinity" : cur + price;
                db.ref('users/' + currentUser.username + '/coins').set(newCoins).then(() => { toast(`💰 Продано ${amt} ${RESOURCE_PRICES[res].name} за ${price}🐾`); rCraft(); });
            });
        });
    });
};

window.craftItem = function(itemId) {
    const recipe = CRAFT_RECIPES.find(r => r.id === itemId);
    if (!recipe) return;
    const userRef = db.ref('users/' + currentUser.username);
    userRef.once('value').then(snap => {
        const inv = snap.val().inventory || { wood: 0, stone: 0, iron: 0, gold: 0, diamond: 0, items: {} };
        if (!inv.items) inv.items = {};
        for (const [res, amt] of Object.entries(recipe.res)) {
            if ((inv[res] || 0) < amt) return toast('❌ Не хватает ресурсов!');
        }
        const updates = {};
        for (const [res, amt] of Object.entries(recipe.res)) updates['inventory/' + res] = (inv[res] || 0) - amt;
        updates['inventory/items/' + itemId] = (inv.items[itemId] || 0) + 1;
        userRef.update(updates).then(() => { toast(`✅ Скрафчено: ${recipe.name}`); rCraft(); });
    });
};

window.equipItem = function(itemId) {
    const recipe = CRAFT_RECIPES.find(r => r.id === itemId);
    if (!recipe) return;
    let slot = recipe.type === 'weapon' ? 'equippedWeapon' : (recipe.type === 'armor' ? 'equippedArmor' : 'equippedAccessory');
    db.ref('users/' + currentUser.username + '/inventory/' + slot).set(itemId).then(() => { toast(`✅ Надето: ${recipe.name}`); rCraft(); });
};

window.sellItem = function(itemId) {
    const recipe = CRAFT_RECIPES.find(r => r.id === itemId);
    if (!recipe) return;
    const price = recipe.dmg ? recipe.dmg * 10 : recipe.hp * 5;
    const userRef = db.ref('users/' + currentUser.username);
    userRef.once('value').then(snap => {
        const u = snap.val() || {};
        const inv = u.inventory || { items: {} };
        if (!inv.items || !inv.items[itemId] || inv.items[itemId] <= 0) return;
        const updates = {};
        updates['inventory/items/' + itemId] = inv.items[itemId] - 1;
        if (u.coins !== Infinity && u.coins !== "Infinity") updates['coins'] = (u.coins || 0) + price;
        userRef.update(updates).then(() => { toast(`💰 Продано за ${price} 🐾`); rCraft(); });
    });
};

window.startKitPvp = function() {
    let h = `<div class="item-modal" id="kitPvpModal"><div class="item-modal-card" style="max-width: 500px; background: #1a1a24; border: 2px solid #00bcd4;"><div class="text-bold" style="font-size: 20px; color: #00bcd4; margin-bottom: 10px; text-align:center;">🐋 ВЫБЕРИ КИТА</div><div style="display:flex; flex-direction:column; gap:10px;"><button class="btn-sm" onclick="window.playKitPvp('sharp')" style="background:#2a2a3a; padding:15px; border:1px solid #ff5252; text-align:left;"><b style="color:#ff5252;">🦈 ОСТРЫЙ КИТ</b><br><span style="font-size:12px; color:#aaa;">Урон: 20, HP: 80. Способность: Кровавый удар</span></button><button class="btn-sm" onclick="window.playKitPvp('tank')" style="background:#2a2a3a; padding:15px; border:1px solid #4caf50; text-align:left;"><b style="color:#4caf50;">🐋 БРОНИРОВАННЫЙ КИТ</b><br><span style="font-size:12px; color:#aaa;">Урон: 10, HP: 150. Способность: Броня</span></button><button class="btn-sm" onclick="window.playKitPvp('speed')" style="background:#2a2a3a; padding:15px; border:1px solid #00bcd4; text-align:left;"><b style="color:#00bcd4;">🐬 БЫСТРЫЙ ДЕЛЬФИН</b><br><span style="font-size:12px; color:#aaa;">Урон: 15, HP: 90. Способность: Уворот</span></button></div><button class="btn-sm btn-red" onclick="document.getElementById('kitPvpModal').remove()" style="margin-top:15px; width:100%;">Отмена</button></div></div>`;
    document.body.insertAdjacentHTML('beforeend', h);
};

window.playKitPvp = function(kitType) {
    document.getElementById('kitPvpModal').remove();
    const kits = { sharp: { name: '🦈 Острый кит', hp: 80, dmg: 20, ability: 'Кровавый удар' }, tank: { name: '🐋 Бронированный кит', hp: 150, dmg: 10, ability: 'Броня' }, speed: { name: '🐬 Быстрый дельфин', hp: 90, dmg: 15, ability: 'Уворот' } };
    const myKit = kits[kitType]; const enemyKit = kits[Object.keys(kits)[Math.floor(Math.random() * 3)]];

    let battleHtml = `<div class="item-modal" id="battleModal"><div class="item-modal-card" style="max-width: 500px; background: #1a1a24; border: 2px solid #00bcd4;"><div class="text-bold" style="font-size: 20px; color: #00bcd4; margin-bottom: 10px; text-align:center;">🐋 КИТ ПВП</div><div style="display: flex; justify-content: space-between; margin-bottom: 10px;"><div style="flex: 1;"><div class="text-bold" style="color: #fff;">${enemyKit.name}</div><div style="background: #333; height: 15px; border-radius: 8px; overflow: hidden;"><div id="enemyHpBar" style="width: 100%; height: 100%; background: #ff5252; transition: width 0.3s;"></div></div><div class="text-sm" style="color: #ccc;" id="enemyHpText">${enemyKit.hp} / ${enemyKit.hp}</div></div></div><div style="display: flex; justify-content: space-between; margin-bottom: 20px;"><div style="flex: 1;"><div class="text-bold" style="color: #fff;">Твой ${myKit.name}</div><div style="background: #333; height: 15px; border-radius: 8px; overflow: hidden;"><div id="playerHpBar" style="width: 100%; height: 100%; background: #4caf50; transition: width 0.3s;"></div></div><div class="text-sm" style="color: #ccc;" id="playerHpText">${myKit.hp} / ${myKit.hp}</div></div></div><div id="battleLog" style="min-height: 50px; color: #ffd700; font-weight: bold; font-size: 14px; margin-bottom: 15px; text-align: center;">Бой начался!</div><div class="row-wrap" style="justify-content: center; gap:10px;"><button class="btn-sm btn-red" id="btnAttack" style="padding: 15px; font-size: 14px; flex: 1;">⚔️ Ударить</button><button class="btn-sm btn-blue" id="btnAbility" style="padding: 15px; font-size: 14px; flex: 1;">✨ ${myKit.ability}</button></div></div></div>`;
    document.body.insertAdjacentHTML('beforeend', battleHtml);
    
    const modal = document.getElementById('battleModal'); const log = document.getElementById('battleLog');
    let myHp = myKit.hp, enemyHp = enemyKit.hp; let abilityCooldown = 0; let battleActive = true;

    function updateUI() {
        document.getElementById('playerHpBar').style.width = Math.max(0, (myHp / myKit.hp) * 100) + '%';
        document.getElementById('enemyHpBar').style.width = Math.max(0, (enemyHp / enemyKit.hp) * 100) + '%';
        document.getElementById('playerHpText').textContent = `${Math.max(0, myHp)} / ${myKit.hp}`;
        document.getElementById('enemyHpText').textContent = `${Math.max(0, enemyHp)} / ${enemyKit.hp}`;
        const abilBtn = document.getElementById('btnAbility');
        if (abilityCooldown > 0) { abilBtn.disabled = true; abilBtn.textContent = `⏳ ${abilityCooldown}`; }
        else { abilBtn.disabled = false; abilBtn.textContent = `✨ ${myKit.ability}`; }
    }

    function enemyTurn() {
        if (enemyHp <= 0 || !battleActive) return;
        setTimeout(() => {
            if (!battleActive) return;
            let dmg = enemyKit.dmg; let isDodge = false;
            if (enemyKit.name.includes('Острый')) dmg += 10;
            if (enemyKit.name.includes('Бронированный')) dmg = Math.floor(dmg / 2);
            if (enemyKit.name.includes('Быстрый') && Math.random() < 0.3) isDodge = true;
            if (isDodge) log.innerHTML = `🐬 Враг уклонился от твоей атаки!`;
            else { myHp -= dmg; log.innerHTML = `🤖 Враг ударил на ${dmg} урона!`; }
            updateUI();
            if (myHp <= 0) { battleActive = false; log.innerHTML = '💀 ПОРАЖЕНИЕ...'; setTimeout(() => { modal.remove(); rCraft(); }, 3000); }
            else { document.getElementById('btnAttack').disabled = false; if (abilityCooldown > 0) abilityCooldown--; updateUI(); }
        }, 1000);
    }

    document.getElementById('btnAttack').onclick = () => {
        if (!battleActive) return;
        document.getElementById('btnAttack').disabled = true;
        let dmg = myKit.dmg; if (myKit.name.includes('Острый')) dmg += 10;
        enemyHp -= dmg; log.innerHTML = `🐱 Ты ударил на ${dmg} урона!`; updateUI();
        if (enemyHp <= 0) {
            battleActive = false; log.innerHTML = '🎉 ПОБЕДА! +100🐾 и +1💎';
            if (currentUser.coins !== Infinity) { currentUser.coins += 100; db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins); }
            db.ref('users/' + currentUser.username + '/inventory/diamond').transaction(c => (c || 0) + 1);
            setTimeout(() => { modal.remove(); rCraft(); }, 3000);
        } else { enemyTurn(); }
    };

    document.getElementById('btnAbility').onclick = () => {
        if (!battleActive || abilityCooldown > 0) return;
        document.getElementById('btnAttack').disabled = true; abilityCooldown = 3;
        if (myKit.name.includes('Острый')) { enemyHp -= 30; log.innerHTML = `🩸 Кровавый удар! -30 HP врагу!`; }
        else if (myKit.name.includes('Бронированный')) { myHp = Math.min(myKit.hp, myHp + 40); log.innerHTML = `🛡️ Броня восстановила 40 HP!`; }
        else if (myKit.name.includes('Быстрый')) { log.innerHTML = `💨 Ты готовишься к увороту!`; }
        updateUI();
        if (enemyHp <= 0) {
            battleActive = false; log.innerHTML = '🎉 ПОБЕДА! +100🐾 и +1💎';
            if (currentUser.coins !== Infinity) { currentUser.coins += 100; db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins); }
            db.ref('users/' + currentUser.username + '/inventory/diamond').transaction(c => (c || 0) + 1);
            setTimeout(() => { modal.remove(); rCraft(); }, 3000);
        } else { enemyTurn(); }
    };
    updateUI();
};

window.startOnlinePvpFight = function(opponentName, opponentData) {
    const players = [currentUser.username, opponentName].sort();
    const matchId = players.join('_vs_');
    const matchRef = db.ref('active_battles/' + matchId);
    let isMyTurn = players[0] === currentUser.username;

    if (isMyTurn) {
        matchRef.set({ p1: players[0], p2: players[1], p1_hp: 50 + (CRAFT_RECIPES.find(x => x.id === (currentUser.inventory?.equippedArmor))?.hp || 0), p2_hp: opponentData.hp || 50, turn: players[0], log: 'Бой начался!' });
    }

    let battleHtml = `<div class="item-modal" id="battleModal"><div class="item-modal-card" style="max-width: 500px; background: #1a1a24; border: 2px solid #ff5252;"><div class="text-bold" style="font-size: 20px; color: #ff5252; margin-bottom: 10px; text-align:center;">⚔️ БОЙ: ${esc(currentUser.username)} VS ${esc(opponentName)}</div><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;"><div style="flex: 1;"><div class="text-bold" style="color: #fff;">${esc(opponentName)}</div><div style="background: #333; height: 15px; border-radius: 8px; overflow: hidden;"><div id="enemyHpBar" style="width: 100%; height: 100%; background: #ff5252; transition: width 0.3s;"></div></div><div class="text-sm" style="color: #ccc;" id="enemyHpText">...</div></div></div><div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;"><div style="flex: 1;"><div class="text-bold" style="color: #fff;">Ты</div><div style="background: #333; height: 15px; border-radius: 8px; overflow: hidden;"><div id="playerHpBar" style="width: 100%; height: 100%; background: #4caf50; transition: width 0.3s;"></div></div><div class="text-sm" style="color: #ccc;" id="playerHpText">...</div></div></div><div id="battleLog" style="min-height: 50px; color: #ffd700; font-weight: bold; font-size: 14px; margin-bottom: 15px; text-align: center;">Ждем начала...</div><div id="turnIndicator" style="text-align:center; font-weight:900; margin-bottom:10px; color: #4caf50;"></div><div class="row-wrap" style="justify-content: center; display:none;" id="battleActions"><button class="btn-sm btn-red" id="btnAttack" style="padding: 15px 20px; font-size: 16px; flex: 1;">⚔️ Ударить</button><button class="btn-sm btn-blue" id="btnDefend" style="padding: 15px 20px; font-size: 16px; flex: 1;">🛡️ Защита</button></div></div></div>`;
    document.body.insertAdjacentHTML('beforeend', battleHtml);
    const modal = document.getElementById('battleModal'); const pBar = document.getElementById('playerHpBar'); const eBar = document.getElementById('enemyHpBar'); const pText = document.getElementById('playerHpText'); const eText = document.getElementById('enemyHpText'); const log = document.getElementById('battleLog'); const turnInd = document.getElementById('turnIndicator'); const actions = document.getElementById('battleActions');

    let myHp = 50 + (CRAFT_RECIPES.find(x => x.id === (currentUser.inventory?.equippedArmor))?.hp || 0); let enemyHp = opponentData.hp || 50;
    let myDmg = 5 + (CRAFT_RECIPES.find(x => x.id === (currentUser.inventory?.equippedWeapon))?.dmg || 0); let enemyDmg = opponentData.dmg || 10;

    matchRef.on('value', snap => {
        const m = snap.val(); if (!m) return;
        if (m.p1 === currentUser.username) { myHp = m.p1_hp; enemyHp = m.p2_hp; } else { myHp = m.p2_hp; enemyHp = m.p1_hp; }
        pBar.style.width = Math.max(0, (myHp / 100) * 100) + '%'; eBar.style.width = Math.max(0, (enemyHp / 100) * 100) + '%';
        pText.textContent = `${myHp} HP`; eText.textContent = `${enemyHp} HP`; log.textContent = m.log;
        if (m.turn === currentUser.username) { turnInd.textContent = 'ТВОЙ ХОД!'; actions.style.display = 'flex'; }
        else { turnInd.textContent = `Ход ${m.turn}...`; actions.style.display = 'none'; }
        if (myHp <= 0) { endOnlineBattle(false); } else if (enemyHp <= 0) { endOnlineBattle(true); }
    });

    document.getElementById('btnAttack').onclick = () => {
        const m = matchRef.val(); if (m.turn !== currentUser.username) return;
        const dmg = myDmg + Math.floor(Math.random() * 5); let newP1Hp = m.p1_hp, newP2Hp = m.p2_hp;
        if (m.p1 === currentUser.username) newP2Hp -= dmg; else newP1Hp -= dmg;
        matchRef.update({ p1_hp: newP1Hp, p2_hp: newP2Hp, turn: m.p1 === currentUser.username ? m.p2 : m.p1, log: `${currentUser.username} ударил на ${dmg} урона!` });
    };

    document.getElementById('btnDefend').onclick = () => {
        const m = matchRef.val(); if (m.turn !== currentUser.username) return;
        matchRef.update({ turn: m.p1 === currentUser.username ? m.p2 : m.p1, log: `${currentUser.username} защищается!` });
    };

    function endOnlineBattle(win) {
        matchRef.off(); matchRef.remove();
        if (win) { log.innerHTML = '🎉 ПОБЕДА! Ты забираешь ресурсы врага.'; setTimeout(() => { modal.remove(); rCraft(); }, 3000); }
        else { log.innerHTML = '💀 ПОРАЖЕНИЕ... Ты потерял ресурсы.'; setTimeout(() => { modal.remove(); rCraft(); }, 3000); }
    }
};