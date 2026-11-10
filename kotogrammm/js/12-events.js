// ============================================================
// 12-events.js — Глобальные ивенты (Метеор, Маяк, Сундук, Сапёр)
// ============================================================

let currentEvent = null;
let eventsListener = null;
let eventTickInterval = null;
let autoEventCheckInterval = null;

window.listenEvents = function() {
    if (autoEventCheckInterval) clearInterval(autoEventCheckInterval);
    
    autoEventCheckInterval = setInterval(() => {
        if (!currentUser) return;
        
        db.ref('events/active').once('value').then(s => {
            if (s.exists() && s.val().status !== 'ended') return;
            
            db.ref('events/lastEventTime').once('value').then(timeSnap => {
                const lastTime = timeSnap.val() || 0;
                const now = Date.now();
                const waitTime = 1200000; 
                
                if (now - lastTime > waitTime) startRandomEvent();
            });
        });
    }, 1000);
};

window.startRandomEvent = function() {
    db.ref('events/active').once('value').then(s => {
        if (s.exists() && s.val().status !== 'ended') return;
        
        db.ref('events/lastType').once('value').then(typeSnap => {
            const lastType = typeSnap.val();
            const types = ['killer_chest', 'meteor_shower', 'killer_lighthouse', 'minesweeper'];
            let nextType = types[Math.floor(Math.random() * types.length)];
            if (nextType === lastType) nextType = types[(types.indexOf(nextType) + 1) % types.length];
            
            const ev = {
                type: nextType,
                status: 'waiting',
                startTime: Date.now(),
                endTime: Date.now() + 60000, 
                participants: {}
            };
            
            db.ref('events/active').set(ev);
            db.ref('events/lastEventTime').set(Date.now());
            db.ref('events/lastType').set(ev.type);
            
            let msg = '🎁 ВНИМАНИЕ! На карте появился «Сундук Убийца»!';
            if (nextType === 'meteor_shower') msg = '☄️ ВНИМАНИЕ! Начинается «Кото-Метеор»! Успей собрать падающие призы!';
            if (nextType === 'killer_lighthouse') msg = '🗼 ВНИМАНИЕ! Захвати «Маяк-Киллер»! Выталкивай других и получай монеты!';
            if (nextType === 'minesweeper') msg = '💣 ВНИМАНИЕ! Начинается «Кото-Сапёр»! Найди монеты и не подорвись на бомбах!';

            db.ref('messages').push({ username: '📢 SYSTEM', text: msg, timestamp: firebase.database.ServerValue.TIMESTAMP, isSystem: true });
        });
    });
};

window.forceStartEvent = function() {
    db.ref('events/active').remove().then(() => {
        db.ref('events/lastEventTime').set(0);
        startRandomEvent();
        toast('🚀 Ивент запущен!');
    });
};

window.rEvents = function() {
    if (eventsListener) db.ref('events/active').off('value', eventsListener);
    if (eventTickInterval) { clearInterval(eventTickInterval); eventTickInterval = null; }

    eventsListener = db.ref('events/active').on('value', snap => {
        const ev = snap.val();
        db._eventsCache = ev;
        const now = Date.now();
        
        let h = '<div class="divider">🎉 ГЛОБАЛЬНЫЕ ИВЕНТЫ</div>';
        
        if (currentUser && currentUser.username === 'Филипп') {
            h += `<div class="card" style="background: #333; text-align: center;"><button class="btn-sm btn-red" onclick="window.forceStartEvent()">🛠️ ТЕСТ: Запустить ивент</button></div>`;
        }

        if (!ev || ev.status === 'ended') {
            h += `<div class="card" style="text-align: center; padding: 40px;">
                <div style="font-size: 40px; margin-bottom: 10px;">⏳</div>
                <div class="text-bold">Следующий ивент скоро...</div>
                <div class="text-sm">Ивенты проходят каждые 20 минут!</div>
            </div>`;
            $('feedContainer').innerHTML = h;
            return;
        }
        
        // --- СУНДУК ---
        if (ev.type === 'killer_chest') {
            if (ev.status === 'waiting') {
                h += `<div class="card" style="background: linear-gradient(135deg, #ffd700, #ff8c00); color: #000; text-align: center; padding: 30px;">
                    <div style="font-size: 80px; margin-bottom: 10px;">🧰</div>
                    <div class="text-bold" style="font-size: 24px;">СУНДУК УБИЙЦА</div>
                    <div style="font-size: 16px; margin-top: 10px;">Откроется через</div>
                    <div class="event-timer-text" style="font-size: 30px; font-weight: 900; margin-top: 15px;">⏳ ${Math.ceil((ev.endTime - now)/1000)} сек</div>
                </div>`;
            } else if (ev.status === 'active') {
                const items = ev.loot || [];
                const myTaken = ev.taken || {};
                h += `<div class="divider">🎁 СУНДУК ОТКРЫТ!</div><div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">`;
                items.forEach((item, index) => {
                    if (myTaken[index] && myTaken[index] !== currentUser.username) {
                        h += `<div class="card" style="text-align:center; opacity:0.3; padding:4px;">${item.emoji}</div>`;
                    } else if (myTaken[index] === currentUser.username) {
                        h += `<div class="card" style="text-align:center; border: 2px solid #4caf50; padding:4px;">✅</div>`;
                    } else {
                        h += `<div class="card loot-item" data-index="${index}" style="text-align:center; cursor: pointer; border: 2px solid #ffd700; padding:4px; background:#2a2a3a;"><div style="font-size: 20px;">${item.emoji}</div><div class="text-sm" style="color: #4caf50; font-size:10px;">+${item.price}</div></div>`;
                    }
                });
                h += `</div>`;
                setTimeout(() => {
                    document.querySelectorAll('.loot-item').forEach(el => {
                        el.onclick = () => {
                            const idx = el.dataset.index;
                            db.ref(`events/active/taken/${idx}`).transaction(t => t === null ? currentUser.username : t).then(res => {
                                if (res.committed) {
                                    const item = items[idx];
                                    if (currentUser.coins !== Infinity) { currentUser.coins += item.price; db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins); }
                                    addAuditLog('event_chest_loot', currentUser.username, item.price);
                                    toast(`🎉 Ты забрал: ${item.name} (+${item.price}🐾)`);
                                } else toast('❌ Уже забрали!');
                            });
                        };
                    });
                }, 50);
            }
        }

        // --- МЕТЕОР ---
        else if (ev.type === 'meteor_shower') {
            if (ev.status === 'waiting') {
                h += `<div class="card" style="background: linear-gradient(135deg, #1565c0, #42a5f5); color: white; text-align: center; padding: 30px;">
                    <div style="font-size: 80px; margin-bottom: 10px;">☄️</div>
                    <div class="text-bold" style="font-size: 24px;">КОТО-МЕТЕОР</div>
                    <div class="event-timer-text" style="font-size: 30px; font-weight: 900; margin-top: 15px;">⏳ ${Math.ceil((ev.endTime - now)/1000)} сек</div>
                </div>`;
            } else if (ev.status === 'active') {
                const meteors = ev.meteors || {};
                h += `<div class="divider">☄️ ЛОВИ МЕТЕОРЫ!</div><div style="position:relative; width:100%; height:400px; background:#0a0a15; border-radius:12px; overflow:hidden; border:2px solid #42a5f5;">`;
                Object.entries(meteors).forEach(([id, m]) => {
                    if (!m.taken) h += `<div class="meteor-item" data-id="${id}" style="position:absolute; left:${m.x}%; top:${m.y}%; font-size:40px; cursor:pointer; transition: top 0.5s linear;">${m.emoji}</div>`;
                });
                h += `</div>`;
                setTimeout(() => {
                    document.querySelectorAll('.meteor-item').forEach(el => {
                        el.onclick = () => {
                            const id = el.dataset.id;
                            db.ref(`events/active/meteors/${id}`).transaction(t => t && !t.taken ? { ...t, taken: currentUser.username } : t).then(res => {
                                if (res.committed) {
                                    const prize = res.snapshot.val().price;
                                    if (currentUser.coins !== Infinity) { currentUser.coins += prize; db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins); }
                                    toast(`☄️ Ты поймал ${prize}🐾!`);
                                }
                            });
                        };
                    });
                }, 50);
            }
        }

        // --- МАЯК ---
        else if (ev.type === 'killer_lighthouse') {
            if (ev.status === 'waiting') {
                h += `<div class="card" style="background: linear-gradient(135deg, #4a148c, #9c27b0); color: white; text-align: center; padding: 30px;">
                    <div style="font-size: 80px; margin-bottom: 10px;">🗼</div>
                    <div class="text-bold" style="font-size: 24px;">МАЯК-КИЛЛЕР</div>
                    <div class="event-timer-text" style="font-size: 30px; font-weight: 900; margin-top: 15px;">⏳ ${Math.ceil((ev.endTime - now)/1000)} сек</div>
                </div>`;
            } else if (ev.status === 'active') {
                const participants = ev.participants || {};
                const sorted = Object.entries(participants).sort((a, b) => b[1] - a[1]);
                const king = sorted.length > 0 ? sorted[0][0] : 'Никто';
                h += `<div class="card" style="text-align: center; background: #1a1a2e; border: 2px solid #ffd700;">
                    <div class="text-bold" style="font-size: 24px; color: #ffd700;">🗼 МАЯК-КИЛЛЕР</div>
                    <div class="text-sm" style="margin: 10px 0;">На маяке: <b>${esc(king)}</b></div>
                    <div class="event-timer-text" style="font-size: 20px; color: #fff;">⏳ ${Math.ceil((ev.endTime - now)/1000)} сек</div>
                    <button id="pushBtn" style="width: 100%; padding: 20px; margin-top: 15px; background: radial-gradient(circle, #ffeb3b, #f44336); border: 3px solid #fff; border-radius: 20px; font-size: 20px; font-weight: 900; cursor: pointer;">ТОЛКНУТЬ ВСЕХ!</button>
                </div>`;
                h += '<div class="divider">🏆 ТОП</div>';
                sorted.slice(0, 5).forEach(([name, score], i) => h += `<div class="card" style="margin-bottom:4px; display:flex; justify-content:space-between;"><span>${i+1}. ${esc(name)}</span><span>${score} очков</span></div>`);
                setTimeout(() => {
                    const btn = $('pushBtn');
                    if (btn) {
                        let lastPush = 0;
                        btn.onclick = () => {
                            const now = Date.now();
                            if (now - lastPush < 100) return;
                            lastPush = now;
                            db.ref('events/active/participants/' + currentUser.username).transaction(c => (c || 0) + 2);
                            btn.style.transform = 'scale(0.9)'; setTimeout(() => { btn.style.transform = 'scale(1)'; }, 50);
                        };
                    }
                }, 50);
            }
        }

        // --- САПЁР (НОВЫЙ) ---
        else if (ev.type === 'minesweeper') {
            if (ev.status === 'waiting') {
                h += `<div class="card" style="background: linear-gradient(135deg, #2e7d32, #66bb6a); color: white; text-align: center; padding: 30px;">
                    <div style="font-size: 80px; margin-bottom: 10px;">💣</div>
                    <div class="text-bold" style="font-size: 24px;">КОТО-САПЁР</div>
                    <div class="text-sm">Ищем монеты...</div>
                    <div class="event-timer-text" style="font-size: 30px; font-weight: 900; margin-top: 15px;">⏳ ${Math.ceil((ev.endTime - now)/1000)} сек</div>
                </div>`;
            } else if (ev.status === 'active') {
                const grid = ev.grid || [];
                h += `<div class="divider">💣 ИЩИ МОНЕТЫ, НЕ ТРОГАЙ БОМБЫ!</div>`;
                h += `<div style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">`;
                grid.forEach((cell, i) => {
                    if (cell.opened) {
                        h += `<div class="card" style="text-align:center; font-size:30px; padding:15px; opacity:0.6;">${cell.type === 'bomb' ? '💥' : '🪙'}</div>`;
                    } else {
                        h += `<div class="card mine-cell" data-idx="${i}" style="text-align:center; font-size:30px; padding:15px; cursor:pointer; background:#2a2a3a; border:2px solid #555;">❓</div>`;
                    }
                });
                h += `</div>`;
                setTimeout(() => {
                    document.querySelectorAll('.mine-cell').forEach(el => {
                        el.onclick = () => {
                            const idx = el.dataset.idx;
                            db.ref(`events/active/grid/${idx}`).transaction(cell => {
                                if (cell && !cell.opened) return { ...cell, opened: true, openedBy: currentUser.username };
                                return cell;
                            }).then(res => {
                                if (res.committed) {
                                    const cell = res.snapshot.val();
                                    if (cell.type === 'bomb') {
                                        if (currentUser.coins !== Infinity) {
                                            currentUser.coins = Math.max(0, currentUser.coins - 100);
                                            db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins);
                                        }
                                        toast('💥 БУМ! Ты потерял 100🐾');
                                    } else {
                                        if (currentUser.coins !== Infinity) {
                                            currentUser.coins += 150;
                                            db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins);
                                        }
                                        toast('🪙 +150🐾!');
                                    }
                                }
                            });
                        };
                    });
                }, 50);
            }
        }
        
        $('feedContainer').innerHTML = h;
    });

    eventTickInterval = setInterval(() => {
        if (activeTab !== 'events') { clearInterval(eventTickInterval); eventTickInterval = null; return; }
        const ev = db._eventsCache;
        if (!ev || !ev.endTime) return;
        const now = Date.now();
        const left = Math.max(0, ev.endTime - now);
        
        document.querySelectorAll('.event-timer-text').forEach(el => el.textContent = `⏳ ${Math.ceil(left/1000)} сек`);
        
        if (left <= 0) {
            db.ref('events/active').once('value').then(s => {
                const currentEv = s.val();
                if (currentEv && currentEv.status === 'waiting') {
                    if (currentEv.type === 'killer_chest') generateChestLoot();
                    else if (currentEv.type === 'meteor_shower') spawnMeteors();
                    else if (currentEv.type === 'minesweeper') spawnMinesweeper();
                    else db.ref('events/active').update({ status: 'active', endTime: Date.now() + 30000 }); 
                } else if (currentEv && currentEv.status === 'active') {
                    if (currentEv.type === 'killer_lighthouse') endLighthouse(currentEv);
                    else db.ref('events/active').update({ status: 'ended' });
                }
            });
        }
    }, 1000);
};

// Спавн метеоров
window.spawnMeteors = function() {
    let meteors = {};
    const emojis = ['🪙', '💰', '💎', '🎁'];
    for (let i = 0; i < 15; i++) {
        meteors['m' + i] = { x: Math.floor(Math.random() * 80) + 10, y: 0, emoji: emojis[Math.floor(Math.random() * emojis.length)], price: Math.floor(Math.random() * 50) + 10, taken: null };
    }
    db.ref('events/active').update({ status: 'active', endTime: Date.now() + 30000, meteors: meteors });
    let topPos = 0;
    const fallInterval = setInterval(() => {
        topPos += 10;
        document.querySelectorAll('.meteor-item').forEach(el => el.style.top = topPos + '%');
        if (topPos > 100) clearInterval(fallInterval);
    }, 200);
};

// Спавн сапёра
window.spawnMinesweeper = function() {
    let grid = [];
    // 6 бомб, 10 монет
    for (let i = 0; i < 16; i++) grid.push({ type: 'coin', opened: false, openedBy: null });
    for (let i = 0; i < 6; i++) {
        let idx = Math.floor(Math.random() * 16);
        while (grid[idx].type === 'bomb') idx = Math.floor(Math.random() * 16);
        grid[idx].type = 'bomb';
    }
    db.ref('events/active').update({ status: 'active', endTime: Date.now() + 60000, grid: grid });
};

// Конец маяка
window.endLighthouse = function(ev) {
    const sorted = Object.entries(ev.participants || {}).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
        const winner = sorted[0][0];
        const prize = 300;
        db.ref('users/' + winner).once('value').then(s => {
            const u = s.val();
            if (u && u.coins !== Infinity) db.ref('users/' + winner + '/coins').set((u.coins || 0) + prize);
            db.ref('messages').push({ username: '📢 SYSTEM', text: `🗼 Маяк-Киллер завершён! Победил: ${winner} (+${prize}🐾)`, timestamp: firebase.database.ServerValue.TIMESTAMP, isSystem: true });
        });
    }
    db.ref('events/active').update({ status: 'ended' });
};

// Сундук
window.generateChestLoot = function() {
    db.ref('sessions').once('value').then(snap => {
        const onlineCount = Object.values(snap.val() || {}).filter(s => s.online).length;
        let itemCount = onlineCount <= 1 ? 40 : 60;
        const rarities = [
            { name: 'Бедный', emoji: '🥔', min: 5, max: 10, chance: 0.5 },
            { name: 'Средний', emoji: '🍖', min: 10, max: 30, chance: 0.3 },
            { name: 'Богатый', emoji: '💎', min: 30, max: 50, chance: 0.15 },
            { name: 'Бриллиантовый', emoji: '👑', min: 50, max: 150, chance: 0.05 }
        ];
        let loot = [];
        for (let i = 0; i < itemCount; i++) {
            const rand = Math.random(); let cum = 0;
            for (const r of rarities) {
                cum += r.chance;
                if (rand <= cum) { loot.push({ name: `${r.name} котость`, emoji: r.emoji, price: Math.floor(Math.random() * (r.max - r.min + 1)) + r.min }); break; }
            }
        }
        db.ref('events/active').update({ status: 'active', endTime: Date.now() + 60000, loot: loot });
    });
};