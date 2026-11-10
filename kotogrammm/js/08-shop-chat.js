// ============================================================
// 08-shop-chat.js — Магазин, Турниры, Чат, ЛС
// ============================================================

// ============ 🛒 rShop ============
window.rShop = function() {
    db.ref('orders').once('value').then(s => {
        const o = s.val()?Object.values(s.val()):[];
        let h = '<div class="divider">🛒 Магазин за койны</div>';
        h+=`<div class="text-sm">💰 Баланс: <b>${fc(currentUser.coins)} 🐾</b></div>`;
        h+=`<div class="shop-item" style="border:2px solid var(--accent)"><div><div class="text-bold">🎰 Колесо фортуны</div><div class="text-sm">💰 100 🐾 • Призы: 1,5,10,100,200,300</div></div><button class="btn-orange" id="openWheel">🎰 Крутить</button></div>`;
        SHOP.forEach((item) => { const ok = currentUser.coins===Infinity||currentUser.coins>=item.price; h+=`<div class="shop-item"><div><div class="text-bold">${esc(item.name)}</div><div class="text-sm">💰 ${item.price} 🐾</div></div><button class="btn-sm btn-purple" onclick="window.buyItem('${ea(item.name)}',${item.price})" ${ok?'':'disabled'}>${ok?'Купить':'Не хватает'}</button></div>`; });
        h+=`<button class="btn-sm btn-green" id="refreshShop" style="margin:8px 0;">🔄 Обновить</button>`;
        h+='<div class="divider">📦 Мои заказы</div>';
        const my = o.filter(x=>x.username===currentUser.username);
        if (!my.length) h+='<div class="empty-state">📭 Нет заказов</div>';
        else my.forEach(x => h+=`<div class="card" style="margin-bottom:4px;"><div class="row-between"><span>${esc(x.item)} (${x.price}🐾)</span><span class="status ${x.status==='pending'?'status-pending':x.status==='approved'?'status-done':'status-no'}">${x.status==='pending'?'⏳':x.status==='approved'?'✅':'❌'}</span></div></div>`);
        $('feedContainer').innerHTML = h;
        $('refreshShop').onclick = () => rShop();
        $('openWheel').onclick = () => { $('wheelOverlay').classList.remove('hidden'); drawWheel(); $('wheelResult').textContent = ''; $('wheelSpin').disabled = false; isSpinning = false; };
    });
};

// ============ 🏆 ТУРНИРЫ ============
window.rTournaments = function() {
    db.ref('tournaments').once('value').then(s => {
        const a = s.val()?Object.values(s.val()):[];
        let h = '<div class="divider">🏆 Турниры</div>';
        if (currentUser.role==='admin') h+='<button class="btn btn-primary" id="atb">➕ Создать</button>';
        if (!a.length) h+='<div class="empty-state">🏟️ Нет турниров</div>';
        a.forEach(t => {
            h+=`<div class="card" style="margin-bottom:8px;"><div class="row-between"><span class="text-bold">${esc(t.title)}</span><span class="status ${t.status==='ongoing'?'status-done':t.status==='upcoming'?'status-pending':'status-no'}">${t.status==='ongoing'?'Идёт':t.status==='upcoming'?'Скоро':'Завершён'}</span></div>`;
            h+=`<div class="text-sm">🎮 ${esc(t.game)} 📅 ${t.date} 🏅 ${t.prize}🐾</div>`;
            if (t.participants?.length) { h+='<div class="text-sm" style="margin-top:4px;">Участники:</div>'; [...t.participants].sort((a,b)=>b.score-a.score).forEach((p,i) => h+=`<div class="row-between" style="padding:2px 0;"><span>${i===0?'🥇':i===1?'🥈':i===2?'🥉':''} ${esc(p.username)}</span><span>${p.score} оч</span></div>`); }
            if (currentUser.role==='admin') h+=`<div class="row-wrap" style="margin-top:6px;"><select class="input-sm tp-s" data-tid="${t.id}"></select><input class="input-sm ts-i" value="1" style="width:40px;"><button class="btn-sm btn-green ts-a" data-tid="${t.id}">+</button><button class="btn-sm btn-red ts-r" data-tid="${t.id}">-</button><select class="input-sm ts-st" data-tid="${t.id}"><option value="upcoming">Скоро</option><option value="ongoing">Идёт</option><option value="finished">Завершён</option></select></div>`;
            h+='</div>';
        });
        h+=`<button class="btn-sm btn-green" id="refreshTourn" style="margin:8px 0;">🔄 Обновить</button>`;
        $('feedContainer').innerHTML = h;
        $('refreshTourn').onclick = () => rTournaments();
        document.querySelectorAll('.tp-s').forEach(sel => { db.ref('users').once('value').then(us => { Object.keys(us.val()||{}).forEach(k => sel.innerHTML+=`<option value="${esc(k)}">${esc(k)}</option>`); }); });
        if ($('atb')) $('atb').onclick = () => {
            const t = prompt('Название:'), g = prompt('Игра:'), d = prompt('Дата:'), p = parseInt(prompt('Приз:','100'))||100;
            if (!t||!g||!d) return;
            const ref = db.ref('tournaments').push();
            ref.set({ id: ref.key, title:t, game:g, date:d, prize:p, status:'upcoming', participants:[] });
            toast('🏆 Создан');
        };
        document.querySelectorAll('.ts-a').forEach(b => b.onclick = function() { chScore(this.dataset.tid,'add'); });
        document.querySelectorAll('.ts-r').forEach(b => b.onclick = function() { chScore(this.dataset.tid,'remove'); });
        document.querySelectorAll('.ts-st').forEach(s => s.onchange = function() { db.ref('tournaments/'+this.dataset.tid+'/status').set(this.value); });
    });
};

window.chScore = function(tid,op) {
    const card = document.querySelector(`.ts-a[data-tid="${tid}"]`)?.closest('.card');
    if (!card) return;
    const sel = card.querySelector('.tp-s'), inp = card.querySelector('.ts-i');
    if (!sel||!inp) return;
    const u = sel.value, s = parseInt(inp.value,10);
    if (!s) return;
    db.ref('tournaments/'+tid+'/participants').once('value').then(snap => {
        const p = snap.val()||[];
        let f = p.find(x=>x.username===u);
        if (!f) { f = { username:u, score:0 }; p.push(f); }
        f.score = op==='add'?f.score+s:Math.max(0,f.score-s);
        db.ref('tournaments/'+tid+'/participants').set(p);
        toast((op==='add'?'✅ +':'❌ -')+s+' → '+u);
    });
};

// ============ 💬 ЧАТ ============
window.rChat = function() {
    db.ref('messages').orderByChild('timestamp').limitToLast(50).on('value', async snap => {
        if (!(await checkModeration())) return;
        const m = snap.val()?Object.values(snap.val()):[];
        let h = '<div class="chat-area"><div class="chat-messages" id="cm">';
        if (!m.length) h+='<div class="empty-state">💬 Пусто</div>';
        else m.forEach(msg => {
            if (msg.isSystem || msg.username === '📢 SYSTEM') { h+=`<div class="msg system"><div class="msg-bubble"><div class="msg-name">📢 SYSTEM</div><div class="msg-text">${esc(msg.text||'')}</div></div></div>`; return; }
            const io = msg.username===currentUser.username;
            const vip = getCurrentVipRole({ vipRole: msg.vipRole, vipExpiresAt: msg.vipExpiresAt });
            const userSnap = { avatarUrl: msg.avatarUrl, nickAnim: msg.nickAnim, verified: msg.verified };
            h+=`<div class="msg${io?' own':''}">${avatarHTML(msg.username, userSnap, 30)}<div class="msg-bubble"><div class="msg-name">${nickHTML(msg.username, userSnap)}`;
            if (vip && ROLES[vip]) h += ` ${roleIcon(vip)}`;
            h+=`</div><div class="msg-text">${esc(msg.text||'')}</div></div></div>`;
        });
        h+=`</div><div class="chat-bar"><input class="chat-input" id="ci" placeholder="Сообщение..."><button class="chat-send" id="cs">➤</button></div></div>`;
        $('feedContainer').innerHTML = h;
        $('cs').onclick = async () => {
            if (!(await checkModeration())) return;
            const muteSnap = await db.ref('mutes/' + currentUser.username).once('value');
            const mute = muteSnap.val();
            if (mute && Date.now() < mute.until) { toast('🔇 У вас мут — писать нельзя'); return; }
            const txt = $('ci').value.trim();
            if (!txt) return;
            const meSnap = await db.ref('users/' + currentUser.username).once('value');
            const me = meSnap.val();
            db.ref('messages').push({ username:currentUser.username, text:txt, timestamp:firebase.database.ServerValue.TIMESTAMP, vipRole: me.vipRole, vipExpiresAt: me.vipExpiresAt, avatarUrl: me.avatarUrl || null, nickAnim: me.nickAnim || null, verified: me.verified || false });
            $('ci').value = '';
            updateQuestProgress('msg3'); updateQuestProgress('msg20');
        };
        db.ref('mutes/' + currentUser.username).once('value').then(s => {
            const mute = s.val();
            if (mute && Date.now() < mute.until) {
                const ci = $('ci');
                if (ci) { ci.disabled = true; ci.placeholder = '🔇 Вы в муте до ' + new Date(mute.until).toLocaleTimeString('ru-RU'); }
                const cs = $('cs');
                if (cs) { cs.disabled = true; cs.style.opacity = '0.4'; }
            }
        });
        setTimeout(() => { const cm = $('cm'); if (cm) cm.scrollTop = cm.scrollHeight; },100);
    });
};

// ============ 📩 ЛС ============
window.rPrivateChats = function() {
    db.ref('users').once('value').then(s => {
        const users = s.val()||{};
        let h = '<div class="divider">📩 Личные сообщения</div>';
        Object.keys(users).forEach(k => {
            if (k!==currentUser.username) h+=`<div class="private-chat-list"><div class="chat-item" onclick="window.openPrivateChat('${ea(k)}')">${avatarHTML(k, users[k], 30)}<span>${nickHTML(k, users[k])}</span></div></div>`;
        });
        h+='<div id="privateChatArea"></div>';
        $('feedContainer').innerHTML = h;
    });
};

window.openPrivateChat = function(target) {
    const chatId = [currentUser.username, target].sort().join('_');
    db.ref('privateChats/'+chatId).orderByChild('timestamp').limitToLast(50).on('value', snap => {
        const msgs = snap.val()?Object.values(snap.val()):[];
        let h = `<div class="divider">💬 С ${esc(target)}</div><div class="chat-messages" style="max-height:300px;overflow-y:auto;">`;
        msgs.forEach(m => {
            const io = m.from===currentUser.username;
            h+=`<div class="msg${io?' own':''}"><div class="msg-bubble"><div class="msg-name">${esc(m.from)}</div><div class="msg-text">${esc(m.text)}</div></div></div>`;
        });
        h+=`</div><div class="row-wrap" style="margin-top:8px;"><input class="input-sm" id="privateMsgInput" placeholder="Сообщение..." style="flex:1;"><button class="btn-sm btn-primary" onclick="window.sendPrivateMsg('${ea(target)}','${chatId}')">➤</button></div>`;
        document.getElementById('privateChatArea').innerHTML = h;
    });
};

window.sendPrivateMsg = function(target, chatId) {
    const txt = document.getElementById('privateMsgInput').value.trim();
    if (!txt) return;
    db.ref('privateChats/'+chatId).push({ from:currentUser.username, to:target, text:txt, timestamp:firebase.database.ServerValue.TIMESTAMP });
    document.getElementById('privateMsgInput').value = '';
};