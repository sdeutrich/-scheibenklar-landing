/* Tests für js/fristenrechner.js – ohne Abhängigkeiten.
   Aufruf: node tests/fristenrechner.test.js
   Die Zeitzone wird vor dem ersten Date-Zugriff auf Europe/Berlin gesetzt
   (Gegenprobe zum Zeitzonen-Fund in der PWA, fristen_tracker.html addJahre). */
process.env.TZ = 'Europe/Berlin';

const assert = require('node:assert/strict');
const path = require('node:path');
const FR = require(path.join(__dirname, '..', 'js', 'fristenrechner.js'));

let gruen = 0;
let rot = 0;
function test(name, fn) {
  try { fn(); gruen++; console.log('  ✓ ' + name); }
  catch (e) { rot++; console.log('  ✗ ' + name + '\n    ' + e.message); }
}
const D = (j, m, t) => ({ j, m, t });

test('Zeitzone Europe/Berlin aktiv (Sommer UTC+2, Winter UTC+1)', () => {
  assert.equal(new Date(2026, 6, 1).getTimezoneOffset(), -120);
  assert.equal(new Date(2026, 0, 1).getTimezoneOffset(), -60);
});

test('heuteBerlin: Kalenderdatum in Berlin, nicht UTC', () => {
  assert.deepEqual(FR.heuteBerlin(Date.UTC(2026, 9, 31, 23, 30)), D(2026, 11, 1)); // Winterzeit
  assert.deepEqual(FR.heuteBerlin(Date.UTC(2026, 5, 30, 22, 30)), D(2026, 7, 1));  // Sommerzeit
  assert.deepEqual(FR.heuteBerlin(Date.UTC(2026, 9, 31, 22, 59)), D(2026, 10, 31));
});

test('Stichtag: heute = 10. Jahrestag → noch nicht erreicht', () => {
  const r = FR.zehnJahresRegel(D(2016, 10, 31), D(2026, 10, 31));
  assert.deepEqual(r.stichtag, D(2026, 10, 31));
  assert.deepEqual(r.ab, D(2026, 11, 1));
  assert.equal(r.erreicht, false);
});

test('Stichtag: heute = Jahrestag + 1 Tag → erreicht', () => {
  assert.equal(FR.zehnJahresRegel(D(2016, 10, 31), D(2026, 11, 1)).erreicht, true);
});

test('29.02.2016: Vereinfachung ab 01.03.2026', () => {
  const r = FR.zehnJahresRegel(D(2016, 2, 29), D(2026, 1, 1));
  assert.deepEqual(r.stichtag, D(2026, 2, 28));
  assert.deepEqual(r.ab, D(2026, 3, 1));
  assert.equal(FR.zehnJahresRegel(D(2016, 2, 29), D(2026, 2, 28)).erreicht, false);
  assert.equal(FR.zehnJahresRegel(D(2016, 2, 29), D(2026, 3, 1)).erreicht, true);
});

test('29.02.2016: 5-Jahres-Termin 28.02.2021', () => {
  const p = FR.naechstePruefung(D(2016, 2, 29), D(2020, 6, 1));
  assert.deepEqual(p.datum, D(2021, 2, 28));
  assert.equal(p.jahre, 5);
});

test('29.02. in Schaltjahr bleibt 29.02. (2016 + 8 = 2024)', () => {
  assert.deepEqual(FR.addJahre(D(2016, 2, 29), 8), D(2024, 2, 29));
});

test('addJahre 01.01.2000–31.12.2029 (+5, +10): nie ein Tag zu früh', () => {
  let geprueft = 0;
  for (let ms = Date.UTC(2000, 0, 1); ms <= Date.UTC(2029, 11, 31); ms += 86400000) {
    const x = new Date(ms);
    const e = D(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate());
    for (const n of [5, 10]) {
      const r = FR.addJahre(e, n);
      const erwartet = (e.m === 2 && e.t === 29 && !FR.istSchaltjahr(e.j + n)) ? D(e.j + n, 2, 28) : D(e.j + n, e.m, e.t);
      assert.deepEqual(r, erwartet, `${FR.formatDatum(e)} + ${n}`);
      geprueft++;
    }
  }
  assert.equal(geprueft, 21916);
});

test('Gegenprobe: PWA-addJahre (fristen_tracker.html) liegt in Berlin teils einen Tag zu früh', () => {
  // wörtliche Kopie aus der PWA, nur zum Vergleich
  function addJahrePwa(datum, jahre) { var d = new Date(datum); d.setFullYear(d.getFullYear() + jahre); return d.toISOString().slice(0, 10); }
  let abweichend = 0;
  for (let ms = Date.UTC(2000, 0, 1); ms <= Date.UTC(2029, 11, 31); ms += 86400000) {
    const iso = new Date(ms).toISOString().slice(0, 10);
    if (iso.slice(5) === '02-29') continue;
    for (const n of [5, 10]) if (addJahrePwa(iso, n) !== (+iso.slice(0, 4) + n) + iso.slice(4)) abweichend++;
  }
  assert.ok(abweichend > 0, 'Fehler der PWA sollte in Berlin nachweisbar sein');
});

test('Fortschreibung: erste Eintragung vor 12 Jahren → E + 15 Jahre', () => {
  const p = FR.naechstePruefung(D(2014, 10, 31), D(2026, 10, 31));
  assert.deepEqual(p.datum, D(2029, 10, 31));
  assert.equal(p.jahre, 15);
  assert.equal(p.tage, 1096);
});

test('Fortschreibung: Termin genau heute → 0 Tage („ab heute“)', () => {
  const p = FR.naechstePruefung(D(2016, 10, 31), D(2026, 10, 31));
  assert.deepEqual(p.datum, D(2026, 10, 31));
  assert.equal(p.jahre, 10);
  assert.equal(p.tage, 0);
});

test('Fortschreibung: Eintragung heute → erster Termin nach 5 Jahren', () => {
  const p = FR.naechstePruefung(D(2026, 10, 31), D(2026, 10, 31));
  assert.deepEqual(p.datum, D(2031, 10, 31));
  assert.equal(p.jahre, 5);
});

test('tageZwischen über Zeitumstellung (25.10.2026 ist 25 h lang)', () => {
  assert.equal(FR.tageZwischen(D(2026, 10, 24), D(2026, 10, 26)), 2);
  assert.equal(FR.tageZwischen(D(2026, 3, 28), D(2026, 3, 30)), 2);
});

const HEUTE = D(2026, 10, 31);
test('Validierung: leer bzw. unvollständig', () => {
  assert.equal(FR.pruefeDatum({ tag: '', monat: '', jahr: '' }, HEUTE).fehler, 'leer');
  assert.equal(FR.pruefeDatum({ tag: '12', monat: '3', jahr: '' }, HEUTE).fehler, 'leer');
  assert.equal(FR.pruefeDatum({ tag: '12', monat: '', jahr: '2010' }, HEUTE).fehler, 'leer');
});

test('Validierung: 31.02. und Tag 0/32 ungültig', () => {
  assert.equal(FR.pruefeDatum({ tag: '31', monat: '2', jahr: '2020' }, HEUTE).fehler, 'ungueltig');
  assert.equal(FR.pruefeDatum({ tag: '29', monat: '2', jahr: '2019' }, HEUTE).fehler, 'ungueltig');
  assert.equal(FR.pruefeDatum({ tag: '0', monat: '5', jahr: '2020' }, HEUTE).fehler, 'ungueltig');
  assert.equal(FR.pruefeDatum({ tag: '32', monat: '5', jahr: '2020' }, HEUTE).fehler, 'ungueltig');
  assert.equal(FR.pruefeDatum({ tag: 'x', monat: '5', jahr: '2020' }, HEUTE).fehler, 'ungueltig');
});

test('Validierung: Zukunft', () => {
  assert.equal(FR.pruefeDatum({ tag: '1', monat: '11', jahr: '2026' }, HEUTE).fehler, 'zukunft');
  assert.equal(FR.pruefeDatum({ tag: '31', monat: '10', jahr: '2026' }, HEUTE).fehler, undefined);
});

test('Validierung: Jahr 1971 und Jahr nach heute → Jahresfehler, 1972 erlaubt', () => {
  assert.equal(FR.pruefeDatum({ tag: '1', monat: '1', jahr: '1971' }, HEUTE).fehler, 'jahr');
  assert.equal(FR.pruefeDatum({ tag: '1', monat: '1', jahr: '2027' }, HEUTE).fehler, 'jahr');
  assert.equal(FR.pruefeDatum({ tag: '1', monat: '1', jahr: '72' }, HEUTE).fehler, 'jahr');
  assert.deepEqual(FR.pruefeDatum({ tag: '1', monat: '1', jahr: '1972' }, HEUTE).datum, D(1972, 1, 1));
});

test('Validierung: gültiges Datum mit führender Null', () => {
  assert.deepEqual(FR.pruefeDatum({ tag: '05', monat: '3', jahr: '2015' }, HEUTE).datum, D(2015, 3, 5));
});

test('berechne: Überkontingent-Kennzeichen', () => {
  assert.equal(FR.berechne(D(2020, 1, 1), 'ueber', HEUTE).ueberkontingent, true);
  assert.equal(FR.berechne(D(2020, 1, 1), 'grund', HEUTE).ueberkontingent, false);
});

test('formatDatum: TT.MM.JJJJ', () => {
  assert.equal(FR.formatDatum(D(2026, 3, 1)), '01.03.2026');
});

console.log(`\n${gruen} grün, ${rot} rot`);
process.exit(rot ? 1 : 0);
