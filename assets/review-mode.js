/* Local copy-review mode. Enable with ?review=1. Notes stay in this browser. */
(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('review') !== '1') return;
  const page = location.pathname.split('/').pop() || 'index.html';
  const storeKey = 'aayushi-portfolio-copy-reviews-v1';
  let reviews = {};
  try { reviews = JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch (_) {}
  const candidates = [...document.querySelectorAll('h1,h2,h3,h4,p,li,.eyebrow,.micro,.stream-note,.hand,.highlight,.project-cat,.project-desc,.project-title,.step-no,.step p,.role-note,.date')];
  const seen = new Set();
  let selected = null;
  candidates.forEach((el, i) => {
    if (el.closest('#copy-review-panel') || el.closest('nav') || el.closest('footer')) return;
    const text = (el.innerText || '').trim();
    if (!text || seen.has(el)) return;
    seen.add(el);
    const id = el.id ? page + '#' + el.id : page + ':' + el.tagName.toLowerCase() + ':' + i;
    el.dataset.reviewId = id;
    el.classList.add('review-target');
    el.addEventListener('click', e => {
      if (e.target.closest('a,button,input,textarea,select,summary')) return;
      e.preventDefault();
      e.stopPropagation();
      select(el);
    }, true);
  });
  const style = document.createElement('style');
  style.textContent = `
    .review-target{cursor:crosshair;outline:1px dashed transparent;outline-offset:4px;transition:outline-color .12s}
    .review-target:hover{outline-color:#7B0828}
    .review-target.review-selected{outline:2px solid #7B0828!important;outline-offset:5px;background-color:#E8AA141c}
    #copy-review-panel{position:fixed;z-index:99999;right:18px;bottom:18px;width:min(370px,calc(100vw - 36px));background:#F7F5EF;color:#171916;border:1px solid #c9c4b8;box-shadow:0 12px 40px #17191630;padding:16px;font:13px/1.45 'DM Sans',Arial,sans-serif}
    #copy-review-panel *{box-sizing:border-box}
    #copy-review-panel .cr-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}
    #copy-review-panel .cr-kicker{font:10px 'DM Mono',monospace;letter-spacing:.12em;text-transform:uppercase;color:#7B0828}
    #copy-review-panel button{border:1px solid #012622;background:#012622;color:#F7F5EF;padding:9px 11px;font:600 11px 'DM Sans',sans-serif;cursor:pointer}
    #copy-review-panel button.secondary{background:transparent;color:#012622}
    #copy-review-panel textarea{display:block;width:100%;min-height:100px;resize:vertical;border:1px solid #c9c4b8;background:#fffdf7;padding:10px;font:13px/1.5 'DM Sans',sans-serif;color:#171916;margin:9px 0}
    #copy-review-panel .cr-context{font:12px/1.4 'Playfair Display',Georgia,serif;color:#555950;max-height:70px;overflow:auto;border-left:2px solid #E8AA14;padding-left:9px}
    #copy-review-panel .cr-actions{display:flex;flex-wrap:wrap;gap:7px}
    #copy-review-panel .cr-status{font:10px 'DM Mono',monospace;color:#555950;margin-top:9px}
    #copy-review-panel .cr-help{font-size:11px;color:#555950;margin:8px 0}
  `;
  document.head.appendChild(style);
  const panel = document.createElement('aside');
  panel.id = 'copy-review-panel';
  panel.innerHTML = `
    <div class="cr-head"><span class="cr-kicker">Copy review / local mode</span><button type="button" class="secondary" id="cr-close">Close</button></div>
    <div class="cr-help">Select any highlighted copy on the page, then leave your note. Your website copy will not change.</div>
    <div class="cr-context" id="cr-context">Choose a copy block to begin.</div>
    <textarea id="cr-note" placeholder="What should change? What feels unclear, repetitive or off-tone?"></textarea>
    <div class="cr-actions"><button type="button" id="cr-save">Save note</button><button type="button" class="secondary" id="cr-export">Export reviews</button><button type="button" class="secondary" id="cr-clear">Clear all</button></div>
    <div class="cr-status" id="cr-status">0 notes saved in this browser</div>`;
  document.body.appendChild(panel);
  const note = panel.querySelector('#cr-note');
  const context = panel.querySelector('#cr-context');
  const status = panel.querySelector('#cr-status');
  const updateStatus = () => status.textContent = Object.keys(reviews).length + ' notes saved in this browser';
  function select(el) {
    document.querySelectorAll('.review-selected').forEach(x => x.classList.remove('review-selected'));
    selected = el;
    el.classList.add('review-selected');
    context.textContent = (el.innerText || '').trim();
    note.value = reviews[el.dataset.reviewId]?.note || '';
    updateStatus();
  }
  panel.querySelector('#cr-save').addEventListener('click', () => {
    if (!selected) { status.textContent = 'Select a copy block first.'; return; }
    const id = selected.dataset.reviewId;
    const value = note.value.trim();
    if (value) reviews[id] = {page, blockId:id, copy:(selected.innerText || '').trim(), note:value, updatedAt:new Date().toISOString()};
    else delete reviews[id];
    localStorage.setItem(storeKey, JSON.stringify(reviews));
    updateStatus();
    status.textContent = 'Saved locally. ' + Object.keys(reviews).length + ' notes total.';
  });
  panel.querySelector('#cr-export').addEventListener('click', () => {
    const payload = {project:'Aayushi portfolio copy review', exportedAt:new Date().toISOString(), notes:Object.values(reviews)};
    const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='aayushi-portfolio-copy-reviews.json'; a.click();
    URL.revokeObjectURL(url);
    status.textContent = 'Review file exported.';
  });
  panel.querySelector('#cr-clear').addEventListener('click', () => {
    if (!confirm('Clear all copy-review notes saved in this browser?')) return;
    reviews = {}; localStorage.removeItem(storeKey); note.value=''; updateStatus();
  });
  panel.querySelector('#cr-close').addEventListener('click', () => panel.remove());
  updateStatus();
})();