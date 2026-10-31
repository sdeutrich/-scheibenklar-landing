# Fristenrechner – sichtbare Texte (FREIGABEFASSUNG v2)

Stand: 31.10.2026 · Rechtsprüfung gegen § 4 Abs. 4, § 14 Abs. 2–6, § 58 Abs. 21 WaffG
(Fassung abgerufen am 31.10.2026, gesetze-im-internet.de / buzer.de).
Anrede „Sie“. Platzhalter: {datum}, {tage}, {jahre}.
Keine anwaltliche Prüfung – Orientierung, keine Rechtsberatung.
Freigegeben von Sebastian am 31.10.2026.

Kennzeichnung je Text: [G] = direkt aus dem Gesetzestext · [P] = Behördenpraxis,
als „voraussichtlich“ formuliert · [UI] = reiner Bedienungstext.

## 1. Seitenkopf

Meta-Titel [UI]
> Fristenrechner WBK: Nächste Bedürfnisprüfung | scheibenklar

Meta-Beschreibung [UI]
> Wann prüft die Waffenbehörde Ihr Bedürfnis? Kostenlos berechnen – mit 4/6-Regel und 10-Jahres-Regel nach § 14 WaffG. Ohne Anmeldung, ohne Speichern.

Eyebrow [UI]
> § 14 WaffG · Sportschützen · ohne Anmeldung

H1 [UI]
> Fristenrechner für Sportschützen

Einleitung [UI]
> Geben Sie das Datum Ihrer ersten Waffeneintragung als Sportschütze ein. Der Rechner zeigt, wann die Waffenbehörde Ihr Bedürfnis voraussichtlich prüft und welche Nachweise dann gelten. Die Berechnung läuft nur in Ihrem Browser – nichts wird übertragen oder gespeichert.

Geltungsbereich [G]
> Gilt für Sportschützen nach § 14 WaffG (grüne WBK als Sportschütze, gelbe WBK). Nicht für Jäger und nicht für Erlaubnisse mit anderem Bedürfnis.

## 2. Formular

Feld 1 – Beschriftung [G]
> Erste Waffeneintragung als Sportschütze

Feld 1 – Hilfetext [G]
> Datum, an dem die erste Schusswaffe in Ihre WBK eingetragen wurde, oder – falls früher – die erste Ausstellung einer Munitionserwerbserlaubnis. Hatten Sie schon vorher eine WBK aus anderem Grund (z. B. als Jäger oder Erbe), kann ein früheres Datum gelten; das klärt Ihre Waffenbehörde.

Feld 2 – Beschriftung [G]
> Ihre Waffen liegen …

Feld 2 – Optionen
> ◯ im Grundkontingent
> ◯ (auch) über dem Grundkontingent

Feld 2 – Hilfetext [G]
> Grundkontingent: bis zu drei halbautomatische Langwaffen und bis zu zwei mehrschüssige Kurzwaffen für Patronenmunition. Waffen auf der gelben WBK zählen nicht dazu. Im Zweifel steht es in Ihrem Erlaubnisbescheid.

Datumswidget [UI] (wie dw-widget.js, kein input type="date")
> „TT“ · Auswahl „Monat“ · „JJJJ“

Knopf [UI]
> Fristen berechnen

## 3. Fehlermeldungen [UI]

| Fall | Text |
|---|---|
| Feld 1 leer oder unvollständig | Bitte geben Sie das Datum vollständig ein (Tag, Monat, Jahr). |
| Datum ungültig (z. B. 31.02.) | Dieses Datum gibt es nicht. Bitte prüfen Sie Tag und Monat. |
| Datum in der Zukunft | Das Datum liegt in der Zukunft. Bitte geben Sie ein vergangenes Datum ein. |
| Jahr vor 1972 oder außerhalb des Widgets | Bitte geben Sie ein Jahr zwischen 1972 und heute ein. |
| Feld 2 nicht gewählt | Bitte wählen Sie Grund- oder Überkontingent. |

(Interne Notiz, nicht auf die Seite: 1972 = Inkrafttreten des Bundeswaffengesetzes.)

## 4. Ergebnis

### 4.1 Bedürfnisprüfung durch die Behörde

Titel [G]
> Nächste Bedürfnisprüfung

Rechtsgrundlage [G]
> § 4 Abs. 4 WaffG · die Behörde prüft alle fünf Jahre

Datum [P]
> Voraussichtlich ab **{datum}** ({jahre} Jahre nach Ihrer ersten Eintragung)

Restzeit [UI]
> noch {tage} Tage

Erläuterung [P]
> Den genauen Zeitpunkt bestimmt Ihre Waffenbehörde. Sie fordert Sie schriftlich auf. Ohne Aufforderung müssen Sie nichts einreichen.

Was ist zu tun? – Variante vor Ablauf von 10 Jahren [G]
> Halten Sie Ihr Schießbuch für die letzten 24 Monate bereit. Damit erhalten Sie von Ihrem Schießsportverband (oder dem zuständigen Landes- bzw. Teilverband) die Bescheinigung, die Sie der Behörde vorlegen.

Was ist zu tun? – Variante nach Ablauf von 10 Jahren [G]
> Sie brauchen nur eine Bescheinigung Ihres Schießsportvereins über die Mitgliedschaft.

Bei Versäumnis [G]
> Fehlt der Nachweis, kann die Behörde die Erlaubnis widerrufen. Bei nur vorübergehendem Wegfall – etwa durch Krankheit – kann sie davon absehen; sprechen Sie die Behörde frühzeitig an.

### 4.2 10-Jahres-Regel

Fall: noch nicht erreicht [G]
> 10-Jahres-Regel ab **{datum}**
> Ab dann genügt für das Fortbestehen des Bedürfnisses die Mitgliedschaft in einem Schießsportverein. Nachweis bei den Folgeprüfungen: Bescheinigung Ihres Vereins.

Fall: erreicht [G]
> ✓ Seit Ihrer ersten Eintragung sind zehn Jahre vergangen. Für das Fortbestehen des Bedürfnisses genügt die Mitgliedschaft in einem Schießsportverein (§ 14 Abs. 4 Satz 3 WaffG). Bei Prüfungen legen Sie eine Mitgliedsbescheinigung Ihres Vereins vor.

Immer anzeigen [G]
> Voraussetzung bleibt die Mitgliedschaft in einem Verein, der einem anerkannten Schießsportverband angehört. Treten Sie aus, entfällt das Bedürfnis.

### 4.3 Grundkontingent – Schießnachweis (nur vor Ablauf von 10 Jahren)

Titel [G]
> Schießnachweis für die Prüfung

Regel [G]
> In den 24 Monaten vor der Prüfung mit einer eigenen erlaubnispflichtigen Waffe im Verein geschossen:
> • mindestens einmal alle drei Monate **oder**
> • mindestens sechsmal in jedem der beiden 12-Monats-Zeiträume.

Kurz- und Langwaffen [G]
> Besitzen Sie Kurz- und Langwaffen, brauchen Sie den Nachweis für beide Kategorien.

Tipp [UI]
> Tragen Sie jeden Termin sofort ins Schießbuch ein – nachträglich lassen sich Lücken kaum schließen.

Fall: 10 Jahre erreicht [G]
> ✓ Für Waffen im Grundkontingent ist kein Schießnachweis mehr nötig – die Vereinsmitgliedschaft genügt.

### 4.4 Überkontingent

Titel [G]
> Wettkampfnachweis (Überkontingent)

Regel [G]
> Für Waffen über dem Grundkontingent verlangt das Gesetz, dass Sie regelmäßig an Schießsportwettkämpfen teilgenommen haben. Wie oft, legen Ihr Verband und Ihre Behörde fest – viele gehen von mindestens einem Wettkampf pro Jahr aus.

Hinweis 10 Jahre [P]
> Ob die 10-Jahres-Regel auch für Waffen im Überkontingent gilt, handhaben Behörden unterschiedlich. Sammeln Sie Ihre Wettkampfnachweise deshalb weiter.

Zusatz [UI]
> Für Ihre übrigen Waffen im Grundkontingent gelten zusätzlich die Regeln oben.

## 5. Haftungs- und Datenschutzhinweis

Haftung [UI]
> Keine Rechtsberatung. Der Rechner gibt eine unverbindliche Orientierung auf Grundlage Ihrer Angaben und des Waffengesetzes (Stand 31.10.2026). Maßgeblich sind die Anforderungen Ihrer Waffenbehörde und Ihres Schießsportverbands.

Datenschutz [UI]
> Ihre Eingaben bleiben in diesem Browserfenster. Keine Anmeldung, keine Cookies, keine Speicherung.

## 6. App-Knopf

Einleitung [UI]
> Fristen dauerhaft im Blick: Die scheibenklar-App erinnert Sie an Ihre WBK-Fristen und zählt Ihre Schießbuch-Termine für den Nachweis automatisch.

Knopf [UI]
> Fristen in der App verwalten – kostenlos

Ziel
> https://scheibenklar.vercel.app/?src=rechner (neuer Tab, rel="noopener")

Kleingedruckt [UI]
> Fristen-Tracker kostenlos für eine WBK. Ihre Daten bleiben auf Ihrem Gerät.

## Entscheidungsprotokoll (31.10.2026) – nicht auf die Seite

| Punkt | Entscheidung |
|---|---|
| Designsystem | dunkler Landing-Look, ohne Canvas-Mauszeiger |
| Feld „letzte Prüfung“ | gestrichen |
| Grundkontingent-Hilfetext | eine Fassung (oben), gelbe WBK zählt nicht |
| Fortschreibung | ja, 5-Jahres-Schritte, „voraussichtlich“; kein Text „Fällig seit“ |
| Kurz/Lang | keine Abfrage, Hinweis „beide Kategorien“ |
| Überkontingent | „regelmäßig“ führend, kein festes „jährlich“ |
| Stichtag 10 Jahre | ab Tag nach dem Jahrestag (§§ 187, 188 BGB) |
| 29.02. | Frist endet 28.02., Vereinfachung ab 01.03. |
| Haftung | eine Fassung (oben) |
