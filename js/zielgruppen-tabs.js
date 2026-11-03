/* Zielgruppen-Umschalter „Für Schützen" / „Für Vereine".
   Ohne JavaScript bleiben beide Panels sichtbar und die Reiterleiste versteckt;
   erst dieses Skript zeigt die Reiter und blendet das inaktive Panel aus. */
(function () {
  var liste = document.querySelector('.zg-tabs');
  if (!liste) return;
  var reiter = Array.prototype.slice.call(liste.querySelectorAll('[role="tab"]'));

  function aktiviere(aktiv, fokus) {
    reiter.forEach(function (tab) {
      var istAktiv = tab === aktiv;
      tab.setAttribute('aria-selected', istAktiv ? 'true' : 'false');
      if (istAktiv) tab.removeAttribute('tabindex');
      else tab.setAttribute('tabindex', '-1');
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !istAktiv;
    });
    if (fokus) aktiv.focus();
  }

  reiter.forEach(function (tab, i) {
    tab.addEventListener('click', function () { aktiviere(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var ziel = null;
      if (e.key === 'ArrowRight') ziel = reiter[(i + 1) % reiter.length];
      else if (e.key === 'ArrowLeft') ziel = reiter[(i - 1 + reiter.length) % reiter.length];
      else if (e.key === 'Home') ziel = reiter[0];
      else if (e.key === 'End') ziel = reiter[reiter.length - 1];
      if (!ziel) return;
      e.preventDefault();
      aktiviere(ziel, true);
    });
  });

  liste.hidden = false;
  aktiviere(reiter[0], false);
})();
