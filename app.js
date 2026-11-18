/* TAGENCY website v3 */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const mobile = () => matchMedia('(max-width:1024px)').matches;

  // header shadow + back-to-top
  const header = $('.site-header'), top = $('.totop'), rail = $('.rail');
  const onScroll = () => {
    const y = scrollY;
    rail && rail.classList.toggle('show', y > 420);
    header && header.classList.toggle('scrolled', y > 10);
    top && top.classList.toggle('show', y > 700);
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  top && top.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

  // mobile drawer
  const burger = $('.burger'), nav = $('#nav');
  const closeNav = () => { nav.classList.remove('open'); header.classList.remove('menu-open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; };
  burger && burger.addEventListener('click', () => {
    const open = !nav.classList.contains('open');
    nav.classList.toggle('open', open); header.classList.toggle('menu-open', open); burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // mega menu: click toggles (mobile accordion, desktop keyboard/touch)
  $$('.has-mega > .nav-link').forEach(btn => btn.addEventListener('click', () => {
    const li = btn.parentElement, open = !li.classList.contains('open');
    $$('.has-mega.open').forEach(o => { if (o !== li) { o.classList.remove('open'); $('.nav-link', o).setAttribute('aria-expanded', 'false'); } });
    li.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open));
  }));
  document.addEventListener('click', e => {
    if (!mobile() && !e.target.closest('.has-mega')) $$('.has-mega.open').forEach(o => { o.classList.remove('open'); $('.nav-link', o).setAttribute('aria-expanded', 'false'); });
  });
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    $$('.has-mega.open').forEach(o => o.classList.remove('open'));
    if (nav && nav.classList.contains('open')) closeNav();
    if (document.activeElement && document.activeElement.closest('.mega')) document.activeElement.blur();
  });
  $$('#nav a').forEach(a => a.addEventListener('click', () => { if (mobile()) closeNav(); }));

  // carousel
  // carousel dự án: slide ở giữa nổi bật, hai bên mờ
  const car = $('#case-car');
  if (car) {
    const slides = $$('.slide', car);
    let cur = 0;
    const center = s => s.offsetLeft - car.offsetLeft + s.offsetWidth / 2;
    const mark = () => {
      const mid = car.scrollLeft + car.clientWidth / 2;
      let best = 0, d = Infinity;
      slides.forEach((s, i) => { const x = Math.abs(center(s) - mid); if (x < d) { d = x; best = i; } });
      cur = best; slides.forEach((s, i) => s.classList.toggle('active', i === best));
    };
    const go = i => {
      cur = (i + slides.length) % slides.length;
      car.scrollTo({ left: center(slides[cur]) - car.clientWidth / 2, behavior: 'smooth' });
    };
    car.classList.add('ready'); mark();
    car.addEventListener('scroll', mark, { passive: true });
    addEventListener('resize', mark);
    $$('.car-foot .car-btn').forEach(b => b.addEventListener('click', () => go(cur + +b.dataset.dir)));
    slides.forEach((s, i) => s.addEventListener('click', e => { if (i !== cur) { e.preventDefault(); go(i); } }));
    car.addEventListener('keydown', e => { if (e.key === 'ArrowRight') go(cur + 1); if (e.key === 'ArrowLeft') go(cur - 1); });
  }

  // nút cuộn ngang dùng chung (dải giải pháp)
  $$('.sc-btn').forEach(b => b.addEventListener('click', () => {
    const t = $(b.dataset.target); if (!t) return;
    const dir = +b.dataset.dir, max = t.scrollWidth - t.clientWidth - 4;
    const step = (t.firstElementChild ? t.firstElementChild.getBoundingClientRect().width : 320);
    if (dir > 0 && t.scrollLeft >= max) t.scrollTo({ left: 0, behavior: 'smooth' });
    else if (dir < 0 && t.scrollLeft <= 4) t.scrollTo({ left: max, behavior: 'smooth' });
    else t.scrollBy({ left: dir * step, behavior: 'smooth' });
  }));

  // project filters
  const chips = $$('.chip'), status = $('#filter-status');
  chips.forEach(ch => ch.addEventListener('click', () => {
    const f = ch.dataset.f; let n = 0;
    chips.forEach(c => { const on = c === ch; c.classList.toggle('active', on); c.setAttribute('aria-pressed', String(on)); });
    $$('.nw-all .nw-item').forEach(c => { const show = f === 'all' || c.dataset.source === f; c.classList.toggle('hide', !show); if (show) n++; });
    $$('.art-grid .art-card').forEach(card => { const show = f === 'all' || card.dataset.cat === f; card.classList.toggle('hide', !show); if (show) n++; });
    $$('.case-grid .case-card').forEach(card => {
      const show = f === 'all' || card.dataset.cat.split(' ').includes(f);
      card.classList.toggle('hide', !show); if (show) n++;
    });
    if (status) status.textContent = `Đang hiển thị ${n} dự án`;
  }));

  // thời gian tương đối cho tin tức
  $$('time[datetime]').forEach(t => {
    const d = new Date(t.getAttribute('datetime')); if (isNaN(d)) return;
    const m = Math.max(1, Math.round((Date.now() - d) / 60000));
    t.textContent = m < 60 ? `${m} phút trước` : m < 1440 ? `${Math.round(m / 60)} giờ trước` : m < 43200 ? `${Math.round(m / 1440)} ngày trước` : d.toLocaleDateString('vi-VN');
  });

  // showreel
  const rb = $('.reel-play'), rv = $('#reel-video');
  if (rb && rv) rb.addEventListener('click', () => {
    const id = (rv.dataset.src || '').match(/embed\/([\w-]{11})/), watch = id ? 'https://www.youtube.com/watch?v=' + id[1] : '';
    // Lỗi 153: YouTube cần biết trang nhúng (Referer). Trang chạy trong khung xem trước hoặc file cục bộ thì mở thẳng YouTube.
    let framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
    if (watch && (framed || location.protocol === 'file:')) { window.open(watch, '_blank', 'noopener'); return; }
    rb.classList.add('gone'); rb.parentElement.classList.add('playing');
    if (id) {
      const f = document.createElement('iframe');
      f.src = 'https://www.youtube.com/embed/' + id[1] + '?autoplay=1&rel=0&playsinline=1&origin=' + encodeURIComponent(location.origin);
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      f.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture'; f.allowFullscreen = true; f.title = 'Showreel TAGENCY';
      rv.appendChild(f); rv.classList.add('on');
    } else { rv.controls = true; rv.play(); }
    $$('.reel-poster').forEach(ps => ps.classList.add('gone'));
  });

  // câu chuyện thành công (carousel trung tâm, vòng lặp)
  const sg = $('.story-stage');
  if (sg) {
    const tr = $('.story-track', sg), ss = $$('.st', tr), N = ss.length / 3, dots = $$('.story-dots i');
    const tt = $('.story-title'), td = $('.story-desc'), tc = $('.story-cat');
    let cur = N, timer;
    ss.forEach((s, k) => { if (k < N || k >= 2 * N) { s.tabIndex = -1; s.setAttribute('aria-hidden', 'true'); } });
    const place = anim => {
      const s = ss[cur]; tr.style.transition = anim ? '' : 'none';
      tr.style.transform = `translateX(${sg.clientWidth / 2 - (s.offsetLeft + s.offsetWidth / 2)}px)`;
      if (!anim) { void tr.offsetWidth; tr.style.transition = ''; }
    };
    const mark = () => {
      ss.forEach((s, k) => { s.classList.toggle('active', k === cur); s.classList.toggle('prev', k === cur - 1); s.classList.toggle('next', k === cur + 1); });
      dots.forEach((d, k) => d.classList.toggle('on', k === cur % N));
    };
    const info = () => {
      const a = ss[cur]; tc.textContent = a.dataset.cat; tt.textContent = a.dataset.title; td.textContent = a.dataset.desc;
      [tt, td, tc].forEach(x => { x.classList.remove('swap'); void x.offsetWidth; x.classList.add('swap'); });
    };
    const go = n => {
      cur = n; mark(); info(); place(true);
      clearTimeout(go.t);
      go.t = setTimeout(() => { if (cur < N || cur >= 2 * N) { cur = N + (cur % N); mark(); place(false); } }, 900);
    };
    const auto = () => { clearInterval(timer); if (!matchMedia('(prefers-reduced-motion: reduce)').matches) timer = setInterval(() => go(cur + 1), 6000); };
    $('.story-btn.prev').addEventListener('click', () => { go(cur - 1); auto(); });
    $('.story-btn.next').addEventListener('click', () => { go(cur + 1); auto(); });
    ss.forEach((s, k) => s.addEventListener('click', ev => { if (k !== cur) { ev.preventDefault(); go(k); auto(); } }));
    dots.forEach((d, k) => d.addEventListener('click', () => { go(N + k); auto(); }));
    sg.addEventListener('mouseenter', () => clearInterval(timer)); sg.addEventListener('mouseleave', auto);
    addEventListener('resize', () => place(false)); addEventListener('load', () => place(false));
    mark(); info(); place(false); auto();
  }

  // solutions sticky nav highlight
  const solLinks = $$('.sol-nav a');
  if (solLinks.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) solLinks.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + en.target.id));
    }), { rootMargin: '-45% 0px -50% 0px' });
    $$('.sol-detail').forEach(s => io.observe(s));
  }

  // reveal on scroll
  const targets = $$('.sec-head, .case-card, .cl-marquee, .ai-orbit, .ind-row, .ind-side, .fw-group, .ai-card, .ai-side, .consult-form, .val, .art-card, .art-row, .svc-card, .need, .scope, .cs-block, .consult-in, .sd-in, .steps li, .solx-intro, .solx-col, .case-gallery figure');
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    targets.forEach((t, i) => { if (t.getBoundingClientRect().top > innerHeight) { t.classList.add('reveal'); t.style.transitionDelay = (i % 6) * 60 + 'ms'; io.observe(t); } });
    // bỏ delay sau khi hiện để hover không bị trễ
    document.addEventListener('transitionend', e => { const t = e.target; if (t.classList && t.classList.contains('reveal') && t.classList.contains('in')) { t.classList.remove('reveal', 'in'); t.style.transitionDelay = ''; } });
  }

  // biểu mẫu đặt lịch: gửi về data-endpoint nếu có, không thì mở ứng dụng email
  const goi = new URLSearchParams(location.search).get('goi');
  $$('form.brief').forEach(form => {
    if (goi && form.message) form.message.value = `Tôi quan tâm giải pháp ${goi}. `;
    form.addEventListener('submit', e => {
      e.preventDefault();
      const err = $('.f-err', form), ok = $('.f-ok', form), btn = $('button[type=submit]', form); let bad = [];
      $$('[required]', form).forEach(el => { const good = el.value.trim() !== ''; el.classList.toggle('invalid', !good); if (!good) bad.push(el); });
      if (form.email && form.email.value && !form.email.checkValidity()) { form.email.classList.add('invalid'); bad.push(form.email); }
      if (bad.length) { err.hidden = false; err.textContent = 'Vui lòng điền đủ các mục có dấu * và kiểm tra email.'; bad[0].focus(); return; }
      err.hidden = true;
      const d = Object.fromEntries(new FormData(form));
      d.page = location.pathname.split('/').pop() || 'index.html'; d.time = new Date().toISOString();
      const mail = () => {
        const subject = `[Đặt lịch] ${d.service} — ${d.company || d.name}`;
        const body = `Họ tên: ${d.name}\nCông ty: ${d.company || ''}\nĐiện thoại: ${d.phone}\nEmail: ${d.email || ''}\nDịch vụ: ${d.service}\nTrang: ${d.page}\n\n${d.message}`;
        location.href = `mailto:agencymedia.t@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        ok.hidden = false; ok.textContent = 'Đã mở ứng dụng email với nội dung bạn điền — hãy bấm Gửi để hoàn tất.';
      };
      const ep = form.dataset.endpoint;
      if (!ep) return mail();
      btn.disabled = true;
      fetch(ep, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(d) })
        .then(() => { form.reset(); ok.hidden = false; ok.textContent = 'Đã nhận thông tin. TAGENCY sẽ liên hệ với bạn sớm.'; })
        .catch(mail).finally(() => { btn.disabled = false; });
    });
  });

  // ô prompt AI: gõ chữ lần lượt các câu mẫu
  $$('.ai-type').forEach(el => {
    const list = (el.dataset.text || '').split('|'); let i = 0, n = 0, del = false;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = list[0]; return; }
    const tick = () => {
      const t = list[i]; n += del ? -1 : 1; el.textContent = t.slice(0, n);
      let wait = del ? 22 : 48;
      if (!del && n === t.length) { del = true; wait = 1600; }
      else if (del && n === 0) { del = false; i = (i + 1) % list.length; wait = 350; }
      setTimeout(tick, wait);
    };
    tick();
  });
})();


/* v6: dự án theo sản phẩm + gói AI */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---- Dự án: lọc theo dòng sản phẩm ----
  const shelves = $$('.pr-shelf');
  if (shelves.length) {
    const chips = $$('.pchip[data-sp]'), tiles = $$('.pr-tile'), st = $('#pr-status');
    const show = (sp, scroll) => {
      if (!chips.some(c => c.dataset.sp === sp)) sp = 'all';
      chips.forEach(c => { const on = c.dataset.sp === sp; c.classList.toggle('active', on); c.setAttribute('aria-pressed', String(on)); });
      tiles.forEach(t => t.classList.toggle('on', t.dataset.sp === sp));
      shelves.forEach(s => { const on = sp === 'all' || s.dataset.sp === sp; s.classList.toggle('hide', !on); s.classList.toggle('only', on && sp !== 'all'); });
      const chip = chips.find(c => c.dataset.sp === sp);
      chip && chip.scrollIntoView({ block: 'nearest', inline: 'center' });
      if (st) st.textContent = sp === 'all' ? 'Đang xem tất cả sản phẩm' : 'Đang xem: ' + chip.textContent.trim();
      if (scroll) { const t = sp === 'all' ? $('.pr-shelves') : $('#sp-' + sp); t && t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    };
    chips.forEach(c => c.addEventListener('click', () => {
      const sp = c.dataset.sp;
      history.replaceState(null, '', sp === 'all' ? location.pathname : '#sp-' + sp);
      show(sp, true);
    }));
    tiles.forEach(t => t.addEventListener('click', e => {
      e.preventDefault(); history.replaceState(null, '', '#sp-' + t.dataset.sp); show(t.dataset.sp, true);
    }));
    const fromHash = () => { const m = location.hash.match(/^#sp-([\w-]+)$/); if (m) show(m[1], true); };
    addEventListener('hashchange', fromHash);
    fromHash();
  }

  // ---- Gói AI: mở hộp ----
  const openPack = (card, on = true) => {
    const btn = $('.pk-open', card), box = $('.pk-in', card);
    card.classList.toggle('open', on); box.hidden = !on;
    btn.setAttribute('aria-expanded', String(on));
    $('.pk-open-t', btn).textContent = on ? 'Đóng gói' : 'Mở gói xem bên trong';
  };
  $$('.pk-card').forEach(card => $('.pk-open', card).addEventListener('click', () => openPack(card, !card.classList.contains('open'))));
  const hashPack = () => { let c = null; try { c = location.hash && $(location.hash + '.pk-card'); } catch (e) {} if (c) { openPack(c); c.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };
  addEventListener('hashchange', hashPack); hashPack();

  // nút "Tôi muốn gói này" -> điền sẵn form
  $$('[data-want]').forEach(a => a.addEventListener('click', () => {
    const f = $('#dat-lich form'); if (!f) return;
    const sel = f.querySelector('select[name=service]'), msg = f.querySelector('textarea[name=message]');
    if (sel) [...sel.options].forEach(o => { if (o.text === 'Tích hợp AI vào marketing') sel.value = o.value; });
    if (msg) { const line = 'Tôi quan tâm: ' + a.dataset.want + '.'; if (!msg.value.includes(line)) msg.value = (line + ' ' + msg.value).trim(); }
    setTimeout(() => { const n = f.querySelector('input[name=name]'); n && n.focus({ preventScroll: true }); }, 700);
  }));

  // ---- Quiz chọn gói ----
  const qz = $('#qz');
  if (qz) {
    const qs = $$('.qz-q', qz), res = $('.qz-r', qz); let score = {}, step = 0;
    const go = i => { qs.forEach((q, k) => q.hidden = k !== i); res.hidden = i < qs.length; };
    $$('.qz-opts button', qz).forEach(b => b.addEventListener('click', () => {
      b.dataset.s.split(',').forEach(p => { const [k, v] = p.split(':'); score[k] = (score[k] || 0) + +v; });
      step++;
      if (step < qs.length) { go(step); $('button', qs[step]).focus(); return; }
      const best = Object.entries(score).sort((a, b) => b[1] - a[1])[0][0];
      const card = $('#goi-' + best);
      $('.qz-name', res).textContent = $('.pk-name', card).textContent;
      $('.qz-hook', res).textContent = $('h3', card).textContent;
      const g = $('.qz-go', res); g.href = '#goi-' + best;
      g.onclick = e => { e.preventDefault(); openPack(card); card.scrollIntoView({ behavior: 'smooth', block: 'start' }); card.classList.remove('pulse'); void card.offsetWidth; card.classList.add('pulse'); };
      go(qs.length); $('.qz-name', res).setAttribute('tabindex', '-1'); $('.qz-name', res).focus();
    }));
    $('.qz-reset', qz).addEventListener('click', () => { score = {}; step = 0; go(0); });
  }
})();

/* v6.1: mega menu Dịch vụ — rê chuột/focus để đổi tab */
(() => {
  document.querySelectorAll('.svm').forEach(m => {
    const tabs = [...m.querySelectorAll('.svm-tab')], panels = [...m.querySelectorAll('.svm-panel')];
    const act = id => { tabs.forEach(t => t.classList.toggle('on', t.dataset.svm === id)); panels.forEach(p => p.classList.toggle('on', p.dataset.svm === id)); };
    tabs.forEach(t => { t.addEventListener('mouseenter', () => act(t.dataset.svm)); t.addEventListener('focus', () => act(t.dataset.svm)); });
  });
})();

/* v6.3: Tagi AI — trợ lý tư vấn tự động (kịch bản, chạy trên trình duyệt) */
(() => {
  const PHONE = '0369 222 331', TEL = 'tel:0369222331', ZALO = 'https://zalo.me/0369222331', MAIL = 'agencymedia.t@gmail.com';
  const AV = 'assets/tagi-avatar.webp';
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

  const MENU = [['Làm phim doanh nghiệp', 'phim'], ['Animation & mascot', 'anim'], ['Nhận diện, ấn phẩm', 'thietke'], ['Hình ảnh sự kiện', 'sukien'], ['Thiết kế website', 'web'], ['Gói AI marketing', 'ai'], ['Chi phí thế nào?', 'gia'], ['Gặp người tư vấn', 'lead']];
  const NEXT = [['Chi phí thế nào?', 'gia'], ['Quy trình làm việc', 'quytrinh'], ['Để lại số điện thoại', 'lead'], ['Hỏi việc khác', 'menu']];
  const KB = {
    phim: { k: ['phim', 'tvc', 'video', 'quay', 'ky niem', 'thanh lap', 'phong su', 'tai lieu', 'gioi thieu cong ty'],
      a: 'TAGENCY làm <b>TVC, phim giới thiệu doanh nghiệp, phim kỷ niệm thành lập, phim tài liệu và video sự kiện</b>. Case gần nhất: <a href="du-an-mai-viet.html">phim 6 năm Mai Việt Land</a>, <a href="du-an-cwd.html">phim tài liệu CWD</a>. Xem chi tiết tại <a href="dich-vu-phim.html">Phim thương hiệu</a>.' },
    anim: { k: ['animation', 'hoat hinh', 'motion', 'mascot', 'nhan vat', 'explainer', 'dao tao', 'elearning', 'linh vat'],
      a: 'Mảng mạnh của TAGENCY: <b>phim hoạt hình 2D, motion graphics, mascot và hệ nhân vật</b>. Ví dụ: <a href="du-an-vatm.html">30 phim đào tạo cho VATM</a>, <a href="du-an-bidv.html">8 phim văn hóa BIDV</a>, <a href="du-an-fecon.html">mascot FECON</a>.' },
    thietke: { k: ['logo', 'nhan dien', 'thiet ke', 'catalogue', 'brochure', 'ho so nang luc', 'bao cao thuong nien', 'an pham', 'so tay', 'key visual', 'guideline'],
      a: 'Bên mình thiết kế <b>nhận diện, hồ sơ năng lực, catalogue, báo cáo thường niên, sổ tay văn hóa và key visual</b>. Tham khảo: <a href="du-an-vnp.html">nhận diện Vietnam Post Logistics</a>, <a href="du-an-kdi.html">catalogue KDI</a>. Xem tất cả theo loại sản phẩm tại <a href="du-an.html">trang Dự án</a>.' },
    sukien: { k: ['su kien', 'backdrop', 'san khau', 'led', 'standee', 'hoi nghi', 'le', 'gala', 'tat nien', 'year end'],
      a: 'Với sự kiện, TAGENCY làm trọn <b>key visual, backdrop, standee, nội dung LED, video mở màn và video tổng kết</b>. Ví dụ: <a href="du-an-nikko.html">Hotel Nikko</a>, <a href="du-an-vaba.html">VABA CUP</a>. Bạn nhớ báo ngày diễn ra sự kiện để mình xếp lịch nhé.' },
    web: { k: ['web', 'website', 'landing', 'trang', 'seo'],
      a: 'Mình làm <b>website giới thiệu doanh nghiệp, landing page chiến dịch, website dự án và trang portfolio</b>, có sẵn biểu mẫu thu khách. Xem <a href="dich-vu-thiet-ke-website.html">Thiết kế website</a>.' },
    ai: { k: ['ai', 'chatgpt', 'gpt', 'claude', 'gemini', 'tu dong', 'chatbot', 'prompt'],
      a: 'TAGENCY có <b>6 gói AI</b>: AI Mirror (ChatGPT nói gì về công ty bạn), Brand Voice, Mascot Live, Ký ức chuyển động, Studio không máy quay, Cỗ máy nội dung 30 ngày. <a href="ai-marketing.html#goi-ai">Mở các gói AI</a> — có cả bản soi AI miễn phí.' },
    gia: { k: ['gia', 'chi phi', 'bao nhieu', 'bao gia', 'ngan sach', 'tien', 'phi'],
      a: 'Chi phí phụ thuộc vào <b>loại sản phẩm, độ dài, số bối cảnh và thời gian cần bàn giao</b>, nên TAGENCY không đưa giá chung chung. Buổi trao đổi đầu tiên <b>miễn phí</b>; sau khi nắm brief, bên mình gửi báo giá chi tiết theo từng hạng mục. Bạn có thể cho mình biết ngân sách dự kiến để được tư vấn phương án phù hợp.' },
    quytrinh: { k: ['quy trinh', 'bao lau', 'thoi gian', 'tien do', 'lam the nao', 'cac buoc'],
      a: 'Quy trình <b>T·A·G</b> 6 bước: lắng nghe brief → định vị thông điệp → concept hình ảnh → kịch bản & storyboard → sản xuất & hậu kỳ → bàn giao. Thời gian tùy hạng mục, sẽ được chốt cùng mốc duyệt ngay từ đầu. <a href="gioi-thieu.html#quy-trinh">Xem quy trình</a>.' },
    duan: { k: ['du an', 'portfolio', 'khach hang', 'da lam', 'case', 'mau'],
      a: 'Bạn xem các dự án đã chia theo từng loại sản phẩm tại <a href="du-an.html">trang Dự án</a> — phim, animation, mascot, nhận diện, ấn phẩm, sự kiện… Phim và video có trên <a href="https://www.youtube.com/@tmediaagency8888" target="_blank" rel="noopener">kênh YouTube</a>.' },
    lienhe: { k: ['lien he', 'sdt', 'so dien thoai', 'hotline', 'zalo', 'email', 'dia chi', 'goi'],
      a: `Bạn gọi hoặc nhắn Zalo <a href="${TEL}">${PHONE}</a>, email <a href="mailto:${MAIL}">${MAIL}</a>. Hoặc để lại số, TAGENCY sẽ gọi lại.` },
    chao: { k: ['xin chao', 'chao', 'hello', 'hi', 'alo'], a: 'Chào bạn! Bạn đang cần làm sản phẩm hình ảnh nào để mình tư vấn đúng hướng?' },
  };

  let step = null, lead = {};
  const fab = document.createElement('button');
  fab.className = 'tagi-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Chat với Tagi AI');
  fab.innerHTML = `<img src="${AV}" alt=""><i></i><span>Hỏi Tagi AI</span>`;
  const win = document.createElement('section');
  win.className = 'tagi-win'; win.setAttribute('aria-label', 'Chat với Tagi AI'); win.setAttribute('role', 'dialog');
  win.innerHTML = `<div class="tg-top"><img src="${AV}" alt=""><div><b>Tagi AI</b><small>Trợ lý tư vấn của TAGENCY</small></div><button type="button" class="tg-x" aria-label="Đóng">×</button></div>
<div class="tg-body" aria-live="polite"></div>
<form class="tg-in"><input type="text" placeholder="Nhập câu hỏi của bạn…" aria-label="Câu hỏi" autocomplete="off"><button type="submit" aria-label="Gửi"><svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></form>
<p class="tg-note">Tagi trả lời tự động · Báo giá chính thức do TAGENCY gửi sau khi trao đổi</p>`;
  document.body.append(fab, win);
  const body = win.querySelector('.tg-body'), form = win.querySelector('.tg-in'), input = form.querySelector('input');

  const scroll = () => { body.scrollTop = body.scrollHeight; };
  const say = (html, who = 'bot') => { const m = document.createElement('div'); m.className = 'tg-m ' + who; if (who === 'me') m.textContent = html; else m.innerHTML = html; body.append(m); scroll(); return m; };
  const chips = list => { const c = document.createElement('div'); c.className = 'tg-chips'; list.forEach(([t, v]) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.onclick = () => { c.remove(); say(t, 'me'); route(v); }; c.append(b); }); body.append(c); scroll(); };
  const bot = (html, next) => new Promise(r => { const t = say('<i></i><i></i><i></i>'); t.classList.add('typing'); setTimeout(() => { t.remove(); say(html); next && chips(next); r(); }, 550); });

  const route = v => {
    if (v === 'goform') { close(); document.querySelector('#dat-lich').scrollIntoView({ behavior: 'smooth' }); return; }
    if (v === 'zalo') { window.open(ZALO, '_blank', 'noopener'); return; }
    if (v === 'menu') return bot('Bạn muốn tìm hiểu thêm về mảng nào?', MENU);
    if (v === 'lead') { step = 'name'; lead = {}; return bot('Tuyệt! Cho mình xin <b>tên của bạn</b> nhé.'); }
    const it = KB[v]; if (it) return bot(it.a, v === 'gia' ? [['Để lại số điện thoại', 'lead'], ['Quy trình làm việc', 'quytrinh'], ['Hỏi việc khác', 'menu']] : NEXT);
  };
  const match = text => {
    const t = ' ' + norm(text) + ' '; let best = null, sc = 0;
    for (const [id, it] of Object.entries(KB)) { let s = 0; it.k.forEach(k => { if (t.includes(' ' + k + ' ') || (k.length > 3 && t.includes(k))) s += k.length; }); if (s > sc) { sc = s; best = id; } }
    return best;
  };
  const finishLead = () => {
    step = null;
    const msg = `Khách chat Tagi AI — ${lead.name}, SĐT ${lead.phone}. Nhu cầu: ${lead.need}`;
    const f = document.querySelector('#dat-lich form.brief');
    if (f) {
      f.querySelector('[name=name]').value = lead.name; f.querySelector('[name=phone]').value = lead.phone;
      f.querySelector('[name=message]').value = lead.need;
      bot(`Cảm ơn ${lead.name}! Mình đã điền sẵn thông tin vào form <b>Đặt lịch trao đổi</b> — bạn chỉ cần bấm gửi. Hoặc gọi ngay <a href="${TEL}">${PHONE}</a>.`, [['Tới form đặt lịch', 'goform'], ['Nhắn Zalo', 'zalo']]);
    } else {
      bot(`Cảm ơn ${lead.name}! Bấm nút dưới để gửi thông tin cho TAGENCY qua email, hoặc nhắn Zalo <a href="${ZALO}" target="_blank" rel="noopener">${PHONE}</a>.`);
      const c = document.createElement('div'); c.className = 'tg-chips';
      c.innerHTML = `<a href="mailto:${MAIL}?subject=${encodeURIComponent('Tư vấn từ Tagi AI — ' + lead.name)}&body=${encodeURIComponent(msg)}">Gửi email</a><a href="${ZALO}" target="_blank" rel="noopener">Nhắn Zalo</a>`;
      setTimeout(() => { body.append(c); scroll(); }, 600);
    }
  };
  const handle = text => {
    if (step === 'name') { lead.name = text.trim().slice(0, 60); step = 'phone'; return bot(`Chào ${lead.name}! Số điện thoại để TAGENCY gọi lại là gì?`); }
    if (step === 'phone') {
      const p = text.replace(/[^\d+]/g, '');
      if (p.length < 9) return bot('Số này hình như chưa đúng, bạn nhập lại giúp mình nhé (ví dụ 09xx xxx xxx).');
      lead.phone = p; step = 'need'; return bot('Bạn mô tả ngắn nhu cầu nhé: làm gì, dùng vào dịp nào, cần khi nào?');
    }
    if (step === 'need') { lead.need = text.trim().slice(0, 500); return finishLead(); }
    const id = match(text);
    if (id) return route(id);
    bot(`Câu này để người của TAGENCY trả lời sẽ chính xác hơn. Bạn gọi/Zalo <a href="${TEL}">${PHONE}</a> hoặc để lại số để được gọi lại nhé.`, [['Để lại số điện thoại', 'lead'], ['Xem các dịch vụ', 'menu']]);
  };

  form.addEventListener('submit', e => { e.preventDefault(); const v = input.value.trim(); if (!v) return; say(v, 'me'); input.value = ''; handle(v); });
  let started = false;
  const openWin = () => {
    win.classList.add('open'); fab.classList.add('hide');
    if (!started) { started = true; say('Xin chào! Mình là <b>Tagi</b> — trợ lý AI của TAGENCY 👋<br>Bạn đang cần làm gì để mình gợi ý đúng dịch vụ và dự án mẫu?'); chips(MENU); }
    setTimeout(() => input.focus(), 250);
  };
  function close() { win.classList.remove('open'); fab.classList.remove('hide'); }
  fab.addEventListener('click', openWin);
  win.querySelector('.tg-x').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && win.classList.contains('open')) close(); });
  document.querySelectorAll('[data-tagi-open]').forEach(b => b.addEventListener('click', openWin));
})();

/* v6.4: ẩn ảnh ngoài (báo, YouTube) nếu không tải được */
document.querySelectorAll('img[referrerpolicy="no-referrer"]').forEach(i => {
  const drop = () => i.remove();
  if (i.complete && !i.naturalWidth) drop(); else i.addEventListener('error', drop);
});

/* v6.7: lọc chuyên mục trang Tin tức */
(() => {
  const chips = [...document.querySelectorAll('.pchip[data-nx]')]; if (!chips.length) return;
  const cards = [...document.querySelectorAll('.nx-card')];
  chips.forEach(c => c.addEventListener('click', () => {
    const f = c.dataset.nx;
    chips.forEach(x => { const on = x === c; x.classList.toggle('active', on); x.setAttribute('aria-pressed', String(on)); });
    cards.forEach(k => k.classList.toggle('hide', f !== 'all' && k.dataset.cat !== f));
  }));
})();

/* v6.8: vào trang mới luôn bắt đầu từ đầu trang (kể cả khi xem trong khung nhúng) */
(() => {
  const nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
  const fresh = !nav || nav.type === 'navigate' || nav.type === 'reload';
  const toTop = () => {
    if (location.hash || !fresh) return;
    window.scrollTo(0, 0);
    try { document.documentElement.scrollIntoView({ block: 'start' }); } catch (e) {}
  };
  toTop();
  addEventListener('load', toTop, { once: true });
})();
