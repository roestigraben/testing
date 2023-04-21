// import axios from 'axios'
import { Chart, ChartType } from 'chart.js/auto';
// import { QueryGL, Area, DocumentType, ProcessType, PsrType } from "./entsoe/src/query";
// import flatpickr from 'flatpickr';
// import SunCalc from 'suncalc'
import { getMeteoMaticsData, getEntsoeData, getSimData, displayData, reFormatDates, calculateSolar, calculateWind, config100, config2} from './MeteoMatics/helper'
import { RowData, ValueData, coordinatesData, datesData, dataSet } from './definitions/dataDefinitions'
// import { QueryGL, Area, DocumentType, ProcessType, PsrType } from "./entsoe/src/query";

/////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////
// control block

// spinner
const spinner = document.getElementById('spinner')
const main = document.getElementById('main')
main.style.display = 'none'

// div used to selectively display the scenario view
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
        //config100.data.datasets[0].hidden = true
        //config100.data.datasets[1].hidden = true
        config100.data.datasets[2].hidden = true
        config100.data.datasets[3].hidden = true
        config100.data.datasets[4].hidden = true
        config100.data.datasets[5].hidden = true

        // config100.data.datasets[6].hidden = false
        config100.data.datasets[7].hidden = false
        config100.data.datasets[8].hidden = false
        config100.data.datasets[9].hidden = false
        config100.data.datasets[10].hidden = false
        config100.data.datasets[11].hidden = false

        recalculateDerivedData(dataSet)
        meteoMatics.update()
    } else { 
        primaryConfig = true
        btn.innerHTML = "Select scenario view"
        dash.style.display = "none";

        //config100.data.datasets[0].hidden = false
        //config100.data.datasets[1].hidden = false
        config100.data.datasets[2].hidden = false
        config100.data.datasets[3].hidden = false
        config100.data.datasets[4].hidden = false
        config100.data.datasets[5].hidden = false
        

        meteoMatics.data.datasets[6].hidden = true
        config100.data.datasets[7].hidden = true
        config100.data.datasets[8].hidden = true
        config100.data.datasets[9].hidden = true
        config100.data.datasets[10].hidden = true
        config100.data.datasets[11].hidden = true

        

        recalculateDerivedData(dataSet)
        meteoMatics.update()  
    }
});

// scenario input fields
// Default settings
var panelCountValue:number = 900000 // in units
var panelPowerValue:number = 500  // in Watts
var conversionFactor = 0.00001 // solar power from W to MW
var turbineCountValue:number = 5000 // in units
var turbineTypeValue = 'vestasV40' // type of turbine
var conversionFactorTurbines = 0.001 
var updateDisplayOnly = false  // variable to avoid deletion of Chart Object each time an imput is changed


var solarpower: number[] = Array(24).fill(0)
var windpower: number[] = Array(24).fill(0)
var windSpeed: number[] = Array(24).fill(0)
var diffNuclearRenewablePos: number[] = Array(24).fill(0)
var diffNuclearRenewableNeg: number[] = Array(24).fill(0)
var base: number[] = Array(24).fill(0)

// dashboard controls
const turbineCount = document.getElementById('turbineCount') as HTMLInputElement;
turbineCount.value = turbineCountValue.toString()
const turbineType = document.getElementById('turbineType') as HTMLInputElement;
turbineType.value = turbineTypeValue
const panelCount = document.getElementById('panelCount') as HTMLInputElement;
panelCount.value = panelCountValue.toString()
const panelPower = document.getElementById('panelPower') as HTMLInputElement;
panelPower.value = panelPowerValue.toString()
const winspeedCheckBox = document.getElementById('checkBoxWindspeed') as HTMLInputElement;
winspeedCheckBox.checked = false
const cloudCoverCheckBox = document.getElementById('checkBoxCloudCover') as HTMLInputElement;
cloudCoverCheckBox.checked = false
const sunPositionCheckBox = document.getElementById('checkBoxSunPosition') as HTMLInputElement;
sunPositionCheckBox.checked = false

// Input Handlers
const inputHandlerCount = async function(e:any) {
    panelCountValue = parseInt(e.target.value);
    console.log('number of panels  : ', panelCountValue)
    config100.options.animation = true

    recalculateDerivedData(dataSet)
    meteoMatics.update()
    config100.options.animation = false
}
const inputHandlerPower = async function(e:any) {
    panelPowerValue = parseInt(e.target.value)
    console.log('power :  ', panelPowerValue)  
    config100.options.animation = true

    recalculateDerivedData(dataSet)
    meteoMatics.update()
    config100.options.animation = false
}
const inputHandlerTurbine = async function(e:any) {
    turbineCountValue = e.target.value
    console.log('number of turbines :  ', turbineCountValue); 
    config100.options.animation = true

    recalculateDerivedData(dataSet)
    meteoMatics.update()
    config100.options.animation = false
}
const inputHandlerTurbineType = async function(e:any) {
    turbineTypeValue = e.target.value
    console.log('type of turbines :  ', turbineTypeValue);
    config100.options.animation = true
    recalculateDerivedData(dataSet)
    meteoMatics.update()
    config100.options.animation = false
}
const inputHandlerWindspeed = function(e:any) {
    console.log('winspeed :  ', e.target.checked);
    // simmulate radio button functionality by disabling all other checkboxes
    if (e.target.checked === true) {
        config100.options.scales.auxiliary.title.text = 'windspeed [m/s]';
        config100.options.scales.auxiliary.display = true
        config100.data.datasets[6].parsing.yAxisKey =  'windspeed'
       config100.data.datasets[6].hidden = false 
        // winspeedScale = true
    } else {
        config100.options.scales.auxiliary.display = false
        config100.data.datasets[6].hidden = true

        // winspeedScale = false
    } 
    meteoMatics.update()
    cloudCoverCheckBox.checked = false
    sunPositionCheckBox.checked = false 
}
const inputHandlerCloudCover = function(e:any) {
    winspeedCheckBox.checked = false
    sunPositionCheckBox.checked = false
    console.log('cloud cover :  ', e.target.checked);
}
const inputHandlerSunPosition = function(e:any) {
    cloudCoverCheckBox.checked = false
    winspeedCheckBox.checked = false
    console.log('cloud cover :  ', e.target.checked);
}

panelCount.addEventListener('input', inputHandlerCount);
panelPower.addEventListener('input', inputHandlerPower);
turbineCount.addEventListener('input', inputHandlerTurbine);
turbineType.addEventListener('input', inputHandlerTurbineType);
winspeedCheckBox.addEventListener('input', inputHandlerWindspeed);
cloudCoverCheckBox.addEventListener('input', inputHandlerCloudCover);
sunPositionCheckBox.addEventListener('input', inputHandlerSunPosition);




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
    spinner.style.display = 'flex'
    main.style.display = 'none'
    // console.log(dateOfInterest.value)
    // console.log(reFormatDates(dateOfInterest.value))
    datesBack = reFormatDates(dateOfInterest.value)
    // console.log(' all possible date formats    :   ', datesBack)
    xStartTime = datesBack[0]
    xEndTime = datesBack[1]
    startTime = datesBack[2]
    endTime = datesBack[3]


    dataSet = await getData()

    spinner.style.display = 'none'
    main.style.display = 'flex'
    
    // meteoMatics.update()
    displayData(dataSet, primaryConfig)
})



/////////////////////////////////////////////////////////////////////////
// get data
var meteoMaticsData:RowData = {}
var entsoeData:RowData[] = []
var dataSet:dataSet[] = []
var pretty = document.getElementById('pretty')


let getData = async() => {

    var localStoreData = JSON.parse(localStorage.getItem(datesBack[4].toString()))
             
    
    if (!localStoreData) {

        dataSet = []
        // get Entsoe Data
        // console.log('Entsoedata startTime        ', startTime)
        console.log('fetch started')
        var result = await getEntsoeData(startTime,endTime)
        // console.log('Entsoedata         ', result[0], result[1], result[2], result[3], result[3].length)
        console.log('fetch completed')

        // get Meteomatics Data
        // console.log('MeteoMatics startTimex        ', xStartTime)
    /////// meteoMaticsData = await getMeteoMaticsData(datesBack[5])
        // console.log('data after API fetch      ',meteoMaticsData)

        // get simulated data
        // var sim = await getSimData(result[3][4].values, solarpower, windpower)
        // console.log(sim)
    /* meteoMaticsData.data[0].coordinates[0].dates.forEach((item,idx) => {
    windSpeed[idx] = item.value
    }) */
        // get solar power and win power
        solarpower =  await calculateSolar(panelCountValue, panelPowerValue, conversionFactor)
        windpower =  await calculateWind(turbineCountValue, turbineTypeValue, windSpeed)

        diffNuclearRenewablePos.forEach((item,idx) => {
            var renewable = Math.round(solarpower[idx] + windpower[idx])

            if(renewable < result[3][4].values[idx].actual) {
                base[idx] = renewable
                diffNuclearRenewablePos[idx] = 0
                diffNuclearRenewableNeg[idx] = result[3][4].values[idx].actual - renewable
              
            } else {
                base[idx] = result[3][4].values[idx].actual
                diffNuclearRenewablePos[idx] = renewable - result[3][4].values[idx].actual
                diffNuclearRenewableNeg[idx] = 0
               
            }
        })
       
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
                'windspeedMeteomatics': windSpeed[idx], //meteoMaticsData.data[0].coordinates[0].dates[idx].value,
                'windspeedWindfinder': 10 + Math.random()*100,
                'solarpower': result[3][5].values[idx].actual,
                'solarRadiation': 0,
                'solarpowerSim': solarpower[idx],
                'windpower': 0,
                'windPowerSim': windpower[idx],
                'diffNuclearRenewablePos': diffNuclearRenewablePos[idx], //(solarpower[idx] +  windpower[idx]) - result[3][4].values[idx].actual, //diffNuclearRenewable[idx]
                'diffNuclearRenewableNeg': diffNuclearRenewableNeg[idx],
                'base': base[idx]
            }
            dataSet.push(dataObj)
        }
        console.log('dataSet construction finished    ', dataSet)
        localStorage.setItem(datesBack[4].toString(), JSON.stringify(dataSet))
        
        return dataSet
    } else {
        // var z = document.getElementById('localStore')
        // z.innerHTML = localStorage.getItem('2023-04-19')
       return localStoreData 
    }
}

var result = document.getElementById('result')
var diffNuclearRenewable = 0
var diffNuclearRenewableAccrued = 0
var renewableAccrued = 0
var nuclearAccrued = 0

var solarbase: number[] = [0,0,0,0,0,0,0,0,15,35,45,52,55,57,55,52,45,35,15,0,0,0,0,0]
var powerCurve = [0,0,0,0,21.5,65.3,120,188,268,365,440,510,556,582,594,598,600,600,600,600,600,600,600,600,600,0,0,0,0,0,0]
var powerCurveV100 = [0,0,0,10,60,240,450,900,1100,1500,1750,1800,1800,1800,1800,1800,1800,1800,1800,1800,1800,0,0,0,0,0,0,0,0,0,0]

function recalculateDerivedData(dataSet:any) {
    diffNuclearRenewableAccrued = 0
    // console.log(dataSet)
    // console.log( panelCountValue, panelPowerValue)
    dataSet.forEach((line:any, idx:any) => {
        
        line.solarpowerSim = Math.round(panelCountValue * panelPowerValue * (0.8 + 0.2 * ((1 - line.cloudCover /100))) * solarbase[idx]/100 * conversionFactor)
        // console.log(panelCountValue, panelPowerValue, line.cloudCover, solarbase[idx], conversionFactor, line.solarpowerSim)
        // line.solar = line.solarpower
        var roundedWindSpeed = Math.round(line.windspeedMeteomatics)
        // console.log(roundedWindSpeed, powerCurve[roundedWindSpeed], powerCurveV100[roundedWindSpeed], turbineCountValue, conversionFactorTurbines)
        if( turbineTypeValue === 'vestasV40') {
            line.windPowerSim = powerCurve[roundedWindSpeed] * turbineCountValue * conversionFactorTurbines
        } else {
            line.windPowerSim = powerCurveV100[roundedWindSpeed] * turbineCountValue * conversionFactorTurbines
        }
        
        var renewable = Math.round(line.solarpowerSim + line.windPowerSim)
        // console.log(renewable)
        if(renewable < line.nuclear) {
            line.base = renewable
            line.diffNuclearRenewableNeg = line.nuclear - renewable
            line.diffNuclearRenewablePos = 0
        } else {
            line.base = line.nuclear
            line.diffNuclearRenewableNeg = 0
            line.diffNuclearRenewablePos = renewable - line.nuclear
        } 
            
        line.windspeed = line.windSpeedMeteomatics

        renewableAccrued = renewableAccrued + renewable
        nuclearAccrued = nuclearAccrued + line.nuclear
        diffNuclearRenewable = - line.nuclear + renewable
        diffNuclearRenewableAccrued = diffNuclearRenewableAccrued + diffNuclearRenewable
            
    })

    // side stuff
    let x = diffNuclearRenewableAccrued.toLocaleString("de-CH", );
    if (diffNuclearRenewableAccrued < 0) {
        result!.style.color = 'red'
    } else {
        result!.style.color = 'green'
    }
    result!.innerHTML = x + ' TWh'

}

//////////////////////////////////////////////////////////////////////
// get the data
dataSet = await getData()

///////////////////////////////////////////////////////////////////////
// calculate derived Data
recalculateDerivedData(dataSet)
// pretty.innerHTML = JSON.stringify(dataSet , undefined, 2)

spinner.style.display = 'none'
main.style.display = 'flex'
console.log(dataSet)


config100.data.labels = dataSet.map(row => row.time)

config100.data.datasets[6].hidden = true
config100.data.datasets[7].hidden = true
config100.data.datasets[8].hidden = true
config100.data.datasets[9].hidden = true
config100.data.datasets[10].hidden = true
config100.data.datasets[11].hidden = true

config100.data.datasets.forEach(set => {
    set.data = dataSet
})
   
const meteoMatics = new Chart('meteoMatics', primaryConfig ? config100 : config2)
meteoMatics.update()

// displayData(dataSet, primaryConfig)








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

