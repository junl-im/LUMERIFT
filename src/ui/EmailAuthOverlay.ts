export type EmailAuthMode = 'login' | 'register';

export interface EmailAuthInput {
  readonly email: string;
  readonly password: string;
}

export function openEmailAuthOverlay(mode: EmailAuthMode): Promise<EmailAuthInput | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'email-auth-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', mode === 'login' ? '이메일 로그인' : '이메일 회원가입');

    const form = document.createElement('form');
    form.className = 'email-auth-card';
    form.innerHTML = `
      <div class="email-auth-kicker">LUMERIFT ACCOUNT</div>
      <h2>${mode === 'login' ? '이메일 로그인' : '이메일 계정 만들기'}</h2>
      <p>${mode === 'login' ? '기존 계정으로 저장 데이터를 불러옵니다.' : '게스트 진행 중이라면 현재 UID와 데이터를 그대로 연결합니다.'}</p>
      <label>이메일<input name="email" type="email" autocomplete="email" required /></label>
      <label>비밀번호<input name="password" type="password" autocomplete="${mode === 'login' ? 'current-password' : 'new-password'}" minlength="6" required /></label>
      ${mode === 'register' ? '<label>비밀번호 확인<input name="confirm" type="password" autocomplete="new-password" minlength="6" required /></label>' : ''}
      <div class="email-auth-error" role="alert" aria-live="polite"></div>
      <div class="email-auth-actions">
        <button type="button" data-action="cancel">취소</button>
        <button type="submit" class="primary">${mode === 'login' ? '로그인' : '가입 및 연결'}</button>
      </div>
    `;
    overlay.appendChild(form);
    document.body.appendChild(overlay);

    const email = form.elements.namedItem('email') as HTMLInputElement;
    const password = form.elements.namedItem('password') as HTMLInputElement;
    const confirm = form.elements.namedItem('confirm') as HTMLInputElement | null;
    const error = form.querySelector<HTMLDivElement>('.email-auth-error');

    const close = (value: EmailAuthInput | null) => {
      overlay.remove();
      resolve(value);
    };

    form.querySelector<HTMLButtonElement>('[data-action="cancel"]')?.addEventListener('click', () => close(null));
    overlay.addEventListener('pointerdown', (event) => {
      if (event.target === overlay) close(null);
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (confirm && password.value !== confirm.value) {
        if (error) error.textContent = '비밀번호 확인이 일치하지 않습니다.';
        return;
      }
      close({ email: email.value.trim(), password: password.value });
    });

    queueMicrotask(() => email.focus());
  });
}
