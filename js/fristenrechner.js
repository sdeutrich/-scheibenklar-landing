/* ══════════════════════════════════════════════════════════
   fristenrechner.js — öffentlicher Fristenrechner (/fristenrechner).
   Texte wörtlich aus docs/FRISTENRECHNER-TEXTE.md (Freigabefassung v2).

   Gerechnet wird ausschließlich mit Kalenderdaten { j, m, t } (Ganzzahlen)
   bzw. Date.UTC – nie mit lokaler Zeit, damit Zeitumstellung und Zeitzone
   kein Datum verschieben. "Heute" ist das Kalenderdatum in Europe/Berlin.
   Kein Speichern, keine Cookies, kein localStorage. Einziger Netzwerk-
   zugriff: anonyme Zählung per sendBeacon an /api/klick der App mit genau
   { src, ziel } – nie Datum, Kontingent oder andere Eingaben.

   Regeln:
   - Bedürfnisprüfung (§ 4 Abs. 4 WaffG): erster 5-Jahres-Termin ab der
     ersten Eintragung, der heute oder später liegt (Fortschreibung).
   - 10-Jahres-Regel (§ 14 Abs. 4 S. 3 WaffG): gilt ab dem Tag nach dem
     10. Jahrestag (§§ 187, 188 BGB). 29.02. → Jahrestag 28.02.
   In Node (Tests) werden nur die Rechenfunktionen exportiert.
══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var JAHR_MIN = 1972;
  var KLICK_URL = 'https://scheibenklar.vercel.app/api/klick';
  var QUELLE_MUSTER = /^[a-z0-9_-]{1,32}$/;

  function istSchaltjahr(j) { return (j % 4 === 0 && j % 100 !== 0) || j % 400 === 0; }

  /* Gleicher Tag/Monat im Jahr j+n; 29.02. in Nicht-Schaltjahr → 28.02. */
  function addJahre(d, n) {
    var j = d.j + n;
    var t = (d.m === 2 && d.t === 29 && !istSchaltjahr(j)) ? 28 : d.t;
    return { j: j, m: d.m, t: t };
  }

  function vergleiche(a, b) { return (a.j * 10000 + a.m * 100 + a.t) - (b.j * 10000 + b.m * 100 + b.t); }

  function plusTage(d, n) {
    var x = new Date(Date.UTC(d.j, d.m - 1, d.t + n));
    return { j: x.getUTCFullYear(), m: x.getUTCMonth() + 1, t: x.getUTCDate() };
  }

  function tageZwischen(von, bis) {
    return Math.round((Date.UTC(bis.j, bis.m - 1, bis.t) - Date.UTC(von.j, von.m - 1, von.t)) / 86400000);
  }

  /* Kalenderdatum in Europe/Berlin; jetzt optional (ms oder Date) für Tests */
  function heuteBerlin(jetzt) {
    var teile = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(jetzt === undefined ? new Date() : new Date(jetzt));
    var w = {};
    teile.forEach(function (p) { w[p.type] = p.value; });
    return { j: parseInt(w.year, 10), m: parseInt(w.month, 10), t: parseInt(w.day, 10) };
  }

  function formatDatum(d) {
    return ('0' + d.t).slice(-2) + '.' + ('0' + d.m).slice(-2) + '.' + d.j;
  }

  /* Nächste Bedürfnisprüfung: kleinstes k ≥ 1 mit E + 5k Jahre ≥ heute */
  function naechstePruefung(erste, heute) {
    var k = 1;
    while (vergleiche(addJahre(erste, 5 * k), heute) < 0) k++;
    var datum = addJahre(erste, 5 * k);
    return { datum: datum, jahre: 5 * k, tage: tageZwischen(heute, datum) };
  }

  /* 10-Jahres-Regel: Jahrestag S = E + 10 Jahre, gilt ab S + 1 Tag */
  function zehnJahresRegel(erste, heute) {
    var stichtag = addJahre(erste, 10);
    var ab = plusTage(stichtag, 1);
    return { stichtag: stichtag, ab: ab, erreicht: vergleiche(heute, ab) >= 0 };
  }

  /* Prüft die Rohwerte des Datumswidgets. Rückgabe { datum } oder { fehler } */
  function pruefeDatum(roh, heute) {
    var tag = String(roh.tag || '').trim();
    var monat = String(roh.monat || '').trim();
    var jahr = String(roh.jahr || '').trim();
    if (!tag || !monat || !jahr) return { fehler: 'leer' };
    if (!/^\d{4}$/.test(jahr)) return { fehler: 'jahr' };
    var j = parseInt(jahr, 10);
    if (j < JAHR_MIN || j > heute.j) return { fehler: 'jahr' };
    if (!/^\d{1,2}$/.test(tag) || !/^\d{1,2}$/.test(monat)) return { fehler: 'ungueltig' };
    var t = parseInt(tag, 10), m = parseInt(monat, 10);
    if (m < 1 || m > 12 || t < 1 || vergleiche(plusTage({ j: j, m: m, t: 1 }, t - 1), { j: j, m: m, t: t }) !== 0) {
      return { fehler: 'ungueltig' };
    }
    var datum = { j: j, m: m, t: t };
    if (vergleiche(datum, heute) > 0) return { fehler: 'zukunft' };
    return { datum: datum };
  }

  /* Restzeit bis zur Prüfung: 0 → "ab heute", 1 → Einzahl */
  function restzeitText(tage) {
    if (tage === 0) return 'ab heute';
    return tage === 1 ? 'noch 1 Tag' : 'noch ' + tage + ' Tage';
  }

  /* Quellenangabe (?src=) der Rechnerseite, gleiche Whitelist wie Landing
     und App; ungültig oder fehlend → null */
  function quelleAusUrl(suche) {
    var roh = new URLSearchParams(suche || '').get('src');
    return roh && QUELLE_MUSTER.test(roh) ? roh : null;
  }

  /* Beacon-Inhalt: ausschließlich src und ziel */
  function beaconInhalt(src, ziel) {
    return JSON.stringify({ src: src || 'direkt', ziel: ziel });
  }

  /* Anonyme Zählung. senden(inhalt) überträgt den Beacon-Inhalt; die
     Berechnung zählt höchstens einmal pro Seitenaufruf. */
  function erstelleZaehler(senden, src) {
    var berechnungGezaehlt = false;
    function zaehle(ziel) {
      try { senden(beaconInhalt(src, ziel)); } catch (e) {}
    }
    return {
      aufruf: function () { zaehle('fristenrechner_aufruf'); },
      berechnung: function () {
        if (berechnungGezaehlt) return;
        berechnungGezaehlt = true;
        zaehle('fristenrechner_berechnung');
      },
      appKlick: function () { zaehle('fristenrechner_app_klick'); }
    };
  }

  function berechne(erste, kontingent, heute) {
    return {
      pruefung: naechstePruefung(erste, heute),
      zehn: zehnJahresRegel(erste, heute),
      ueberkontingent: kontingent === 'ueber'
    };
  }

  var api = {
    JAHR_MIN: JAHR_MIN, istSchaltjahr: istSchaltjahr, addJahre: addJahre, vergleiche: vergleiche,
    plusTage: plusTage, tageZwischen: tageZwischen, heuteBerlin: heuteBerlin, formatDatum: formatDatum,
    naechstePruefung: naechstePruefung, zehnJahresRegel: zehnJahresRegel, pruefeDatum: pruefeDatum,
    restzeitText: restzeitText, berechne: berechne,
    quelleAusUrl: quelleAusUrl, beaconInhalt: beaconInhalt, erstelleZaehler: erstelleZaehler
  };
  if (typeof module === 'object' && module.exports) { module.exports = api; return; }

  /* ── Ab hier nur Browser: Anzeige ── */

  var FEHLER = {
    leer: 'Bitte geben Sie das Datum vollständig ein (Tag, Monat, Jahr).',
    ungueltig: 'Dieses Datum gibt es nicht. Bitte prüfen Sie Tag und Monat.',
    zukunft: 'Das Datum liegt in der Zukunft. Bitte geben Sie ein vergangenes Datum ein.',
    jahr: 'Bitte geben Sie ein Jahr zwischen 1972 und heute ein.',
    kontingent: 'Bitte wählen Sie Grund- oder Überkontingent.'
  };

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  /* Absatz aus Teilen: Strings als Text, { fett } als <strong> */
  function absatz(cls, teile) {
    var p = el('p', cls);
    teile.forEach(function (teil) {
      if (typeof teil === 'string') p.appendChild(document.createTextNode(teil));
      else p.appendChild(el('strong', '', teil.fett));
    });
    return p;
  }
  function block(label, text) {
    var d = el('div', 'fr-block');
    d.appendChild(el('div', 'fr-label', label));
    d.appendChild(el('p', '', text));
    return d;
  }

  function karteBeduerfnis(r) {
    var k = el('section', 'fr-karte');
    k.appendChild(el('h2', 'fr-titel', 'Nächste Bedürfnisprüfung'));
    k.appendChild(el('div', 'fr-para', '§ 4 Abs. 4 WaffG · die Behörde prüft alle fünf Jahre'));
    k.appendChild(absatz('fr-datum', ['Voraussichtlich ab ', { fett: formatDatum(r.pruefung.datum) },
      ' (' + r.pruefung.jahre + ' Jahre nach Ihrer ersten Eintragung)']));
    k.appendChild(el('div', 'fr-rest', restzeitText(r.pruefung.tage)));
    k.appendChild(el('p', '', 'Den genauen Zeitpunkt bestimmt Ihre Waffenbehörde. Sie fordert Sie schriftlich auf. Ohne Aufforderung müssen Sie nichts einreichen.'));
    k.appendChild(block('Was ist zu tun?', r.zehn.erreicht
      ? 'Sie brauchen nur eine Bescheinigung Ihres Schießsportvereins über die Mitgliedschaft.'
      : 'Halten Sie Ihr Schießbuch für die letzten 24 Monate bereit. Damit erhalten Sie von Ihrem Schießsportverband (oder dem zuständigen Landes- bzw. Teilverband) die Bescheinigung, die Sie der Behörde vorlegen.'));
    k.appendChild(block('Bei Versäumnis', 'Fehlt der Nachweis, kann die Behörde die Erlaubnis widerrufen. Bei nur vorübergehendem Wegfall – etwa durch Krankheit – kann sie davon absehen; sprechen Sie die Behörde frühzeitig an.'));
    return k;
  }

  function karteZehnJahre(r) {
    var k = el('section', 'fr-karte');
    if (r.zehn.erreicht) {
      k.appendChild(el('p', 'fr-ok', '✓ Seit Ihrer ersten Eintragung sind zehn Jahre vergangen. Für das Fortbestehen des Bedürfnisses genügt die Mitgliedschaft in einem Schießsportverein (§ 14 Abs. 4 Satz 3 WaffG). Bei Prüfungen legen Sie eine Mitgliedsbescheinigung Ihres Vereins vor.'));
    } else {
      var h = el('h2', 'fr-titel', '10-Jahres-Regel ab ');
      h.appendChild(el('strong', '', formatDatum(r.zehn.ab)));
      k.appendChild(h);
      k.appendChild(el('p', '', 'Ab dann genügt für das Fortbestehen des Bedürfnisses die Mitgliedschaft in einem Schießsportverein. Nachweis bei den Folgeprüfungen: Bescheinigung Ihres Vereins.'));
    }
    k.appendChild(el('p', 'fr-hinweis', 'Voraussetzung bleibt die Mitgliedschaft in einem Verein, der einem anerkannten Schießsportverband angehört. Treten Sie aus, entfällt das Bedürfnis.'));
    return k;
  }

  function karteGrundkontingent(r) {
    var k = el('section', 'fr-karte');
    if (r.zehn.erreicht) {
      k.appendChild(el('p', 'fr-ok', '✓ Für Waffen im Grundkontingent ist kein Schießnachweis mehr nötig – die Vereinsmitgliedschaft genügt.'));
      return k;
    }
    k.appendChild(el('h2', 'fr-titel', 'Schießnachweis für die Prüfung'));
    k.appendChild(el('p', '', 'In den 24 Monaten vor der Prüfung mit einer eigenen erlaubnispflichtigen Waffe im Verein geschossen:'));
    var ul = el('ul', 'fr-liste');
    var li1 = el('li', '', 'mindestens einmal alle drei Monate ');
    li1.appendChild(el('strong', '', 'oder'));
    ul.appendChild(li1);
    ul.appendChild(el('li', '', 'mindestens sechsmal in jedem der beiden 12-Monats-Zeiträume.'));
    k.appendChild(ul);
    k.appendChild(el('p', '', 'Besitzen Sie Kurz- und Langwaffen, brauchen Sie den Nachweis für beide Kategorien.'));
    k.appendChild(el('p', 'fr-tipp', 'Tragen Sie jeden Termin sofort ins Schießbuch ein – nachträglich lassen sich Lücken kaum schließen.'));
    return k;
  }

  function karteUeberkontingent() {
    var k = el('section', 'fr-karte');
    k.appendChild(el('h2', 'fr-titel', 'Wettkampfnachweis (Überkontingent)'));
    k.appendChild(el('p', '', 'Für Waffen über dem Grundkontingent verlangt das Gesetz, dass Sie regelmäßig an Schießsportwettkämpfen teilgenommen haben. Wie oft, legen Ihr Verband und Ihre Behörde fest – viele gehen von mindestens einem Wettkampf pro Jahr aus.'));
    k.appendChild(el('p', 'fr-hinweis', 'Ob die 10-Jahres-Regel auch für Waffen im Überkontingent gilt, handhaben Behörden unterschiedlich. Sammeln Sie Ihre Wettkampfnachweise deshalb weiter.'));
    k.appendChild(el('p', '', 'Für Ihre übrigen Waffen im Grundkontingent gelten zusätzlich die Regeln oben.'));
    return k;
  }

  function zeigeFehler(id, schluessel) {
    var f = document.getElementById(id);
    f.textContent = schluessel ? FEHLER[schluessel] : '';
    f.hidden = !schluessel;
  }

  function init() {
    var form = document.getElementById('fr-form');
    var ergebnis = document.getElementById('fr-ergebnis');
    if (!form || !ergebnis) return;
    var w = document.getElementById('fr-erste-w');

    var zaehler = erstelleZaehler(function (inhalt) {
      if (navigator.sendBeacon) navigator.sendBeacon(KLICK_URL, inhalt);
    }, quelleAusUrl(window.location.search));
    zaehler.aufruf();
    var appKnopf = document.getElementById('fr-app-knopf');
    if (appKnopf) appKnopf.addEventListener('click', function () { zaehler.appKlick(); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var heute = heuteBerlin();
      var datum = pruefeDatum({
        tag: w.querySelector('.dw-d').value,
        monat: w.querySelector('.dw-m').value,
        jahr: w.querySelector('.dw-y').value
      }, heute);
      var gewaehlt = form.querySelector('input[name="kontingent"]:checked');

      zeigeFehler('fr-fehler-datum', datum.fehler);
      zeigeFehler('fr-fehler-kontingent', gewaehlt ? null : 'kontingent');
      w.querySelectorAll('.dw-d, .dw-m, .dw-y').forEach(function (feld) {
        feld.setAttribute('aria-invalid', datum.fehler ? 'true' : 'false');
      });

      ergebnis.innerHTML = '';
      ergebnis.hidden = true;
      if (datum.fehler) { w.querySelector('.dw-d').focus(); return; }
      if (!gewaehlt) { form.querySelector('input[name="kontingent"]').focus(); return; }

      var r = berechne(datum.datum, gewaehlt.value, heute);
      ergebnis.appendChild(karteBeduerfnis(r));
      ergebnis.appendChild(karteZehnJahre(r));
      ergebnis.appendChild(karteGrundkontingent(r));
      if (r.ueberkontingent) ergebnis.appendChild(karteUeberkontingent());
      ergebnis.hidden = false;
      zaehler.berechnung();
      ergebnis.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  init();
})();
