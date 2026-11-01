(() => {
  const key = 'cs.medicoes';
  let items = [];
  try { const saved = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(saved)) items = saved.filter(x => x && ['cardiaca', 'pressao', 'glicemia'].includes(x.type) && Number.isFinite(x.value) && Number.isFinite(new Date(x.date).getTime())); } catch { /* Histórico vazio até um novo registro. */ }
  const names = { cardiaca: 'Frequência cardíaca', pressao: 'Pressão arterial', glicemia: 'Glicemia' };
  const units = { cardiaca: 'bpm', pressao: 'mmHg', glicemia: 'mg/dL' };
  const format = x => `${x.value}${x.type === 'pressao' ? ' / ' + x.secondary : ''} ${units[x.type]}`;
  const date = x => new Date(x.date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  const history = document.querySelector('#measurement-history');
  if (history) {
    items.slice().reverse().slice(0, 20).forEach(item => {
      const li = document.createElement('li');
      const title = document.createElement('strong'); title.textContent = `${names[item.type]}: ${format(item)}`;
      const detail = document.createElement('p'); detail.textContent = `${date(item)} · Registro manual${item.note ? ' · ' + item.note : ''}`;
      li.append(title, detail); history.append(li);
    });
    document.querySelector('#empty-history').hidden = items.length > 0;
    for (const type of Object.keys(names)) {
      const latest = items.filter(x => x.type === type).at(-1);
      if (latest) { document.querySelector(`[data-value="${type}"]`).textContent = format(latest); document.querySelector(`[data-date="${type}"]`).textContent = `${date(latest)} · Registro manual`; }
    }
  }
  const form = document.querySelector('#measurement-form');
  if (!form) return;
  const type = form.elements.type, value = form.elements.value, secondary = form.elements.secondary;
  const update = () => {
    const pressure = type.value === 'pressao';
    document.querySelector('#secondary-field').hidden = !pressure; secondary.required = pressure; secondary.disabled = !pressure;
    document.querySelector('#value-label').textContent = pressure ? 'Pressão máxima (mmHg)' : `${names[type.value]} (${units[type.value]})`;
    value.value = ''; secondary.value = '';
  };
  type.addEventListener('change', update); update();
  form.addEventListener('submit', event => {
    event.preventDefault(); const status = document.querySelector('#measurement-status');
    if (!form.reportValidity()) return;
    if (type.value === 'pressao' && Number(secondary.value) >= Number(value.value)) { status.textContent = 'Confira os valores: a pressão mínima deve ser menor que a máxima.'; secondary.focus(); return; }
    const item = { type: type.value, value: Number(value.value), secondary: type.value === 'pressao' ? Number(secondary.value) : null, note: form.elements.note.value.trim(), date: new Date().toISOString() };
    try { localStorage.setItem(key, JSON.stringify([...items, item])); window.location.href = '/pages/medicao-registrada.html'; }
    catch { status.textContent = 'Não foi possível salvar. Verifique se o navegador permite armazenamento e tente novamente.'; }
  });
})();
