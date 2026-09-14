(function exportSubscribePanel(root) {
  let elements = {};

  function bindElements() {
    for (const element of document.querySelectorAll('[id]')) {
      elements[element.id] = element;
    }
  }

  function init() {
    bindElements();
    if (!elements.subscribeForm) return;
    elements.subscribeForm.addEventListener('submit', onSubmit);
  }

  async function onSubmit(event) {
    event.preventDefault();
    const email = elements.subscribeEmail.value.trim();

    elements.subscribeSubmit.disabled = true;
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        showMessage(payload.error || 'Не получилось отправить email. Попробуйте ещё раз.', 'error');
        return;
      }

      showMessage('Готово! Мы напишем вам, когда личный кабинет будет готов.', 'success');
      elements.subscribeForm.reset();
    } catch (error) {
      showMessage('Не получилось отправить email. Проверьте соединение и попробуйте ещё раз.', 'error');
    } finally {
      elements.subscribeSubmit.disabled = false;
    }
  }

  function showMessage(text, kind) {
    elements.subscribeMessage.textContent = text;
    elements.subscribeMessage.classList.remove('hidden', 'is-success', 'is-error');
    elements.subscribeMessage.classList.add(kind === 'success' ? 'is-success' : 'is-error');
  }

  root.FocusForgeSubscribe = { init };
})(window);
