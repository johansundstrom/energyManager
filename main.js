/**
 *
 * energymanager adapter
 *
 */

'use strict';

let request = require('request');
let nameTranslation;
let valTagLang;

const kwRounding = true
const host = '192.168.250.39'

main()
//console.log(translateName("round values"))


//fungerar men byter inte språk automatiskt
function translateName(strName) {
    nameTranslation = require(__dirname + '/lang/i18n/en/translations.json')
    //nameTranslation = require('./lang/i18n/en/translations.json')
    if (nameTranslation[strName]) {
        return nameTranslation[strName];
    } else {
        return strName;
    }
}



function getManagerValues() {
    request(
        {
            url: "http://" + host + "/rest/kiwigrid/wizard/devices",
            json: true
        },
        function (error, response, content) {
            if (!error && response.statusCode == 200) {

                for (let i in content.result.items) {

                    for (let j in content.result.items[i].tagValues) {

                        let valValue = content.result.items[i].tagValues[j].value;
                        valTagLang = translateName(content.result.items[i].tagValues[j].tagName);
                        let valType = typeof valValue;
                        let valTag = content.result.items[i].tagValues[j].tagName;
                        let strGroup;
                        let valUnit;

                        switch (valType) {
                            case "boolean":
                                var valRole = 'indicator.working';  //lustigt rollnamn?
                                break;

                            case "number":
                                if (valTag.search('Date') > -1) {   //underligt sätt att kolla om finns
                                    var valRole = 'value.time';
                                    valValue = new Date(valValue);
                                    valValue = valValue.getTime();
                                    break;
                                }

                                if (valTag.search('StateOfCharge') == 0) {
                                    var valRole = 'value.battery';
                                    break;
                                }
                                if (valTag.search('PowerConsum') == 0 || valTag.search('Work') == 0) {
                                    var valRole = 'value.power.consumption';
                                    break;
                                }
                                if (valTag.search('Temperature') == 0) {
                                    var valRole = 'value.temperature';
                                    break;
                                }
                                if (valTag.search('Min') > -1 && valTag.search('Minute') == -1) {
                                    var valRole = 'value.min';
                                    break;
                                }
                                if (valTag.search('Max') > -1) {
                                    var valRole = 'value.max';
                                    break;
                                }
                                var valRole = 'value';
                                break;

                            case "string":
                                var valRole = 'text';
                                break;

                            default:
                                var valRole = 'state';
                                break;
                        }

                        // hantera enheter
                        if (valTag.search('Work') == 0) {
                            if (!kwRounding) {
                                valUnit = 'Wh';
                            } else {
                                valValue = valValue / 1000;
                                valUnit = 'kWh';
                            }
                        } else if (valTag.search('Temperature') == 0) {
                            valUnit = '°C';
                        } else if (valTag.search('Price') == 0) {
                            valUnit = 'ct/kWh';
                        } else if (valTag.search('Degree') == 0) {
                            valUnit = '°';
                        } else if (valTag.search('Voltage') == 0) {
                            valUnit = 'V';
                        } else if (valTag.search('StateOf') == 0) {
                            valUnit = '%';
                        } else if (valTag.search('Resistance') == 0) {
                            valUnit = 'Ohm';
                        } else if (valTag.search('Power') == 0) {
                            if ("managerRounding" == "no") {
                                valUnit = 'W';
                            } else {
                                valValue = valValue / 1000;
                                valUnit = 'kW';
                            }
                        } else {
                            valUnit = '';   //skiter i vad det är för enhet
                        }

                        if (valType == "number" && valTag.search('Date') == -1) {
                            valValue = Math.round(valValue * 100) / 100;
                        }

                        if (valValue != null && content.result.items[i].tagValues.IdName.value != null) {
                            let IDNameClear = content.result.items[i].tagValues.IdName.value
                            IDNameClear = IDNameClear
                                .replace(/[ ]+/g, "_")           //ersätt space med _
                                .replace(/[\.]+/g, "")           //ersätt . med ""
                                .replace(/[\u00df]+/, "SS");     //tyska dubbel-s
                            if (content.result.items[i].deviceModel[1] !== undefined) {
                                switch (content.result.items[i].deviceModel[1].deviceClass) {
                                    case "com.kiwigrid.devices.inverter.Inverter":
                                    case "com.kiwigrid.devices.powermeter.PowerMeter":
                                        strGroup = translateName(content.result.items[i].deviceModel[2].deviceClass.split(".").pop()) + "_(" + IDNameClear + ")"; // Alla som börjar på "MyReserve" och "batteri"
                                        break;

                                    case "com.kiwigrid.devices.location.Location":
                                    case "com.kiwigrid.devices.pvplant.PVPlant":
                                        strGroup = translateName(content.result.items[i].deviceModel[1].deviceClass.split(".").pop()) + "_(" + IDNameClear + ")";  //Börjar med "plats" och "pv-anläggning"
                                        break;

                                    default:
                                        strGroup = translateName(content.result.items[i].deviceModel[1].deviceClass.split(".").pop());
                                        break;
                                }
                            }
                        }
                        console.log('***** ' + strGroup + ' - ' + valRole + ' - ' + valTagLang + ': ' + valValue + ' ' + valUnit + ' [' + valType + ']')

                        if (valValue != null && valType != 'object' && strGroup != '' && strGroup != undefined) {
                            console.log(strGroup,valTag,valTagLang,valType,valUnit,valRole,valValue);
                        } else if (valValue != null && valType == 'object' && valTag == 'WeatherForecast') {
                            for (var location in valValue) {
                                var jsonObject = JSON.parse(valValue[location]);
                        
                                for ( var day in jsonObject.hourly) {

                                  for (var hour in jsonObject.hourly[day]) {
                                    var datum = new Date(jsonObject.hourly[day][hour].time*1000);
                                    var localOffset = (-1) * datum.getTimezoneOffset() * 60000;
                                    var stamp = new Date((jsonObject.hourly[day][hour].time*1000 + localOffset));
                                    console.log('#####' + stamp)
                                    console.log('väder ' + strGroup+"." + translateName('WeatherForecast') + "." + location + "." + day + "." + hour, 'cloudCover' ,translateName('cloudCover'), 'number','','value',jsonObject.hourly[day][hour].cloudCover);
                                    console.log('väder ' + strGroup+"." + translateName('WeatherForecast') + "." + location + "." + day + "." + hour, 'temperature' ,translateName('temperature'), 'number','°C','value.temperature',jsonObject.hourly[day][hour].temperature);
                                    console.log('väder ' + strGroup+"." + translateName('WeatherForecast') + "." + location + "." + day + "." + hour, 'date' ,translateName('date'), 'text','','value.date',stamp);
                                  }
                                }
                            }
                        }
                    }
                }

            } else {
                adapter.log.error(error);
            }
        }

    )
}


function main() {
    console.log(getManagerValues());
    //managerIntervall = setInterval(getManagerValues, 5000);
}

