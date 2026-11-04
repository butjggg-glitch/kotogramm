// ============================================================
// 12-events.js — Глобальные ивенты (Авто-запуск)
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
                
                // ⏳ ВРЕМЯ ОЖИДАНИЯ ИВЕНТА
                // 20 минут = 1200000. Для теста 3 секунды = 3000
                const waitTime = 1200000; 
                
                if (now - lastTime > waitTime) {
                    startRandomEvent();
                }
            });
        });
    }, 1000);
};

window.startRandomEvent = function() {
    db.ref('events/active').once('value').then(s => {
        if (s.exists() && s.val().status !== 'ended') return;
        
        db.ref('events/lastType').once('value').then(typeSnap => {
            const lastType = typeSnap.val();
            const isDeathButton = lastType === 'killer_chest'; 
            
            const ev = {
                type: isDeathButton ? 'death_button' : 'killer_chest',
                status: 'waiting',
                startTime: Date.now(),
                endTime: Date.now() + 60000, 
                participants: {}
            };
            
            db.ref('events/active').set(ev);
            db.ref('events/lastEventTime').set(Date.now());
            db.ref('events/lastType').set(ev.type);
            
            db.ref('messages').push({ 
                username: '📢 SYSTEM', 
                text: isDeathButton ? '🚨 ВНИМАНИЕ! Через минуту начнётся «Кнопка Смерти»! Заходи во вкладку Ивенты!' : '🎁 ВНИМАНИЕ! На карте появился «Сундук Убийца»! Заходи во вкладку Ивенты!', 
                timestamp: firebase.database.ServerValue.TIMESTAMP, 
                isSystem: true 
            });
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
        
        // Тестовая кнопка для Филиппа
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
        
        // --- ИВЕНТ 1: КНОПКА СМЕРТИ ---
        if (ev.type === 'death_button') {
            if (ev.status === 'waiting') {
                h += `<div class="card" style="background: linear-gradient(135deg, #b71c1c, #ff0000); color: white; text-align: center; padding: 30px;">
                    <div style="font-size: 50px; margin-bottom: 10px;">💀</div>
                    <div class="text-bold" style="font-size: 24px;">КНОПКА СМЕРТИ</div>
                    <div style="font-size: 16px; margin-top: 10px;">Приготовься тапать!</div>
                    <div class="event-timer-text" style="font-size: 30px; font-weight: 900; margin-top: 15px;">⏳ ${Math.ceil((ev.endTime - now)/1000)} сек</div>
                </div>`;
            } else if (ev.status === 'active') {
                const myTaps = (ev.participants && ev.participants[currentUser.username]) || 0;
                h += `<div class="card" style="background: linear-gradient(135deg, #4a148c, #9c27b0); color: white; text-align: center; padding: 20px;">
                    <div class="text-bold" style="font-size: 20px;">ТАПАЙ БЫСТРЕЕ!</div>
                    <div class="event-timer-text" style="font-size: 26px; font-weight: 900; margin: 10px 0;">⏳ ${Math.ceil((ev.endTime - now)/1000)} сек</div>
                    <div style="font-size: 16px; margin-bottom: 15px;">Твои тапы: <b id="myTapCount">${myTaps}</b></div>
                    <button id="deathTapBtn" style="width: 150px; height: 150px; border-radius: 50%; background: radial-gradient(circle, #ffeb3b, #f44336); border: 5px solid #fff; font-size: 40px; cursor: pointer; box-shadow: 0 0 30px rgba(255,0,0,0.8);">👊</button>
                </div>`;
                
                setTimeout(() => {
                    const btn = $('deathTapBtn');
                    if (btn) {
                        const doTap = (e) => {
                            if (e) e.preventDefault();
                            btn.style.transform = 'scale(0.9)';
                            setTimeout(() => { btn.style.transform = 'scale(1)'; }, 50);
                            const counter = $('myTapCount');
                            if (counter) counter.textContent = Number(counter.textContent) + 1;
                            db.ref('events/active/participants/' + currentUser.username).transaction(c => (c || 0) + 1);
                        };
                        btn.onmousedown = doTap;
                        btn.ontouchstart = doTap;
                    }
                }, 50);
                
                if (ev.participants) {
                    const sorted = Object.entries(ev.participants).sort((a, b) => b[1] - a[1]);
                    h += '<div class="divider" style="margin-top:20px;">🏆 ТОП ТАПАЛЬЩИКОВ</div>';
                    sorted.slice(0, 5).forEach(([name, taps], i) => {
                        h += `<div class="card" style="margin-bottom:4px; display:flex; justify-content:space-between;"><span>${i+1}. ${esc(name)}</span><span>${taps} тапов</span></div>`;
                    });
                }
            }
        }
        
        // --- ИВЕНТ 2: СУНДУК УБИЙЦА ---
        else if (ev.type === 'killer_chest') {
            if (ev.status === 'waiting') {
                h += `<div class="card" style="background: linear-gradient(135deg, #ffd700, #ff8c00); color: #000; text-align: center; padding: 30px;">
                    <div style="font-size: 80px; margin-bottom: 10px;">🧰</div>
                    <div class="text-bold" style="font-size: 24px;">СУНДУК УБИЙЦА</div>
                    <div style="font-size: 16px; margin-top: 10px;">Сундук откроется через</div>
                    <div class="event-timer-text" style="font-size: 30px; font-weight: 900; margin-top: 15px;">⏳ ${Math.ceil((ev.endTime - now)/1000)} сек</div>
                </div>`;
            } else if (ev.status === 'active') {
                h += `<div class="divider">🎁 СУНДУК ОТКРЫТ!</div>`;
                h += `<div class="text-sm" style="margin-bottom:10px;">Кликай на предметы, чтобы забрать их!</div>`;
                
                const items = ev.loot || [];
                const myTaken = ev.taken || {};
                
                h += `<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;">`;
                items.forEach((item, index) => {
                    if (myTaken[index] && myTaken[index] !== currentUser.username) {
                        h += `<div class="card" style="text-align:center; opacity:0.3; padding:4px;">${item.emoji}</div>`;
                    } else if (myTaken[index] === currentUser.username) {
                        h += `<div class="card" style="text-align:center; border: 2px solid #4caf50; padding:4px;">✅</div>`;
                    } else {
                        h += `<div class="card loot-item" data-index="${index}" style="text-align:center; cursor: pointer; border: 2px solid #ffd700; padding:4px; background:#2a2a3a;">
                            <div style="font-size: 20px;">${item.emoji}</div>
                            <div class="text-sm" style="color: #4caf50; font-size:10px;">+${item.price}</div>
                        </div>`;
                    }
                });
                h += `</div>`;
                
                setTimeout(() => {
                    document.querySelectorAll('.loot-item').forEach(el => {
                        el.onclick = () => {
                            const idx = el.dataset.index;
                            db.ref(`events/active/taken/${idx}`).transaction(t => {
                                if (t === null) return currentUser.username;
                                return t;
                            }).then(res => {
                                if (res.committed && res.snapshot.val() === currentUser.username) {
                                    const item = items[idx];
                                    if (currentUser.coins !== Infinity) {
                                        currentUser.coins += item.price;
                                        db.ref('users/' + currentUser.username + '/coins').set(currentUser.coins);
                                    }
                                    addAuditLog('event_chest_loot', currentUser.username, item.price);
                                    toast(`🎉 Ты забрал: ${item.name} (+${item.price}🐾)`);
                                } else {
                                    toast('❌ Этот предмет уже забрал кто-то другой!');
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
        if (activeTab !== 'events') {
            clearInterval(eventTickInterval);
            eventTickInterval = null;
            return;
        }
        
        const ev = db._eventsCache;
        if (!ev || !ev.endTime) return;
        
        const now = Date.now();
        const left = Math.max(0, ev.endTime - now);
        
        document.querySelectorAll('.event-timer-text').forEach(el => {
            el.textContent = `⏳ ${Math.ceil(left/1000)} сек`;
        });
        
        if (left <= 0) {
            db.ref('events/active').once('value').then(s => {
                const currentEv = s.val();
                if (currentEv && currentEv.status === 'waiting') {
                    if (currentEv.type === 'killer_chest') {
                        generateChestLoot(); 
                    } else {
                        db.ref('events/active').update({ status: 'active', endTime: Date.now() + 30000 }); 
                    }
                } else if (currentEv && currentEv.status === 'active') {
                    if (currentEv.type === 'death_button') endDeathButton(currentEv);
                    else db.ref('events/active').update({ status: 'ended' });
                }
            });
        }
    }, 1000);
};

window.generateChestLoot = function() {
    db.ref('sessions').once('value').then(snap => {
        const sessions = snap.val() || {};
        const onlineCount = Object.values(sessions).filter(s => s.online).length;
        
        let itemCount = 40;
        let multiplier = 1;

        if (onlineCount <= 1) { itemCount = 40; multiplier = 1; }
        else if (onlineCount === 2) { itemCount = 60; multiplier = 1.5; }
        else { itemCount = 80; multiplier = 2; }

        const rarities = [
            { name: 'Бедный', emoji: '🥔', min: 5, max: 10, chance: 0.5 },
            { name: 'Средний', emoji: '🍖', min: 10, max: 30, chance: 0.3 },
            { name: 'Богатый', emoji: '💎', min: 30, max: 50, chance: 0.15 },
            { name: 'Бриллиантовый', emoji: '👑', min: 50, max: 150, chance: 0.05 }
        ];
        
        let loot = [];
        for (let i = 0; i < itemCount; i++) {
            const rand = Math.random();
            let cum = 0;
            for (const r of rarities) {
                cum += r.chance;
                if (rand <= cum) {
                    const basePrice = Math.floor(Math.random() * (r.max - r.min + 1)) + r.min;
                    const price = Math.floor(basePrice * multiplier);
                    loot.push({ name: `${r.name} котость`, emoji: r.emoji, price });
                    break;
                }
            }
        }
        
        db.ref('events/active').update({ status: 'active', endTime: Date.now() + 60000, loot: loot });
        db.ref('messages').push({ 
            username: '📢 SYSTEM', 
            text: `🎁 Сундук открылся! Онлайн: ${onlineCount}. Предметов: ${loot.length}. Скорее забирай!`, 
            timestamp: firebase.database.ServerValue.TIMESTAMP, 
            isSystem: true 
        });
    });
};

window.endDeathButton = function(ev) {
    const participants = ev.participants || {};
    const sorted = Object.entries(participants).sort((a, b) => b[1] - a[1]);
    const playerCount = sorted.length;

    let rewards = [];
    if (playerCount <= 1) rewards = [100];
    else if (playerCount === 2) rewards = [200, 100];
    else rewards = [300, 200, 100];

    sorted.slice(0, rewards.length).forEach(([name, taps], index) => {
        const prize = rewards[index];
        db.ref('users/' + name).once('value').then(s => {
            const u = s.val();
            if (u && u.coins !== Infinity) {
                db.ref('users/' + name + '/coins').set((u.coins || 0) + prize);
            }
        });
    });

    const topPlayer = sorted.length > 0 ? `${sorted[0][0]} (${sorted[0][1]} тапов) +${rewards[0]}🐾` : 'никто не тапал';
    db.ref('messages').push({ 
        username: '📢 SYSTEM', 
        text: `🏆 Ивент «Кнопка Смерти» завершён! Участников: ${playerCount}. Победитель: ${topPlayer}`, 
        timestamp: firebase.database.ServerValue.TIMESTAMP, 
        isSystem: true 
    });
    
    db.ref('events/active').update({ status: 'ended' });
};