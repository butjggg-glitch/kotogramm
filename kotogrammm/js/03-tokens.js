// ============================================================
// 03-tokens.js — Токены, передача, обмен, вывод, админ-выдача
// Курс: 20 токенов = 1 рубль
// ============================================================

window.rTokens = function() {
    if (!currentUser) return;
    db.ref('users/' + currentUser.username).once('value').then(snap => {
        const me = snap.val() || {};
        const isInfinite = me.tokens === Infinity || me.tokens === "Infinity" || currentUser.username === 'Филипп';
        const tokens = isInfinite ? Infinity : (me.tokens || 0);
        
        // Курс: 20 токенов = 1 ₽
        const rubles = isInfinite ? '∞' : (tokens / 20).toFixed(2);
        const kos = isInfinite ? '∞' : (tokens * 1000).toLocaleString('ru-RU');

        let h = '<div class="divider">💎 ТОКЕНЫ</div>';
        h += `<div class="token-card"><div>${tokenIcon(56)}</div><div class="token-balance">${isInfinite ? '∞' : tokens}</div><div style="font-size: 13px; font-weight: 700; margin-top: 6px;">ТОКЕНОВ У ТЕБЯ</div><div style="font-size: 12px; margin-top: 8px;">≈ ${rubles} ₽ • ${kos} 🐾</div></div>`;

        h += '<div class="divider">💸 ПЕРЕДАТЬ ТОКЕНЫ ДРУГУ</div>';
        h += `<div class="card"><div class="text-sm" style="margin-bottom:8px;">Отправь токены другому игроку. Комиссия 0%.</div><div class="row-wrap"><select class="select-sm" id="transferTo"></select><input class="input-sm" id="transferAmount" type="number" placeholder="Сколько 💎" min="1"><button class="btn-sm btn-orange" id="transferBtn">💸 Отправить</button></div></div>`;

        if (currentUser.role === 'admin') {
            h += '<div class="divider">⚡ ЗАКИНУТЬ ТОКЕНЫ (админ)</div>';
            h += `<div class="card card-glow"><div class="text-sm" style="margin-bottom:8px;">Выдай токены любому игроку</div><div class="row-wrap" style="margin-bottom:8px;"><select class="select-sm" id="grantTo" style="flex:1; min-width:140px;"></select></div><div class="row-wrap" style="margin-bottom:8px;"><button class="btn-sm btn-green quick-tok" data-amount="10">+10</button><button class="btn-sm btn-green quick-tok" data-amount="50">+50</button><button class="btn-sm btn-green quick-tok" data-amount="100">+100</button><button class="btn-sm btn-green quick-tok" data-amount="500">+500</button><button class="btn-sm btn-green quick-tok" data-amount="1000">+1000</button></div><div class="row-wrap"><input class="input-sm" id="grantAmount" type="number" placeholder="Своя сумма" min="1"><button class="btn-sm btn-gold" id="grantBtn">💎 Выдать</button></div></div>`;
            h += '<div class="divider">💎 СПИСАТЬ ТОКЕНЫ (админ)</div>';
            h += `<div class="card card-glow" style="border-color:var(--red);"><div class="text-sm" style="margin-bottom:8px;">Списать токены у игрока</div><div class="row-wrap" style="margin-bottom:8px;"><select class="select-sm" id="removeTokTo" style="flex:1; min-width:140px;"></select></div><div class="row-wrap" style="margin-bottom:8px;"><button class="btn-sm btn-red quick-rtok" data-amount="10">-10</button><button class="btn-sm btn-red quick-rtok" data-amount="50">-50</button><button class="btn-sm btn-red quick-rtok" data-amount="100">-100</button><button class="btn-sm btn-red quick-rtok" data-amount="500">-500</button><button class="btn-sm btn-red quick-rtok" data-amount="1000">-1000</button></div><div class="row-wrap"><input class="input-sm" id="removeTokAmount" type="number" placeholder="Своя сумма" min="1"><button class="btn-sm btn-red" id="removeTokBtn">💎 Списать</button></div></div>`;
            h += '<div class="divider">📢 BROADCAST ВСЕМ</div>';
            h += `<div class="card"><div class="text-sm" style="margin-bottom:8px;">Отправить сообщение всем игрокам</div><div class="row-wrap"><input class="input-sm" id="bcText" placeholder="Текст сообщения" style="flex:1;"><button class="btn-sm btn-purple" id="bcBtn">📢 Отправить</button></div></div>`;
        }

        // 🟢 ВИЗУАЛЬНО ИСПРАВЛЕННЫЙ КУРС
        h += '<div class="divider">💰 КУРС ОБМЕНА</div>';
        h += `<div class="card">
            <div class="row-between" style="padding:4px 0;"><span>${tokenIcon(18)} 20 токенов</span><b>→ 1 ₽</b></div>
            <div class="row-between" style="padding:4px 0;"><span>💳 1 ₽</span><b>→ 20 токенов</b></div>
            <div class="row-between" style="padding:4px 0;"><span>${tokenIcon(18)} 1 токен</span><b>→ 1 000 🐾</b></div>
            <div class="row-between" style="padding:4px 0;"><span>🐾 1 000 койнов</span><b>→ 1 токен</b></div>
        </div>`;

        h += '<div class="divider">🛒 КУПИТЬ ТОКЕНЫ</div>';
        h += `<div class="card"><div class="text-sm" style="margin-bottom:8px;">Заявка админу.</div><div class="row-wrap"><input class="input-sm" id="buyRub" type="number" placeholder="Сумма в ₽" min="1"><button class="btn-sm btn-gold" id="buyTokensBtn">${tokenIcon(14)} Купить</button></div></div>`;

        // 🟢 ВИЗУАЛЬНО ИСПРАВЛЕННЫЙ ВЫВОД
        h += '<div class="divider">💸 ВЫВЕСТИ В РУБЛИ</div>';
        h += `<div class="card"><div class="text-sm" style="margin-bottom:8px;">Минимум 200 токенов (10 ₽).</div><div class="row-wrap"><input class="input-sm" id="withdrawTokens" type="number" placeholder="Сколько токенов" min="200"><button class="btn-sm btn-green" id="withdrawBtn">💸 Вывести</button></div></div>`;

        h += '<div class="divider">🔄 ОБМЕН НА КОЙНЫ</div>';
        h += `<div class="card"><div class="text-sm" style="margin-bottom:8px;">1 токен = 1 000 🐾</div><div class="row-wrap"><input class="input-sm" id="exTokens" type="number" placeholder="Токенов" min="1"><button class="btn-sm btn-orange" id="exTokToKos">${tokenIcon(14)} → 🐾</button></div><div class="row-wrap" style="margin-top:6px;"><input class="input-sm" id="exKos" type="number" placeholder="Койнов" min="1000" step="1000"><button class="btn-sm btn-purple" id="exKosToTok">🐾 → ${tokenIcon(14)}</button></div></div>`;

        $('feedContainer').innerHTML = h;

        db.ref('users').once('value').then(us => {
            const u = us.val() || {};
            const sel = $('transferTo');
            if (sel) { sel.innerHTML = '<option value="">— Кому —</option>'; Object.keys(u).forEach(k => { if (k !== currentUser.username) sel.innerHTML += `<option value="${esc(k)}">${esc(k)}</option>`; }); }
            if (currentUser.role === 'admin') {
                const gsel = $('grantTo');
                if (gsel) { gsel.innerHTML = '<option value="">— Кому выдать —</option>'; Object.keys(u).forEach(k => gsel.innerHTML += `<option value="${esc(k)}">${esc(k)} (💎 ${ft(u[k].tokens)})</option>`); }
                const rsel = $('removeTokTo');
                if (rsel) { rsel.innerHTML = '<option value="">— У кого списать —</option>'; Object.keys(u).forEach(k => { if (k !== 'Филипп') rsel.innerHTML += `<option value="${esc(k)}">${esc(k)} (💎 ${ft(u[k].tokens)})</option>`; }); }
            }
        });

        db.ref('tokenRequests').once('value').then(rs => {
            const reqs = rs.val() ? Object.values(rs.val()).filter(r => r.username === currentUser.username) : [];
            let rh = '<div class="divider">📋 МОИ ЗАЯВКИ</div>';
            if (!reqs.length) rh += '<div class="empty-state">📭 Нет заявок</div>';
            else reqs.slice(-10).forEach(r => {
                const st = r.status === 'pending' ? '⏳' : r.status === 'approved' ? '✅' : '❌';
                const cls = r.status === 'pending' ? 'status-pending' : r.status === 'approved' ? 'status-done' : 'status-no';
                // 🟢 Починили отображение, чтобы не было "undefined"
                let displayAmount = r.amount || 0;
                if (r.type === 'buy') displayAmount = r.amount + '₽';
                else if (r.type === 'withdraw') displayAmount = r.amount + '💎';
                else if (r.type === 'buy_role') displayAmount = r.priceRub + '₽';
                else if (r.type === 'shop_item') displayAmount = r.price + '💎';
                
                let label = '🔄 Обмен';
                if (r.type === 'buy') label = '💳 Купить';
                else if (r.type === 'withdraw') label = '💸 Вывести';
                else if (r.type === 'buy_role') label = '🎭 Роль';
                else if (r.type === 'shop_item') label = '🖌️ Котость';

                rh += `<div class="card" style="margin-bottom:4px;"><div class="row-between"><span>${label}: ${displayAmount}</span><span class="status ${cls}">${st}</span></div></div>`;
            });
            const container = document.createElement('div');
            container.innerHTML = rh;
            $('feedContainer').appendChild(container);
        });

        document.querySelectorAll('.quick-tok').forEach(btn => { btn.onclick = () => { $('grantAmount').value = parseInt(btn.dataset.amount); grantTokens(); }; });
        document.querySelectorAll('.quick-rtok').forEach(btn => { btn.onclick = () => { $('removeTokAmount').value = parseInt(btn.dataset.amount); removeTokens(); }; });

        function grantTokens() {
            const to = $('grantTo')?.value;
            const amount = Number($('grantAmount')?.value);
            if (!to) return toast('Выбери получателя');
            if (!amount || amount < 1) return toast('Введи сумму');
            db.ref('users/' + to + '/tokens').once('value').then(ts => {
                const currentT = ts.val() || 0;
                if (currentT === Infinity || currentT === "Infinity") { toast('У него ∞'); return; }
                db.ref('users/' + to + '/tokens').set(currentT + amount).then(() => { toast(`✅ Выдано ${amount}💎 → ${to}`); addAuditLog('admin_grant_tokens', to, amount); rTokens(); });
            });
        }
        function removeTokens() {
            const to = $('removeTokTo')?.value;
            const amount = Number($('removeTokAmount')?.value);
            if (!to) return toast('Выбери игрока');
            if (!amount || amount < 1) return toast('Введи сумму');
            db.ref('users/' + to + '/tokens').once('value').then(ts => {
                const currentT = ts.val() || 0;
                if (currentT === Infinity || currentT === "Infinity") { toast('У него ∞ — нельзя списать'); return; }
                const newT = Math.max(0, currentT - amount);
                db.ref('users/' + to + '/tokens').set(newT).then(() => {
                    toast(`✅ Списано ${amount}💎 у ${to} (осталось ${newT})`);
                    addAuditLog('admin_remove_tokens', to, amount);
                    rTokens();
                });
            });
        }
        if ($('grantBtn')) $('grantBtn').onclick = grantTokens;
        if ($('removeTokBtn')) $('removeTokBtn').onclick = removeTokens;
        if ($('bcBtn')) $('bcBtn').onclick = () => {
            const text = $('bcText').value.trim();
            if (!text) return toast('Введи текст');
            db.ref('messages').push({ username: '📢 SYSTEM', text: `📢 BROADCAST: ${text}`, timestamp: firebase.database.ServerValue.TIMESTAMP, isSystem: true });
            $('bcText').value = '';
            toast('📢 Отправлено всем');
            addAuditLog('broadcast', 'всем', 0);
        };

        $('transferBtn').onclick = () => {
            const to = $('transferTo').value;
            const amount = Number($('transferAmount').value);
            if (!to) return toast('Выбери получателя');
            if (!amount || amount < 1) return toast('Введи сумму');
            if (currentUser.username !== 'Филипп') { if ((me.tokens || 0) < amount) return toast('Недостаточно токенов'); }
            if (!confirm(`Отправить ${amount}💎 игроку ${to}?`)) return;
            db.ref('users/' + to + '/tokens').once('value').then(ts => {
                const currentT = ts.val() || 0;
                const newT = (currentT === Infinity || currentT === "Infinity") ? currentT : currentT + amount;
                db.ref('users/' + to + '/tokens').set(newT).then(() => {
                    if (currentUser.username !== 'Филипп') db.ref('users/' + currentUser.username + '/tokens').set((me.tokens || 0) - amount);
                    toast(`✅ Отправлено ${amount}💎 → ${to}`);
                    addAuditLog('transfer_tokens', to, amount);
                    rTokens();
                });
            });
        };

        $('buyTokensBtn').onclick = () => {
            if (currentUser.username === 'Филипп') { toast('👑 У тебя ∞ токенов'); return; }
            const rub = Number($('buyRub').value);
            if (!rub || rub < 1) return toast('Введи сумму в ₽');
            const tokensToGive = rub * 20; // 🟢 НОВЫЙ КУРС
            const ref = db.ref('tokenRequests').push();
            ref.set({ id: ref.key, username: currentUser.username, type: 'buy', amount: rub, tokens: tokensToGive, status: 'pending', time: Date.now() });
            toast(`💳 Заявка на ${tokensToGive} токенов за ${rub}₽`);
        };

        $('withdrawBtn').onclick = () => {
            if (currentUser.username === 'Филипп') { toast('👑 У тебя ∞ токенов'); return; }
            const tk = Number($('withdrawTokens').value);
            if (!tk || tk < 200) return toast('Минимум 200 токенов (10 ₽)');
            if (tk > tokens) return toast('Недостаточно токенов');
            const ref = db.ref('tokenRequests').push();
            ref.set({ id: ref.key, username: currentUser.username, type: 'withdraw', amount: tk, rubles: tk / 20, status: 'pending', time: Date.now() }); // 🟢 НОВЫЙ КУРС
            toast(`💸 Заявка на ${(tk / 20).toFixed(2)}₽`);
        };

        $('exTokToKos').onclick = () => {
            if (currentUser.username === 'Филипп') { toast('👑 Обмен не нужен'); return; }
            const tk = Number($('exTokens').value);
            if (!tk || tk < 1) return toast('Введи количество');
            if (tk > tokens) return toast('Недостаточно токенов');
            const kosToGive = tk * 1000;
            db.ref('users/' + currentUser.username).once('value').then(s => {
                const me2 = s.val();
                const newKos = (me2.coins === Infinity || me2.coins === "Infinity") ? Infinity : (me2.coins || 0) + kosToGive;
                db.ref('users/' + currentUser.username).update({ tokens: tokens - tk, coins: newKos === Infinity ? "Infinity" : newKos });
                localStorage.setItem('last_exchange_' + currentUser.username, Date.now().toString());
                toast(`✅ ${tk}💎 → ${kosToGive}🐾`);
                rTokens();
            });
        };

        $('exKosToTok').onclick = () => {
            if (currentUser.username === 'Филипп') { toast('👑 Обмен не нужен'); return; }
            const kos = Number($('exKos').value);
            if (!kos || kos < 1000 || kos % 1000 !== 0) return toast('Минимум 1000, кратно 1000');
            if (currentUser.coins !== Infinity && currentUser.coins < kos) return toast('Недостаточно');
            const tokensToGive = Math.floor(kos / 1000);
            const newKos = currentUser.coins === Infinity ? Infinity : currentUser.coins - kos;
            db.ref('users/' + currentUser.username).update({ tokens: tokens + tokensToGive, coins: newKos === Infinity ? "Infinity" : newKos });
            localStorage.setItem('last_exchange_' + currentUser.username, Date.now().toString());
            toast(`✅ ${kos}🐾 → ${tokensToGive}💎`);
            rTokens();
        };
    });
};