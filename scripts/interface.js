(() => {
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const contactForm = document.querySelector('#contact-form');
  contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    const data = new FormData(contactForm), phone = String(data.get('phone')).replace(/[^+0-9]/g, '');
    if (phone.replace(/\D/g,'').length < 10) { document.querySelector('#contact-status').textContent = 'Confira o telefone e inclua o DDD.'; return; }
    try {
      const contacts = read('cs.contatos', []);
      localStorage.setItem('cs.contatos', JSON.stringify([...contacts, { name: String(data.get('name')).trim(), phone, relationship: String(data.get('relationship')).trim() }]));
      location.href = '/pages/contato-registrado.html';
    } catch { document.querySelector('#contact-status').textContent = 'Não foi possível salvar neste navegador. Tente novamente.'; }
  });
  const list = document.querySelector('#contacts');
  if (list) {
    const contacts = read('cs.contatos', []);
    if (!Array.isArray(contacts) || !contacts.length) list.innerHTML = '<section class="card"><h2>Quem faz parte do seu cuidado?</h2><p>Adicione uma pessoa de confiança para encontrar seu telefone com facilidade.</p><a class="button" href="/pages/adicionar-contato.html">Adicionar primeiro contato</a></section>';
    else contacts.forEach(contact => {
      const card = document.createElement('section'); card.className = 'card';
      const title = document.createElement('h2'); title.textContent = contact.name;
      const description = document.createElement('p'); description.textContent = contact.relationship || 'Contato de confiança';
      const number = document.createElement('p'); number.textContent = contact.phone;
      const call = document.createElement('a'); call.className = 'button'; call.textContent = 'Ligar'; call.href = 'tel:' + String(contact.phone).replace(/[^+0-9]/g, '');
      card.append(title, description, number, call); list.append(card);
    });
  }
  document.querySelectorAll('[data-pref]').forEach(input => {
    input.checked = read('cs.alerta.' + input.dataset.pref, false);
    input.addEventListener('change', () => {
      try { localStorage.setItem('cs.alerta.' + input.dataset.pref, JSON.stringify(input.checked)); document.querySelector('#local-status').textContent = 'Preferência salva neste navegador.'; }
      catch { document.querySelector('#local-status').textContent = 'Não foi possível salvar a preferência.'; }
    });
  });
})();
