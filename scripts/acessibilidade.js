(() => {
  const read = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); return true; } catch { return false; } };
  const textSizes = ['medio', 'grande', 'muito-grande'];
  const textSize = () => {
    const value = read('cs.texto', 'medio');
    return textSizes.includes(value) ? value : 'medio';
  };
  const apply = () => {
    document.documentElement.dataset.textSize = textSize();
    document.documentElement.classList.toggle('high-contrast', read('cs.contraste', 'false') === 'true');
  };
  apply();
  // A preferência é global, inclusive quando alterada em outra aba do projeto.
  window.addEventListener('storage', (event) => {
    if (event.key === null || ['cs.texto', 'cs.contraste'].includes(event.key)) {
      apply();
      const size = document.querySelector('#text-size');
      const contrast = document.querySelector('#contrast');
      if (size) size.value = textSize();
      if (contrast) contrast.checked = read('cs.contraste', 'false') === 'true';
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.bottom-navigation-link').forEach(link => {
      if (!link.querySelector('.nav-label')) {
        const label = document.createElement('span'); label.className = 'nav-label'; label.textContent = link.getAttribute('aria-label'); link.append(label);
      }
    });
    const size = document.querySelector('#text-size');
    if (size) {
      size.value = textSize();
      size.addEventListener('change', () => { const ok = save('cs.texto', size.value); apply(); document.querySelector('#preferences-status').textContent = ok ? 'Tamanho do texto salvo.' : 'Não foi possível salvar a preferência neste navegador.'; });
    }
    const contrast = document.querySelector('#contrast');
    if (contrast) {
      contrast.checked = read('cs.contraste', 'false') === 'true';
      contrast.addEventListener('change', () => { const ok = save('cs.contraste', String(contrast.checked)); apply(); document.querySelector('#preferences-status').textContent = ok ? 'Preferência de contraste salva.' : 'Não foi possível salvar a preferência neste navegador.'; });
    }
    const speak = document.querySelector('#read-page');
    if (speak) {
      if (!('speechSynthesis' in window)) { speak.disabled = true; speak.textContent = 'Leitura em voz alta indisponível neste navegador'; }
      else speak.addEventListener('click', () => {
        if (speechSynthesis.speaking) { speechSynthesis.cancel(); speak.textContent = 'Ouvir esta página'; return; }
        const message = new SpeechSynthesisUtterance(document.querySelector('main').innerText); message.lang = 'pt-BR'; message.rate = 0.85;
        const reset = () => { speak.textContent = 'Ouvir esta página'; };
        message.onend = reset; message.onerror = reset; speechSynthesis.speak(message); speak.textContent = 'Parar leitura';
      });
    }
    const help = document.querySelector('#help-dialog');
    document.querySelector('#request-help')?.addEventListener('click', () => help.showModal());
    document.querySelector('#close-help')?.addEventListener('click', () => help.close());
  });
})();
