import { icon, escape } from './ui.js';
import * as views from './views.js';
const MW = window.MW,
  app = document.querySelector('#app'),
  nav = document.querySelector('#nav');
const preferences = MW.storage.getPreferences();
const initialRoutes = {
  weather: 'today',
  ootd: 'outfit',
  onboarding: 'onboarding',
  profile: 'profile',
  forecast: 'forecast',
  style: 'style'
};
const page = location.pathname.split('/').pop().replace('.html', '');
const valid = ['today', 'forecast', 'style', 'profile', 'outfit', 'onboarding'];
let route = valid.includes(location.hash.slice(1))
  ? location.hash.slice(1)
  : initialRoutes[page] || (preferences.onboarded ? 'today' : 'onboarding');
let scenario = 'cloudy',
  variant = 0,
  error = false,
  loading = false,
  refreshTimer;
let state = { preferences };
function hydrate() {
  state.weather = MW.getMockWeather(state.preferences.cityId, scenario);
  state.preferences.cityId = state.weather.city.id;
  state.formatted = MW.formatWeather(state.weather, state.preferences.unit);
  state.outfit = MW.generateOutfitRecommendation(
    state.weather.current,
    state.preferences,
    state.weather.hourly,
    variant
  );
  state.saved = MW.storage.getSaved();
  state.isSaved = state.saved.some((o) => o.id === state.outfit.id);
}
function render(keepScroll = false) {
  app.dataset.page = route;
  const scroll = app.scrollTop;
  const focused = document.activeElement;
  const focusData = focused && focused.matches('button') ? { ...focused.dataset } : null;
  hydrate();
  nav.hidden = route === 'onboarding';
  nav.innerHTML = ['today', 'forecast', 'style', 'profile']
    .map(
      (v) =>
        `<button data-route="${v}" class="${route === v || (v === 'today' && route === 'outfit') ? 'active' : ''}" ${route === v ? 'aria-current="page"' : ''}>${icon(v)}<span>${v[0].toUpperCase() + v.slice(1)}</span></button>`
    )
    .join('');
  app.innerHTML = loading
    ? '<div class="loading" role="status"><p>Finding your forecast…</p><div class="skeleton hero"></div><div class="skeleton"></div><div class="skeleton tall"></div></div>'
    : error
      ? '<div class="empty"><h2>Unable to load weather.</h2><p>Let’s give it another try.</p><button class="primary" data-action="refresh">Try again</button></div>'
      : route === 'onboarding'
        ? views.style(state, true)
        : views[route](state);
  app.scrollTop = keepScroll ? scroll : 0;
  if (keepScroll && focusData && Object.keys(focusData).length) {
    const replacement = [...app.querySelectorAll('button')].find((button) =>
      Object.entries(focusData).every(([key, value]) => button.dataset[key] === value)
    );
    if (replacement) replacement.focus({ preventScroll: true });
  }
}
function go(next) {
  if (!valid.includes(next)) return;
  route = next;
  location.hash = next;
  render();
  app.focus({ preventScroll: true });
}
function toast(message) {
  const el = document.querySelector('#toast');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('visible'), 2600);
}
function persist() {
  if (!MW.storage.write('preferences', state.preferences)) toast(MW.storage.getError());
}
function updatePreference(key, value) {
  const p = state.preferences;
  if (key === 'styles') {
    if (p.styles.includes(value)) {
      if (p.styles.length === 1) return toast('Keep at least one favorite style.');
      p.styles = p.styles.filter((s) => s !== value);
    } else {
      if (p.styles.length === 3) return toast('Choose up to three favorites.');
      p.styles.push(value);
    }
  } else p[key] = value;
  state.preferences = MW.normalizePreferences(p);
  variant = 0;
  persist();
  render(true);
}
document.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.route) return go(button.dataset.route);
  if (button.dataset.pref) return updatePreference(button.dataset.pref, button.dataset.value);
  if (button.dataset.remove) {
    MW.storage.write(
      'saved',
      MW.storage.getSaved().filter((o) => o.id !== button.dataset.remove)
    )
      ? toast('Outfit removed.')
      : toast(MW.storage.getError());
    render(true);
    return;
  }
  const action = button.dataset.action;
  if (action === 'city') openCity();
  if (action === 'start') {
    state.preferences.onboarded = true;
    persist();
    go('today');
  }
  if (action === 'regenerate') {
    variant++;
    render(true);
    toast('A fresh take on the same forecast.');
  }
  if (action === 'save') {
    const result = MW.storage.toggleSaved(state.outfit);
    render(true);
    toast(
      result.ok
        ? result.saved
          ? 'Saved to your everyday collection.'
          : 'Outfit removed.'
        : MW.storage.getError()
    );
  }
  if (action === 'refresh') {
    if (loading) return;
    loading = true;
    error = false;
    render();
    refreshTimer = setTimeout(() => {
      loading = false;
      render();
      toast('Demo forecast refreshed.');
    }, 350);
  }
});
const dialog = document.querySelector('#city-dialog'),
  search = document.querySelector('#city-search'),
  results = document.querySelector('#city-results');
function cityResults() {
  results.innerHTML =
    MW.searchCities(search.value)
      .map(
        (c) =>
          `<button class="city-result" data-city="${c.id}"><strong>${c.name}</strong><span>${c.country} ↗</span></button>`
      )
      .join('') ||
    '<p class="empty">City not found. Try New York, Shanghai, Tokyo, London, or Los Angeles.</p>';
}
function openCity() {
  search.value = '';
  document.querySelector('#location-status').textContent = '';
  cityResults();
  dialog.showModal();
  search.focus();
}
function chooseCity(id) {
  state.preferences.cityId = id;
  persist();
  dialog.close();
  variant = 0;
  render();
  toast('Forecast set to ' + state.weather.city.name + '.');
}
search.addEventListener('input', cityResults);
results.addEventListener('click', (ev) => {
  const target = ev.target.closest('[data-city]');
  if (target) chooseCity(target.dataset.city);
});
document.querySelector('#close-city').onclick = () => dialog.close();
document.querySelector('#locate').onclick = () => {
  const status = document.querySelector('#location-status'),
    button = document.querySelector('#locate');
  if (!navigator.geolocation) {
    status.textContent = 'Location is unavailable. Choose a city manually.';
    return;
  }
  status.textContent = 'Finding your city…';
  button.disabled = true;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      button.disabled = false;
      const city = MW.nearestCity(position.coords.latitude, position.coords.longitude);
      if (city) chooseCity(city.id);
      else
        status.textContent = 'Your area is outside this five-city preview. Choose a city manually.';
    },
    (err) => {
      button.disabled = false;
      status.textContent =
        err.code === 1
          ? 'Location access is off. Choose a city manually.'
          : 'Unable to find your location. Choose a city manually.';
    },
    { timeout: 8000, maximumAge: 60000 }
  );
};
document.querySelector('#scenario').onchange = (ev) => {
  scenario = ev.target.value;
  variant = 0;
  error = false;
  render();
};
document.querySelector('#simulate-error').onclick = () => {
  clearTimeout(refreshTimer);
  loading = false;
  error = true;
  render();
};
window.addEventListener('hashchange', () => {
  const next = location.hash.slice(1);
  if (valid.includes(next) && next !== route) {
    route = next;
    render();
  }
});
window.addEventListener('offline', () =>
  toast('Offline. The demo continues to work with local weather data.')
);
render();
if (MW.storage.getError()) toast(MW.storage.getError());
