/* ══════════════════════════════════════════════════════════
   dw-widget — gemeinsames Drei-Felder-Datumswidget (Tag/Monat/Jahr)
   für alle Module. Erwartet je Feld: <span id="{id}-w" class="dw">
   mit .dw-d (Freitext-Tag), .dw-m (Monat-Select), .dw-y (Freitext-Jahr)
   sowie ein <input type="hidden" id="{id}"> zur Ablage des ISO-Datums
   (JJJJ-MM-TT). Synchronisiert wird zentral per Delegation (siehe unten),
   die Widgets brauchen keine Inline-Handler.
══════════════════════════════════════════════════════════ */

function dwSync(id){var w=document.getElementById(id+'-w');var d=parseInt(w.querySelector('.dw-d').value)||0,m=parseInt(w.querySelector('.dw-m').value)||0,y=parseInt(w.querySelector('.dw-y').value)||0,hi=document.getElementById(id);if(d>=1&&d<=31&&m>=1&&m<=12&&y>=1900&&y<=2099){var dt=new Date(y,m-1,d);if(dt.getFullYear()===y&&dt.getMonth()===m-1&&dt.getDate()===d){hi.value=y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0');return;}}hi.value='';}
/* Zentrale Synchronisation für jedes .dw mit id="{id}-w" – auch für später
   per innerHTML erzeugte Widgets. Capture-Phase: das versteckte ISO-Feld ist
   aktuell, bevor seiteneigene input/change-Listener laufen. */
(function(){
  function dwDelegation(e){
    var w = e.target && e.target.closest ? e.target.closest('.dw') : null;
    if(!w || !w.id || w.id.slice(-2) !== '-w') return;
    var id = w.id.slice(0, -2);
    if(document.getElementById(id)) dwSync(id);
  }
  document.addEventListener('input', dwDelegation, true);
  document.addEventListener('change', dwDelegation, true);
})();
function dwSet(id,iso){var hi=document.getElementById(id);if(!hi)return;hi.value=iso||'';var w=document.getElementById(id+'-w');if(!w)return;if(!iso){w.querySelector('.dw-d').value='';w.querySelector('.dw-m').value='';w.querySelector('.dw-y').value='';return;}var p=iso.split('-');if(p.length===3){w.querySelector('.dw-y').value=p[0];w.querySelector('.dw-m').value=String(parseInt(p[1]));w.querySelector('.dw-d').value=String(parseInt(p[2]));}}
