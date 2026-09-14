import { escape as e, icon, section, outfitCard, hourly, daily } from './ui.js';
const MW = window.MW;
export function today(s) {
  const w = s.formatted;
  return `<header class="location"><button data-action="city">◎ ${e(w.city.name)} <span>⌄</span></button><button data-action="refresh" aria-label="Refresh weather">${icon('refresh')}</button></header><section class="weather-hero ${w.current.condition}"><div class="atmosphere"><i></i><b></b><span></span></div><div class="hero-content"><p class="hero-date">${e(w.dateLabel)}</p><div class="temperature">${w.temperature}<small>${s.preferences.unit}</small></div><div class="hero-bottom"><div><h2>${e(w.conditionLabel)}</h2><p>Feels like ${w.feelsLike}</p></div><span class="weather-note">A new day.<br>Your own way.</span></div></div></section><div class="metrics">${w.metrics.map((m) => `<div><span>${m.label}</span><strong>${m.value}</strong></div>`).join('')}</div><p class="data-notice"><span class="live-dot"></span> ${e(w.notice)}</p>${section('DRESSED FOR THE DAY', 'What should I wear?', `<span class="little-sun">✳</span>`)}${outfitCard(s.outfit, s.isSaved)}<button class="forecast-link" data-route="forecast"><span>Plan a little further ahead<br><strong>Your next 24 hours</strong></span><span>↗</span></button>`;
}
export function forecast(s) {
  const w = s.formatted;
  return `<header class="page-heading"><p class="eyebrow">${e(w.city.name)} / ${s.preferences.unit === 'F' ? 'FAHRENHEIT' : 'CELSIUS'}</p><h1>Ahead of the<br><em>weather.</em></h1><p class="muted">A little planning. A more comfortable day.</p></header><div class="shift"><span>↗ WEATHER SHIFT</span><p>${e(w.shift)}</p><button class="text-link" data-route="outfit">Find your layers →</button></div><div class="periods">${w.periods.map((p) => `<div><span>${p.label}</span><strong>${p.temperature}</strong><small>${p.rain}% rain</small></div>`).join('')}</div>${section('THE NEXT 24 HOURS', 'Follow the temperature')}${hourly(w)}${section('A LITTLE FURTHER OUT', 'Your week, at a glance')}${daily(w)}<p class="data-notice">${e(w.notice)} All times are local to the selected city.</p>`;
}
export function style(s, onboarding = false) {
  const p = s.preferences;
  return `<header class="page-heading"><p class="eyebrow">${onboarding ? 'WELCOME TO MINIWEATHER' : 'PERSONAL, BY DESIGN'}</p><h1>${onboarding ? 'Good days start<br>with <em>you.</em>' : 'Find your<br><em>everyday.</em>'}</h1><p class="muted">${onboarding ? 'Your weather. Your style. Settle in with a few details.' : 'A few preferences. A look that feels like you.'}</p></header>${onboarding ? `<button class="setting full" data-action="city"><span>Your city</span><strong>${e(s.weather.city.name)} ↗</strong></button>` : ''}<div class="preference-section"><h3>Preferred styling profile</h3><p class="muted small">A starting point for silhouettes. Always your choice.</p><div class="chips">${Object.keys(
    MW.profiles
  )
    .map(
      (v) =>
        `<button class="chip ${p.profile === v ? 'selected' : ''}" data-pref="profile" data-value="${v}" aria-pressed="${p.profile === v}">${v}</button>`
    )
    .join(
      ''
    )}</div></div><div class="preference-section"><div class="row"><h3>Your style vocabulary</h3><span class="muted small">${p.styles.length} / 3</span></div><p class="muted small">Choose up to three. Mix what speaks to you.</p><div class="style-grid">${MW.profiles[p.profile].map((v, i) => `<button class="style-tile ${p.styles.includes(v) ? 'selected' : ''}" data-pref="styles" data-value="${v}" aria-pressed="${p.styles.includes(v)}"><span class="swatch-art" style="--swatch:${['#b5b7a2', '#a9b6c1', '#c9b592', '#c4b0b0'][i % 4]}"><i></i><b></b></span><span>${v}</span><small aria-hidden="true">${p.styles.includes(v) ? '✓' : '+'}</small></button>`).join('')}</div></div><div class="preference-section"><h3>A palette to return to</h3><div class="colors">${Object.entries(
    MW.palettes
  )
    .map(
      ([v, colors]) =>
        `<button data-pref="color" data-value="${v}" class="color ${p.color === v ? 'selected' : ''}" aria-pressed="${p.color === v}"><span>${colors.map((c) => `<i style="background:${c}"></i>`).join('')}</span><small>${v}</small></button>`
    )
    .join(
      ''
    )}</div></div><div class="preference-section"><h3>How do you feel the weather?</h3><p class="muted small">We adjust the layers, not just the temperature.</p><div class="sensitivity">${['I get cold easily', 'Normal', 'I run warm'].map((v) => `<button class="chip ${p.sensitivity === v ? 'selected' : ''}" data-pref="sensitivity" data-value="${v}" aria-pressed="${p.sensitivity === v}">${v}</button>`).join('')}</div></div>${onboarding ? '<button class="primary full" data-action="start">Make it my day <span>↗</span></button>' : '<p class="small muted">Preferences save automatically on this device.</p><button class="primary full" data-route="today">See my daily edit ↗</button>'}`;
}
export function profile(s) {
  return `<header class="page-heading"><p class="eyebrow">YOUR LITTLE CORNER</p><h1>Made<br><em>for you.</em></h1><p class="muted">No account. Just your everyday essentials.</p></header><div class="settings"><button class="setting" data-action="city"><span>Current city</span><strong>${e(s.weather.city.name)} ↗</strong></button><div class="setting"><span>Temperature unit</span><div class="chips compact">${['F', 'C'].map((v) => `<button class="chip ${s.preferences.unit === v ? 'selected' : ''}" data-pref="unit" data-value="${v}" aria-pressed="${s.preferences.unit === v}">°${v}</button>`).join('')}</div></div><button class="setting" data-route="style"><span>Style preferences</span><strong>${e(s.preferences.styles.join(', '))} ↗</strong></button><button class="setting" data-route="style"><span>Temperature sensitivity</span><strong>${e(s.preferences.sensitivity)} ↗</strong></button></div>${section('GOOD LOOKS, KEPT CLOSE', 'Your saved outfits', `<span class="muted">${s.saved.length}</span>`)}${s.saved.length ? s.saved.map((o) => `<article class="saved-look"><img src="../miniprogram${e(o.illustration)}" alt="Saved outfit palette"><div><strong>${e(o.style)} / ${e(o.color)}</strong><p class="small muted">${e(o.pieces.join(' · '))}</p><button class="text-link" data-remove="${e(o.id)}">Remove</button></div></article>`).join('') : `<div class="empty">${icon('heart', 32)}<h3>No saved outfits yet.</h3><p>Keep a look you love.<br>It will be waiting right here.</p><button class="text-link" data-route="today">Find your first look →</button></div>`}<p class="privacy">Stored only on this device. No login, tracking, or location history.</p>`;
}
export function outfit(s) {
  return `<button class="text-link back" data-route="today">← Back to Today</button>${section('THE REASONING, REVEALED', 'Your daily edit.')}${outfitCard(s.outfit, s.isSaved, true)}`;
}
