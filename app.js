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
  $$('.has-mega > .mega-tg').forEach(btn => btn.addEventListener('click', () => {
    const li = btn.parentElement, open = !li.classList.contains('open');
    $$('.has-mega.open').forEach(o => { if (o !== li) { o.classList.remove('open'); $('.mega-tg', o).setAttribute('aria-expanded', 'false'); } });
    li.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open));
  }));
  document.addEventListener('click', e => {
    if (!mobile() && !e.target.closest('.has-mega')) $$('.has-mega.open').forEach(o => { o.classList.remove('open'); $('.mega-tg', o).setAttribute('aria-expanded', 'false'); });
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
        const subject = `[Đặt lịch] ${d.service} - ${d.company || d.name}`;
        const body = `Họ tên: ${d.name}\nCông ty: ${d.company || ''}\nĐiện thoại: ${d.phone}\nEmail: ${d.email || ''}\nDịch vụ: ${d.service}\nTrang: ${d.page}\n\n${d.message}`;
        location.href = `mailto:agencymedia.t@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        ok.hidden = false; ok.textContent = 'Đã mở ứng dụng email với nội dung bạn điền - hãy bấm Gửi để hoàn tất.';
      };
      const ep = form.dataset.endpoint || window.TG_API; d.type = 'lead'; d.source = 'form';
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

/* v6.1: mega menu Dịch vụ - rê chuột/focus để đổi tab */
(() => {
  document.querySelectorAll('.svm').forEach(m => {
    const tabs = [...m.querySelectorAll('.svm-tab')], panels = [...m.querySelectorAll('.svm-panel')];
    const act = id => { tabs.forEach(t => t.classList.toggle('on', t.dataset.svm === id)); panels.forEach(p => p.classList.toggle('on', p.dataset.svm === id)); };
    tabs.forEach(t => { t.addEventListener('mouseenter', () => act(t.dataset.svm)); t.addEventListener('focus', () => act(t.dataset.svm)); });
  });
})();

/* v6.3: Tagi AI - trợ lý tư vấn tự động (kịch bản, chạy trên trình duyệt) */
(() => {
  const PHONE = '0369 222 331', TEL = 'tel:0369222331', ZALO = 'https://zalo.me/0369222331', MAIL = 'agencymedia.t@gmail.com';
  const AV = 'assets/tagi-avatar.webp';
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');

  const MENU = [['Làm phim doanh nghiệp', 'phim'], ['Animation & mascot', 'anim'], ['Nhận diện, ấn phẩm', 'thietke'], ['Hình ảnh sự kiện', 'sukien'], ['Thiết kế website', 'web'], ['Gói AI marketing', 'ai'], ['Chi phí thế nào?', 'gia'], ['Gặp người tư vấn', 'lead']];
  const NEXT = [['Chi phí thế nào?', 'gia'], ['Quy trình làm việc', 'quytrinh'], ['Để lại số điện thoại', 'lead'], ['Hỏi việc khác', 'menu']];
  const KB = {
    phim: { k: ['phim', 'tvc', 'video', 'quay', 'ky niem', 'thanh lap', 'phong su', 'tai lieu', 'gioi thieu cong ty'],
      a: 'TAGENCY làm <b>TVC, phim giới thiệu doanh nghiệp, phim kỷ niệm thành lập, phim tài liệu và video sự kiện</b>. Case gần nhất: <a href="du-an-mai-viet">phim 6 năm Mai Việt Land</a>, <a href="du-an-cwd">phim tài liệu CWD</a>. Xem chi tiết tại <a href="dich-vu-phim">Phim thương hiệu</a>.' },
    anim: { k: ['animation', 'hoat hinh', 'motion', 'mascot', 'nhan vat', 'explainer', 'dao tao', 'elearning', 'linh vat'],
      a: 'Mảng mạnh của TAGENCY: <b>phim hoạt hình 2D, motion graphics, mascot và hệ nhân vật</b>. Ví dụ: <a href="du-an-vatm">30 phim đào tạo cho VATM</a>, <a href="du-an-bidv">8 phim văn hóa BIDV</a>, <a href="du-an-fecon">mascot FECON</a>.' },
    thietke: { k: ['logo', 'nhan dien', 'thiet ke', 'catalogue', 'brochure', 'ho so nang luc', 'bao cao thuong nien', 'an pham', 'so tay', 'key visual', 'guideline'],
      a: 'Bên mình thiết kế <b>nhận diện, hồ sơ năng lực, catalogue, báo cáo thường niên, sổ tay văn hóa và key visual</b>. Tham khảo: <a href="du-an-vnp">nhận diện Vietnam Post Logistics</a>, <a href="du-an-kdi">catalogue KDI</a>. Xem tất cả theo loại sản phẩm tại <a href="du-an">trang Dự án</a>.' },
    sukien: { k: ['su kien', 'backdrop', 'san khau', 'led', 'standee', 'hoi nghi', 'le', 'gala', 'tat nien', 'year end'],
      a: 'Với sự kiện, TAGENCY làm trọn <b>key visual, backdrop, standee, nội dung LED, video mở màn và video tổng kết</b>. Ví dụ: <a href="du-an-nikko">Hotel Nikko</a>, <a href="du-an-vaba">VABA CUP</a>. Bạn nhớ báo ngày diễn ra sự kiện để mình xếp lịch nhé.' },
    web: { k: ['web', 'website', 'landing', 'trang', 'seo'],
      a: 'Mình làm <b>website giới thiệu doanh nghiệp, landing page chiến dịch, website dự án và trang portfolio</b>, có sẵn biểu mẫu thu khách. Xem <a href="dich-vu-thiet-ke-website">Thiết kế website</a>.' },
    ai: { k: ['ai', 'chatgpt', 'gpt', 'claude', 'gemini', 'tu dong', 'chatbot', 'prompt'],
      a: 'TAGENCY có <b>6 gói AI</b>: AI Mirror (ChatGPT nói gì về công ty bạn), Brand Voice, Mascot Live, Ký ức chuyển động, Studio không máy quay, Cỗ máy nội dung 30 ngày. <a href="ai-marketing#goi-ai">Mở các gói AI</a> - có cả bản soi AI miễn phí.' },
    gia: { k: ['gia', 'chi phi', 'bao nhieu', 'bao gia', 'ngan sach', 'tien', 'phi'],
      a: 'Chi phí phụ thuộc vào <b>loại sản phẩm, độ dài, số bối cảnh và thời gian cần bàn giao</b>, nên TAGENCY không đưa giá chung chung. Buổi trao đổi đầu tiên <b>miễn phí</b>; sau khi nắm brief, bên mình gửi báo giá chi tiết theo từng hạng mục. Bạn có thể cho mình biết ngân sách dự kiến để được tư vấn phương án phù hợp.' },
    quytrinh: { k: ['quy trinh', 'bao lau', 'thoi gian', 'tien do', 'lam the nao', 'cac buoc'],
      a: 'Quy trình <b>T·A·G</b> 6 bước: lắng nghe brief → định vị thông điệp → concept hình ảnh → kịch bản & storyboard → sản xuất & hậu kỳ → bàn giao. Thời gian tùy hạng mục, sẽ được chốt cùng mốc duyệt ngay từ đầu. <a href="gioi-thieu#quy-trinh">Xem quy trình</a>.' },
    duan: { k: ['du an', 'portfolio', 'khach hang', 'da lam', 'case', 'mau'],
      a: 'Bạn xem các dự án đã chia theo từng loại sản phẩm tại <a href="du-an">trang Dự án</a> - phim, animation, mascot, nhận diện, ấn phẩm, sự kiện… Phim và video có trên <a href="https://www.youtube.com/@tmediaagency8888" target="_blank" rel="noopener">kênh YouTube</a>.' },
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
    const msg = `Khách chat Tagi AI - ${lead.name}, SĐT ${lead.phone}. Nhu cầu: ${lead.need}`;
    if (window.TG_API) {
      fetch(window.TG_API, { method: 'POST', mode: 'no-cors', body: new URLSearchParams({ type: 'lead', source: 'tagi', name: lead.name, phone: lead.phone, message: lead.need, service: 'Chat Tagi AI', page: location.pathname.split('/').pop() || 'index.html' }) })
        .then(() => bot(`Cảm ơn ${lead.name}! TAGENCY đã nhận thông tin và sẽ gọi lại cho bạn sớm. Cần gấp, bạn gọi <a href="${TEL}">${PHONE}</a> nhé.`, [['Hỏi việc khác', 'menu']]))
        .catch(() => bot(`Mạng đang chập chờn, bạn gọi <a href="${TEL}">${PHONE}</a> hoặc nhắn <a href="${ZALO}" target="_blank" rel="noopener">Zalo</a> giúp mình nhé.`));
      return;
    }
    const f = document.querySelector('#dat-lich form.brief');
    if (f) {
      f.querySelector('[name=name]').value = lead.name; f.querySelector('[name=phone]').value = lead.phone;
      f.querySelector('[name=message]').value = lead.need;
      bot(`Cảm ơn ${lead.name}! Mình đã điền sẵn thông tin vào form <b>Đặt lịch trao đổi</b> - bạn chỉ cần bấm gửi. Hoặc gọi ngay <a href="${TEL}">${PHONE}</a>.`, [['Tới form đặt lịch', 'goform'], ['Nhắn Zalo', 'zalo']]);
    } else {
      bot(`Cảm ơn ${lead.name}! Bấm nút dưới để gửi thông tin cho TAGENCY qua email, hoặc nhắn Zalo <a href="${ZALO}" target="_blank" rel="noopener">${PHONE}</a>.`);
      const c = document.createElement('div'); c.className = 'tg-chips';
      c.innerHTML = `<a href="mailto:${MAIL}?subject=${encodeURIComponent('Tư vấn từ Tagi AI - ' + lead.name)}&body=${encodeURIComponent(msg)}">Gửi email</a><a href="${ZALO}" target="_blank" rel="noopener">Nhắn Zalo</a>`;
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
    if (!started) { started = true; say('Xin chào! Mình là <b>Tagi</b> - trợ lý AI của TAGENCY 👋<br>Bạn đang cần làm gì để mình gợi ý đúng dịch vụ và dự án mẫu?'); chips(MENU); }
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

/* v7.7: mọi lần mở trang mới đều bắt đầu từ đầu trang (trừ khi có #mục) */
(() => {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  const toTop = () => { if (location.hash) return; window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); };
  toTop(); document.addEventListener('DOMContentLoaded', toTop); addEventListener('load', toTop); addEventListener('pageshow', toTop);
})();

/* v7: thả tim + bình luận (Tin tức, Tài nguyên). Lưu vào Google Sheet qua window.TG_API; chưa có API thì chạy chế độ xem thử (localStorage). */
(() => {
  const API = window.TG_API || '';
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
               set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let jn = 0;
  const jsonp = params => new Promise((ok, no) => {
    const cb = '__tg' + (++jn) + Date.now(), s = document.createElement('script');
    window[cb] = d => { ok(d); delete window[cb]; s.remove(); };
    s.onerror = () => { no(); delete window[cb]; s.remove(); };
    s.src = API + '?' + new URLSearchParams({ ...params, callback: cb }); document.head.append(s);
    setTimeout(() => { if (window[cb]) { no(); window[cb] = () => { delete window[cb]; }; s.remove(); } }, 9000);  // Apps Script trả lời muộn vẫn gọi hàm: để hàm rỗng, tránh lỗi console
  });
  const post = params => fetch(API, { method: 'POST', mode: 'no-cors', body: new URLSearchParams(params) });
  const liked = id => ls.get('tg-liked', {})[id];
  const setLiked = (id, v) => { const m = ls.get('tg-liked', {}); if (v) m[id] = 1; else delete m[id]; ls.set('tg-liked', m); };
  const localCmts = id => ls.get('tg-cmt-' + id, []);
  const fmt = n => n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'K' : String(n);
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.2 4.4 2.5.8-1.3 2.3-2.5 4.4-2.5 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z"/></svg>';
  const BUBBLE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>';

  // số liệu cho mọi phần tử cần đếm
  const ids = [...new Set([...$$('[data-soc-id]').map(e => e.dataset.socId), ...$$('.soc').map(e => e.dataset.id)])];
  const stats = {};
  ids.forEach(id => stats[id] = { likes: liked(id) && !API ? 1 : 0, comments: API ? 0 : localCmts(id).length });
  const paint = () => {
    $$('[data-soc-id]').forEach(el => {
      const s = stats[el.dataset.socId]; if (!s) return;
      let m = $('.soc-mini', el); if (!m) { m = document.createElement('span'); m.className = 'soc-mini'; (el.querySelector('.nx-tx, .rs-body, .dg-tx') || el).append(m); }
      m.innerHTML = `<i class="${liked(el.dataset.socId) ? 'on' : ''}">${HEART}${fmt(s.likes)}</i><i>${BUBBLE}${fmt(s.comments)}</i>`;
    });
    $$('.soc').forEach(w => {
      const s = stats[w.dataset.id]; if (!s) return;
      const l = $('.soc-like b', w), c = $('.soc-cmt b', w); if (l) l.textContent = fmt(s.likes); if (c) c.textContent = fmt(s.comments);
    });
  };
  const loadStats = () => jsonp({ type: 'stats', ids: ids.join(',') }).then(d => {
    if (d && d.stats) Object.entries(d.stats).forEach(([k, v]) => stats[k] = v); paint();
  }).catch(() => {});
  if (API && ids.length) {  // chỉ gọi Apps Script khi khách cuộn gần tới phần thả tim/bình luận: trang mở nhanh hơn
    const els = $$('[data-soc-id], .soc');
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); loadStats(); } }, { rootMargin: '600px 0px' });
      els.forEach(e => io.observe(e));
    } else loadStats();
  }

  // thanh tương tác đầy đủ
  $$('.soc').forEach(w => {
    const id = w.dataset.id, url = w.dataset.url || location.href.split('#')[0];
    w.innerHTML = `<div class="soc-bar">
<button type="button" class="soc-like" aria-pressed="false">${HEART}<span>Thích</span><b>0</b></button>
<button type="button" class="soc-cmt" aria-expanded="false">${BUBBLE}<span>Bình luận</span><b>0</b></button>
<div class="soc-share"><a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener">Chia sẻ Facebook</a><button type="button" class="soc-copy">Sao chép link</button></div></div>
<div class="soc-box" hidden><ul class="soc-list"></ul>
<form class="soc-form" novalidate><img src="assets/tagi-avatar.webp" alt="" width="36" height="36"><div class="soc-fields">
<input name="name" maxlength="60" placeholder="Tên của bạn" autocomplete="name"><textarea name="text" rows="2" maxlength="1000" placeholder="Viết bình luận…" required></textarea>
<input name="website" tabindex="-1" autocomplete="off" class="soc-hp" aria-hidden="true"><div class="soc-row"><small class="soc-note"></small><button type="submit">Gửi</button></div></div></form></div>`;
    const like = $('.soc-like', w), cbtn = $('.soc-cmt', w), box = $('.soc-box', w), list = $('.soc-list', w), form = $('.soc-form', w), note = $('.soc-note', w);
    if (!API) note.textContent = 'Chế độ xem thử: tim và bình luận chỉ lưu trên máy bạn.';
    const sync = () => { const on = !!liked(id); like.classList.toggle('on', on); like.setAttribute('aria-pressed', String(on)); };
    sync();
    like.addEventListener('click', () => {
      const on = !liked(id); setLiked(id, on); stats[id].likes = Math.max(0, stats[id].likes + (on ? 1 : -1)); sync(); paint();
      like.classList.remove('pop'); void like.offsetWidth; like.classList.add('pop');
      if (API) post({ type: 'like', id, delta: on ? 1 : -1 }).catch(() => {});
    });
    const item = (c, pending) => `<li${pending ? ' class="pending"' : ''}><span class="soc-av">${esc((c.name || 'B')[0].toUpperCase())}</span><div><b>${esc(c.name || 'Bạn đọc')}</b>${pending ? '<em>' + pending + '</em>' : ''}<p>${esc(c.text)}</p></div></li>`;
    let loaded = false;
    const load = () => {
      if (loaded) return; loaded = true;
      const mine = localCmts(id);
      if (!API) { list.innerHTML = mine.map(c => item(c, 'chỉ trên máy bạn')).join('') || '<li class="soc-empty">Chưa có bình luận. Hãy là người đầu tiên!</li>'; return; }
      list.innerHTML = '<li class="soc-empty">Đang tải bình luận…</li>';
      jsonp({ type: 'comments', id }).then(d => {
        const arr = (d && d.comments) || [];
        list.innerHTML = arr.map(c => item(c)).join('') + mine.filter(m => m.pending).map(c => item(c, 'chờ duyệt')).join('') || '<li class="soc-empty">Chưa có bình luận. Hãy là người đầu tiên!</li>';
      }).catch(() => { list.innerHTML = '<li class="soc-empty">Chưa tải được bình luận.</li>'; });
    };
    cbtn.addEventListener('click', () => { const open = box.hidden; box.hidden = !open; cbtn.setAttribute('aria-expanded', String(open)); if (open) { load(); setTimeout(() => form.text.focus(), 50); } });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const text = form.text.value.trim(), name = form.name.value.trim() || 'Bạn đọc';
      if (text.length < 2) { form.text.focus(); return; }
      if (form.website.value) return;
      const c = { name, text, time: Date.now(), pending: !!API };
      const mine = localCmts(id); mine.push(c); ls.set('tg-cmt-' + id, mine);
      list.querySelector('.soc-empty')?.remove();
      list.insertAdjacentHTML('beforeend', item(c, API ? 'chờ duyệt' : 'chỉ trên máy bạn'));
      form.text.value = '';
      if (API) { post({ type: 'comment', id, name, text, page: location.pathname.split('/').pop() }).catch(() => {}); note.textContent = 'Cảm ơn bạn! Bình luận sẽ hiển thị sau khi được duyệt.'; }
      else { stats[id].comments++; paint(); }
    });
    $('.soc-copy', w).addEventListener('click', e => {
      const b = e.currentTarget; (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(() => { b.textContent = 'Đã sao chép ✓'; }, () => { b.textContent = url; });
      setTimeout(() => { b.textContent = 'Sao chép link'; }, 2200);
    });
  });
  paint();
})();

/* v7: lọc trang Tài nguyên */
(() => {
  const chips = [...document.querySelectorAll('.pchip[data-rs]')]; if (!chips.length) return;
  const items = [...document.querySelectorAll('.rs-card, .rs-fonts, .sk')];
  chips.forEach(c => c.addEventListener('click', () => {
    const f = c.dataset.rs;
    chips.forEach(x => { const on = x === c; x.classList.toggle('active', on); x.setAttribute('aria-pressed', String(on)); });
    items.forEach(k => k.classList.toggle('hide', f !== 'all' && k.dataset.cat !== f));
  }));
})();

/* v7.1: lọc Kho tài nguyên */
(() => {
  const chips = [...document.querySelectorAll('.pchip[data-k]')]; if (!chips.length) return;
  const cards = [...document.querySelectorAll('.kr')], kho = document.querySelector('.kho'), hoc = document.querySelector('.kho-hoc');
  chips.forEach(c => c.addEventListener('click', () => {
    const f = c.dataset.k;
    chips.forEach(x => { const on = x === c; x.classList.toggle('active', on); x.setAttribute('aria-pressed', String(on)); });
    cards.forEach(k => k.classList.toggle('hide', f !== 'all' && f !== 'hoc' && k.dataset.k !== f));
    kho && kho.classList.toggle('hide', f === 'hoc');
    hoc && hoc.classList.toggle('hide', f !== 'all' && f !== 'hoc');
  }));
})();

/* v7.2: mở toàn bộ khách hàng */
document.querySelectorAll('[data-cl-all]').forEach(b => b.addEventListener('click', () => {
  const g = b.closest('.wrap').querySelector('.cl-all'); if (!g) return;
  const open = g.hidden; g.hidden = !open; b.setAttribute('aria-expanded', String(open));
  b.textContent = open ? 'Thu gọn' : b.textContent.replace('Thu gọn', '') || 'Xem toàn bộ khách hàng';
  if (!open) b.textContent = 'Xem toàn bộ ' + g.children.length + ' khách hàng';
}));

/* v7.3: tab loại website */
(() => {
  const tabs = [...document.querySelectorAll('.wv-tab')]; if (!tabs.length) return;
  const panels = [...document.querySelectorAll('.wv-panel')];
  const show = k => { tabs.forEach(t => { const on = t.dataset.wv === k; t.classList.toggle('on', on); t.setAttribute('aria-selected', String(on)); }); panels.forEach(p => p.classList.toggle('on', p.dataset.wv === k)); };
  tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.wv)));
  const fromHash = () => { const m = location.hash.match(/^#web-([\w-]+)$/); if (m) { show(m[1]); document.getElementById('loai-website').scrollIntoView({ block: 'start' }); } };
  addEventListener('hashchange', fromHash); fromHash();
})();

/* v7.4: lọc dự án website */
(() => {
  const chips = [...document.querySelectorAll('.pchip[data-wp]')]; if (!chips.length) return;
  const cards = [...document.querySelectorAll('.wp')];
  chips.forEach(c => c.addEventListener('click', () => {
    const f = c.dataset.wp;
    chips.forEach(x => { const on = x === c; x.classList.toggle('active', on); x.setAttribute('aria-pressed', String(on)); });
    cards.forEach(k => k.classList.toggle('hide', f !== 'all' && k.dataset.wp !== f));
  }));
})();

/* v7.6: thư viện phim YouTube */
(() => {
  const lib = document.getElementById('phim-youtube'); if (!lib) return;
  const chips = [...lib.querySelectorAll('.pchip[data-yt]')], cards = [...lib.querySelectorAll('.yt-card')];
  chips.forEach(c => c.addEventListener('click', () => {
    const f = c.dataset.yt;
    chips.forEach(x => { const on = x === c; x.classList.toggle('active', on); x.setAttribute('aria-pressed', String(on)); });
    cards.forEach(k => k.classList.toggle('hide', f !== 'all' && k.dataset.yt !== f));
  }));
  let framed = false; try { framed = window.self !== window.top; } catch (e) { framed = true; }
  if (framed || location.protocol === 'file:') return; // trong khung xem thử: mở YouTube ở tab mới
  const m = document.createElement('div'); m.className = 'yt-modal'; m.hidden = true;
  m.innerHTML = '<div></div><button type="button" aria-label="Đóng">×</button>'; document.body.append(m);
  const close = () => { m.hidden = true; m.firstChild.innerHTML = ''; };
  m.addEventListener('click', e => { if (e.target === m || e.target.tagName === 'BUTTON') close(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden) close(); });
  cards.forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube.com/embed/' + a.dataset.ytId + '?autoplay=1&rel=0&playsinline=1&origin=' + encodeURIComponent(location.origin);
    f.referrerPolicy = 'strict-origin-when-cross-origin'; f.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture'; f.allowFullscreen = true;
    m.firstChild.innerHTML = ''; m.firstChild.append(f); m.hidden = false;
  }));
})();

/* v7.7: phát phim trên trang phim + nút xem thêm */
(() => {
  document.querySelectorAll('[data-fm-more]').forEach(b => b.addEventListener('click', () => {
    const g = b.closest('.pr-shelf').querySelector('.fm-more'); if (!g) return;
    g.hidden = !g.hidden; b.textContent = g.hidden ? 'Xem thêm ' + g.children.length + ' ' + (b.dataset.word || 'phim') : 'Thu gọn';
  }));
  const p = document.querySelector('.fm-player'); if (!p) return;
  // luôn phát ngay trên trang; kèm link dự phòng nếu trình duyệt chặn trình phát nhúng
  if (!p.nextElementSibling || !p.nextElementSibling.classList.contains('fm-alt')) {
    const alt = document.createElement('p'); alt.className = 'fm-alt';
    alt.innerHTML = 'Không phát được? <a href="https://www.youtube.com/watch?v=' + p.dataset.ytId + '" target="_blank" rel="noopener">Xem phim trên YouTube ↗</a>';
    p.after(alt);
  }
  p.querySelector('.fm-play').addEventListener('click', () => {
    const id = p.dataset.ytId;
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1&origin=' + encodeURIComponent(location.origin);
    f.referrerPolicy = 'strict-origin-when-cross-origin'; f.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture'; f.allowFullscreen = true; f.title = p.querySelector('img').alt;
    p.append(f); p.querySelector('.fm-play').remove();
  });
})();

// Chặn chuột phải / kéo thả trên ảnh, video (răn đe sao chép; ảnh đã đóng logo TAGENCY)
['contextmenu', 'dragstart'].forEach(function (ev) {
  document.addEventListener(ev, function (e) { if (e.target.closest && e.target.closest('img, video, .media')) e.preventDefault(); });
});
/* Tài nguyên: nhập số điện thoại trước khi tải (lưu Google Sheet qua TG_API, tab Khách hàng, nguồn "tai-ve"). Nhập 1 lần, nhớ trên máy. */
(() => {
  const links = document.querySelectorAll('.rs-dl a[download]'); if (!links.length) return;
  const KEY = 'tg_phone', ok = v => /^(0|\+?84)(3|5|7|8|9)\d{8}$/.test(v.replace(/[\s.-]/g, ''));
  const get = () => { try { return localStorage.getItem(KEY); } catch (e) { return null; } };
  const m = document.createElement('div'); m.className = 'dl-gate'; m.hidden = true;
  m.innerHTML = '<form class="dl-box" novalidate><button type="button" class="dl-x" aria-label="Đóng">×</button><b>Nhận tài liệu miễn phí</b>' +
    '<p>Để lại số điện thoại để tải. TAGENCY chỉ liên hệ khi bạn cần tư vấn, không spam.</p>' +
    '<label for="dl-phone">Số điện thoại</label><input id="dl-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="09xx xxx xxx" required>' +
    '<input name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px" aria-hidden="true">' +
    '<small class="dl-err" role="alert" hidden>Số điện thoại chưa đúng (10 số, bắt đầu bằng 03, 05, 07, 08, 09).</small>' +
    '<button class="btn sun" type="submit">Tải tài liệu</button></form>';
  document.body.appendChild(m);
  const f = m.querySelector('form'), inp = f.phone, err = m.querySelector('.dl-err'); let pending = null;
  const close = () => { m.hidden = true; pending = null; };
  const go = a => { const x = document.createElement('a'); x.href = a.href; x.download = ''; document.body.appendChild(x); x.click(); x.remove(); };
  links.forEach(a => a.addEventListener('click', e => {
    if (get()) return;
    e.preventDefault(); pending = a; m.hidden = false; err.hidden = true; inp.focus();
  }));
  m.querySelector('.dl-x').onclick = close;
  m.addEventListener('click', e => { if (e.target === m) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !m.hidden) close(); });
  f.addEventListener('submit', e => {
    e.preventDefault(); const v = inp.value.trim();
    if (!ok(v)) { err.hidden = false; inp.focus(); return; }
    if (f.website.value) return close();
    const name = pending.closest('.rs-card')?.querySelector('h3')?.textContent || 'Tài nguyên';
    if (window.TG_API) fetch(window.TG_API, { method: 'POST', mode: 'no-cors', body: new URLSearchParams({ type: 'lead', source: 'tai-ve', phone: v, name: 'Tải tài nguyên', service: name, page: location.pathname.slice(1) }) }).catch(() => {});
    try { localStorage.setItem(KEY, v); } catch (x) {}
    const a = pending; close(); go(a);
  });
})();
