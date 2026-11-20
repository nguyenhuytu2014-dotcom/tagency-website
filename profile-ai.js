/* Tagi: tự tạo khung nội dung profile (trang dich-vu-profile-doanh-nghiep-ai.html, dựng bởi website/tools/profile_ai.py).
   Ghép bản nháp từ mẫu câu ngay trên trình duyệt, không gửi dữ liệu đi đâu.
   shortcut: mẫu câu cố định, chưa gọi AI thật; muốn viết bằng AI thì nối Apps Script + Gemini API (cần khóa API của anh Tú). */
(() => {
  const f = document.getElementById('tg-form'), out = document.getElementById('tg-out');
  if (!f || !out) return;
  const NOW = new Date().getFullYear();
  const ARROW = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  // [tên, cụm ngành, 2 slogan, "N năm ...", lợi ích cho khách, 3 giá trị cốt lõi, 3 hình ảnh nên dựng]
  const LV = {
    sx: ['Sản xuất', 'sản xuất', ['Chất lượng làm nên niềm tin', 'Chuẩn xác trong từng sản phẩm'], 'làm nên chất lượng', 'vận hành hiệu quả và bền vững', ['Chất lượng', 'Chính xác', 'Bền vững'], ['Phối cảnh 3D toàn cảnh nhà máy', 'Mặt cắt dây chuyền sản xuất', 'Chân dung kỹ sư, công nhân trong đồng phục']],
    xd: ['Xây dựng', 'xây dựng', ['Kiến tạo công trình bền vững', 'Vững chắc từ nền móng'], 'kiến tạo công trình', 'an tâm với từng công trình', ['An toàn', 'Chất lượng', 'Đúng tiến độ'], ['Phối cảnh 3D công trình tiêu biểu', 'Công trường gọn gàng, đúng an toàn lao động', 'Chân dung đội ngũ kỹ sư']],
    bds: ['Bất động sản', 'bất động sản', ['Kiến tạo không gian sống', 'Nơi giá trị được vun đắp'], 'kiến tạo không gian sống', 'sở hữu không gian sống đáng giá', ['Uy tín', 'Minh bạch', 'Tận tâm'], ['Phối cảnh dự án và tiện ích', 'Không gian nhà mẫu', 'Chân dung đội ngũ tư vấn']],
    lg: ['Logistics, kho vận', 'logistics và kho vận', ['Kết nối mọi hành trình', 'Đúng hẹn trên mọi tuyến đường'], 'kết nối mọi hành trình', 'đưa hàng hóa đến đúng nơi, đúng hẹn', ['Đúng hẹn', 'An toàn', 'Linh hoạt'], ['Toàn cảnh kho bãi từ trên cao', 'Dòng hàng hóa, đội xe vận tải', 'Chân dung đội ngũ vận hành']],
    tc: ['Tài chính, ngân hàng', 'tài chính, ngân hàng', ['Đồng hành cùng thịnh vượng', 'Vững vàng giá trị, bền lâu niềm tin'], 'đồng hành cùng thịnh vượng', 'quản lý tài chính an toàn, hiệu quả', ['An toàn', 'Minh bạch', 'Chuyên nghiệp'], ['Sảnh giao dịch, phòng tư vấn', 'Chân dung chuyên viên', 'Không gian làm việc hiện đại']],
    yt: ['Y tế', 'y tế', ['Tận tâm vì sức khỏe', 'Chăm sóc bằng cả trái tim'], 'tận tâm vì sức khỏe', 'được chăm sóc sức khỏe tốt hơn', ['Tận tâm', 'Chuyên môn', 'An toàn'], ['Phòng khám, trang thiết bị', 'Chân dung bác sĩ, điều dưỡng', 'Không gian đón tiếp']],
    gd: ['Giáo dục', 'giáo dục', ['Khơi mở tiềm năng', 'Ươm mầm tri thức, chắp cánh tương lai'], 'ươm mầm tri thức', 'học tập và phát triển toàn diện', ['Tận tâm', 'Sáng tạo', 'Trách nhiệm'], ['Khuôn viên, phòng học', 'Chân dung thầy cô', 'Hoạt động học tập']],
    tm: ['Thương mại, dịch vụ', 'thương mại, dịch vụ', ['Tận tâm trong từng dịch vụ', 'Trọn vẹn trải nghiệm'], 'tận tâm phục vụ', 'có trải nghiệm trọn vẹn', ['Tận tâm', 'Uy tín', 'Chuyên nghiệp'], ['Showroom, cửa hàng', 'Chân dung đội ngũ tư vấn', 'Sản phẩm tiêu biểu']],
    cn: ['Công nghệ', 'công nghệ', ['Công nghệ cho tương lai', 'Đổi mới mỗi ngày'], 'đổi mới không ngừng', 'chuyển đổi số hiệu quả', ['Đổi mới', 'Chính xác', 'Hợp tác'], ['Văn phòng, phòng lab', 'Chân dung đội ngũ kỹ sư', 'Mô phỏng 3D sản phẩm, hệ thống']],
    khac: ['Lĩnh vực khác', '', ['Uy tín tạo nên giá trị', 'Vững bước cùng niềm tin'], 'xây dựng niềm tin', 'phát triển bền vững', ['Uy tín', 'Chất lượng', 'Tận tâm'], ['Văn phòng, không gian làm việc', 'Chân dung đội ngũ', 'Sản phẩm, dịch vụ tiêu biểu']]
  };
  const TAG = { ai: ['t-ai', 'AI'], '3d': ['t-3d', '3D'], ed: ['t-ed', 'Biên tập'] };
  const e = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const and = a => a.length > 1 ? a.slice(0, -1).join(', ') + ' và ' + a[a.length - 1] : (a[0] || '');
  f.elements.lv.innerHTML = Object.entries(LV).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('');

  function make(d) {
    const L = LV[d.lv] || LV.khac, ten = d.ten, y = /^(19|20)\d\d$/.test(d.nam) && +d.nam <= NOW ? +d.nam : 0, n = y ? NOW - y : 0;
    const sp = d.sp || 'các sản phẩm, dịch vụ chủ lực', kh = d.kh || 'khách hàng và đối tác', nganh = L[1];
    const tm = d.tm.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean).slice(0, 4);
    const intro = {
      'hiện đại': `${ten} mang đến ${sp} cho ${kh}.${y ? ` Từ năm ${y}, chúng tôi` : ' Chúng tôi'} không ngừng đổi mới để tạo ra giá trị khác biệt${nganh ? ` trong ngành ${nganh}` : ''}.${tm.length ? ` Điểm mạnh: ${and(tm)}.` : ''}`,
      'gần gũi': `Chúng tôi là ${ten}${y ? `, gắn bó với ${nganh ? `ngành ${nganh}` : 'nghề'} từ năm ${y}` : ''}. Mỗi ngày, chúng tôi mang đến ${sp} với mong muốn giúp ${kh} ${L[4]}.${tm.length ? ` Điều chúng tôi tự hào: ${and(tm)}.` : ''}`
    }[d.gv] || `${y ? `Thành lập năm ${y}, ` : ''}${ten} là doanh nghiệp ${nganh ? `trong lĩnh vực ${nganh}, ` : ''}chuyên cung cấp ${sp}.${tm.length ? ` Thế mạnh của chúng tôi là ${and(tm)}.` : ''} ${ten} cam kết đồng hành cùng ${kh} bằng chất lượng, uy tín và sự tận tâm.`;
    const vision = `Trở thành doanh nghiệp ${nganh ? nganh + ' ' : ''}được ${kh} tin chọn, phát triển bền vững và có trách nhiệm với cộng đồng.`;
    const mission = `Mang đến ${sp} chất lượng, giúp ${kh} ${L[4]}.`;
    const values = L[5].join(' · ');
    const slogans = [...L[2], n >= 2 ? `${n} năm ${L[3]}` : `${ten}: ${L[2][0]}`];
    const toc = [
      ['Thông điệp lãnh đạo', 'Lời chào và cam kết của Ban lãnh đạo', 'ai ed'],
      ['Giới thiệu & lịch sử', y ? `Từ năm ${y} đến nay: các cột mốc chính` : 'Các cột mốc phát triển', 'ed'],
      ['Tầm nhìn, sứ mệnh, giá trị', L[5].join(', '), 'ed'],
      ['Sản phẩm & dịch vụ', sp, '3d ed'],
      ['Năng lực', tm.length ? and(tm) : 'Hạ tầng, máy móc, quy trình', '3d ai'],
      ['Đội ngũ', `Chân dung đồng bộ cho đội ngũ ${ten}`, 'ai'],
      ['Dự án & khách hàng', `Dự án tiêu biểu cho ${kh}`, 'ed'],
      ['Chứng nhận & liên hệ', 'Chỉ đưa chứng nhận doanh nghiệp đang có', 'ed']];
    const tags = t => t.split(' ').map(k => `<i class="pai-tag ${TAG[k][0]}">${TAG[k][1]}</i>`).join('');
    const html = `<article class="pai-doc"><div class="pai-doc-body"><small class="pai-doc-k">Bản nháp profile · Tagi AI</small><h3>${e(ten)}</h3><p class="pai-doc-sl">“${e(slogans[0])}”</p>`
      + `<h4>Slogan gợi ý</h4><ul>${slogans.map(s => `<li>${e(s)}</li>`).join('')}</ul><h4>Giới thiệu</h4><p>${e(intro)}</p>`
      + `<h4>Tầm nhìn</h4><p>${e(vision)}</p><h4>Sứ mệnh</h4><p>${e(mission)}</p><h4>Giá trị cốt lõi</h4><p>${e(values)}</p>`
      + `<h4>Khung 8 phần</h4><ol class="pai-doc-toc">${toc.map((t, i) => `<li><b>0${i + 1}</b><span>${e(t[0])}<small>${e(t[1])}</small></span>${tags(t[2])}</li>`).join('')}</ol>`
      + `<h4>Hình ảnh nên dựng bằng AI &amp; 3D</h4><ul>${L[6].map(s => `<li>${e(s)}</li>`).join('')}</ul></div>`
      + `<div class="pai-doc-act"><button type="button" data-act="copy">Sao chép bản nháp</button><button type="button" data-act="prompt">Sao chép câu lệnh AI</button><a class="btn sun" href="#dat-lich" data-act="send">Gửi TAGENCY hoàn thiện ${ARROW}</a></div></article>`;
    const text = [`BẢN NHÁP PROFILE: ${ten}`, '', 'Slogan gợi ý:', ...slogans.map(s => '- ' + s), '', 'Giới thiệu:', intro, '', 'Tầm nhìn: ' + vision, 'Sứ mệnh: ' + mission, 'Giá trị cốt lõi: ' + values,
      '', 'Khung 8 phần:', ...toc.map((t, i) => `${i + 1}. ${t[0]}: ${t[1]}`), '', 'Hình ảnh nên dựng bằng AI và 3D:', ...L[6].map(s => '- ' + s), '', 'Soạn cùng Tagi AI - www.tagency.com.vn'].join('\n');
    const prompt = `Bạn là chuyên gia viết hồ sơ năng lực (company profile). Hãy viết nội dung profile bằng tiếng Việt, giọng văn ${d.gv || 'trang trọng'}, cho doanh nghiệp sau:\n- Tên: ${ten}\n- Lĩnh vực: ${L[0]}\n- Năm thành lập: ${y || '[cần bổ sung]'}\n- Sản phẩm, dịch vụ: ${d.sp || '[cần bổ sung]'}\n- Thế mạnh: ${tm.length ? tm.join(', ') : '[cần bổ sung]'}\n- Khách hàng mục tiêu: ${d.kh || '[cần bổ sung]'}\nViết theo 8 phần: ${toc.map(t => t[0]).join('; ')}. Chỉ dùng thông tin được cung cấp, không tự thêm số liệu, chứng nhận hay giải thưởng; chỗ nào thiếu thông tin thì ghi [cần bổ sung].`;
    const brief = `Nhờ TAGENCY hoàn thiện profile cho ${ten}${nganh ? ` (${L[0]})` : ''}.${d.sp ? ` Sản phẩm, dịch vụ: ${d.sp}.` : ''}${tm.length ? ` Thế mạnh: ${tm.join(', ')}.` : ''} Đã có bản nháp khung nội dung từ Tagi.`;
    return { html, text, prompt, brief, ten };
  }

  let last = null;
  const err = f.querySelector('.pai-tg-err');
  f.addEventListener('submit', ev => {
    ev.preventDefault();
    const d = Object.fromEntries([...new FormData(f)].map(([k, v]) => [k, String(v).trim().slice(0, 200)]));
    const bad = !d.ten ? ['ten', 'Bạn nhập tên doanh nghiệp giúp Tagi nhé.'] : d.nam && !/^(19|20)\d\d$/.test(d.nam) ? ['nam', 'Năm thành lập gồm 4 chữ số, ví dụ 2010.'] : null;
    err.hidden = !bad;
    if (bad) { err.textContent = bad[1]; f.elements[bad[0]].focus(); return; }
    last = make(d); out.innerHTML = last.html;
    if (innerWidth < 860) out.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  const copy = async t => {
    try { await navigator.clipboard.writeText(t); } catch {
      const a = Object.assign(document.createElement('textarea'), { value: t }); a.style.cssText = 'position:fixed;opacity:0';
      document.body.append(a); a.select(); document.execCommand('copy'); a.remove();
    }
  };
  out.addEventListener('click', ev => {
    const b = ev.target.closest('[data-act]'); if (!b || !last) return;
    if (b.dataset.act === 'send') {  // điền sẵn form đặt lịch cuối trang, để link #dat-lich tự cuộn xuống
      const c = document.querySelector('#dat-lich form'); if (!c) return;
      if (c.elements.company) c.elements.company.value = last.ten;
      if (c.elements.service) c.elements.service.value = 'Profile doanh nghiệp AI';
      if (c.elements.message) c.elements.message.value = last.brief;
      setTimeout(() => c.elements.name && c.elements.name.focus({ preventScroll: true }), 700);
      return;
    }
    copy(b.dataset.act === 'prompt' ? last.prompt : last.text).then(() => {
      const o = b.textContent; b.textContent = 'Đã sao chép ✓'; setTimeout(() => { b.textContent = o; }, 1600);
    });
  });
})();
