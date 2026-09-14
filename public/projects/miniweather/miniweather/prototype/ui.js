export const escape = (value) =>
  String(value == null ? '' : value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
export function icon(name, size = 20) {
  const paths = {
    today:
      'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
    forecast: 'M4 18V9m5 9V4m6 14v-6m5 6V7',
    style: 'm8 4-5 3 3 5 2-1v9h8v-9l2 1 3-5-5-3c0 4-8 4-8 0',
    profile: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 21v-3c0-6 16-6 16 0v3',
    heart:
      'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8',
    refresh: 'M20 7v5h-5M4 17v-5h5M6 6a8 8 0 0 1 13 2M18 18A8 8 0 0 1 5 16',
    cloud: 'M6 18h12a4 4 0 0 0 0-8 6 6 0 0 0-11-2 5 5 0 0 0-1 10',
    rain: 'M6 15h12a4 4 0 0 0 0-8 6 6 0 0 0-11-2 5 5 0 0 0-1 10M8 18l-1 3m6-3-1 3m6-3-1 3',
    night: 'M20 15A8 8 0 0 1 9 4 9 9 0 1 0 20 15',
    snow: 'M12 2v20M3 7l18 10M3 17 21 7',
    fog: 'M3 7h18M5 12h14M3 17h18'
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name] || paths.cloud}"/></svg>`;
}
export function weatherIcon(condition) {
  return icon({ sunny: 'today', cloudy: 'cloud' }[condition] || condition);
}
export function section(kicker, title, extra = '') {
  return `<div class="section-head"><div><p class="eyebrow">${kicker}</p><h2>${title}</h2></div>${extra}</div>`;
}
export function outfitCard(outfit, saved, detail = false) {
  return `<article class="outfit-card reveal"><div class="outfit-art"><img src="../miniprogram${escape(outfit.illustration)}" alt="Illustrated ${escape(outfit.color.toLowerCase())} ${escape(outfit.layer)} outfit silhouettes"><span class="art-label">THE DAILY UNIFORM</span><button class="save ${saved ? 'saved' : ''}" data-action="save" aria-label="${saved ? 'Unsave' : 'Save'} outfit" aria-pressed="${saved}">${icon('heart')}</button></div><div class="outfit-content"><div class="row"><span class="tag">${escape(outfit.style)} / ${escape(outfit.color)}</span><span class="muted small">LOOK ${detail ? 'DETAIL' : '01'}</span></div><h3>${escape(outfit.title)}</h3><div class="pieces">${outfit.pieces.map((p, i) => `<div><span>0${i + 1}</span>${escape(p)}</div>`).join('')}</div><div class="reason"><span>↳</span><p>${escape(outfit.reasons[0])} ${escape(outfit.reasons.find((r) => r.startsWith('Rain')) || '')}</p></div>${detail ? `<h4>Why this works for you</h4><ul class="reasons">${outfit.reasons.map((r) => `<li>${escape(r)}</li>`).join('')}</ul>${outfit.accessories.length ? `<h4>Take along</h4><p>${escape(outfit.accessories.join(' · '))}</p>` : ''}<p class="small muted">Rule fit ${outfit.comfortScore}/100 — a heuristic, not a measured comfort score.</p><p class="small muted">Illustration shows the palette and layering mood; the item list is authoritative.</p>` : ''}<button class="primary full" data-action="regenerate">${icon('refresh', 17)} Try another look <span>↗</span></button>${!detail ? '<button class="text-link full" data-route="outfit">See the reasoning →</button>' : ''}</div></article>`;
}
export function hourly(w) {
  const width = w.hourly.length * 53 - 17;
  const points = w.hourly.map((h, i) => `${18 + i * 53},${60 - h.height}`).join(' ');
  return `<div class="hourly" tabindex="0" aria-label="24-hour forecast, scroll horizontally"><div class="hour-grid"><svg class="temperature-curve" width="${width}" height="60" viewBox="0 0 ${width} 60" aria-hidden="true"><polygon points="18,60 ${points} ${18 + (w.hourly.length - 1) * 53},60" fill="#a8b58322"/><polyline points="${points}" fill="none" stroke="#839263" stroke-width="2" stroke-linejoin="round"/></svg>${w.hourly.map((h) => `<div class="hour"><span>${escape(h.label)}</span>${weatherIcon(h.condition)}<strong>${h.displayTemp}</strong><div class="curve-track"></div><small>${h.rainProbability}%</small></div>`).join('')}</div></div>`;
}
export function daily(w) {
  return `<div class="daily">${w.daily.map((d) => `<div class="day"><span>${escape(d.label)}</span><span aria-label="${escape(d.conditionLabel)}">${weatherIcon(d.condition)}</span><small>${d.rainProbability}%</small><span class="muted">${d.displayLow}</span><div class="range"><i style="left:${d.left}%;width:${d.width}%"></i></div><strong>${d.displayHigh}</strong></div>`).join('')}</div>`;
}
