'use strict';

const page = document.querySelector('.page');
const cards = [...document.querySelectorAll('.card')];
const message = document.getElementById('message');
const copyButton = document.getElementById('copy');
const copyStatus = document.getElementById('copy-status');
const endingTitle = document.getElementById('ending-title');
const endingText = document.getElementById('ending-text');
const endingHint = document.getElementById('ending-hint');
const ending = document.getElementById('ending');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

function show(id) {
  for (const card of cards) {
    card.hidden = card.id !== id;
  }
  const focusTarget = document.getElementById(id).querySelector('h2, button');
  focusTarget.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function celebrate(count = 20) {
  if (motion.matches) return;

  for (let index = 0; index < count; index += 1) {
    const angle = (2 * Math.PI * index) / count;
    const radius = 17 + Math.random() * 32;
    const heart = document.createElement('span');
    heart.className = 'heart';
    heart.setAttribute('aria-hidden', 'true');
    heart.textContent = ['♥', '♡', '✦'][index % 3];
    heart.style.setProperty('--x', `${Math.cos(angle) * radius}vw`);
    heart.style.setProperty('--y', `${Math.sin(angle) * radius - 12}vh`);
    heart.style.setProperty('--spin', `${index % 2 === 0 ? -35 : 35}deg`);
    heart.style.setProperty('--size', `${1 + Math.random() * 1.4}rem`);
    heart.style.setProperty('--delay', `${index * 12}ms`);
    page.append(heart);
    window.setTimeout(() => heart.remove(), 1450 + index * 12);
  }
}

function finish(accepted, copied = false) {
  endingTitle.textContent = accepted ? 'Anh yêu em, Khánh Ly ♡' : 'Anh cảm ơn em đã đọc thư';
  endingText.textContent = accepted
    ? 'Anh vui lắm. Khi nào em rảnh, anh mời em một buổi hẹn nhé. Em chọn món mình ăn, còn anh sẽ mang theo lá thư này để đọc cho em nghe.'
    : 'Em cứ thong thả nha. Khi nào muốn nói chuyện, anh sẽ lắng nghe.';
  ending.toggleAttribute('data-celebration', accepted);
  endingHint.hidden = !copied;
  show('ending');
  if (accepted) celebrate(38);
}

document.getElementById('open').addEventListener('click', () => show('story'));
document.getElementById('continue').addEventListener('click', () => show('question'));
document.getElementById('yes').addEventListener('click', () => {
  show('reply');
  celebrate();
});
document.getElementById('later').addEventListener('click', () => finish(false));
document.getElementById('skip').addEventListener('click', () => finish(true));
document.getElementById('restart').addEventListener('click', () => show('cover'));

message.addEventListener('input', () => {
  copyStatus.textContent = 'Em có thể dán lời nhắn vào cuộc trò chuyện với anh.';
});

copyButton.addEventListener('click', async () => {
  const text = message.value.trim();
  if (!text) {
    copyStatus.textContent = 'Em viết vài dòng trước khi sao chép nhé.';
    message.focus();
    return;
  }

  copyButton.disabled = true;
  try {
    await navigator.clipboard.writeText(text);
    if (!document.getElementById('reply').hidden) finish(true, true);
  } catch {
    if (!document.getElementById('reply').hidden) {
      message.focus();
      message.select();
      copyStatus.textContent = 'Anh đã bôi đen lời nhắn để em tự sao chép.';
    }
  } finally {
    copyButton.disabled = false;
  }
});
