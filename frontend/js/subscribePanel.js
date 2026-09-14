(function exportSubscribePanel(root) {
  let elements = {};
  // Ключ последнего показанного сообщения из словаря i18n (если оно пришло с
  // бэкенда как готовый текст — здесь null, тогда перевод при смене языка
  // не подменяет пришедшее с сервера сообщение).
  let lastMessageKey = null;

  function bindElements() {
    for (const element of document.querySelectorAll('[id]')) {
      elements[element.id] = element;
    }
  }

  function init() {
    bindElements();
    if (!elements.subscribeForm) return;
    elements.subscribeForm.addEventListener('submit', onSubmit);
    document.addEventListener('focusforge:langchange', () => {
      if (lastMessageKey && !elements.subscribeMessage.classList.contains('hidden')) {
        elements.subscribeMessage.textContent = root.FocusForgeI18n.t(lastMessageKey);
      }
    });
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
        if (payload.error) {
          showMessage(payload.error, 'error', null);
        } else {
          showMessage(root.FocusForgeI18n.t('subscribe_error_generic'), 'error', 'subscribe_error_generic');
        }
        return;
      }

      showMessage(root.FocusForgeI18n.t('subscribe_success'), 'success', 'subscribe_success');
      elements.subscribeForm.reset();
    } catch (error) {
      showMessage(root.FocusForgeI18n.t('subscribe_error_network'), 'error', 'subscribe_error_network');
    } finally {
      elements.subscribeSubmit.disabled = false;
    }
  }

  function showMessage(text, kind, key) {
    lastMessageKey = key;
    elements.subscribeMessage.textContent = text;
    elements.subscribeMessage.classList.remove('hidden', 'is-success', 'is-error');
    elements.subscribeMessage.classList.add(kind === 'success' ? 'is-success' : 'is-error');
  }

  root.FocusForgeSubscribe = { init };
})(window);
