/* Conference & Deadline Planner
   All data lives in conferences.json — you should rarely need to edit this file.
   A milestone with "deadline": true shows up in Next up, the timeline, the table
   and the .ics export. "Passed" is never stored: it is worked out from the clock. */
'use strict';

/* ---------- Labels (edit here to rename tiers / fields / types) ---------- */
const LABELS = {
  tier: { primary: 'Primary', stretch: 'Stretch', 'long-shot': 'Long-shot', 'low-stakes': 'Low-stakes' },
  field: { medical: 'Medical imaging', ml: 'General ML', cv: 'Computer vision' },
  status: { official: 'Official', estimate: 'Estimate', passed: 'Passed' },
  type: {
    abstract: 'Abstract', paper: 'Paper', registration: 'Registration', workshop: 'Workshop',
    supplementary: 'Supplementary', reviews: 'Reviews', rebuttal: 'Rebuttal',
    notification: 'Notification', 'camera-ready': 'Camera-ready',
  },
  tz: { AoE: 'AoE (UTC−12)', 'US-Eastern': 'US Eastern', local: 'your time' },
};
const DATA_URL = 'conferences.json';
const NEXT_UP_COUNT = 3;

const state = {
  data: null,
  items: [],                     // flat list of deadline items, soonest first
  view: 'timeline',
  filters: { tier: new Set(), field: new Set(), status: new Set(['official', 'estimate']) },
  sort: { key: 'date', dir: 1 },
  open: new Set(),               // keys of expanded cards / rows, kept across re-renders
};

/* ---------- Safe localStorage ---------- */
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
};

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Time: every deadline is 23:59 in its stated zone ---------- */
function ymd(iso) { const [y, m, d] = iso.split('-').map(Number); return { y, m, d }; }

// Minutes that `timeZone` is ahead of UTC at instant `ms` (e.g. -240 for EDT).
function zoneOffset(ms, timeZone) {
  const p = {};
  new Intl.DateTimeFormat('en-US', { timeZone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' })
    .formatToParts(new Date(ms)).forEach((x) => { p[x.type] = Number(x.value); });
  return (Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - ms) / 60000;
}

// Epoch ms of 23:59 on `iso` in tz: "AoE" (UTC−12), "US-Eastern" (DST-aware) or "local".
function dueMs(iso, tz) {
  const { y, m, d } = ymd(iso);
  const wall = Date.UTC(y, m - 1, d, 23, 59);
  if (tz === 'AoE') return wall + 12 * 3600e3;
  if (tz === 'US-Eastern') {
    try { return wall - zoneOffset(wall + 5 * 3600e3, 'America/New_York') * 60e3; }
    catch (e) { return wall + 5 * 3600e3; }
  }
  return new Date(y, m - 1, d, 23, 59).getTime();
}

// Format an ISO date without letting the browser's zone shift the day.
function fmtDate(iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  const { y, m, d } = ymd(iso);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts });
}
const fmtLocal = (ms) => new Date(ms).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function countdown(ms) {
  const diff = ms - Date.now();
  if (diff <= 0) return 'passed';
  const days = Math.floor(diff / 864e5), hours = Math.floor((diff % 864e5) / 36e5);
  if (days === 0) return `${hours}h ${Math.floor((diff % 36e5) / 6e4)}m`;
  return `${days}d ${hours}h`;
}
const bigCountdown = (ms) => countdown(ms).replace(/(\d+)([dhm])/g, '$1<small>$2</small>');

function confDates(c) {
  const d = c.dates || {};
  if (d.text) return d.text;
  if (!d.start) return 'TBA';
  return `${fmtDate(d.start, { day: 'numeric', month: 'short' })} – ${fmtDate(d.end || d.start)}`;
}

/* ---------- Data → flat deadline list ---------- */
function buildItems(confs) {
  const now = Date.now(), items = [];
  confs.forEach((c) => (c.milestones || []).forEach((m) => {
    if (!m.deadline) return;
    const tz = m.tz || 'local';
    const due = dueMs(m.date, tz);
    const est = (m.status || c.status) === 'estimate';
    items.push({ c, m, tz, due, est, status: due < now ? 'passed' : (est ? 'estimate' : 'official'),
      key: `${c.id}|${m.type}|${m.date}` });
  }));
  return items.sort((a, b) => a.due - b.due);
}

let noteSeq = 0;
const typeLabel = (m) => m.label || LABELS.type[m.type] || m.type;
const dateText = (it) => `${it.est ? '~' : ''}${fmtDate(it.m.date)}`;

function passesFilters(it) {
  const f = state.filters;
  return (!f.tier.size || f.tier.has(it.c.tier)) &&
    (!f.field.size || f.field.has(it.c.field)) &&
    f.status.has(it.status);
}

/* ---------- Shared bits ---------- */
function badges(it) {
  return `<span class="badge s-${it.status}">${LABELS.status[it.status]}</span>` +
    (it.est && it.status !== 'passed' ? ' <span class="verify">verify</span>' : '') +
    ` <span class="badge t-${esc(it.c.tier)}">${esc(LABELS.tier[it.c.tier] || it.c.tier)}</span>` +
    ` <span class="badge field">${esc(LABELS.field[it.c.field] || it.c.field)}</span>`;
}

function detailHTML(c) {
  const now = Date.now();
  const ms = (c.milestones || []).map((m) => {
    const past = dueMs(m.date, m.tz || 'local') < now;
    const when = (c.status === 'estimate' ? '~' : '') + (m.start ? `${fmtDate(m.start, { day: 'numeric', month: 'short' })} – ` : '') + fmtDate(m.date);
    const tz = m.deadline ? ` · ${LABELS.tz[m.tz || 'local']}` : '';
    return `<li><span class="d${past ? ' is-past' : ''}">${when}</span><span>${esc(typeLabel(m))}${m.deadline ? ' <b>deadline</b>' : ''}<span class="n">${tz}${m.note ? ' · ' + esc(m.note) : ''}</span></span></li>`;
  }).join('');
  const row = (k, v) => (v ? `<dt>${k}</dt><dd>${v}</dd>` : '');
  const uid = `note-${esc(c.id)}-${++noteSeq}`;
  return `<div class="detail"><dl>
    ${row('Location', esc(c.location))}
    ${row('Conference', esc(confDates(c)) + (c.datesNote ? ` <span class="n">· ${esc(c.datesNote)}</span>` : ''))}
    ${row('Milestones', `<ul class="ms">${ms}</ul>`)}
    ${row('Page limit', esc(c.pageLimit))}
    ${row('Notes', esc(c.notes))}
    ${row('Official site', c.url ? `<a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.url.replace(/^https?:\/\//, ''))} ↗</a>` : '')}
  </dl>
  <div class="mynotes"><label for="${uid}">My notes <span class="saved"></span></label>
    <textarea id="${uid}" data-note="${esc(c.id)}" placeholder="Ideas, co-authors, internal deadline…">${esc(store.get('cdp-note:' + c.id) || '')}</textarea></div></div>`;
}

/* ---------- Next up ---------- */
function renderNextUp() {
  const next = state.items.filter((it) => it.status !== 'passed').slice(0, NEXT_UP_COUNT);
  $('#next-up').innerHTML = next.length ? next.map((it) => `
    <li class="next-card${it.est ? ' est' : ''}">
      <div class="badges">${badges(it)}</div>
      <div class="name">${esc(it.c.name)}</div>
      <div class="what">${esc(typeLabel(it.m))} · ${dateText(it)}</div>
      <div class="countdown" data-due="${it.due}">${bigCountdown(it.due)}</div>
      <div class="when">due ${fmtLocal(it.due)} your time · ${LABELS.tz[it.tz]}</div>
    </li>`).join('') : '<li class="next-card">No upcoming deadlines. Time to add some to conferences.json.</li>';
}

/* ---------- Filters ---------- */
function renderFilters() {
  const group = (name, title) => `<fieldset><legend>${title}</legend>${Object.entries(LABELS[name]).map(([k, v]) =>
    `<button type="button" class="chip" data-filter="${name}" data-value="${k}" aria-pressed="${state.filters[name].has(k)}">${v}</button>`).join('')}</fieldset>`;
  $('#filters').innerHTML = group('tier', 'Tier') + group('field', 'Field') + group('status', 'Status') +
    '<button type="button" class="chip chip-reset" data-reset>Reset</button>';
}

/* ---------- Timeline ---------- */
function monthKeys(items) {
  let [sy, sm] = state.data.range.start.split('-').map(Number);
  let [ey, em] = state.data.range.end.split('-').map(Number);
  items.forEach((it) => {           // stretch the range if a shown deadline falls outside it
    const { y, m } = ymd(it.m.date);
    if (y * 12 + m < sy * 12 + sm) { sy = y; sm = m; }
    if (y * 12 + m > ey * 12 + em) { ey = y; em = m; }
  });
  const keys = [];
  for (let i = sy * 12 + sm - 1; i <= ey * 12 + em - 1; i++) keys.push(`${Math.floor(i / 12)}-${String(i % 12 + 1).padStart(2, '0')}`);
  return keys;
}

function renderTimeline(items) {
  const now = new Date(), nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  $('#timeline').innerHTML = monthKeys(items).map((key) => {
    const list = items.filter((it) => it.m.date.startsWith(key));
    const cls = `month${key === nowKey ? ' now' : ''}${list.length ? '' : ' is-empty'}`;
    const body = list.length ? list.map((it) => `
      <li class="item ${it.status === 'passed' ? 'passed' : ''} ${it.est ? 'est' : ''}">
        <details class="card ${it.status === 'passed' ? 'passed' : ''} ${it.est && it.status !== 'passed' ? 'est' : ''}" data-key="${esc(it.key)}"${state.open.has(it.key) ? ' open' : ''}>
          <summary>
            <span class="date">${dateText(it)}<span>${fmtDate(it.m.date, { weekday: 'long' })}</span></span>
            <span>
              <span class="name">${esc(it.c.name)}</span><span class="type">${esc(typeLabel(it.m))}</span><span class="chev" aria-hidden="true">›</span>
              <span class="badges">${badges(it)}</span>
              <span class="sub">${esc(it.c.location || 'TBA')} · ${esc(confDates(it.c))}</span>
            </span>
            <span class="left" data-due="${it.due}">${countdown(it.due)}</span>
          </summary>
          ${state.open.has(it.key) ? detailHTML(it.c) : ''}
        </details>
      </li>`).join('') : '<li class="empty">—</li>';
    return `<section class="${cls}"><h3>${fmtDate(key + '-01', { month: 'short', year: 'numeric' })}</h3><ol>${body}</ol></section>`;
  }).join('');
}

/* ---------- Table ---------- */
const SORTERS = {
  date: (it) => it.due,
  conference: (it) => it.c.name,
  type: (it) => typeLabel(it.m),
  tier: (it) => Object.keys(LABELS.tier).indexOf(it.c.tier),
  status: (it) => Object.keys(LABELS.status).indexOf(it.status),
  location: (it) => it.c.location || '',
};

function renderTable(items) {
  const { key, dir } = state.sort;
  const rows = [...items].sort((a, b) => {
    const x = SORTERS[key](a), y = SORTERS[key](b);
    return (x < y ? -1 : x > y ? 1 : a.due - b.due) * dir;
  });
  const th = (k, label) => `<th scope="col"${k === key ? ` aria-sort="${dir > 0 ? 'ascending' : 'descending'}"` : ''}>
    <button type="button" data-sort="${k}">${label}${k === key ? (dir > 0 ? ' ↑' : ' ↓') : ''}</button></th>`;
  $('#table-view').innerHTML = `<table><thead><tr>${th('date', 'Date')}${th('conference', 'Conference')}${th('type', 'Type')}${th('tier', 'Tier')}${th('status', 'Status')}${th('location', 'Location')}</tr></thead><tbody>
    ${rows.map((it) => `<tr class="${it.status === 'passed' ? 'passed' : ''} ${it.est ? 'est' : ''}">
      <td class="mono">${dateText(it)}<br><span class="n">${countdown(it.due)}</span></td>
      <td><button type="button" class="linkish" data-row="${esc(it.key)}" aria-expanded="${state.open.has(it.key)}">${esc(it.c.name)} <span aria-hidden="true">${state.open.has(it.key) ? '▾' : '▸'}</span></button></td>
      <td>${esc(typeLabel(it.m))}</td>
      <td><span class="badge t-${esc(it.c.tier)}">${esc(LABELS.tier[it.c.tier] || it.c.tier)}</span></td>
      <td><span class="badge s-${it.status}">${LABELS.status[it.status]}</span>${it.est && it.status !== 'passed' ? ' <span class="verify">verify</span>' : ''}</td>
      <td>${esc(it.c.location || 'TBA')}</td></tr>
      ${state.open.has(it.key) ? `<tr class="detail-row"><td colspan="6">${detailHTML(it.c)}</td></tr>` : ''}`).join('')}
  </tbody></table>`;
}

/* ---------- Render all ---------- */
function render() {
  state.items = buildItems(state.data.conferences);
  const shown = state.items.filter(passesFilters);
  const passed = state.items.filter((it) => it.status === 'passed').length;
  renderNextUp();
  renderFilters();
  $('#count').textContent = `Showing ${shown.length} of ${state.items.length} deadlines` +
    (passed && !state.filters.status.has('passed') ? ` · ${passed} passed hidden (toggle "Passed" to show)` : '');
  $('#timeline').hidden = state.view !== 'timeline';
  $('#table-view').hidden = state.view !== 'table';
  document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === state.view));
  if (state.view === 'timeline') renderTimeline(shown); else renderTable(shown);
}

/* Refresh the countdowns every 30 s; re-render fully if something just passed. */
function tick() {
  if (state.items.some((it) => it.status !== 'passed' && it.due < Date.now())) return render();
  document.querySelectorAll('[data-due]').forEach((el) => {
    const due = Number(el.dataset.due);
    el.innerHTML = el.classList.contains('countdown') ? bigCountdown(due) : countdown(due);
  });
}

/* ---------- .ics export (all-day events for every non-passed deadline) ---------- */
function exportICS() {
  const icsText = (s) => String(s).replace(/[\\;,]/g, (c) => '\\' + c).replace(/\n/g, '\\n').replace(/[^\x20-\x7E\\]/g, '-');
  const fold = (line) => line.match(/.{1,73}/g).join('\r\n ');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const nextDay = (iso) => { const { y, m, d } = ymd(iso); return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10).replace(/-/g, ''); };
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Atharva Kocharekar//Deadline Planner//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Research deadlines'];
  state.items.filter((it) => it.status !== 'passed').forEach((it) => {
    const desc = `${it.est ? 'ESTIMATE - verify on the official site. ' : ''}Due 23:59 ${it.tz}. ${it.m.note || ''}\n${it.c.url || ''}`;
    lines.push('BEGIN:VEVENT', `UID:${it.key.replace(/[^a-z0-9]/gi, '-')}@atharvax16.github.io`, `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${it.m.date.replace(/-/g, '')}`, `DTEND;VALUE=DATE:${nextDay(it.m.date)}`,
      `SUMMARY:${icsText(`${it.est ? '~ ' : ''}${it.c.name}: ${typeLabel(it.m)} deadline`)}`,
      `DESCRIPTION:${icsText(desc)}`, 'TRANSP:TRANSPARENT', 'END:VEVENT');
  });
  lines.push('END:VCALENDAR');
  const blob = new Blob([lines.map(fold).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'research-deadlines.ics' });
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/* ---------- Events ---------- */
function bindEvents() {
  document.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.view) { state.view = t.dataset.view; store.set('cdp-view', state.view); render(); }
    else if (t.dataset.filter) {
      const set = state.filters[t.dataset.filter];
      set.has(t.dataset.value) ? set.delete(t.dataset.value) : set.add(t.dataset.value);
      render();
    } else if ('reset' in t.dataset) {
      state.filters = { tier: new Set(), field: new Set(), status: new Set(['official', 'estimate']) };
      render();
    } else if (t.dataset.sort) {
      state.sort = { key: t.dataset.sort, dir: state.sort.key === t.dataset.sort ? -state.sort.dir : 1 };
      render();
      $(`[data-sort="${state.sort.key}"]`).focus();
    } else if (t.dataset.row) {
      state.open.has(t.dataset.row) ? state.open.delete(t.dataset.row) : state.open.add(t.dataset.row);
      render();
      $(`[data-row="${CSS.escape(t.dataset.row)}"]`).focus();
    } else if (t.id === 'export-ics') exportICS();
    else if (t.id === 'theme-toggle') toggleTheme();
  });

  // <details> cards: remember open state and render the detail lazily.
  document.addEventListener('toggle', (e) => {
    const d = e.target;
    if (!d.matches || !d.matches('details.card')) return;
    if (d.open) {
      state.open.add(d.dataset.key);
      if (!d.querySelector('.detail')) d.insertAdjacentHTML('beforeend', detailHTML(state.items.find((it) => it.key === d.dataset.key).c));
    } else state.open.delete(d.dataset.key);
  }, true);

  // Notes: saved per conference, kept in sync if the same conference is open twice.
  document.addEventListener('input', (e) => {
    const id = e.target.dataset && e.target.dataset.note;
    if (!id) return;
    const ok = store.set('cdp-note:' + id, e.target.value);
    document.querySelectorAll(`textarea[data-note="${CSS.escape(id)}"]`).forEach((ta) => { if (ta !== e.target) ta.value = e.target.value; });
    const tag = e.target.parentElement.querySelector('.saved');
    if (tag) tag.textContent = ok ? '· saved in this browser' : '· could not save (storage blocked)';
  });
}

/* ---------- Theme ---------- */
function toggleTheme() {
  const root = document.documentElement;
  const dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  root.dataset.theme = dark ? 'light' : 'dark';
  store.set('cdp-theme', root.dataset.theme);
}

/* ---------- Boot ---------- */
async function init() {
  bindEvents();
  if (store.get('cdp-view') === 'table') state.view = 'table';
  try {
    const res = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.data = await res.json();
  } catch (err) {
    const box = $('#error');
    box.hidden = false;
    box.innerHTML = `<h2>Couldn't load the deadlines</h2><p>conferences.json failed to load (${esc(err.message)}).
      If you opened this file directly from disk, serve the folder instead, e.g. <code>python3 -m http.server</code>.
      Otherwise check the JSON for a typo such as a trailing comma.</p>`;
    return;
  }
  $('#last-verified').textContent = state.data.lastVerified || '—';
  $('#strategy-list').innerHTML = (state.data.strategy || []).map((s) => `<li><b>${esc(s.label)}:</b> ${esc(s.text)}</li>`).join('');
  render();
  setInterval(tick, 30000);
}

init();
