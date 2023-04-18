import axios from 'axios'
import { Chart, ChartType } from 'chart.js/auto';
// import { QueryGL, Area, DocumentType, ProcessType, PsrType } from "./entsoe/src/query";
import flatpickr from 'flatpickr';
import SunCalc from 'suncalc'
import { getMeteoMaticsData, getEntsoeData, getSimData, displayData, reFormatDates } from './MeteoMatics/helper'
import { RowData, ValueData, coordinatesData, datesData, dataSet } from './definitions/dataDefinitions'
import { QueryGL, Area, DocumentType, ProcessType, PsrType } from "./entsoe/src/query";

/////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////
// control block

const spinner = document.getElementById('spinner')
const main = document.getElementById('main')
main.style.display = 'none'

// the div is used to selectively display the control panel
const dash = document.getElementById('dash')
dash.style.display = "none";
// select Button between views
const btn = document.getElementById('selectMode')
var primaryConfig = true

btn.innerHTML = "Select scenario view"

btn.addEventListener('click', function selectMode() {
    if (primaryConfig) {
        primaryConfig = false
        btn.innerHTML = "Select Status view"
        dash.style.display = "block";
        displayData(dataSet, primaryConfig)
    } else { 
        primaryConfig = true
        btn.innerHTML = "Select scenario view"
        dash.style.display = "none";
        displayData(dataSet, primaryConfig)
    }
});


/////////////////////////////////////////////////////////////////////////
// Date preparation
var today = new Date()
var yesterday = today.setDate(today.getDate()-1);
// datepicker
const dateOfInterest = document.getElementById('dateOfInterest') as HTMLInputElement;
// default value
var datesBack = reFormatDates(yesterday)
//  datesback[0]   =>  April 17,2023 00:00:00
//  datesback[1]   =>  April 17,2023 24:00:00
//  datesback[2]   =>  Sun Apr 16 2023 00:00:00 GMT+0200 (Central European Summer Time)
//  datesback[3]   =>  Mon Apr 17 2023 00:00:00 GMT+0200 (Central European Summer Time)
//  datesback[4]   =>  2023-04-17
//  datesback[5]   =>  2023-04-17T00:00:00
var xStartTime = datesBack[0]
var xEndTime = datesBack[1]
var startTime = datesBack[2]
var endTime = datesBack[3]
console.log(' all possible date formats    :   ', datesBack)

dateOfInterest.value = datesBack[4].toString() 
// change handler
dateOfInterest.addEventListener('change', async function(){
    // console.log(dateOfInterest.value)
    // console.log(reFormatDates(dateOfInterest.value))
    datesBack = reFormatDates(dateOfInterest.value)
    console.log(' all possible date formats    :   ', datesBack)
    xStartTime = datesBack[0]
    xEndTime = datesBack[1]
    startTime = datesBack[2]
    endTime = datesBack[3]
    dataSet = await getData()
    displayData(dataSet, primaryConfig)
})



/////////////////////////////////////////////////////////////////////////
// get data
var meteoMaticsData:RowData = {}
var entsoeData:RowData[] = []
var dataSet:dataSet[] = []

let getData = async() => {

    dataSet = []
    // get Entsoe Data
    // console.log('Entsoedata startTime        ', startTime)
    var result = await getEntsoeData(startTime,endTime)
    console.log('Entsoedata         ', result[0], result[1], result[2], result[3], result[3].length)

    // get Meteomatics Data
    // console.log('MeteoMatics startTimex        ', xStartTime)
    // meteoMaticsData = await getMeteoMaticsData(datesBack[5])
    // console.log('data after API fetch      ',meteoMaticsData)

    // get simulated data
    const simulatedData = await getSimData()
    // console.log(simulatedData)

    // consolidate various sources into single formatted Data Set
    
    for (let idx = 0; idx < 24; idx++) {
        var dataObj = {
            'time': idx.toString(), 
            'forecast': 0, 
            'actual': result[3][0].values[idx].actual,
            'nuclear': result[3][4].values[idx].actual,
            'hydroReservoir': result[3][3].values[idx].actual,
            'hydroRiver': result[3][2].values[idx].actual,
            'hydroPumped': result[3][1].values[idx].actual,
            'cloudCover': 0,
            'windspeedMeteomatics': 0,//meteoMaticsData.data[0].coordinates[0].dates[idx].value,
            'windspeedWindfinder': 10 + Math.random()*100,
            'solarpower': result[3][5].values[idx].actual,
            'solarRadiation': 0,
            'solarpowerSim': 0,
            'windpower': 0,
            'windPowerSim': 0
            
        }
        dataSet.push(dataObj)
    }
    console.log('dataSet construction finished    ', dataSet)
    return dataSet
}

dataSet = await getData()
spinner.style.display = 'none'
main.style.display = 'flex'
displayData(dataSet, primaryConfig)








// side project with SunCalc
// I can get sunset and sunrise out of it
/* var times = SunCalc.getTimes(new Date(), 47.1, 7.0);

var sunrisePos = SunCalc.getPosition(times.sunrise, 47.1, 7.0);

console.log('get todays sunlight times for Chasseral', times)
console.log('get position of the sun (azimuth and altitude) at todays sunrise', sunrisePos)

// get sunrise azimuth in degrees
var sunriseAzimuth = sunrisePos.azimuth * 180 / Math.PI;

console.log('get sunrise azimuth in degrees', sunriseAzimuth)

const datum = new Date()
const latitude = 47.1
const longitude = 7.0
const height = 10
var x = SunCalc.getTimes(datum,latitude,longitude,height)
console.log('Sunlight times', x)
 */

