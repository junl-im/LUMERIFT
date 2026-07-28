export function openEmailPromptOverlay(
  title = '비밀번호 재설정',
  description = '가입한 이메일 주소로 재설정 링크를 보냅니다.',
): Promise<string | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'email-auth-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', title);

    const form = document.createElement('form');
    form.className = 'email-auth-card';
    form.innerHTML = `
      <div class="email-auth-kicker">LUMERIFT ACCOUNT</div>
      <h2>${escapeHtml(title)}</h2>
      <p>${escapeHtml(description)}</p>
      <label>이메일<input name="email" type="email" autocomplete="email" required /></label>
      <div class="email-auth-actions">
        <button type="button" data-action="cancel">취소</button>
        <button type="submit" class="primary">메일 보내기</button>
      </div>
    `;
    overlay.appendChild(form);
    document.body.appendChild(overlay);

    const email = form.elements.namedItem('email') as HTMLInputElement;
    const close = (value: string | null): void => {
      overlay.remove();
      resolve(value);
    };
    form.querySelector<HTMLButtonElement>('[data-action="cancel"]')?.addEventListener('click', () => close(null));
    overlay.addEventListener('pointerdown', (event) => {
      if (event.target === overlay) close(null);
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      close(email.value.trim());
    });
    queueMicrotask(() => email.focus());
  });
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  })[character] ?? character);
}
