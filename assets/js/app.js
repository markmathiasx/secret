
(function(){
  const cfg = window.MDH_CONFIG;
  const baseProducts = window.MDH_PRODUCTS_BASE || [];
  const products = window.MDH_PRODUCTS || baseProducts;
  const currency = (value) => new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL' }).format(value);
  const safeMsg = (text) => encodeURIComponent(text);

  function byId(id){ return document.getElementById(id); }
  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return [...root.querySelectorAll(sel)]; }

  function initYear(){ qsa('[data-year]').forEach((el)=> el.textContent = cfg.year); }
  function initMobileMenu(){
    const toggle = byId('mobileToggle'); const menu = byId('navLinks');
    if(!toggle || !menu) return;
    toggle.addEventListener('click', ()=> menu.classList.toggle('open'));
  }
  function initQuickPrompts(){
    qsa('[data-quick-prompts]').forEach((wrap) => {
      wrap.innerHTML = cfg.quickPrompts.map((text)=> `<a href="${cfg.whatsappLink}?text=${safeMsg(text)}">${text}</a>`).join('');
    });
  }
  function initBackToTop(){
    const btn = byId('backToTop'); if(!btn) return;
    window.addEventListener('scroll', ()=> btn.classList.toggle('show', window.scrollY > 480));
    btn.addEventListener('click', ()=> window.scrollTo({ top:0, behavior:'smooth' }));
  }
  function initTabs(){
    const buttons = qsa('[data-tab]'); if(!buttons.length) return;
    buttons.forEach((btn)=> btn.addEventListener('click', ()=> {
      buttons.forEach((b)=> b.classList.remove('active'));
      btn.classList.add('active');
      const target = btn.getAttribute('data-tab');
      qsa('.service-pane').forEach((pane)=> pane.classList.toggle('active', pane.id===target));
    }));
  }
  function initCounters(){
    qsa('[data-counter]').forEach((el)=> {
      const target = Number(el.getAttribute('data-counter'));
      let done = false;
      const run = () => {
        if(done) return; done = true;
        let current = 0;
        const step = Math.max(1, Math.ceil(target / 50));
        const tick = () => {
          current += step;
          if(current >= target) current = target;
          el.textContent = current.toLocaleString('pt-BR');
          if(current < target) requestAnimationFrame(tick);
        };
        tick();
      };
      const io = new IntersectionObserver((entries)=> {
        entries.forEach((entry)=> { if(entry.isIntersecting) { run(); io.disconnect(); } });
      }, { threshold: .3 });
      io.observe(el);
    });
  }
  function initFaq(){
    qsa('.faq-item button').forEach((btn)=> btn.addEventListener('click', ()=> btn.closest('.faq-item').classList.toggle('open')));
  }
  function initHeroUpload(){
    const heroInput = byId('heroFile'); const heroName = byId('heroFileName');
    if(heroInput && heroName){
      heroInput.addEventListener('change', ()=> {
        const file = heroInput.files?.[0];
        if(!file) return;
        const ok = validateFile(file);
        if(ok.valid){ heroName.textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)}MB`; }
        else { alert(ok.reason); heroInput.value = ''; heroName.textContent = 'Envie STL, OBJ ou 3MF até 50MB'; }
      });
    }
  }
  function validateFile(file){
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if(!cfg.allowedUploadExtensions.includes(ext)) return { valid:false, reason:'Arquivo inválido. Use .stl, .obj ou .3mf' };
    if(file.size > cfg.maxUploadSizeMb * 1024 * 1024) return { valid:false, reason:`Arquivo muito grande. Máximo ${cfg.maxUploadSizeMb}MB.` };
    return { valid:true };
  }
  function initUploadPage(){
    const fileInput = byId('quoteFile'); const zone = byId('dropZone'); if(!fileInput || !zone) return;
    const fileName = byId('quoteFileName'); const sendWhats = byId('sendWhatsApp'); const sendEmail = byId('sendEmail'); const saveLocal = byId('saveLocal');
    const fields = ['quoteName','quotePhone','quoteEmail','quoteNotes'];
    let selectedFile = null;
    const updateActions = () => {
      const name = byId('quoteName').value.trim() || 'Cliente';
      const phone = byId('quotePhone').value.trim();
      const email = byId('quoteEmail').value.trim();
      const notes = byId('quoteNotes').value.trim();
      const fileBlock = selectedFile ? `Arquivo: ${selectedFile.name} (${(selectedFile.size/1024/1024).toFixed(1)}MB)` : 'Arquivo: ainda não selecionado';
      const msg = `Olá! Quero orçamento para impressão 3D.%0A%0ANome: ${name}%0AWhatsApp: ${phone || '-'}%0AEmail: ${email || '-'}%0A${fileBlock}%0AObservações: ${notes || '-'}%0A%0APor favor, me orientem sobre material, prazo e valor.`;
      sendWhats.href = `${cfg.whatsappLink}?text=${msg}`;
      sendEmail.href = `mailto:${cfg.email}?subject=Orçamento STL MDH 3D&body=${msg}`;
    };
    function setFile(file){
      const res = validateFile(file);
      if(!res.valid){ alert(res.reason); return; }
      selectedFile = file; fileName.textContent = `${file.name} · ${(file.size/1024/1024).toFixed(1)}MB`; updateActions();
    }
    zone.addEventListener('dragover', (e)=> { e.preventDefault(); zone.classList.add('dragover'); });
    zone.addEventListener('dragleave', ()=> zone.classList.remove('dragover'));
    zone.addEventListener('drop', (e)=> { e.preventDefault(); zone.classList.remove('dragover'); const file = e.dataTransfer.files?.[0]; if(file) setFile(file); });
    fileInput.addEventListener('change', ()=> { const file = fileInput.files?.[0]; if(file) setFile(file); });
    fields.forEach((id)=> byId(id).addEventListener('input', updateActions));
    saveLocal.addEventListener('click', ()=> {
      const payload = {
        name: byId('quoteName').value.trim(),
        phone: byId('quotePhone').value.trim(),
        email: byId('quoteEmail').value.trim(),
        notes: byId('quoteNotes').value.trim(),
        fileName: selectedFile?.name || null,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem('mdh-last-quote', JSON.stringify(payload));
      alert('Rascunho salvo neste navegador. Seu arquivo não foi armazenado.');
    });
    updateActions();
  }

  function buildCard(product){
    const material = product.material;
    const acabamento = product.acabamento;
    const delivery = product.prazo;
    const prompt = `Oi! Vim pelo site e quero o produto ${product.nome} (${product.id}). Pode me passar disponibilidade?`;
    return `
      <article class="product-card fade-in-up">
        <div class="card-media">
          <img loading="lazy" src="${product.imagem}" alt="${product.nome} - ${product.categoria}">
          <span class="card-badge">${product.categoria}</span>
          ${product.disponivel ? '<span class="card-available">Pronta Entrega</span>' : ''}
        </div>
        <div class="card-body">
          <h4 class="card-title">${product.nome}</h4>
          <p class="card-description">${product.descricao}</p>
          <div class="tag-row">
            <span class="tag">${delivery}</span>
            <span class="tag">${material}</span>
            <span class="tag">${acabamento}</span>
          </div>
          <div class="price-box">
            <div>
              <div class="price-main">${currency(product.precoPix)}</div>
              <div class="price-sub">PIX à vista</div>
            </div>
            <div class="price-sub">12x de ${currency(product.precoParcelado / product.parcelas)}</div>
          </div>
          <div class="card-actions">
            <a class="button button-secondary" href="${cfg.whatsappLink}?text=${safeMsg(prompt)}">Ver Produto</a>
            <a class="button button-ghost" href="${cfg.whatsappLink}?text=${safeMsg('Quero comprar ' + product.nome)}">WhatsApp</a>
          </div>
        </div>
      </article>`;
  }

  function initCatalog(){
    const grid = byId('catalogGrid'); if(!grid) return;
    const search = byId('searchInput'); const category = byId('categoryFilter'); const collection = byId('collectionFilter');
    const sort = byId('sortFilter'); const minPrice = byId('minPrice'); const maxPrice = byId('maxPrice');
    const priceText = byId('priceText'); const countEl = byId('resultCount'); const pagination = byId('pagination'); const skeleton = byId('catalogSkeleton');
    const perPage = 25;
    let state = { page: 1, query:'', category:'Todas', collection:'Todas', sort:'recentes', min:20, max:500 };

    const hydrateProducts = products.map((item, idx)=> ({ ...item, idx }));
    function filterProducts(){
      let filtered = hydrateProducts.filter((p)=> {
        const matchQuery = `${p.nome} ${p.descricao} ${p.tags.join(' ')}`.toLowerCase().includes(state.query.toLowerCase());
        const matchCat = state.category === 'Todas' ? true : p.categoria === state.category;
        const matchCol = state.collection === 'Todas' ? true : p.colecao === state.collection;
        const matchPrice = p.precoPix >= state.min && p.precoPix <= state.max;
        return matchQuery && matchCat && matchCol && matchPrice;
      });
      if(state.sort === 'menor') filtered.sort((a,b)=> a.precoPix - b.precoPix);
      if(state.sort === 'maior') filtered.sort((a,b)=> b.precoPix - a.precoPix);
      if(state.sort === 'az') filtered.sort((a,b)=> a.nome.localeCompare(b.nome, 'pt-BR'));
      if(state.sort === 'recentes') filtered.sort((a,b)=> b.maisRecente - a.maisRecente);
      return filtered;
    }
    function showSkeleton(){ skeleton.classList.remove('hidden'); grid.classList.add('hidden'); }
    function hideSkeleton(){ skeleton.classList.add('hidden'); grid.classList.remove('hidden'); }
    function render(){
      showSkeleton();
      setTimeout(()=> {
        const filtered = filterProducts();
        countEl.textContent = filtered.length.toLocaleString('pt-BR');
        priceText.textContent = `${currency(state.min)} — ${currency(state.max)}`;
        const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
        if(state.page > totalPages) state.page = totalPages;
        const start = (state.page - 1) * perPage;
        const pageItems = filtered.slice(start, start + perPage);
        grid.innerHTML = pageItems.map(buildCard).join('');
        pagination.innerHTML = Array.from({ length: totalPages }, (_,i)=> i+1).map((page)=> `<button class="page-btn ${page===state.page ? 'active' : ''}" data-page="${page}">${page}</button>`).join('');
        qsa('.page-btn', pagination).forEach((btn)=> btn.addEventListener('click', ()=> { state.page = Number(btn.dataset.page); render(); window.scrollTo({ top: qs('.catalog-shell').offsetTop - 90, behavior:'smooth' }); }));
        hideSkeleton();
      }, 320);
    }
    [search, category, collection, sort].forEach((el)=> el.addEventListener('input', ()=> { state.page = 1; state.query = search.value; state.category = category.value; state.collection = collection.value; state.sort = sort.value; render(); }));
    [minPrice, maxPrice].forEach((el)=> el.addEventListener('input', ()=> {
      if(Number(minPrice.value) > Number(maxPrice.value)) {
        if(el === minPrice) maxPrice.value = minPrice.value; else minPrice.value = maxPrice.value;
      }
      state.min = Number(minPrice.value); state.max = Number(maxPrice.value); state.page = 1; render();
    }));
    render();
  }

  initYear(); initMobileMenu(); initQuickPrompts(); initBackToTop(); initTabs(); initCounters(); initFaq(); initHeroUpload(); initUploadPage(); initCatalog();
})();
