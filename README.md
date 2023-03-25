# Kiwigrid/Solarwatt

API till MyReserve Energymanager finns under http:// + lan-ip + /rest/kiwigrid/wizard/devices. Resultatet kommer i form av JSON. Denna går att läsa med hög kontinuitet. Innehållet ser ut så här...

```
result.items[i].tagValues[j].value;
```

## Anledning

Orsaken till denna kod är att ordningen i JSON-filen ständigt ändras. Att läsa ut t.ex. 5:e item i ordningen (enligt nedanstående exempel) för att nå specifikt värde går ej. Förutom detta finns en mängd oönskad data. 

```
result.items[5].tagValues[j].value;
```

Lösningen är att iterera genom samtliga tagNames samt dessas values. Samtidigt blir det då möjligt att översätta och snygga upp tagNames från  t.ex. obegriplighet och camel case.

```getManagerValues()```

Läser inte bara värden utan tolkar dessa 

## funktioner

```main() //startar```

```getManagerValues() //Anropar och hämtar utvalda värden```

```translateName() //i18n översättning (https://developer.mozilla.org/en-US/docs/mozilla/add-ons/webextensions/api/i18n)
