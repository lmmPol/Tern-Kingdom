import { HEROES_DATA } from '../data/heroes.js';
import { toggleCampfireAudio } from './audio.js';

const state = {
  selectedHeroId: null,
  currentAdventureHero: null,
  currentChapterIndex: 0,
  activeArtworkUrl: ''
};

const sceneImg = document.getElementById('scene-img');
const toggleAudioBtn = document.getElementById('toggle-audio-btn');
const modal = document.getElementById('character-modal');
const cardVisual = document.getElementById('card-visual');
const cardSvgIcon = document.getElementById('card-svg-icon');
const cardFaction = document.getElementById('card-faction');
const cardHeroRole = document.getElementById('card-hero-role');
const cardHeroName = document.getElementById('card-hero-name');
const cardHeroDesc = document.getElementById('card-hero-desc');
const cardHeroTraits = document.getElementById('card-hero-traits');
const cardStatusNote = document.getElementById('card-status-note');
const startAdventureBtn = document.getElementById('start-adventure-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const adventureScreen = document.getElementById('adventure-screen');
const advBackdrop = document.getElementById('adv-backdrop');
const advHeroTitle = document.getElementById('adv-hero-title');
const advChapterCounter = document.getElementById('adv-chapter-counter');
const advChapterTag = document.getElementById('adv-chapter-tag');
const advChapterHeading = document.getElementById('adv-chapter-heading');
const advNarrative = document.getElementById('adv-narrative');
const advChoices = document.getElementById('adv-choices');
const advResponseNote = document.getElementById('adv-response-note');
const chapterDots = document.getElementById('chapter-dots');
const advToMenuBtn = document.getElementById('adv-to-menu-btn');
const advNextBtn = document.getElementById('adv-next-btn');
const toastMsg = document.getElementById('toast-msg');

function showToast(text) {
  toastMsg.textContent = text;
  toastMsg.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toastMsg.classList.remove('show'), 3200);
}

function buildFullCampIllustrationDataUrl() {
  const c = document.createElement('canvas');
  c.width = 1600;
  c.height = 900;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 620);
  sky.addColorStop(0, '#090e1b');
  sky.addColorStop(0.5, '#152036');
  sky.addColorStop(1, '#131923');
  g.fillStyle = sky;
  g.fillRect(0, 0, 1600, 900);
  const fireLight = g.createRadialGradient(785, 670, 15, 785, 640, 520);
  fireLight.addColorStop(0, 'rgba(255, 165, 60, 0.45)');
  fireLight.addColorStop(1, 'transparent');
  g.fillStyle = fireLight;
  g.fillRect(220, 240, 1140, 660);
  return c.toDataURL('image/jpeg', 0.9);
}

const FALLBACK_ARTWORK_URL = buildFullCampIllustrationDataUrl();
const CANDIDATE_SOURCES = ['./assets/bg.JPEG', './assets/bg.jpg', 'bg.png', 'bg.jpg'];
let candidateIdx = 0;

sceneImg.addEventListener('load', () => {
  state.activeArtworkUrl = sceneImg.currentSrc || sceneImg.src;
});

sceneImg.addEventListener('error', () => {
  candidateIdx += 1;
  if (candidateIdx < CANDIDATE_SOURCES.length) {
    sceneImg.src = CANDIDATE_SOURCES[candidateIdx];
  } else {
    state.activeArtworkUrl = FALLBACK_ARTWORK_URL;
    sceneImg.src = FALLBACK_ARTWORK_URL;
  }
});

function openCharacterCard(heroId) {
  const hero = HEROES_DATA[heroId];
  if (!hero) return;
  state.selectedHeroId = heroId;
  const bgUrl = state.activeArtworkUrl || sceneImg.src || FALLBACK_ARTWORK_URL;
  cardVisual.style.backgroundImage = `url("${bgUrl}")`;
  cardVisual.style.backgroundSize = hero.crop.size;
  cardVisual.style.backgroundPosition = hero.crop.pos;
  cardSvgIcon.innerHTML = hero.iconSvg;
  cardFaction.textContent = hero.faction;
  cardHeroRole.textContent = hero.role;
  cardHeroName.textContent = hero.name;
  cardHeroDesc.textContent = hero.description;
  cardStatusNote.textContent = hero.statusNote;
  cardHeroTraits.innerHTML = '';
  hero.traits.forEach((trait) => {
    const span = document.createElement('span');
    span.className = 'trait-chip';
    span.textContent = trait;
    cardHeroTraits.appendChild(span);
  });
  startAdventureBtn.textContent = hero.id === 'you' ? 'НАЧАТЬ ПРОЛОГ' : 'НАЧАТЬ ПРИКЛЮЧЕНИЕ';
  modal.classList.add('open');
  startAdventureBtn.focus();
}

function closeCharacterCard() {
  modal.classList.remove('open');
  state.selectedHeroId = null;
}

document.querySelectorAll('.character-hotspot').forEach((btn) => {
  btn.addEventListener('click', () => openCharacterCard(btn.dataset.hero));
});

closeModalBtn.addEventListener('click', closeCharacterCard);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeCharacterCard();
});

function startAdventure(heroId) {
  const hero = HEROES_DATA[heroId];
  if (!hero || !hero.chapters || hero.chapters.length === 0) return;
  state.currentAdventureHero = hero;
  state.currentChapterIndex = 0;
  closeCharacterCard();
  const bgUrl = state.activeArtworkUrl || sceneImg.src || FALLBACK_ARTWORK_URL;
  advBackdrop.style.backgroundImage = `url("${bgUrl}")`;
  advHeroTitle.textContent = `${hero.name} • ${hero.role.toUpperCase()}`;
  renderChapter();
  adventureScreen.classList.add('active');
}

function renderChapter() {
  const hero = state.currentAdventureHero;
  const chapters = hero.chapters;
  const idx = state.currentChapterIndex;
  const chapter = chapters[idx];
  advChapterCounter.textContent = `ГЛАВА ${idx + 1} ИЗ ${chapters.length}`;
  advChapterTag.textContent = chapter.tag;
  advChapterHeading.textContent = chapter.title;
  advNarrative.textContent = chapter.text;
  advResponseNote.textContent = '';
  advResponseNote.classList.remove('visible');
  advChoices.innerHTML = '';
  if (chapter.choices && chapter.choices.length > 0) {
    chapter.choices.forEach((choice) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'adv-choice-btn';
      btn.textContent = `✦ ${choice.label}`;
      btn.addEventListener('click', () => {
        document.querySelectorAll('.adv-choice-btn').forEach((b) => b.classList.remove('selected'));
        btn.classList.add('selected');
        advResponseNote.textContent = choice.reply;
        advResponseNote.classList.add('visible');
      });
      advChoices.appendChild(btn);
    });
  }
  chapterDots.innerHTML = '';
  chapters.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'chapter-dot' + (i < idx ? ' done' : i === idx ? ' current' : '');
    chapterDots.appendChild(dot);
  });
  advNextBtn.textContent = idx < chapters.length - 1 ? 'СЛЕДУЮЩАЯ ГЛАВА' : 'ЗАВЕРШИТЬ И ВЕРНУТЬСЯ К КОСТРУ';
}

function returnToMainMenu() {
  adventureScreen.classList.remove('active');
  state.currentAdventureHero = null;
  state.currentChapterIndex = 0;
}

startAdventureBtn.addEventListener('click', () => {
  if (state.selectedHeroId) startAdventure(state.selectedHeroId);
});

advNextBtn.addEventListener('click', () => {
  if (!state.currentAdventureHero) return;
  const total = state.currentAdventureHero.chapters.length;
  if (state.currentChapterIndex < total - 1) {
    state.currentChapterIndex += 1;
    renderChapter();
  } else {
    returnToMainMenu();
    showToast('Глава завершена. Вы вернулись к ночному костру.');
  }
});

advToMenuBtn.addEventListener('click', returnToMainMenu);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (modal.classList.contains('open')) closeCharacterCard();
    else if (adventureScreen.classList.contains('active')) returnToMainMenu();
  }
});

if (toggleAudioBtn) {
  toggleAudioBtn.addEventListener('click', () => toggleCampfireAudio(toggleAudioBtn));
}
