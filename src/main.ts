import './styles.css';
import { GameApp } from './app/GameApp';

const host = document.querySelector<HTMLDivElement>('#game-host');
const fallback = document.querySelector<HTMLDivElement>('#boot-fallback');

if (!host) {
  throw new Error('게임 호스트 요소를 찾을 수 없습니다.');
}

const game = new GameApp(host);

void game.start().then(() => {
  fallback?.remove();
}).catch((error: unknown) => {
  console.error(error);
  if (fallback) {
    fallback.textContent = '게임 초기화에 실패했습니다. 콘솔 로그를 확인해 주세요.';
  }
});
