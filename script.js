/* =========================================================================
   CONFIGURACAO: o unico lugar para mexer no contato.
   whatsapp: so digitos, com 55 + DDD + numero (fonte: bio do Instagram).
   Se mudar, troque aqui E nos href "https://wa.me/..." do index.html.
   ========================================================================= */
const CONFIG = {
  whatsapp: '5551997617886',
};

const MESSAGES = {
  "geral": "Olá! Conheci a Watt Luz pelo site e gostaria de um orçamento.",
  "eletrica": "Olá! Vim pelo site e gostaria de um orçamento de serviço elétrico.",
  "clima": "Olá! Vim pelo site e gostaria de um orçamento de instalação ou limpeza de ar-condicionado.",
  "iluminacao": "Olá! Vim pelo site e gostaria de consultar um projeto de iluminação.",
  "carregador": "Olá! Vim pelo site e gostaria de um orçamento de instalação de carregador veicular.",
  "falar": "Olá! Vim pelo site e gostaria de falar com a Watt Luz.",
  "area": "Olá! Vim pelo site e gostaria de confirmar se vocês atendem na minha região. Minha cidade/bairro é: ",
  "duvida": "Olá! Vim pelo site e tenho uma dúvida."
};

(() => {
  const root = document.documentElement;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // ---------- WhatsApp com mensagem por contexto ----------
  const phone = String(CONFIG.whatsapp).replace(/\D/g, '');
  if (/^55\d{10,11}$/.test(phone)) {
    $$('[data-wa]').forEach((a) => {
      a.href = `https://wa.me/${phone}?text=${encodeURIComponent(MESSAGES[a.dataset.wa] || MESSAGES.geral)}`;
    });
    const local = phone.slice(4);
    $$('[data-wa-number]').forEach((el) => { el.textContent = `(${phone.slice(2, 4)}) ${local.slice(0, -4)}-${local.slice(-4)}`; });
  } else {
    if (CONFIG.whatsapp) console.warn('CONFIG.whatsapp invalido: use so digitos, com 55 + DDD + numero.');
  }

  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Rolagem: tudo por IntersectionObserver, sem listener de scroll ----------
  if (!('IntersectionObserver' in window)) {
    $$('[data-reveal]').forEach((el) => el.classList.add('is-in'));
    root.classList.add('is-past-hero');
  } else {
    const header = $('.header');
    new IntersectionObserver(([e]) => header.classList.toggle('is-scrolled', !e.isIntersecting))
      .observe($('.top-sentinel'));

    // Botao flutuante e barra do celular: aparecem depois dos botoes do hero...
    new IntersectionObserver(([e]) => {
      root.classList.toggle('is-past-hero', !e.isIntersecting && e.boundingClientRect.top < 0);
    }).observe($('.hero__actions'));

    // ...e somem no CTA final e no rodape, para nao repetir o botao
    const atCta = new Set();
    const ctaObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? atCta.add(e.target) : atCta.delete(e.target)));
      root.classList.toggle('is-at-cta', atCta.size > 0);
    });
    ctaObs.observe($('.cta'));
    ctaObs.observe($('.footer'));

    const reveal = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        reveal.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    $$('[data-reveal]').forEach((el) => reveal.observe(el));
  }

  // ---------- Menu do celular ----------
  const header = $('.header');
  const menuBtn = $('.menu-btn');
  const menu = $('#menu');
  const setMenu = (open) => {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    $('use', menuBtn).setAttribute('href', open ? '#i-x' : '#i-menu-2');
    header.classList.toggle('is-open', open);
    root.classList.toggle('menu-open', open);
  };
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
  });
  matchMedia('(min-width: 960px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // ---------- Galeria ampliada ----------
  const box = $('.lightbox');
  const items = $$('.g__btn');
  if (!box || !items.length || typeof box.showModal !== 'function') return;

  const img = $('.lightbox__img', box);
  const cap = $('.lightbox__cap', box);
  let index = 0;
  const show = (i) => {
    index = (i + items.length) % items.length;
    const item = items[index];
    img.src = item.dataset.full;
    img.alt = $('img', item).alt;
    cap.textContent = `${item.dataset.caption}  ·  ${index + 1} de ${items.length}`;
  };
  items.forEach((item, i) => item.addEventListener('click', () => { show(i); box.showModal(); }));
  $('.lightbox__close', box).addEventListener('click', () => box.close());
  $('.lightbox__prev', box).addEventListener('click', () => show(index - 1));
  $('.lightbox__next', box).addEventListener('click', () => show(index + 1));
  box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
  box.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
  let startX = null;
  box.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  box.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 48) show(index + (dx < 0 ? 1 : -1));
  });
})();
