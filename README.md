# Kiwigrid/Solarwatt

API till MyReserve Energymanager finns under http:// + ip + /rest/kiwigrid/wizard/devices. Resultatet kommer i form av JSON. Denna går att läsa med hög kontinuitet. Innehållet ser ut så här...

```
result.items[i].tagValues[j].value;
```

Orsaken till denna kod är att ordningen i JSON-filen ständigt ändras. Att läsa ut t.ex. 5:e item i ordningen (enligt nedanstående exempel) för att nå specifikt värde går ej. Förutom detta finns en mängd oönskad data. 

```
result.items[5].tagValues[j].value;
```

Lösningen är att iterera genom samtliga tagNames samt dessas value. Samtidigt blir det då möjligt att översätta och snygga upp tagNames från  t.ex. obegriplighet och camel case.

```getManagerValues()```

Läser inte bara värden utan tolkar dessa 