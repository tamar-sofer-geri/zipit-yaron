(function(){
"use strict";

var IS_DEMO = (function(){
  try { return new URLSearchParams(window.location.search).get('demo') === '1'; }
  catch (e) { return false; }
})();
var STORAGE_KEY = IS_DEMO ? 'zipit-yaron-data-v1-demo' : 'zipit-yaron-data-v1';

var PROD_DEFAULT_STATE = {"categories":["Travel Essentials","Clothes","Shoes","Toiletries","Medications","Outdoor Gear","Other"],"items":[{"id":"te-passports","category":"Travel Essentials","name":"Passports","mode":"fixed","qty":0},{"id":"te-tz","category":"Travel Essentials","name":"T.Z. (Teudat Zehut)","mode":"fixed","qty":0},{"id":"te-license","category":"Travel Essentials","name":"Driver's license","mode":"fixed","qty":0},{"id":"te-map","category":"Travel Essentials","name":"Map","mode":"fixed","qty":0},{"id":"te-eyemask","category":"Travel Essentials","name":"Eye mask","mode":"fixed","qty":0},{"id":"cl-tshirts","category":"Clothes","name":"T-shirts","mode":"perDay","rate":0},{"id":"cl-socks","category":"Clothes","name":"Socks","mode":"perDay","rate":0},{"id":"cl-pants-long","category":"Clothes","name":"Long pants","mode":"perDay","rate":0},{"id":"cl-jacket","category":"Clothes","name":"Jacket","mode":"fixed","qty":0},{"id":"cl-shirts-ls","category":"Clothes","name":"Long sleeve shirts","mode":"perDay","rate":0},{"id":"cl-pjs","category":"Clothes","name":"PJs","mode":"perDay","rate":0},{"id":"cl-underpants","category":"Clothes","name":"Underpants","mode":"perDay","rate":0},{"id":"cl-swimsuit","category":"Clothes","name":"Swim suits","mode":"fixed","qty":0},{"id":"cl-sunglasses","category":"Clothes","name":"Sunglasses","mode":"fixed","qty":0},{"id":"sh-boots","category":"Shoes","name":"Boots","mode":"fixed","qty":0},{"id":"sh-sandals","category":"Shoes","name":"Sandals","mode":"fixed","qty":0},{"id":"sh-flipflops","category":"Shoes","name":"Flip flops","mode":"fixed","qty":0},{"id":"sh-sneakers","category":"Shoes","name":"Sneakers","mode":"fixed","qty":0},{"id":"to-toothbrush","category":"Toiletries","name":"Toothbrush","mode":"fixed","qty":0},{"id":"to-toothpaste","category":"Toiletries","name":"Toothpaste","mode":"fixed","qty":0},{"id":"to-deodorant","category":"Toiletries","name":"Deodorant","mode":"fixed","qty":0},{"id":"to-shampoo","category":"Toiletries","name":"Shampoo","mode":"fixed","qty":0},{"id":"to-conditioner","category":"Toiletries","name":"Conditioner","mode":"fixed","qty":0},{"id":"to-soap","category":"Toiletries","name":"Soap","mode":"fixed","qty":0},{"id":"na-backpack","category":"Outdoor Gear","name":"Backpack","mode":"fixed","qty":0},{"id":"na-gloves","category":"Outdoor Gear","name":"Gloves","mode":"fixed","qty":0},{"id":"na-hikingpoles","category":"Outdoor Gear","name":"Hiking poles","mode":"fixed","qty":0},{"id":"na-hikingsocks","category":"Outdoor Gear","name":"Hiking socks","mode":"fixed","qty":0},{"id":"na-picnicblanket","category":"Outdoor Gear","name":"Picnic blanket","mode":"fixed","qty":0},{"id":"na-beachblankets","category":"Outdoor Gear","name":"Beach blankets","mode":"fixed","qty":0},{"id":"na-waterbottles","category":"Outdoor Gear","name":"Water bottles","mode":"fixed","qty":0},{"id":"na-insectrepellent","category":"Outdoor Gear","name":"Insect repellent","mode":"fixed","qty":0},{"id":"na-sunscreen","category":"Outdoor Gear","name":"Sunscreen","mode":"fixed","qty":0},{"id":"ot-wallcharger","category":"Other","name":"Wall charger + USB-C cable","mode":"fixed","qty":0},{"id":"ot-carcharger","category":"Other","name":"Car charger","mode":"fixed","qty":0},{"id":"ot-converters","category":"Other","name":"Plug converters","mode":"fixed","qty":0},{"id":"ot-glasses","category":"Other","name":"Glasses","mode":"fixed","qty":0},{"id":"ot-computer","category":"Other","name":"Computer","mode":"fixed","qty":0},{"id":"ot-computercharger","category":"Other","name":"Computer charger","mode":"fixed","qty":0},{"id":"ot-laundrybag","category":"Other","name":"Laundry bags","mode":"fixed","qty":0},{"id":"ot-watch","category":"Other","name":"Watch","mode":"fixed","qty":0},{"id":"ot-headphones","category":"Other","name":"Headphones","mode":"fixed","qty":0}],"destinations":[],"tripTypes":[{"key":"city","label":"City","note":"General city trip."},{"key":"outdoors","label":"Outdoors - hiking","note":"Hiking & outdoor gear."},{"key":"beach","label":"Swim / beach","note":"Beach essentials for any warm-water trip."},{"key":"fancy","label":"Fancy","note":"Dressier occasions."},{"key":"hot","label":"Hot","note":"Hot-weather protection."},{"key":"cold","label":"Cold","note":"Cold-weather layers."},{"key":"international","label":"International","note":"Any trip outside the US."}],"savedPlans":[]};

var DEMO_STATE = structuredCloneState(PROD_DEFAULT_STATE);
var DEFAULT_STATE = IS_DEMO ? DEMO_STATE : PROD_DEFAULT_STATE;

function loadState(){
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredCloneState(DEFAULT_STATE);
    var parsed = JSON.parse(raw);
    if (!parsed || !parsed.items) return structuredCloneState(DEFAULT_STATE);
    return parsed;
  } catch (e){
    return structuredCloneState(DEFAULT_STATE);
  }
}

function structuredCloneState(s){
  return JSON.parse(JSON.stringify(s));
}

var DEST_KEYS = ['israel', 'neworleans', 'hawaii'];

function migrateState(state){
  var changed = false;

  if (state.rules){
    var seen = {};
    var tripTypes = [];
    state.rules.forEach(function(r){
      if (seen[r.key]) return;
      seen[r.key] = true;
      tripTypes.push({ key: r.key, label: r.label, note: r.note || '' });
    });
    state.tripTypes = tripTypes;
    delete state.rules;
    changed = true;
  }
  if (!state.tripTypes) state.tripTypes = structuredCloneState(DEFAULT_STATE.tripTypes);

  if (!state.destinations){
    var moved = state.tripTypes.filter(function(t){ return DEST_KEYS.indexOf(t.key) !== -1; });
    state.destinations = moved;
    state.tripTypes = state.tripTypes.filter(function(t){ return DEST_KEYS.indexOf(t.key) === -1; });
    changed = true;
  }

  var hasDestKey = function(key){ return state.destinations.some(function(t){ return t.key === key; }); };
  DEFAULT_STATE.destinations.forEach(function(d){
    if (!hasDestKey(d.key)){ state.destinations.push(structuredCloneState(d)); changed = true; }
  });

  var hasTypeKey = function(key){ return state.tripTypes.some(function(t){ return t.key === key; }); };
  DEFAULT_STATE.tripTypes.forEach(function(t){
    if (!hasTypeKey(t.key)){ state.tripTypes.push(structuredCloneState(t)); changed = true; }
  });

  if (!state.savedPlans){ state.savedPlans = []; changed = true; }

  if (state.trip && state.trip.tags && !state.trip.tripType && !state.trip.tripTypes){
    state.trip.tripType = state.trip.tags[0] || '';
    delete state.trip.tags;
    changed = true;
  }
  if (state.trip && state.trip.tripType !== undefined && !state.trip.tripTypes){
    state.trip.tripTypes = state.trip.tripType ? [state.trip.tripType] : [];
    delete state.trip.tripType;
    changed = true;
  }
  if (state.trip && state.trip.location){
    if (!state.trip.tripTypes) state.trip.tripTypes = [];
    if (state.trip.tripTypes.indexOf(state.trip.location) === -1) state.trip.tripTypes.push(state.trip.location);
    delete state.trip.location;
    changed = true;
  } else if (state.trip && state.trip.location === ''){
    delete state.trip.location;
    changed = true;
  }
  if (state.trip && state.trip.tripTypes && state.trip.destination === undefined){
    var foundDest = state.trip.tripTypes.filter(function(k){ return DEST_KEYS.indexOf(k) !== -1; })[0];
    state.trip.destination = foundDest || '';
    state.trip.tripTypes = state.trip.tripTypes.filter(function(k){ return DEST_KEYS.indexOf(k) === -1; });
    changed = true;
  }

  (state.savedPlans || []).forEach(function(plan){
    if (plan.tripTypes && plan.destination === undefined){
      var pd = plan.tripTypes.filter(function(k){ return DEST_KEYS.indexOf(k) !== -1; })[0];
      plan.destination = pd || '';
      plan.tripTypes = plan.tripTypes.filter(function(k){ return DEST_KEYS.indexOf(k) === -1; });
      changed = true;
    }
  });

  if (state.categories && state.categories.indexOf('Other') !== -1 && state.categories.indexOf('Other') !== state.categories.length - 1){
    state.categories = state.categories.filter(function(c){ return c !== 'Other'; });
    state.categories.push('Other');
    changed = true;
  }

  if (state.categories && state.categories.indexOf('Nature & Weather') !== -1){
    state.categories = state.categories.map(function(c){ return c === 'Nature & Weather' ? 'Outdoor Gear' : c; });
    state.items.forEach(function(it){ if (it.category === 'Nature & Weather') it.category = 'Outdoor Gear'; });
    changed = true;
  }

  return changed;
}

var STATE = loadState();
if (migrateState(STATE)){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); } catch (e){}
}

var persistTimer = null;
function persist(){
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(function(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); } catch (e){}
  }, 150);
  pushCloud();
}

var trip, manualOverrides, packed, extraItems, collapsedPlan, collapsedBaseList;
var openMore = {};

function rehydrateFromState(){
  trip = STATE.trip || { startDate: '', days: 7, destination: '', tripTypes: [] };
  if (trip.startDate === undefined) trip.startDate = '';
  manualOverrides = STATE.manualOverrides || {};
  packed = STATE.packed || {};
  extraItems = STATE.extraItems || [];
  collapsedPlan = STATE.collapsedPlan || {};
  collapsedBaseList = STATE.collapsedBaseList || {};
  STATE.trip = trip;
  STATE.manualOverrides = manualOverrides;
  STATE.packed = packed;
  STATE.extraItems = extraItems;
  STATE.collapsedPlan = collapsedPlan;
  STATE.collapsedBaseList = collapsedBaseList;
  if (STATE.activePlanId === undefined) STATE.activePlanId = null;
}
rehydrateFromState();

// ---------- Shared (cloud) sync ----------
// Reuses the same Supabase project as the sister apps. Local demo mode never
// touches this — it stays fully isolated from the real shared data.

var CLOUD_CONNECTED_KEY = 'zipit-yaron-cloud-connected-v1';
var CLOUD_ROW_ID = 'shared';
var CLOUD_ENABLED = !IS_DEMO && !!(window.ZIPIT_CONFIG && window.ZIPIT_CONFIG.supabaseUrl && window.ZIPIT_CONFIG.supabaseAnonKey);
var supa = null;
if (CLOUD_ENABLED){
  try { supa = window.supabase.createClient(window.ZIPIT_CONFIG.supabaseUrl, window.ZIPIT_CONFIG.supabaseAnonKey); }
  catch (e){ supa = null; CLOUD_ENABLED = false; }
}
var cloudConnected = CLOUD_ENABLED && localStorage.getItem(CLOUD_CONNECTED_KEY) === '1';
var cloudChannel = null;
var applyingRemote = false;
var cloudPushTimer = null;

function pushCloud(){
  if (!CLOUD_ENABLED || !cloudConnected || applyingRemote) return;
  if (cloudPushTimer) clearTimeout(cloudPushTimer);
  cloudPushTimer = setTimeout(pushCloudNow, 400);
}

function pushCloudNow(){
  if (!CLOUD_ENABLED || !cloudConnected) return;
  supa.from('zipit_state').upsert({ id: CLOUD_ROW_ID, data: STATE, updated_at: new Date().toISOString() })
    .then(function(res){ if (res && res.error) console.error('Zip It cloud sync: push failed', res.error); });
}

function pullCloudState(cb){
  supa.from('zipit_state').select('id, data').eq('id', CLOUD_ROW_ID).maybeSingle()
    .then(function(res){
      if (res && res.error) console.error('Zip It cloud sync: pull failed', res.error);
      cb(res && !res.error ? res.data : null);
    });
}

function subscribeRealtime(){
  if (!CLOUD_ENABLED || cloudChannel) return;
  cloudChannel = supa.channel('zipit_state_changes')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'zipit_state', filter: 'id=eq.' + CLOUD_ROW_ID }, function(payload){
      if (!payload.new || !payload.new.data) return;
      applyingRemote = true;
      STATE = payload.new.data;
      rehydrateFromState();
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); } catch (e){}
      applyingRemote = false;
      renderAll();
    })
    .subscribe();
}

function connectCloudSync(){
  if (!CLOUD_ENABLED) return;
  pullCloudState(function(row){
    if (row && row.data){
      showConfirm('Connect to the shared list? This replaces what\'s on this device with the shared list everyone sees.', 'Connect', function(){
        applyingRemote = true;
        STATE = row.data;
        rehydrateFromState();
        applyingRemote = false;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); } catch (e){}
        cloudConnected = true;
        try { localStorage.setItem(CLOUD_CONNECTED_KEY, '1'); } catch (e){}
        subscribeRealtime();
        renderAll();
      });
    } else {
      showConfirm('Connect to shared sync? This uploads your current list so others you share the link with can see and edit it too.', 'Connect', function(){
        cloudConnected = true;
        try { localStorage.setItem(CLOUD_CONNECTED_KEY, '1'); } catch (e){}
        pushCloudNow();
        subscribeRealtime();
        renderAll();
      });
    }
  });
}

function initCloud(){
  if (!CLOUD_ENABLED) return;
  if (cloudConnected){
    pullCloudState(function(row){
      if (row && row.data){
        applyingRemote = true;
        STATE = row.data;
        rehydrateFromState();
        applyingRemote = false;
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); } catch (e){}
      }
      subscribeRealtime();
      renderAll();
    });
  } else {
    renderSyncStatus();
  }
}

function renderSyncStatus(){
  var box = document.getElementById('sync-status');
  if (!box) return;
  box.innerHTML = '';
  if (!CLOUD_ENABLED) return;
  if (cloudConnected){
    box.appendChild(el('span', { class: 'sync-badge', title: 'Shared in real time with anyone else connected', text: '🔗 Synced' }));
  } else {
    box.appendChild(el('button', { class: 'btn ghost sync-connect-btn', type: 'button', text: '🔗 Connect shared list', onclick: connectCloudSync }));
  }
}

function renderAll(){
  renderPlan();
  renderBaseList();
  renderPlans();
  renderSyncStatus();
}

function attachLongPress(target, onLongPress){
  var timer = null;
  function start(){
    clearTimeout(timer);
    timer = setTimeout(onLongPress, 500);
  }
  function cancel(){ clearTimeout(timer); }
  target.addEventListener('pointerdown', start);
  target.addEventListener('pointerup', cancel);
  target.addEventListener('pointerleave', cancel);
  target.addEventListener('pointercancel', cancel);
  target.addEventListener('contextmenu', function(e){ e.preventDefault(); });
}

function toggleCollapse(map, storageField, cat, renderFn){
  map[cat] = !map[cat];
  STATE[storageField] = map;
  persist();
  renderFn();
}

// Drag-to-reorder for a <ul> of <li class="item-row" data-id="..."> rows.
// Reorders the actual DOM nodes live as the pointer moves (works for mouse
// and touch via Pointer Events), then hands the final id order to onDrop
// once the drag ends. Returns a function to wire a drag-handle element to a
// given row.
function makeListDraggable(listEl, onDrop){
  var draggingRow = null;

  function rowAfterPointer(y){
    var rows = Array.prototype.slice.call(listEl.children).filter(function(r){
      return r.classList.contains('item-row') && r !== draggingRow;
    });
    var closest = { offset: -Infinity, element: null };
    rows.forEach(function(r){
      var box = r.getBoundingClientRect();
      var offset = y - (box.top + box.height / 2);
      if (offset < 0 && offset > closest.offset) closest = { offset: offset, element: r };
    });
    return closest.element;
  }

  function onMove(e){
    if (!draggingRow) return;
    e.preventDefault();
    var y = e.touches ? e.touches[0].clientY : e.clientY;
    var after = rowAfterPointer(y);
    if (after == null) listEl.appendChild(draggingRow);
    else listEl.insertBefore(draggingRow, after);
  }

  function onUp(){
    if (!draggingRow) return;
    draggingRow.classList.remove('dragging');
    var row = draggingRow;
    draggingRow = null;
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.removeEventListener('pointercancel', onUp);
    var newOrder = Array.prototype.slice.call(listEl.children)
      .filter(function(r){ return r.classList.contains('item-row'); })
      .map(function(r){ return r.getAttribute('data-id'); });
    onDrop(newOrder, row);
  }

  return function attachHandle(handleEl, rowEl){
    handleEl.addEventListener('pointerdown', function(e){
      e.preventDefault();
      draggingRow = rowEl;
      rowEl.classList.add('dragging');
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
      document.addEventListener('pointercancel', onUp);
    });
  };
}

// Reorders STATE.items so the given category's items follow newVisibleIdOrder,
// keeping every item currently hidden for this trip in its original relative
// slot (only the visible ones — the ones the user could actually drag — move).
function reorderCategoryItems(cat, newVisibleIdOrder){
  var queue = newVisibleIdOrder.slice();
  var visibleIds = {};
  queue.forEach(function(id){ visibleIds[id] = true; });
  STATE.items = STATE.items.map(function(it){
    if (it.category !== cat || !visibleIds[it.id]) return it;
    return itemById(queue.shift());
  });
}

function reorderExtraItems(newIdOrder){
  extraItems = newIdOrder.map(function(id){
    return extraItems.filter(function(it){ return it.id === id; })[0];
  });
  STATE.extraItems = extraItems;
}

function el(tag, attrs, children){
  var e = document.createElement(tag);
  attrs = attrs || {};
  for (var k in attrs){
    if (k === 'class') e.className = attrs[k];
    else if (k === 'html') e.innerHTML = attrs[k];
    else if (k === 'text') e.textContent = attrs[k];
    else if (k.indexOf('on') === 0 && typeof attrs[k] === 'function') e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  (children || []).forEach(function(c){ if (c) e.appendChild(c); });
  return e;
}

function itemById(id){
  for (var i = 0; i < STATE.items.length; i++) if (STATE.items[i].id === id) return STATE.items[i];
  return null;
}

function tagLabel(key){
  var all = STATE.destinations.concat(STATE.tripTypes);
  var t = all.filter(function(x){ return x.key === key; })[0];
  return t ? t.label : key;
}

function formatTripDate(iso){
  if (!iso) return '';
  var parts = iso.split('-');
  var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

// ---------- Weather & packing tips ----------
// Free, keyless weather via Open-Meteo (open-meteo.com) — no account needed,
// fits this app's no-sign-in model. Built-in destinations get hardcoded
// coordinates rather than live geocoding: Open-Meteo's place search only
// indexes exact-name places, so bare "Hawaii" resolves to a random village in
// Guatemala instead of the US state (confirmed by hand) — there's no fixing
// that with a smarter query, since the state itself just isn't a geocodable
// entry there. User-added ("New…") destinations still geocode live, biased
// toward the highest-population match so "Paris" means France, not Texas.

var KNOWN_DESTINATION_COORDS = {
  israel: { lat: 32.0853, lon: 34.7818, name: 'Tel Aviv', admin1: '', country: 'Israel' },
  neworleans: { lat: 29.9511, lon: -90.0715, name: 'New Orleans', admin1: 'Louisiana', country: 'United States' },
  hawaii: { lat: 21.3099, lon: -157.8581, name: 'Honolulu', admin1: 'Hawaii', country: 'United States' }
};

var weatherCache = null; // { key, data }
var lastAutoWeatherKey = null;
var weatherFetchToken = 0;

function weatherKey(){
  return trip.destination + '|' + trip.startDate + '|' + trip.days;
}

function isoDate(d){
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function parseISODate(iso){
  var parts = iso.split('-');
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

function addDaysToDate(date, n){
  var d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function geocodeDestination(label){
  var url = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(label) + '&count=10&language=en&format=json';
  return fetch(url).then(function(res){ return res.json(); }).then(function(data){
    var results = (data && data.results) || [];
    if (!results.length) return null;
    function score(r){
      var bonus = (r.feature_code === 'PCLI' || r.feature_code === 'PCL') ? 5000000 : 0;
      return (r.population || 0) + bonus;
    }
    var best = results.reduce(function(a, b){ return score(b) > score(a) ? b : a; });
    return { lat: best.latitude, lon: best.longitude, name: best.name, admin1: best.admin1 || '', country: best.country || '' };
  });
}

function resolveDestinationPlace(){
  var known = KNOWN_DESTINATION_COORDS[trip.destination];
  if (known) return Promise.resolve(known);
  return geocodeDestination(tagLabel(trip.destination));
}

function fetchForecastOutlook(lat, lon, startISO, endISO){
  var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon +
    '&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_mean,windspeed_10m_max' +
    '&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto' +
    '&start_date=' + startISO + '&end_date=' + endISO;
  return fetch(url).then(function(res){ return res.json(); }).then(function(data){
    var daily = data && data.daily;
    if (!daily || !daily.time || !daily.time.length) return null;
    var highs = daily.temperature_2m_max || [];
    var lows = daily.temperature_2m_min || [];
    var rainProb = daily.precipitation_probability_mean || [];
    var wind = daily.windspeed_10m_max || [];
    return {
      mode: 'forecast',
      highF: highs.length ? Math.round(Math.max.apply(null, highs)) : null,
      lowF: lows.length ? Math.round(Math.min.apply(null, lows)) : null,
      rainPct: rainProb.length ? Math.round(rainProb.reduce(function(a, b){ return a + b; }, 0) / rainProb.length) : null,
      windMph: wind.length ? Math.round(Math.max.apply(null, wind)) : null,
      daysSampled: daily.time.length
    };
  });
}

function fetchHistoricalOutlook(lat, lon, startISO, days){
  var startDate = parseISODate(startISO);
  var endDate = addDaysToDate(startDate, Math.min(days, 10) - 1);
  var yearsAgoList = [1, 2, 3];
  var requests = yearsAgoList.map(function(yearsAgo){
    var s = new Date(startDate); s.setFullYear(s.getFullYear() - yearsAgo);
    var e = new Date(endDate); e.setFullYear(e.getFullYear() - yearsAgo);
    var url = 'https://archive-api.open-meteo.com/v1/archive?latitude=' + lat + '&longitude=' + lon +
      '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max' +
      '&temperature_unit=fahrenheit&windspeed_unit=mph&precipitation_unit=inch&timezone=auto' +
      '&start_date=' + isoDate(s) + '&end_date=' + isoDate(e);
    return fetch(url).then(function(res){ return res.json(); }).catch(function(){ return null; });
  });
  return Promise.all(requests).then(function(results){
    var allDays = [];
    results.forEach(function(data){
      var d = data && data.daily;
      if (!d || !d.time) return;
      for (var i = 0; i < d.time.length; i++){
        allDays.push({ high: d.temperature_2m_max[i], low: d.temperature_2m_min[i], precip: d.precipitation_sum[i], wind: d.windspeed_10m_max[i] });
      }
    });
    if (!allDays.length) return null;
    var highs = allDays.map(function(d){ return d.high; }).filter(function(v){ return v != null; });
    var lows = allDays.map(function(d){ return d.low; }).filter(function(v){ return v != null; });
    var winds = allDays.map(function(d){ return d.wind; }).filter(function(v){ return v != null; });
    var rainyDays = allDays.filter(function(d){ return d.precip != null && d.precip >= 0.04; }).length;
    return {
      mode: 'historical',
      highF: highs.length ? Math.round(Math.max.apply(null, highs)) : null,
      lowF: lows.length ? Math.round(Math.min.apply(null, lows)) : null,
      rainPct: Math.round((rainyDays / allDays.length) * 100),
      windMph: winds.length ? Math.round(Math.max.apply(null, winds)) : null,
      daysSampled: allDays.length
    };
  });
}

function getWeatherOutlook(){
  return resolveDestinationPlace().then(function(place){
    if (!place) return { error: 'place' };
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var startDate = parseISODate(trip.startDate);
    var daysFromToday = Math.round((startDate - today) / 86400000);
    var outlookPromise;
    if (daysFromToday >= 0 && daysFromToday <= 15){
      var forecastEnd = addDaysToDate(startDate, Math.max(0, Math.min(trip.days - 1, 15 - daysFromToday)));
      outlookPromise = fetchForecastOutlook(place.lat, place.lon, trip.startDate, isoDate(forecastEnd));
    } else {
      outlookPromise = fetchHistoricalOutlook(place.lat, place.lon, trip.startDate, trip.days);
    }
    return outlookPromise.then(function(outlook){
      return outlook ? { place: place, outlook: outlook } : { error: 'weather' };
    });
  }).catch(function(){ return { error: 'network' }; });
}

function buildPackingTips(outlook){
  var tips = [];
  if (outlook.highF != null && outlook.highF >= 85){
    tips.push({ text: 'Highs near ' + outlook.highF + '°F — pack light, breathable clothing and extra sunscreen.', add: 'Extra sunscreen' });
  }
  if (outlook.lowF != null && outlook.lowF <= 45){
    tips.push({ text: 'Lows near ' + outlook.lowF + '°F — pack a warm jacket and layers.', add: 'Warm jacket' });
  }
  if (outlook.rainPct != null && outlook.rainPct >= 40){
    var rainNote = outlook.mode === 'forecast'
      ? outlook.rainPct + '% chance of rain'
      : 'rain is common this time of year (' + outlook.rainPct + '% of similar days)';
    tips.push({ text: 'There’s ' + rainNote + ' — pack a compact umbrella or rain jacket.', add: 'Umbrella' });
  }
  if (outlook.windMph != null && outlook.windMph >= 25){
    tips.push({ text: 'Winds up to ' + outlook.windMph + ' mph — a windbreaker could help.', add: 'Windbreaker' });
  }
  if (!tips.length){
    tips.push({ text: 'Looks mild and dry — nothing extra needed beyond your usual base list.', add: null });
  }
  return tips;
}

function renderWeatherDialog(state){
  var dialog = document.getElementById('weather-dialog');
  if (!dialog) return;
  dialog.innerHTML = '';
  dialog.appendChild(el('div', { class: 'dialog-header' }, [
    el('h2', { text: '🌦️ Weather & packing tips' }),
    el('button', { class: 'icon-btn', type: 'button', text: '✕', title: 'Close', onclick: function(){ dialog.close(); } })
  ]));

  var body = el('div', { class: 'item-editor weather-body' });

  if (state === 'loading'){
    body.appendChild(el('p', { class: 'confirm-message', text: 'Checking the weather…' }));
  } else if (state.error === 'place'){
    body.appendChild(el('p', { class: 'confirm-message', text: 'Couldn’t find "' + tagLabel(trip.destination) + '" on the map. You can still pack by trip type as usual.' }));
  } else if (state.error){
    body.appendChild(el('p', { class: 'confirm-message', text: 'Couldn’t reach the weather service right now — try again in a bit.' }));
  } else {
    var place = state.place, outlook = state.outlook;
    var placeLabel = place.name + (place.admin1 && place.admin1 !== place.name ? ', ' + place.admin1 : '') + (place.country ? ', ' + place.country : '');
    var endLabel = trip.days > 1 ? formatTripDate(isoDate(addDaysToDate(parseISODate(trip.startDate), trip.days - 1))) : null;

    body.appendChild(el('div', { class: 'weather-summary' }, [
      el('div', { class: 'weather-place', text: placeLabel }),
      el('div', { class: 'weather-dates', text: formatTripDate(trip.startDate) + (endLabel ? ' – ' + endLabel : '') }),
      el('div', { class: 'weather-mode', text: outlook.mode === 'forecast' ? 'Forecast' : 'Typical for these dates, based on recent years' }),
      el('div', { class: 'weather-stats' }, [
        (outlook.highF != null && outlook.lowF != null) ? el('span', { class: 'weather-stat', text: '🌡️ ' + outlook.lowF + '°–' + outlook.highF + '°F' }) : null,
        outlook.rainPct != null ? el('span', { class: 'weather-stat', text: '☔ ' + outlook.rainPct + '%' }) : null,
        outlook.windMph != null ? el('span', { class: 'weather-stat', text: '💨 ' + outlook.windMph + ' mph' }) : null
      ])
    ]));

    var tipsList = el('ul', { class: 'weather-tips' });
    buildPackingTips(outlook).forEach(function(tip){
      var row = el('li', { class: 'weather-tip' }, [ el('span', { text: tip.text }) ]);
      if (tip.add){
        row.appendChild(el('button', {
          class: 'btn ghost weather-add-btn', type: 'button', text: '+ Add',
          onclick: function(e){
            addExtraItem(tip.add);
            e.target.textContent = 'Added ✓';
            e.target.disabled = true;
          }
        }));
      }
      tipsList.appendChild(row);
    });
    body.appendChild(tipsList);
  }

  dialog.appendChild(body);

  dialog.appendChild(el('div', { class: 'dialog-footer' }, [
    el('button', { class: 'btn ghost', type: 'button', text: 'Refresh', onclick: function(){ openWeatherDialog(true); } }),
    el('button', { class: 'btn primary', type: 'button', text: 'Close', onclick: function(){ dialog.close(); } })
  ]));
}

function openWeatherDialog(forceRefresh){
  var dialog = document.getElementById('weather-dialog');
  if (!dialog || !trip.startDate || !trip.destination) return;
  var key = weatherKey();
  if (!forceRefresh && weatherCache && weatherCache.key === key){
    renderWeatherDialog(weatherCache.data);
    dialog.showModal();
    return;
  }
  renderWeatherDialog('loading');
  dialog.showModal();
  var token = ++weatherFetchToken;
  getWeatherOutlook().then(function(result){
    if (token !== weatherFetchToken) return;
    weatherCache = { key: key, data: result };
    renderWeatherDialog(result);
  });
}

function maybeAutoShowWeather(){
  if (!trip.startDate || !trip.destination) return;
  var key = weatherKey();
  if (key === lastAutoWeatherKey) return;
  lastAutoWeatherKey = key;
  openWeatherDialog(false);
}

function baseQty(item){
  if (item.mode === 'fixed') return item.qty;
  if (item.mode === 'perWeek') return Math.ceil((item.rate || 0) * (trip.days / 7));
  return Math.ceil((item.rate || 0) * trip.days);
}

function computeItem(item){
  var tags = item.tags || [];
  var destMatch = trip.destination && tags.indexOf(trip.destination) !== -1;
  var typeMatch = trip.tripTypes.some(function(t){ return tags.indexOf(t) !== -1; });
  var qty = (destMatch || typeMatch) ? baseQty(item) : 0;
  if (manualOverrides.hasOwnProperty(item.id)) qty = manualOverrides[item.id];
  if (qty < 0) qty = 0;
  return { qty: qty };
}

function syncActivePlan(){
  if (!STATE.activePlanId) return;
  var active = findPlan(STATE.activePlanId);
  if (!active) return;
  active.startDate = trip.startDate;
  active.days = trip.days;
  active.destination = trip.destination;
  active.tripTypes = trip.tripTypes.slice();
  active.packed = JSON.parse(JSON.stringify(packed));
  active.manualOverrides = JSON.parse(JSON.stringify(manualOverrides));
  active.extraItems = JSON.parse(JSON.stringify(extraItems));
  active.updatedAt = Date.now();
}

function setStartDate(value){
  trip.startDate = value;
  persist();
  syncActivePlan();
  renderPlans();
  renderPlan();
  maybeAutoShowWeather();
}

function setDays(n){
  trip.days = Math.max(1, Math.min(60, n || 1));
  persist();
  syncActivePlan();
  renderPlans();
  renderPlan();
}

function toggleTripType(key, on){
  var idx = trip.tripTypes.indexOf(key);
  if (on && idx === -1) trip.tripTypes.push(key);
  else if (!on && idx !== -1) trip.tripTypes.splice(idx, 1);
  persist();
  syncActivePlan();
  renderPlans();
  renderPlan();
}

function setDestination(key){
  trip.destination = key;
  persist();
  syncActivePlan();
  renderPlans();
  renderPlan();
  maybeAutoShowWeather();
}

function addDestination(onAdded){
  showPrompt('Add a destination', '', 'e.g. Portugal', function(name){
    var key = 'dest' + Math.random().toString(36).slice(2, 8);
    STATE.destinations.push({ key: key, label: name, note: '' });
    onAdded(key);
  });
}

function deleteDestination(key){
  var dest = STATE.destinations.filter(function(d){ return d.key === key; })[0];
  if (!dest) return;
  showConfirm('Delete destination "' + dest.label + '"? It will be removed from any items tagged with it.', 'Delete', function(){
    STATE.destinations = STATE.destinations.filter(function(d){ return d.key !== key; });
    STATE.items.forEach(function(it){
      if (it.tags) it.tags = it.tags.filter(function(t){ return t !== key; });
    });
    persist();
    renderBaseList();
  });
}

function deleteBaseListItem(item){
  showConfirm('Delete "' + (item.name || 'this item') + '" from the base list? This can\'t be undone.', 'Delete', function(){
    STATE.items = STATE.items.filter(function(it){ return it.id !== item.id; });
    persist();
    renderBaseList();
  });
}

function adjustQty(id, delta){
  var item = itemById(id);
  var current = manualOverrides.hasOwnProperty(id) ? manualOverrides[id] : computeItem(item).qty;
  manualOverrides[id] = Math.max(0, current + delta);
  persist();
  syncActivePlan();
  renderPlans();
  renderPlan();
}

function forceAdd(id){
  var item = itemById(id);
  var base = baseQty(item);
  manualOverrides[id] = base > 0 ? base : 1;
  persist();
  syncActivePlan();
  renderPlans();
  renderPlan();
}

function addExtraItem(name){
  extraItems.push({ id: 'extra' + Math.random().toString(36).slice(2, 9), name: name, qty: 1 });
  persist();
  syncActivePlan();
  renderPlans();
  renderPlan();
}

function adjustExtraQty(id, delta){
  var item = extraItems.filter(function(it){ return it.id === id; })[0];
  if (!item) return;
  var qty = item.qty + delta;
  if (qty < 1){
    removeExtraItem(id);
    return;
  }
  item.qty = qty;
  persist();
  syncActivePlan();
  renderPlans();
  renderPlan();
}

function removeExtraItem(id){
  extraItems = extraItems.filter(function(it){ return it.id !== id; });
  STATE.extraItems = extraItems;
  delete packed[id];
  persist();
  syncActivePlan();
  renderPlans();
  renderPlan();
}

function editExtraItem(id){
  var item = extraItems.filter(function(it){ return it.id === id; })[0];
  if (!item) return;

  var dialog = document.getElementById('prompt-dialog');
  dialog.innerHTML = '';
  dialog.appendChild(el('div', { class: 'dialog-header' }, [ el('h2', { text: 'Edit item' }) ]));

  var input = el('input', { class: 'editor-input', type: 'text', value: item.name, placeholder: '' });
  var body = el('div', { class: 'item-editor' }, [ el('div', { class: 'field' }, [ input ]) ]);
  dialog.appendChild(body);

  function save(){
    var v = input.value.trim();
    dialog.close();
    if (!v) return;
    item.name = v;
    persist();
    syncActivePlan();
    renderPlans();
    renderPlan();
  }

  input.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); save(); } });

  var footer = el('div', { class: 'dialog-footer' }, [
    el('button', { class: 'btn ghost', type: 'button', text: 'Delete item', onclick: function(){ dialog.close(); removeExtraItem(id); } }),
    el('button', { class: 'btn primary', type: 'button', text: 'Save', onclick: save })
  ]);
  dialog.appendChild(footer);

  dialog.showModal();
  input.focus();
  input.select();
}

function togglePacked(id){
  var wasFullyPacked = isFullyPacked();
  packed[id] = !packed[id];
  persist();
  syncActivePlan();
  renderPlans();
  var row = document.querySelector('.item-row[data-id="' + cssEscape(id) + '"]');
  if (row) row.classList.toggle('packed', !!packed[id]);
  updateProgress();
  if (!wasFullyPacked && isFullyPacked()) celebrateFullyPacked();
}

function isFullyPacked(){
  var rows = document.querySelectorAll('#checklist .item-row[data-id]');
  if (!rows.length) return false;
  var allPacked = true;
  rows.forEach(function(r){ if (!packed[r.getAttribute('data-id')]) allPacked = false; });
  return allPacked;
}

var celebrateTimer = null;

function celebrateFullyPacked(){
  var dialog = document.getElementById('celebrate-dialog');
  if (!dialog) return;
  dialog.innerHTML = '';

  var confettiColors = ['#3B76B8', '#7B5EA7', '#B44A3F', '#F2B705', '#E85D9E'];
  for (var i = 0; i < 90; i++){
    var piece = el('span', { class: 'confetti-piece' });
    piece.style.left = (Math.random() * 100) + 'vw';
    piece.style.background = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    piece.style.width = piece.style.height = (5 + Math.random() * 5) + 'px';
    piece.style.setProperty('--fall-duration', (2.2 + Math.random() * 1.6) + 's');
    piece.style.setProperty('--fall-delay', (Math.random() * 0.5) + 's');
    piece.style.setProperty('--fall-rotate', (Math.random() * 720 - 360) + 'deg');
    dialog.appendChild(piece);
  }

  dialog.appendChild(el('div', { class: 'celebrate-card' }, [
    el('div', { class: 'celebrate-emoji', text: '🎉' }),
    el('h2', { text: 'You did it!' }),
    el('p', { text: 'Have a great trip!' }),
    el('button', { class: 'btn primary', type: 'button', text: 'Thanks!', onclick: function(){ dialog.close(); } })
  ]));

  dialog.showModal();
  clearTimeout(celebrateTimer);
  celebrateTimer = setTimeout(function(){ dialog.close(); }, 6000);
}

function cssEscape(s){ return s.replace(/[^a-zA-Z0-9_-]/g, '\\$&'); }

function showPrompt(title, defaultValue, placeholder, onConfirm){
  var dialog = document.getElementById('prompt-dialog');
  dialog.innerHTML = '';
  dialog.appendChild(el('div', { class: 'dialog-header' }, [ el('h2', { text: title }) ]));

  var input = el('input', { class: 'editor-input', type: 'text', value: defaultValue || '', placeholder: placeholder || '' });
  var body = el('div', { class: 'item-editor' }, [ el('div', { class: 'field' }, [ input ]) ]);
  dialog.appendChild(body);

  function confirm(){
    var v = input.value.trim();
    dialog.close();
    if (v) onConfirm(v);
  }

  input.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); confirm(); } });

  var footer = el('div', { class: 'dialog-footer' }, [
    el('button', { class: 'btn ghost', type: 'button', text: 'Cancel', onclick: function(){ dialog.close(); } }),
    el('button', { class: 'btn primary', type: 'button', text: 'OK', onclick: confirm })
  ]);
  dialog.appendChild(footer);

  dialog.showModal();
  input.focus();
  input.select();
}

function showConfirm(message, confirmLabel, onConfirm){
  var dialog = document.getElementById('prompt-dialog');
  dialog.innerHTML = '';
  dialog.appendChild(el('div', { class: 'dialog-header' }, [ el('h2', { text: 'Are you sure?' }) ]));
  dialog.appendChild(el('div', { class: 'item-editor' }, [ el('p', { class: 'confirm-message', text: message }) ]));

  var footer = el('div', { class: 'dialog-footer' }, [
    el('button', { class: 'btn ghost', type: 'button', text: 'Cancel', onclick: function(){ dialog.close(); } }),
    el('button', { class: 'btn primary', type: 'button', text: confirmLabel || 'OK', onclick: function(){ dialog.close(); onConfirm(); } })
  ]);
  dialog.appendChild(footer);

  dialog.showModal();
}

// ---------- Tutorial ----------

var TUTORIAL_STEPS = [
  {
    icon: '🧳',
    title: 'Welcome to Zip It!',
    body: 'A packing checklist that scales with your trip. Three quick steps and you’ll have your own list ready to go.'
  },
  {
    icon: '📝',
    title: '1. Build your Base List',
    body: 'Open the Base List tab and tap “+ Add item” under any category. Set how much you need — a fixed amount, or a rate per day for things like socks.',
    illustration: function(){
      var row = el('li', { class: 'item-row' }, [
        el('span', { class: 'drag-handle', text: '⠿' }),
        el('span', { class: 'item-name', text: 'Toothbrush' }, undefined),
        el('div', { class: 'qty-control' }, [
          el('button', { type: 'button', text: '−' }),
          el('span', { class: 'mono', text: '1' }),
          el('button', { type: 'button', text: '+' })
        ])
      ]);
      row.style.pointerEvents = 'none';
      return el('ul', { class: 'tutorial-illustration item-list' }, [row]);
    }
  },
  {
    icon: '🏷️',
    title: '2. Tag what it’s for',
    body: 'Tap an item to open it, then pick which destinations and trip types it applies to. Only tagged items show up automatically for a matching trip — untagged ones stay out of the way.',
    illustration: function(){
      var wrap = el('div', { class: 'tutorial-illustration chip-row' }, [
        el('span', { class: 'chip toggle selected', text: 'Hot' }),
        el('span', { class: 'chip toggle', text: 'Cold' }),
        el('span', { class: 'chip toggle selected', text: 'Beach' }),
        el('span', { class: 'chip toggle', text: 'City' })
      ]);
      wrap.style.pointerEvents = 'none';
      return wrap;
    }
  },
  {
    icon: '🗺️',
    title: '3. Plan a trip',
    body: 'Switch to Trips, set a start date and length, then pick a destination and trip types. Your tagged items appear automatically — check them off as you pack.',
    illustration: function(){
      var row = el('label', { class: 'check tutorial-illustration' }, [
        el('input', { type: 'checkbox', checked: 'checked', disabled: 'disabled' }),
        el('span', { text: 'Sunscreen' })
      ]);
      return row;
    }
  },
  {
    icon: '🎉',
    title: 'You’re all set!',
    body: 'Add a few items, tag them, then start your first trip. You can replay this walkthrough anytime from the Base List tab.'
  }
];

var tutorialStepIndex = 0;

function markTutorialSeen(){
  try { localStorage.setItem(STORAGE_KEY + '-tutorial-seen', '1'); } catch (e){}
}

function showTutorial(){
  tutorialStepIndex = 0;
  renderTutorialStep();
  document.getElementById('tutorial-dialog').showModal();
}

function closeTutorial(){
  markTutorialSeen();
  document.getElementById('tutorial-dialog').close();
}

function renderTutorialStep(){
  var dialog = document.getElementById('tutorial-dialog');
  var step = TUTORIAL_STEPS[tutorialStepIndex];
  var isLast = tutorialStepIndex === TUTORIAL_STEPS.length - 1;
  var isFirst = tutorialStepIndex === 0;

  dialog.innerHTML = '';

  var dots = el('div', { class: 'tutorial-dots' }, TUTORIAL_STEPS.map(function(s, i){
    return el('span', { class: 'tutorial-dot' + (i === tutorialStepIndex ? ' active' : '') });
  }));

  var body = el('div', { class: 'tutorial-body' }, [
    el('div', { class: 'tutorial-icon', text: step.icon }),
    el('h2', { text: step.title }),
    el('p', { class: 'confirm-message', text: step.body }),
    step.illustration ? step.illustration() : null
  ]);

  var footer = el('div', { class: 'dialog-footer' }, [
    el('button', { class: 'btn ghost', type: 'button', text: isLast ? '' : 'Skip', onclick: closeTutorial }),
    el('div', { class: 'tutorial-nav-right' }, [
      isFirst ? null : el('button', {
        class: 'btn ghost', type: 'button', text: 'Back',
        onclick: function(){ tutorialStepIndex--; renderTutorialStep(); }
      }),
      el('button', {
        class: 'btn primary', type: 'button', text: isLast ? 'Get started' : 'Next',
        onclick: function(){
          if (isLast) { closeTutorial(); return; }
          tutorialStepIndex++;
          renderTutorialStep();
        }
      })
    ].filter(Boolean))
  ]);
  if (isLast) footer.firstChild.style.visibility = 'hidden';

  dialog.appendChild(body);
  dialog.appendChild(dots);
  dialog.appendChild(footer);
}

function updateProgress(){
  var rows = document.querySelectorAll('#checklist .item-row[data-id]');
  var total = rows.length, done = 0;
  rows.forEach(function(r){ if (packed[r.getAttribute('data-id')]) done++; });
  var fill = document.getElementById('progress-fill');
  var label = document.getElementById('progress-label');
  if (fill) fill.style.width = (total ? (done / total * 100) : 0) + '%';
  if (label) label.textContent = done + ' / ' + total + ' packed';
}

function resetTrip(){
  manualOverrides = {};
  packed = {};
  extraItems = [];
  STATE.manualOverrides = manualOverrides;
  STATE.packed = packed;
  STATE.extraItems = extraItems;
  persist();
  syncActivePlan();
  renderPlans();
  renderPlan();
}

function resetToDefaults(){
  showConfirm('Reset the base list back to the originals? Your current trip selections and saved trips stay put.', 'Reset', function(){
    var fresh = structuredCloneState(DEFAULT_STATE);
    STATE.items = fresh.items;
    STATE.categories = fresh.categories;
    persist();
    renderPlan();
    renderBaseList();
  });
}

function resetDemo(){
  showConfirm('Reset the whole demo back to its starting point? Everything you\'ve changed here will be lost.', 'Reset demo', function(){
    STATE = structuredCloneState(DEMO_STATE);
    rehydrateFromState();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE)); } catch (e){}
    renderPlan();
    renderBaseList();
    renderPlans();
  });
}

// ---------- Saved Plans ----------

function findPlan(id){
  return STATE.savedPlans.filter(function(p){ return p.id === id; })[0] || null;
}

function currentPlanSnapshot(name){
  return {
    id: 'plan' + Math.random().toString(36).slice(2, 9),
    name: name,
    startDate: trip.startDate,
    days: trip.days,
    destination: trip.destination,
    tripTypes: trip.tripTypes.slice(),
    packed: JSON.parse(JSON.stringify(packed)),
    manualOverrides: JSON.parse(JSON.stringify(manualOverrides)),
    extraItems: JSON.parse(JSON.stringify(extraItems)),
    updatedAt: Date.now()
  };
}

function savePlanAs(){
  showPrompt('Name this trip', 'Trip', '', function(name){
    var plan = currentPlanSnapshot(name);
    STATE.savedPlans.push(plan);
    STATE.activePlanId = plan.id;
    persist();
    renderPlan();
    renderPlans();
  });
}

function loadPlan(id){
  var plan = findPlan(id);
  if (!plan) return;
  trip.startDate = plan.startDate || '';
  trip.days = plan.days;
  trip.destination = plan.destination || '';
  trip.tripTypes = plan.tripTypes.slice();
  packed = JSON.parse(JSON.stringify(plan.packed));
  manualOverrides = JSON.parse(JSON.stringify(plan.manualOverrides));
  extraItems = JSON.parse(JSON.stringify(plan.extraItems || []));
  STATE.trip = trip;
  STATE.packed = packed;
  STATE.manualOverrides = manualOverrides;
  STATE.extraItems = extraItems;
  STATE.activePlanId = id;
  persist();
  switchTab('plan');
  renderPlan();
  renderPlans();
}

function newPlan(){
  trip.startDate = '';
  trip.days = 7;
  trip.destination = '';
  trip.tripTypes = [];
  packed = {};
  manualOverrides = {};
  extraItems = [];
  STATE.trip = trip;
  STATE.packed = packed;
  STATE.manualOverrides = manualOverrides;
  STATE.extraItems = extraItems;
  STATE.activePlanId = null;
  persist();
  switchTab('plan');
  renderPlan();
  renderPlans();
}

function renamePlan(id){
  var plan = findPlan(id);
  if (!plan) return;
  showPrompt('Rename trip', plan.name, '', function(name){
    plan.name = name;
    persist();
    renderPlans();
    renderPlan();
  });
}

function deletePlan(id){
  var plan = findPlan(id);
  if (!plan) return;
  showConfirm('Delete "' + plan.name + '"? This can\'t be undone.', 'Delete', function(){
    STATE.savedPlans = STATE.savedPlans.filter(function(p){ return p.id !== id; });
    if (STATE.activePlanId === id) STATE.activePlanId = null;
    persist();
    renderPlans();
    renderPlan();
  });
}

// ---------- Rendering: Plan view ----------

function renderPlan(){
  var view = document.getElementById('view-plan');
  view.innerHTML = '';

  var active = STATE.activePlanId ? findPlan(STATE.activePlanId) : null;
  var planBar = el('div', { class: 'plan-bar' }, [
    el('div', { class: 'plan-name-row' }, [
      el('span', { class: 'plan-name', text: active ? active.name : 'Unsaved trip' }),
      active ? el('span', { class: 'autosave-indicator', title: 'Every change here saves automatically.' }, [
        document.createTextNode('✓ Autosaved')
      ]) : null
    ]),
    el('div', { class: 'plan-bar-actions' }, [
      !active ? el('button', { class: 'btn ghost', type: 'button', text: 'Save trip…', onclick: savePlanAs }) : null,
      active ? el('button', { class: 'btn ghost', type: 'button', text: 'Save as new…', onclick: savePlanAs }) : null,
      el('button', { class: 'btn ghost', type: 'button', text: '+ New trip', onclick: newPlan })
    ])
  ]);
  view.appendChild(planBar);

  var panel = el('div', { class: 'panel trip-panel' });

  var startDateInput = el('input', { type: 'date', class: 'editor-input', id: 'start-date-input', value: trip.startDate || '' });
  startDateInput.addEventListener('change', function(){ setStartDate(startDateInput.value); });
  panel.appendChild(el('div', { class: 'field' }, [ el('label', { text: 'Start date' }), startDateInput ]));

  var daysField = el('div', { class: 'field' }, [
    el('label', { text: 'Days' }),
    el('div', { class: 'stepper' }, [
      el('button', { type: 'button', text: '−', onclick: function(){ setDays(trip.days - 1); } }),
      el('input', { type: 'number', id: 'days-input', value: trip.days, min: '1', max: '60' }),
      el('button', { type: 'button', text: '+', onclick: function(){ setDays(trip.days + 1); } })
    ])
  ]);
  panel.appendChild(daysField);

  var destSelect = el('select', { class: 'select-field' });
  destSelect.appendChild(el('option', { value: '', text: 'None' }));
  STATE.destinations.forEach(function(d){
    var o = el('option', { value: d.key, text: d.label });
    if (trip.destination === d.key) o.setAttribute('selected', '');
    destSelect.appendChild(o);
  });
  destSelect.appendChild(el('option', { value: '__new__', text: 'New…' }));
  destSelect.addEventListener('change', function(){
    if (destSelect.value === '__new__'){
      addDestination(function(key){ setDestination(key); });
      renderPlan();
      return;
    }
    setDestination(destSelect.value);
  });
  panel.appendChild(el('div', { class: 'field' }, [ el('label', { text: 'Destination' }), destSelect ]));

  var typeGroup = el('div', { class: 'checkbox-group' });
  STATE.tripTypes.forEach(function(t){
    var cbId = 'triptype-' + t.key;
    var cb = el('input', { type: 'checkbox', id: cbId });
    cb.checked = trip.tripTypes.indexOf(t.key) !== -1;
    cb.addEventListener('change', function(){ toggleTripType(t.key, cb.checked); });
    typeGroup.appendChild(el('label', { class: 'checkbox-label', for: cbId, title: t.note }, [
      cb, document.createTextNode(t.label)
    ]));
  });
  panel.appendChild(el('div', { class: 'field' }, [ el('label', { text: 'Trip type' }), typeGroup ]));

  if (trip.startDate && trip.destination){
    panel.appendChild(el('button', {
      class: 'btn ghost weather-open-btn', type: 'button', text: '🌦️ Weather & packing tips',
      onclick: function(){ openWeatherDialog(false); }
    }));
  }

  view.appendChild(panel);

  var activeTags = trip.tripTypes.slice();
  if (trip.destination) activeTags.unshift(trip.destination);
  if (activeTags.length){
    var strip = el('div', { class: 'rule-strip' });
    activeTags.forEach(function(key){
      strip.appendChild(el('span', { class: 'rule-chip' }, [
        el('span', { class: 'dot' }), document.createTextNode(tagLabel(key))
      ]));
    });
    view.appendChild(strip);
  }

  var progressRow = el('div', { class: 'progress-row' }, [
    el('span', { id: 'progress-label', text: '0 / 0 packed' }),
    el('div', { class: 'progress-track' }, [ el('div', { class: 'progress-fill', id: 'progress-fill' }) ]),
    el('button', { class: 'btn ghost', type: 'button', text: 'Reset for new trip', onclick: resetTrip })
  ]);
  view.appendChild(progressRow);

  var grid = el('div', { class: 'cat-grid', id: 'checklist' });
  STATE.categories.forEach(function(cat){
    var catItems = STATE.items.filter(function(it){ return it.category === cat; });
    var visible = [], hidden = [];
    catItems.forEach(function(it){
      var r = computeItem(it);
      if (r.qty > 0) visible.push({ item: it, r: r }); else hidden.push(it);
    });

    var isCollapsed = !!collapsedPlan[cat];
    var card = el('article', { class: 'cat-card' + (isCollapsed ? ' collapsed' : '') });
    var titleEl = el('h2', {}, [
      el('span', { class: 'collapse-indicator', text: isCollapsed ? '▸' : '▾' }),
      document.createTextNode(cat)
    ]);
    attachLongPress(titleEl, function(){ toggleCollapse(collapsedPlan, 'collapsedPlan', cat, renderPlan); });
    card.appendChild(el('header', {}, [
      titleEl,
      el('span', { class: 'count mono', text: String(visible.length) })
    ]));

    var list = el('ul', { class: 'item-list' });
    var attachCatHandle = makeListDraggable(list, function(newOrder){
      reorderCategoryItems(cat, newOrder);
      persist();
      renderBaseList();
      renderPlan();
    });
    visible.forEach(function(v){
      list.appendChild(renderItemRow(v.item, v.r, attachCatHandle));
    });
    card.appendChild(list);

    if (hidden.length){
      var det = el('details', { class: 'more' });
      if (openMore[cat]) det.setAttribute('open', '');
      det.addEventListener('toggle', function(){ openMore[cat] = det.open; });
      det.appendChild(el('summary', { text: hidden.length + ' more not needed for this trip' }));
      var hlist = el('ul', { class: 'item-list' });
      hidden.forEach(function(it){
        hlist.appendChild(el('li', { class: 'item-row muted' }, [
          el('span', { class: 'item-name', text: it.name }),
          el('button', { class: 'add-btn', type: 'button', text: '+ Add', onclick: function(){ forceAdd(it.id); } })
        ]));
      });
      det.appendChild(hlist);
      card.appendChild(det);
    }

    grid.appendChild(card);
  });

  var extraCard = el('article', { class: 'cat-card' });
  extraCard.appendChild(el('header', {}, [
    el('h2', { text: 'Extra items for this trip' }),
    el('span', { class: 'count mono', text: String(extraItems.length) })
  ]));
  var extraList = el('ul', { class: 'item-list' });
  var attachExtraHandle = makeListDraggable(extraList, function(newOrder){
    reorderExtraItems(newOrder);
    persist();
    syncActivePlan();
    renderPlans();
    renderPlan();
  });
  extraItems.forEach(function(it){
    extraList.appendChild(renderExtraItemRow(it, attachExtraHandle));
  });
  extraCard.appendChild(extraList);

  var extraNameInput = el('input', { class: 'editor-input', type: 'text', placeholder: 'e.g. Dress for the wedding' });
  var addExtraBtn = el('button', { class: 'btn ghost', type: 'button', text: '+ Add', onclick: function(){
    var name = extraNameInput.value.trim();
    if (!name) return;
    addExtraItem(name);
  } });
  extraNameInput.addEventListener('keydown', function(e){ if (e.key === 'Enter'){ e.preventDefault(); addExtraBtn.click(); } });
  extraCard.appendChild(el('div', { class: 'extra-add-row' }, [ extraNameInput, addExtraBtn ]));

  grid.appendChild(extraCard);
  view.appendChild(grid);

  updateProgress();

  var daysInput = document.getElementById('days-input');
  daysInput.addEventListener('change', function(){ setDays(parseInt(daysInput.value, 10)); });
}

function renderItemRow(item, r, attachHandle){
  var row = el('li', { class: 'item-row' + (packed[item.id] ? ' packed' : ''), 'data-id': item.id });

  var cb = el('input', { type: 'checkbox' });
  cb.checked = !!packed[item.id];
  cb.addEventListener('change', function(){ togglePacked(item.id); });
  row.appendChild(el('label', { class: 'check' }, [ cb, el('span', {}) ]));

  var main = el('div', { class: 'item-main' }, [ el('span', { class: 'item-name', text: item.name }) ]);
  if (item.note) main.appendChild(el('span', { class: 'item-subnote', text: item.note }));
  row.appendChild(main);

  var qc = el('div', { class: 'qty-control' }, [
    el('button', { type: 'button', text: '−', onclick: function(){ adjustQty(item.id, -1); } }),
    el('span', { class: 'qty mono', text: String(r.qty) }),
    el('button', { type: 'button', text: '+', onclick: function(){ adjustQty(item.id, 1); } })
  ]);
  row.appendChild(qc);

  var handle = el('span', { class: 'drag-handle', title: 'Drag to reorder', text: '⠿' });
  row.appendChild(handle);
  if (attachHandle) attachHandle(handle, row);

  return row;
}

function renderExtraItemRow(item, attachHandle){
  var row = el('li', { class: 'item-row' + (packed[item.id] ? ' packed' : ''), 'data-id': item.id });

  var cb = el('input', { type: 'checkbox' });
  cb.checked = !!packed[item.id];
  cb.addEventListener('change', function(){ togglePacked(item.id); });
  row.appendChild(el('label', { class: 'check' }, [ cb, el('span', {}) ]));

  row.appendChild(el('div', {
    class: 'item-main tappable', onclick: function(){ editExtraItem(item.id); }
  }, [ el('span', { class: 'item-name', text: item.name }) ]));

  var qc = el('div', { class: 'qty-control' }, [
    el('button', { type: 'button', text: '−', title: item.qty === 1 ? 'Remove' : '', onclick: function(){ adjustExtraQty(item.id, -1); } }),
    el('span', { class: 'qty mono', text: String(item.qty) }),
    el('button', { type: 'button', text: '+', onclick: function(){ adjustExtraQty(item.id, 1); } })
  ]);
  row.appendChild(qc);

  var handle = el('span', { class: 'drag-handle', title: 'Drag to reorder', text: '⠿' });
  row.appendChild(handle);
  if (attachHandle) attachHandle(handle, row);

  return row;
}

// ---------- Rendering: Base List view ----------

function renderBaseList(){
  var view = document.getElementById('view-baselist');
  view.innerHTML = '';

  view.appendChild(el('div', { class: 'toolbar' }, [
    el('button', { class: 'btn ghost', type: 'button', text: 'Reset base list to defaults', onclick: resetToDefaults }),
    el('button', { class: 'btn ghost', type: 'button', text: '🎓 How it works', onclick: function(){ showTutorial(); } }),
    el('span', { class: 'status-msg', text: 'Changes save automatically on this device.' })
  ]));

  var destChips = STATE.destinations.map(function(d){
    return el('span', { class: 'chip chip-sm removable-chip' }, [
      el('span', { text: d.label }),
      el('button', {
        type: 'button', class: 'chip-remove', title: 'Remove destination',
        onclick: function(e){ e.stopPropagation(); deleteDestination(d.key); },
        text: '✕'
      })
    ]);
  });
  destChips.push(el('button', {
    type: 'button', class: 'chip chip-sm chip-add', text: '+ Add destination',
    onclick: function(){ addDestination(function(){ persist(); renderBaseList(); }); }
  }));
  view.appendChild(el('div', { class: 'edit-card destinations-card' }, [
    el('header', {}, [ el('h2', { text: 'Destinations' }) ]),
    el('div', { class: 'chip-group destinations-chip-group' }, destChips)
  ]));

  STATE.categories.forEach(function(cat){
    var catItems = STATE.items.filter(function(it){ return it.category === cat; });
    var isCollapsed = !!collapsedBaseList[cat];
    var card = el('div', { class: 'edit-card' + (isCollapsed ? ' collapsed' : '') });
    var titleEl = el('h2', {}, [
      el('span', { class: 'collapse-indicator', text: isCollapsed ? '▸' : '▾' }),
      document.createTextNode(cat)
    ]);
    attachLongPress(titleEl, function(){ toggleCollapse(collapsedBaseList, 'collapsedBaseList', cat, renderBaseList); });
    card.appendChild(el('header', {}, [ titleEl, el('span', { class: 'count mono', text: String(catItems.length) }) ]));

    var list = el('ul', { class: 'item-list edit-list' });
    catItems.forEach(function(item){
      list.appendChild(renderItemSummaryRow(item));
    });
    card.appendChild(list);

    card.appendChild(el('button', {
      class: 'btn ghost add-row-btn', type: 'button', text: '+ Add item',
      onclick: function(){
        var id = 'custom-' + Math.random().toString(36).slice(2, 9);
        var item = { id: id, category: cat, name: '', mode: 'fixed', qty: 1, tags: [] };
        STATE.items.push(item);
        persist();
        renderBaseList();
        openItemEditor(item, true);
      }
    }));

    view.appendChild(card);
  });
}

var openSwipeRow = null;

function attachSwipeToDelete(rowEl, contentEl, onTap){
  var OPEN_X = 76;
  var startX = 0, startY = 0, dx = 0, dragging = false, decided = false, isHorizontal = false, open = false;

  function setX(x, animate){
    contentEl.style.transition = animate ? 'transform .18s ease' : 'none';
    contentEl.style.transform = 'translateX(' + x + 'px)';
  }
  function close(animate){
    setX(0, animate !== false);
    open = false;
    if (openSwipeRow === closer) openSwipeRow = null;
  }
  var closer = { close: close };

  rowEl.addEventListener('pointerdown', function(e){
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    startX = e.clientX; startY = e.clientY; dx = 0; dragging = true; decided = false; isHorizontal = false;
  });
  rowEl.addEventListener('pointermove', function(e){
    if (!dragging) return;
    var moveX = e.clientX - startX, moveY = e.clientY - startY;
    if (!decided){
      if (Math.abs(moveX) < 8 && Math.abs(moveY) < 8) return;
      decided = true;
      isHorizontal = Math.abs(moveX) > Math.abs(moveY);
      if (isHorizontal){
        try { rowEl.setPointerCapture(e.pointerId); } catch (err){}
        if (openSwipeRow && openSwipeRow !== closer) openSwipeRow.close();
      }
    }
    if (!isHorizontal) return;
    e.preventDefault();
    dx = moveX;
    var base = open ? OPEN_X : 0;
    setX(Math.max(0, Math.min(OPEN_X, base + dx)), false);
  });
  function endDrag(){
    if (!dragging) return;
    dragging = false;
    if (!isHorizontal) return;
    var base = open ? OPEN_X : 0;
    var finalX = Math.max(0, Math.min(OPEN_X, base + dx));
    if (finalX >= OPEN_X / 2){
      setX(OPEN_X, true); open = true; openSwipeRow = closer;
    } else {
      close(true);
    }
  }
  rowEl.addEventListener('pointerup', endDrag);
  rowEl.addEventListener('pointercancel', endDrag);

  contentEl.addEventListener('click', function(e){
    if (open){ e.preventDefault(); e.stopPropagation(); close(true); return; }
    onTap();
  });
}

function renderItemSummaryRow(item){
  if (!item.tags) item.tags = [];
  var modeMeta = item.mode === 'fixed' ? ('Fixed · ' + item.qty)
    : item.mode === 'perWeek' ? ('Per week · ' + item.rate + '/week')
    : ('Per day · ' + item.rate + '/day');
  var metaParts = [ modeMeta ];
  if (item.tags.length){
    metaParts.push(item.tags.map(tagLabel).join(', '));
  }

  var content = el('div', { class: 'item-row-content' }, [
    el('div', { class: 'item-main' }, [
      el('span', { class: 'item-name', text: item.name }),
      el('span', { class: 'item-summary-meta', text: metaParts.join(' · ') })
    ]),
    el('span', { class: 'summary-arrow', text: '›' })
  ]);

  var deleteAction = el('div', { class: 'swipe-delete-action' }, [
    el('button', {
      class: 'swipe-delete-btn', type: 'button', text: 'Delete',
      onclick: function(e){ e.stopPropagation(); deleteBaseListItem(item); }
    })
  ]);

  var row = el('li', { class: 'item-row edit-summary-row swipeable' }, [ deleteAction, content ]);
  attachSwipeToDelete(row, content, function(){ openItemEditor(item); });
  return row;
}

function openItemEditor(item, focusName){
  var dialog = document.getElementById('item-dialog');
  dialog.innerHTML = '';
  if (!item.tags) item.tags = [];

  var header = el('div', { class: 'dialog-header' }, [
    el('h2', { text: 'Edit item' }),
    el('button', { class: 'icon-btn', type: 'button', text: '✕', title: 'Close', onclick: function(){ dialog.close(); renderBaseList(); } })
  ]);
  dialog.appendChild(header);

  var body = el('div', { class: 'item-editor' });

  var nameInput = el('input', { type: 'text', class: 'editor-input', value: item.name, placeholder: 'e.g. Toothbrush' });
  nameInput.addEventListener('input', function(){ item.name = nameInput.value; persist(); });
  body.appendChild(el('div', { class: 'field' }, [ el('label', { text: 'Name' }), nameInput ]));

  var catSelect = el('select', { class: 'select-field' });
  STATE.categories.forEach(function(c){
    var o = el('option', { value: c, text: c });
    if (item.category === c) o.setAttribute('selected', '');
    catSelect.appendChild(o);
  });
  catSelect.addEventListener('change', function(){ item.category = catSelect.value; persist(); });
  body.appendChild(el('div', { class: 'field' }, [ el('label', { text: 'Category' }), catSelect ]));

  function buildTagField(fieldLabel, list){
    var group = el('div', { class: 'chip-group' });
    list.forEach(function(t){
      var on = item.tags.indexOf(t.key) !== -1;
      var chip = el('button', {
        type: 'button', class: 'chip chip-sm' + (on ? ' selected' : ''), text: t.label,
        onclick: function(){
          var idx = item.tags.indexOf(t.key);
          if (idx === -1) item.tags.push(t.key); else item.tags.splice(idx, 1);
          chip.classList.toggle('selected');
          persist();
        }
      });
      group.appendChild(chip);
    });
    var labelRow = el('div', { class: 'field-label-row' }, [
      el('label', { text: fieldLabel }),
      el('button', {
        type: 'button', class: 'link-btn', text: 'Select all',
        onclick: function(){
          list.forEach(function(t){ if (item.tags.indexOf(t.key) === -1) item.tags.push(t.key); });
          persist();
          openItemEditor(item);
        }
      })
    ]);
    return el('div', { class: 'field' }, [ labelRow, group ]);
  }

  body.appendChild(buildTagField('Destination', STATE.destinations));
  body.appendChild(buildTagField('Trip type', STATE.tripTypes));

  var MODE_LABELS = { fixed: 'Fixed', perDay: 'Per day', perWeek: 'Per week' };
  var modeSelect = el('select', { class: 'select-field' });
  ['fixed', 'perDay', 'perWeek'].forEach(function(m){
    var opt = el('option', { value: m, text: MODE_LABELS[m] });
    if (item.mode === m) opt.setAttribute('selected', '');
    modeSelect.appendChild(opt);
  });
  modeSelect.addEventListener('change', function(){
    if (modeSelect.value === 'fixed'){ item.mode = 'fixed'; item.qty = item.qty || 1; delete item.rate; }
    else { item.mode = modeSelect.value; item.rate = item.rate || 0; delete item.qty; }
    persist();
    openItemEditor(item);
  });
  body.appendChild(el('div', { class: 'field' }, [ el('label', { text: 'Mode' }), modeSelect ]));

  var isRateMode = item.mode === 'perDay' || item.mode === 'perWeek';
  var qtyInput = el('input', { class: 'editor-input', type: 'number', step: isRateMode ? '0.1' : '1', min: '0',
    value: isRateMode ? item.rate : item.qty });
  qtyInput.addEventListener('input', function(){
    var v = parseFloat(qtyInput.value) || 0;
    if (isRateMode) item.rate = v; else item.qty = v;
    persist();
  });
  var qtyLabel = item.mode === 'perDay' ? 'Rate per day' : item.mode === 'perWeek' ? 'Rate per week' : 'Quantity';
  body.appendChild(el('div', { class: 'field' }, [ el('label', { text: qtyLabel }), qtyInput ]));

  var noteInput = el('input', { class: 'editor-input', type: 'text', value: item.note || '', placeholder: 'Optional' });
  noteInput.addEventListener('input', function(){ item.note = noteInput.value || undefined; persist(); });
  body.appendChild(el('div', { class: 'field' }, [ el('label', { text: 'Notes' }), noteInput ]));

  dialog.appendChild(body);

  var footer = el('div', { class: 'dialog-footer' }, [
    el('button', {
      class: 'btn ghost', type: 'button', text: 'Delete item',
      onclick: function(){ dialog.close(); deleteBaseListItem(item); }
    }),
    el('button', { class: 'btn primary', type: 'button', text: 'Done', onclick: function(){ dialog.close(); renderBaseList(); } })
  ]);
  dialog.appendChild(footer);

  dialog.showModal();
  if (focusName){
    nameInput.focus();
    nameInput.select();
  }
}

// ---------- Rendering: Plans view ----------

function renderPlans(){
  var view = document.getElementById('view-plans');
  view.innerHTML = '';

  view.appendChild(el('div', { class: 'toolbar' }, [
    el('button', { class: 'btn', type: 'button', text: '+ New trip', onclick: newPlan })
  ]));

  if (!STATE.savedPlans.length){
    view.appendChild(el('div', { class: 'empty-hint', text: 'No saved trips yet. Set up a trip on Trips, then tap "Save trip…".' }));
    return;
  }

  STATE.savedPlans.slice().sort(function(a, b){
    var ad = a.startDate || '', bd = b.startDate || '';
    if (ad && bd) return ad < bd ? -1 : ad > bd ? 1 : (b.updatedAt - a.updatedAt);
    if (ad !== bd) return ad ? -1 : 1;
    return b.updatedAt - a.updatedAt;
  }).forEach(function(plan){
    var isActive = STATE.activePlanId === plan.id;
    var packedCount = Object.keys(plan.packed).filter(function(k){ return plan.packed[k]; }).length;
    var meta = plan.days + ' day' + (plan.days === 1 ? '' : 's');
    if (plan.startDate) meta = formatTripDate(plan.startDate) + ' · ' + meta;
    var planTags = (plan.destination ? [plan.destination] : []).concat(plan.tripTypes);
    if (planTags.length) meta += ' · ' + planTags.map(tagLabel).join(', ');

    var card = el('div', {
      class: 'plan-card' + (isActive ? ' active' : ''), onclick: function(){ loadPlan(plan.id); }
    }, [
      el('div', { class: 'plan-card-main' }, [
        el('div', { class: 'plan-card-name', text: plan.name }),
        el('div', { class: 'item-summary-meta', text: meta })
      ]),
      el('div', { class: 'plan-card-actions' }, [
        isActive ? el('span', { class: 'plan-card-loaded', text: 'Loaded' }) : null,
        el('button', { class: 'icon-btn', type: 'button', text: '✎', title: 'Rename', onclick: function(e){ e.stopPropagation(); renamePlan(plan.id); } }),
        el('button', { class: 'icon-btn', type: 'button', text: '✕', title: 'Delete', onclick: function(e){ e.stopPropagation(); deletePlan(plan.id); } })
      ])
    ]);
    view.appendChild(card);
  });
}

// ---------- Tabs ----------

function switchTab(tab){
  document.querySelectorAll('.tab').forEach(function(b){ b.classList.toggle('active', b.getAttribute('data-tab') === tab); });
  document.querySelectorAll('.view').forEach(function(v){ v.classList.toggle('active', v.id === 'view-' + tab); });
}

// ---------- Back-gesture guard (Android) ----------
// A page with no browser-history entries makes Android's back button/edge-swipe
// close the app outright instead of doing anything in-page. Keeping one extra
// history entry armed means that gesture always lands on us as a popstate
// event instead — closing an open dialog first, or returning to the Trips tab.

var BACK_DEFAULT_TAB = 'plan';

function armBackGuard(){
  try { history.pushState({ zipitGuard: true }, ''); } catch (e){}
}

function closeOpenDialogs(){
  var open = document.querySelectorAll('dialog[open]');
  if (!open.length) return false;
  open.forEach(function(d){ d.close(); });
  return true;
}

window.addEventListener('popstate', function(){
  if (!closeOpenDialogs()) switchTab(BACK_DEFAULT_TAB);
  armBackGuard();
});

// ---------- Boot ----------

function boot(){
  var root = document.getElementById('root');
  root.innerHTML =
    '<header class="topbar">' +
      '<div class="brand"><span class="brand-mark">🧳</span><div><h1>Zip It!</h1><p class="eyebrow">packing, calculated</p></div></div>' +
      '<nav class="tabs" role="tablist">' +
        '<button class="tab active" data-tab="plan">Trips</button>' +
        '<button class="tab" data-tab="plans">Saved Trips</button>' +
        '<button class="tab" data-tab="baselist">Base List</button>' +
      '</nav>' +
      '<div class="sync-status" id="sync-status"></div>' +
    '</header>' +
    (IS_DEMO ?
      '<div class="demo-banner">' +
        '<span>🎮 <strong>Demo mode</strong> — play freely! Nothing here is connected to the real app.</span>' +
        '<button id="demo-reset-btn" class="btn ghost" type="button">Reset demo</button>' +
      '</div>' : '') +
    '<main>' +
      '<section id="view-plan" class="view active"></section>' +
      '<section id="view-plans" class="view"></section>' +
      '<section id="view-baselist" class="view"></section>' +
    '</main>' +
    '<dialog id="item-dialog" class="item-dialog"></dialog>' +
    '<dialog id="prompt-dialog" class="item-dialog prompt-dialog"></dialog>' +
    '<dialog id="celebrate-dialog" class="celebrate-dialog"></dialog>' +
    '<dialog id="weather-dialog" class="item-dialog weather-dialog"></dialog>' +
    '<dialog id="tutorial-dialog" class="item-dialog tutorial-dialog"></dialog>';

  document.querySelectorAll('.tab').forEach(function(b){
    b.addEventListener('click', function(){ switchTab(b.getAttribute('data-tab')); });
  });

  if (IS_DEMO) document.getElementById('demo-reset-btn').addEventListener('click', resetDemo);

  document.getElementById('item-dialog').addEventListener('close', function(){ renderBaseList(); });

  renderPlan();
  renderBaseList();
  renderPlans();
  renderSyncStatus();
  initCloud();
  armBackGuard();

  var tutorialSeenKey = STORAGE_KEY + '-tutorial-seen';
  var tutorialSeen = false;
  try { tutorialSeen = localStorage.getItem(tutorialSeenKey) === '1'; } catch (e){}
  if (!tutorialSeen) showTutorial();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();

})();
