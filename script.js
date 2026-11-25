'use strict';

const page = document.querySelector('.page');
const cards = [...document.querySelectorAll('.card')];
const yesButton = document.getElementById('yes');
const proposalNote = document.getElementById('proposal-note');
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const noMessages = ['Em cứ suy nghĩ thêm nha.', 'Anh đợi em nè.', 'Thong thả thôi em ♡'];
let noCount = 0;

function show(id) {
  for (const card of cards) {
    card.hidden = card.id !== id;
  }
  const focusTarget = document.getElementById(id).querySelector('h2, button');
  focusTarget.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function celebrate(count) {
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

document.getElementById('open').addEventListener('click', () => show('story'));
document.getElementById('continue').addEventListener('click', () => {
  noCount = 0;
  yesButton.style.removeProperty('--yes-growth');
  proposalNote.textContent = '';
  show('question');
});
document.getElementById('back-to-letter').addEventListener('click', () => show('story'));
document.getElementById('restart').addEventListener('click', () => show('cover'));

document.getElementById('no').addEventListener('click', () => {
  noCount += 1;
  yesButton.style.setProperty('--yes-growth', String(1 - 0.82 ** noCount));
  if (noCount <= noMessages.length) proposalNote.textContent = noMessages[noCount - 1];
});

yesButton.addEventListener('click', () => {
  show('ending');
  celebrate(38);
});
