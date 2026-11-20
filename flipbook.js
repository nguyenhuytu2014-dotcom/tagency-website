/* TAGENCY flipbook: xem catalogue dạng lật trang từ ảnh trang (assets/flip/<id>.json). Không dùng thư viện ngoài.
   Nút mở: <button data-flip="assets/flip/kdi.json" data-book="0">. Trang PDF đôi được cắt làm 2 mặt bằng background-position. */
(function () {
  var books = {}, st = null, busy = false;
  var $ = function (h) { var d = document.createElement('div'); d.innerHTML = h; return d.firstChild; };
  var m = $('<div class="fb" hidden role="dialog" aria-modal="true" aria-label="Xem catalogue"><div class="fb-top"><b class="fb-title"></b><span class="fb-count"></span><button class="fb-x" type="button" aria-label="Đóng">×</button></div>' +
    '<div class="fb-stage"><button class="fb-nav fb-prev" type="button" aria-label="Trang trước">‹</button><div class="fb-book"><div class="fb-l fb-face"></div><div class="fb-r fb-face"></div></div><button class="fb-nav fb-next" type="button" aria-label="Trang sau">›</button></div>' +
    '<div class="fb-hint">Bấm mép sách, dùng phím ← → hoặc vuốt để lật trang</div></div>');
  document.body.appendChild(m);
  var book = m.querySelector('.fb-book'), L = m.querySelector('.fb-l'), R = m.querySelector('.fb-r');

  function faces(b) { // mỗi mặt sách = [ảnh, 'f' | 'l' | 'r']
    var f = [];
    b.pages.forEach(function (p) { if (p[1] === 2) { f.push([p[0], 'l'], [p[0], 'r']); } else f.push([p[0], 'f']); });
    return f;
  }
  function paint(el, face) {
    el.style.visibility = face ? '' : 'hidden';
    if (!face) return;
    el.style.backgroundImage = 'url("' + face[0] + '")';
    el.style.backgroundSize = face[1] === 'f' ? '100% 100%' : '200% 100%';
    el.style.backgroundPosition = face[1] === 'r' ? '100% 0' : '0 0';
  }
  function single() { return innerWidth < 760; }
  function size() {
    var r = st.ratio, maxH = innerHeight - 150, maxW = single() ? innerWidth - 96 : innerWidth * 0.86; // chừa chỗ 2 nút lật
    var w = Math.min(maxW / (single() ? 1 : 2), maxH * r);
    book.style.width = (single() ? w : w * 2) + 'px'; book.style.height = (w / r) + 'px';
    book.classList.toggle('one', single());
  }
  function view() { // chế độ đôi -> [trái, phải]; chế độ đơn -> [null, mặt i]
    var F = st.f, i = st.i;
    if (single()) return [null, F[i]];
    return [F[2 * i - 1], F[2 * i]];
  }
  function last() { return single() ? st.f.length - 1 : Math.floor(st.f.length / 2); }
  function render() {
    var v = view(); paint(L, v[0]); paint(R, v[1]);
    L.style.display = single() ? 'none' : '';
    var n = st.f.length, a = single() ? st.i + 1 : Math.max(1, 2 * st.i), b = single() ? a : Math.min(n, 2 * st.i + 1);
    m.querySelector('.fb-count').textContent = 'Trang ' + (a === b ? a : a + '-' + b) + ' / ' + n;
    m.querySelector('.fb-prev').disabled = st.i === 0; m.querySelector('.fb-next').disabled = st.i >= last();
    for (var k = 1; k <= 3; k++) [st.f[2 * (st.i + k)], st.f[st.i + k]].forEach(function (x) { if (x) new Image().src = x[0]; });
  }
  function turn(dir) {
    if (busy || !st) return;
    var to = st.i + dir; if (to < 0 || to > last()) return;
    if (single()) { st.i = to; book.animate && book.animate([{ opacity: .3, transform: 'translateX(' + (-dir * 30) + 'px)' }, { opacity: 1, transform: 'none' }], 260); return render(); }
    var F = st.f, i = st.i, next = dir > 0;
    var leaf = $('<div class="fb-leaf ' + (next ? 'to-l' : 'to-r') + '"><div class="fb-face front"></div><div class="fb-face back"></div></div>');
    paint(leaf.firstChild, next ? F[2 * i] : F[2 * i - 1]);
    paint(leaf.lastChild, next ? F[2 * i + 1] : F[2 * i - 2]);
    if (next) paint(R, F[2 * i + 2]); else paint(L, F[2 * i - 3]);
    book.appendChild(leaf); busy = true;
    requestAnimationFrame(function () { requestAnimationFrame(function () { leaf.classList.add('go'); }); });
    setTimeout(function () { leaf.remove(); busy = false; st.i = to; render(); }, 720);
  }
  function open(url, n) {
    var go = function (list) {
      var b = list[n]; st = { f: faces(b), ratio: b.ratio, i: 0 };
      m.querySelector('.fb-title').textContent = b.title;
      m.hidden = false; document.documentElement.style.overflow = 'hidden'; size(); render(); m.querySelector('.fb-x').focus();
    };
    if (books[url]) return go(books[url]);
    fetch(url).then(function (r) { return r.json(); }).then(function (j) { books[url] = j; go(j); });
  }
  function close() { m.hidden = true; st = null; document.documentElement.style.overflow = ''; }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-flip]'); if (b) { e.preventDefault(); open(b.dataset.flip, +b.dataset.book || 0); }
  });
  m.querySelector('.fb-x').onclick = close;
  m.querySelector('.fb-prev').onclick = function () { turn(-1); };
  m.querySelector('.fb-next').onclick = function () { turn(1); };
  book.addEventListener('click', function (e) { var r = book.getBoundingClientRect(); turn(e.clientX - r.left > r.width / 2 ? 1 : -1); });
  m.addEventListener('click', function (e) { if (e.target === m) close(); });
  document.addEventListener('keydown', function (e) {
    if (m.hidden) return;
    if (e.key === 'Escape') close(); if (e.key === 'ArrowRight') turn(1); if (e.key === 'ArrowLeft') turn(-1);
  });
  var x0 = null;
  book.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  book.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) turn(dx < 0 ? 1 : -1); x0 = null; });
  addEventListener('resize', function () { if (st) { st.i = Math.min(st.i, last()); size(); render(); } });
})();
