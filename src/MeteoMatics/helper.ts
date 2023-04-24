import { Chart, ChartType } from 'chart.js/auto';
import { RowData, ValueData, coordinatesData, datesData, EData } from '../definitions/dataDefinitions'
import { QueryGL, Area, DocumentType, ProcessType, PsrType } from "../entsoe/src/query";

var entsoeData:EData[] = []
export async function getEntsoeData(startTime, endTime): Promise<any> {
    // console.log(startTime, endTime)
    const resultTotalLoad = await QueryGL('102f171b-9352-466b-9e71-5783f324afb5',{
        documentType: DocumentType("System total load"),        // A71 - Generation forecast
        processType: ProcessType("Realised"),         // A01 - Day ahead
        outDomain: Area("Switzerland (CH)"),   
        outBiddingZoneDomain: Area("BZN|CH"),
        startDateTime: startTime, // Start date
        endDateTime: endTime, // End date   
    })

    var label = resultTotalLoad[0].documentTypeDescription + ' ' + resultTotalLoad[0].processTypeDescription

    entsoeData = []
    resultTotalLoad[0].timeseries.forEach((item, idx) => {
        let obj = { label : item.mktPsrTypeDescription }
        //  console.log(x.push(obj))
    
        // console.log(idx, '      ', item.mktPsrTypeDescription)
        item.periods.forEach((item1, idx) => {
            // console.log('      ', idx, '      ', item.points)
            let y = []
            item1.points.forEach(point => {
                // console.log('position : ', point.position, 'quantity : ', point.quantity)
                let innerObj = { year : point.position, actual: point.quantity}
                y.push(innerObj)
                
    
            })
            let obj = { label : label, values : y}
            entsoeData.push(obj) 
        })  
    })

    ////////////////////////////////////////////////////
    // Run ENTSO-e transparency playform query
    // 2nd query
    // Actual generation per type    // A71
    // Realised                      //A16
    const result = await QueryGL('102f171b-9352-466b-9e71-5783f324afb5',{
        documentType: DocumentType("Actual generation per type"),        // A71 - Generation forecast
        processType: ProcessType("Realised"),         // A01 - Day ahead
        inDomain: Area("Switzerland (CH)"), // FistAreaByIdentifier resolves to "10YSE-1--------K" which is also CTA|SE, MBA|SE etc...
        
        startDateTime: startTime, // Start date
        endDateTime: endTime, // End date
    })
    //console.log('Query 2 Actual generation per type result ', result)




    result[0].timeseries.forEach((item, idx) => {
        let obj = { label : item.mktPsrTypeDescription }
        //  console.log(x.push(obj))

        // console.log(idx, '      ', item.mktPsrTypeDescription)
        item.periods.forEach((item1, idx) => {
            // console.log('      ', idx, '      ', item.points)
            let y = []
            item1.points.forEach(point => {
                // console.log('position : ', point.position, 'quantity : ', point.quantity)
                if(!point.quantity){ point.quantity = 0 }
                let innerObj = { year : point.position, actual: point.quantity}
                y.push(innerObj)
                

            })
            let obj = { label : item.mktPsrTypeDescription, values : y}
            entsoeData.push(obj)
        })  
        
    })
    // console.log('Completed Data Fetching after Query 1 and 2  ', entsoeData)

    return [resultTotalLoad, result, label, entsoeData]

}

var meteoMaticsData:RowData = {}

export async function getMeteoMaticsData(date): Promise<any> {
       
        
        const base64Encode = (str: string) => {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            return btoa(String.fromCharCode(...new Uint8Array(data)));
        };

        
        const url = "https://api.meteomatics.com/" + date + "ZP1D:PT60M/wind_speed_10m:ms/47.1330,7.0594/json"
        const username = "peter_hirt"
        const password = "......."
        
        const authHeader = `Basic ${base64Encode(`${username}:${password}`)}`;

        await fetch(url, {headers: { 'Authorization' : authHeader }})
        .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
        })
        .then(data => {
            meteoMaticsData = data
            return 
        })
        .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
        }); 

        return meteoMaticsData
        
}

export async function getSimData(nuclear, solar, wind):Promise<any> {
   
    /* var diffPos = Array(24).fill(0)
    var diffNeg = Array(24).fill(0)
    var base = Array(24).fill(0)
    base.forEach((item,idx) => {
        var renewable = Math.round(solar[idx] + wind[idx])
        if(renewable < nuclear[idx].actual) {
            base[idx] = renewable
            diffNeg[idx] = nuclear[idx] - renewable
            diffPos[idx] = 0
        } else {
            base[idx] = nuclear[idx].actual
            diffNeg[idx] = 0
            diffPos[idx] = renewable - nuclear[idx]
        } 
    })

    console.log(base)
    console.log(diffPos)
    console.log(diffNeg)   */
    return 999999
}

export async function calculateSolar(panelCountValue, panelPowerValue, conversionFactor):Promise<any>{
    var solarpower = Array(24).fill(0)
    var solarbase: number[] = [0,0,0,0,0,0,0,0,15,35,45,52,55,57,55,52,45,35,15,0,0,0,0,0]
    solarpower.forEach((item,idx) => {
        solarpower[idx] = Math.round(panelCountValue * panelPowerValue * solarbase[idx]/100 * conversionFactor)
    })
    return solarpower
}

export async function calculateWind(turbineCountValue, turbineTypeValue:string, windSpeed:number[]):Promise<any>{
    var windpower = Array(24).fill(0)
    var powerCurve = [0,0,0,0,21.5,65.3,120,188,268,365,440,510,556,582,594,598,600,600,600,600,600,600,600,600,600,0,0,0,0,0,0]
    var powerCurveV100 = [0,0,0,10,60,240,450,900,1100,1500,1750,1800,1800,1800,1800,1800,1800,1800,1800,1800,1800,0,0,0,0,0,0,0,0,0,0]
    var conversionFactorTurbines = 0.001
    var windbase: number[] = [0,0,12,10,11,9,8,5,5,5,4,6,7,8,15,12,13,9,15,8,7,10,11,13]
    windpower.forEach((item,idx) => {
        if(turbineTypeValue == 'vestasV40') {
            windpower[idx] = Math.round( powerCurve[windbase[idx]] * turbineCountValue * conversionFactorTurbines)
        }
        if(turbineTypeValue == 'vestasV100') {
            windpower[idx] = Math.round( powerCurveV100[windSpeed[idx]] * turbineCountValue * conversionFactorTurbines)
        }
    // console.log('wind item  ', powerCurve[windbase[idx]], turbineCountValue, conversionFactorTurbines)
    })
    // console.log('wind      ', windpower)
    return windpower
}



export function reFormatDates(yesterday) {
    var yesterdayEle = new Date(yesterday).toLocaleDateString().split('/')
    var yesterdayShort = yesterdayEle[2] + '-' + yesterdayEle[1] + '-' + yesterdayEle[0]
    var constructedDate = yesterdayShort + 'T00:00:00'
    // console.log(constructedDate)
    // for Entsoe
    var splitDate = new Date(yesterday).toLocaleDateString("en-ZA",{
        day: "numeric",
        month: "long",
        year: "numeric"}).split(' ')
    var xStartTime = splitDate[1]+ ' ' + splitDate[0] + ',' + splitDate[2] + ' 00:00:00' 
    var xEndTime = splitDate[1]+ ' ' + splitDate[0] + ',' + splitDate[2] + ' 24:00:00' 
    // for MeteoMatics 
    var startTime = new Date(xStartTime)  //('April 12,2023 00:00:00'); 
    startTime.setDate(startTime.getDate()-1);
    var endTime = new Date(xEndTime) //('April 12,2023 24:00:00');
    endTime.setDate(endTime.getDate()-1);
    // console.log(startTime, endTime)

    return [xStartTime, xEndTime, startTime, endTime, yesterdayShort, constructedDate]
}

export const config100:any = {
    data: {
        // labels: dataSet.data[0].coordinates[0].dates.map(row => row.date.slice(11, -4)),
        labels: null, //dataSet.time,
        datasets: [
            
              
                {
                    type: 'line',
                    label: 'total',
                    data: null, //dataSet,
                    borderWidth: 5,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(100, 10, 100, 0.1)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'actual'
                    },
                    hidden: false
                },  
                {
                    type: 'line',
                    stack: 'xx',
                    label: 'nuclear',
                    data: null, // dataSet,
                    borderWidth: 2,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(150, 220, 150, 0.4)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'nuclear'
                    },
                    hidden: false
                },  
                {
                    type: 'line',
                    stack: 'xx',
                    label: 'Hydro Pumped Storage',
                    data: null, //dataSet,
                    borderWidth: 2,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(100, 200, 200, 1.0)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'hydroPumped'
                    },
                    hidden: false
                },
                {
                    type: 'line',
                    stack: 'xx',
                    label: 'Hydro Run-of-river and poundage',
                    data: null, //dataSet,
                    borderWidth: 2,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(200, 150, 200, 1.0)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'hydroRiver'
                    },
                    hidden: false
                },
                {
                    type: 'line',
                    stack: 'xx',
                    label: 'Hydro Water Reservoir',
                    data: null, //dataSet,
                    borderWidth: 2,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(150, 120, 150, 0.3)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'hydroReservoir'
                    },
                    hidden: false
                },
                {
                    type: 'line',
                    stack: 'xx',
                    label: 'Solar',
                    data: null, //dataSet,
                    borderWidth: 2,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(255, 255, 10, 0.3)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'solarpower'
                    },
                    hidden: false
                },
                // new sets
            
            {
                type: 'line',
                label: 'auxiliary',
                data: null, //dataSet,
                borderWidth: 2,
                fill: false,
                borderColor: 'rgb(100, 100, 100)',
                backgroundColor: 'rgb(10, 10, 100, 1.0)',
                tension: 0.3,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'windspeedMeteomatics'
                },
                yAxisID: 'auxiliary',
                hidden: true
            },
            {
                type: 'line',
                stack: 'x',
                label: 'solar power simulated',
                data: null, // dataSet,
                borderWidth: 2,
                fill: true,
                borderColor: 'rgb(100, 100, 100)',
                backgroundColor: 'rgb(150, 150, 250, 0.3)',
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'solarpowerSim'
                },
                hidden: true
            }, 
            {
                type: 'line',
                stack: 'x',
                label: 'wind power simulated',
                data: null, //dataSet,
                borderWidth: 2,
                fill: true,
                borderColor: 'rgb(100, 100, 100)',
                backgroundColor: 'rgb(100, 200, 250, 0.3)',
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'windPowerSim'
                },
                hidden: true
            }, 
            {
                type: 'line',
                stack: 'xxxxx',
                label: 'base',
                data: null, //dataSet,
                borderWidth: 2,
                fill: false,
                borderColor: 'rgb(100, 100, 100, 0.3)',
                backgroundColor: 'rgb(100, 100, 100, 0.3)',
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'base'
                },
                hidden: true
            }, 
            {
                type: 'bar',
                stack: 'xxxxx',
                barThickness: 16,
                label: 'difference',
                data: null, //dataSet,
                borderWidth: 2,
                fill: true,
                borderColor: 'rgb(10, 10, 10 0.8)', //colours,
                backgroundColor: 'rgb(10 255, 10, 0.8)', //null, //colours,
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'diffNuclearRenewablePos'
                },
                hidden: true
            }, 
            {
                type: 'bar',
                stack: 'xxxxx',
                barThickness: 16,
                label: 'difference',
                data: null, //dataSet,
                borderWidth: 2,
                fill: true,
                borderColor: 'rgb(10, 10, 10, 0.8)', //colours,
                backgroundColor: 'rgb(255, 10, 10, 0.8)', //null, //colours,
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'diffNuclearRenewableNeg'
                },
                hidden: true
            },  
            ]
        },
        options: {
            animation: false,
            plugins: {
                htmlLegend: {
                    // ID of the container to put the legend in
                    containerID: 'legend-container',
                  },
                legend: {
                    display: true
                },
                tooltip: {
                    enabled: true
                },
                title: {
                    display: true,
                    text: 'Power Consumption' 
                }
            },
            aspectRatio: 2,
            scales: {
                y: {
                    beginAtZero: true,
                    //min: 5000,
                    //max: 8000,
                    title: {
                        text: 'Power [MW]',
                        display: true
                        }
                },
                auxiliary: {
                    display: false,
                    beginAtZero: true,
                    //min: 5000,
                    //max: 8000,
                    title: {
                        text: 'windspeed [m/s]',
                        display: true
                        },
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        callback: function(value:any) {
                            return  `${value}`
                            /* if (winspeedScale) {
                                return  `${value}`
                            } 
                            if (cloudCoverScale){
                                return `${value} %`
                            } 
                            if (sunPositionScale) {
                                return  `${value}`
                            } */
                        }
                    }
                },
                
                x: {
                    title: {
                        text: 'Time of day',
                        display: true
                    }
                }
            }
        }
        // plugins: [htmlLegendPlugin],    // https://www.chartjs.org/docs/latest/samples/legend/html.html
}

export const config101:any = {
    data: {
        // labels: dataSet.data[0].coordinates[0].dates.map(row => row.date.slice(11, -4)),
        labels: null, //dataSet.time,
        datasets: [
            
              
                {
                    type: 'line',
                    label: 'total',
                    data: null, //dataSet,
                    borderWidth: 5,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(100, 10, 100, 0.1)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'actual'
                    },
                    hidden: false
                },  
                {
                    type: 'line',
                    stack: 'xx',
                    label: 'nuclear',
                    data: null, // dataSet,
                    borderWidth: 2,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(150, 220, 150, 0.4)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'nuclear'
                    },
                    hidden: false
                },  
                {
                    type: 'line',
                    stack: 'xx',
                    label: 'Hydro Pumped Storage',
                    data: null, //dataSet,
                    borderWidth: 2,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(100, 200, 200, 1.0)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'hydroPumped'
                    },
                    hidden: false
                },
                {
                    type: 'line',
                    stack: 'xx',
                    label: 'Hydro Run-of-river and poundage',
                    data: null, //dataSet,
                    borderWidth: 2,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(200, 150, 200, 1.0)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'hydroRiver'
                    },
                    hidden: false
                },
                {
                    type: 'line',
                    stack: 'xx',
                    label: 'Hydro Water Reservoir',
                    data: null, //dataSet,
                    borderWidth: 2,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(150, 120, 150, 0.3)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'hydroReservoir'
                    },
                    hidden: false
                },
                {
                    type: 'line',
                    stack: 'xx',
                    label: 'Solar',
                    data: null, //dataSet,
                    borderWidth: 2,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(255, 255, 10, 0.3)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'solarpower'
                    },
                    hidden: false
                },
                // new sets
            
            {
                type: 'line',
                label: 'auxiliary',
                data: null, //dataSet,
                borderWidth: 2,
                fill: false,
                borderColor: 'rgb(100, 100, 100)',
                backgroundColor: 'rgb(10, 10, 100, 1.0)',
                tension: 0.3,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'windspeedMeteomatics'
                },
                yAxisID: 'auxiliary',
                hidden: true
            },
            {
                type: 'line',
                stack: 'x',
                label: 'solar power simulated',
                data: null, // dataSet,
                borderWidth: 2,
                fill: true,
                borderColor: 'rgb(100, 100, 100)',
                backgroundColor: 'rgb(150, 150, 250, 0.3)',
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'solarpowerSim'
                },
                hidden: true
            }, 
            {
                type: 'line',
                stack: 'x',
                label: 'wind power simulated',
                data: null, //dataSet,
                borderWidth: 2,
                fill: true,
                borderColor: 'rgb(100, 100, 100)',
                backgroundColor: 'rgb(100, 200, 250, 0.3)',
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'windPowerSim'
                },
                hidden: true
            }, 
            {
                type: 'line',
                stack: 'xxxxx',
                label: 'base',
                data: null, //dataSet,
                borderWidth: 2,
                fill: false,
                borderColor: 'rgb(100, 100, 100, 0.3)',
                backgroundColor: 'rgb(100, 100, 100, 0.3)',
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'base'
                },
                hidden: true
            }, 
            {
                type: 'bar',
                stack: 'xxxxx',
                barThickness: 16,
                label: 'difference',
                data: null, //dataSet,
                borderWidth: 2,
                fill: true,
                borderColor: 'rgb(10, 10, 10 0.8)', //colours,
                backgroundColor: 'rgb(10 255, 10, 0.8)', //null, //colours,
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'diffNuclearRenewablePos'
                },
                hidden: true
            }, 
            {
                type: 'bar',
                stack: 'xxxxx',
                barThickness: 16,
                label: 'difference',
                data: null, //dataSet,
                borderWidth: 2,
                fill: true,
                borderColor: 'rgb(10, 10, 10, 0.8)', //colours,
                backgroundColor: 'rgb(255, 10, 10, 0.8)', //null, //colours,
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'diffNuclearRenewableNeg'
                },
                hidden: true
            }, 
            ]
        },
        options: {
            animation: false,
            plugins: {
                htmlLegend: {
                    // ID of the container to put the legend in
                    containerID: 'legend-container',
                  },
                legend: {
                    display: true
                },
                tooltip: {
                    enabled: true
                },
                title: {
                    display: true,
                    text: 'Power Consumption' 
                }
            },
            aspectRatio: 2,
            scales: {
                y: {
                    beginAtZero: true,
                    //min: 5000,
                    //max: 8000,
                    title: {
                        text: 'Power [MW]',
                        display: true
                        }
                },
                auxiliary: {
                    display: false,
                    beginAtZero: true,
                    //min: 5000,
                    //max: 8000,
                    title: {
                        text: 'windspeed [m/s]',
                        display: true
                        },
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        callback: function(value:any) {
                            return  `${value}`
                            /* if (winspeedScale) {
                                return  `${value}`
                            } 
                            if (cloudCoverScale){
                                return `${value} %`
                            } 
                            if (sunPositionScale) {
                                return  `${value}`
                            } */
                        }
                    }
                },
                
                x: {
                    title: {
                        text: 'Time of day',
                        display: true
                    }
                }
            }
        }
        // plugins: [htmlLegendPlugin],    // https://www.chartjs.org/docs/latest/samples/legend/html.html
}

export const config2:any = {
    data: {
        labels: null, //dataSet.time,
        datasets: [
            {
                type: 'bar',
                barThickness: 16,
                label: 'difference',
                data: null, //dataSet,
                borderWidth: 2,
                fill: true,
                borderColor: null, //colours,
                backgroundColor: null, //colours,
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'diffNuclearRenewable'
                },
            }, 
            {
                type: 'line',
                label: 'auxiliary',
                data: null, //dataSet,
                borderWidth: 2,
                fill: false,
                borderColor: 'rgb(100, 100, 100)',
                backgroundColor: 'rgb(10, 10, 100, 0.1)',
                tension: 0.3,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'windspeedMeteomatics'
                },
                yAxisID: 'auxiliary',
                hidden: true
            },
            {
                type: 'line',
                label: 'total',
                data: null, //dataSet,
                borderWidth: 5,
                fill: true,
                borderColor: 'rgb(100, 100, 100)',
                backgroundColor: 'rgb(100, 10, 100, 0.1)',
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'actual'
                },
            },  
            {
                type: 'line',
                stack: 'x',
                label: 'solar',
                data: null, //dataSet,
                borderWidth: 2,
                fill: true,
                borderColor: 'rgb(100, 100, 100)',
                backgroundColor: 'rgb(150, 150, 250, 0.2)',
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'solarpowerSim'
                },
            }, 
            {
                type: 'line',
                stack: 'x',
                label: 'solar',
                data: null, //dataSet,
                borderWidth: 2,
                fill: true,
                borderColor: 'rgb(100, 100, 100)',
                backgroundColor: 'rgb(100, 200, 250, 0.2)',
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'windPowerSim'
                },
            }, 
            
            {
                type: 'line',
                stack: 'y',
                label: 'nuclear',
                data: null, //dataSet,
                borderWidth: 2,
                fill: true,
                borderColor: 'rgb(100, 100, 100)',
                backgroundColor: 'rgb(150, 220, 150, 0.2)',
                tension: 0.2,
                parsing: {
                    xAxisKey: 'time',
                    yAxisKey: 'nuclear'
                },
            }, 
            
            
            
            ]
        },
        options: {
            animation: true,
            plugins: {
                legend: {
                    display: true
                },
                tooltip: {
                    enabled: true
                },
                title: {
                    display: true,
                    text: 'Wind Speed' 
                }
            },
            aspectRatio: 2,
            scales: {
                y: {
                    beginAtZero: true,
                    //min: 5000,
                    //max: 8000,
                    title: {
                        text: 'wind speed [m/s]',
                        display: true
                        }
                },
                auxiliary: {
                    display: true,
                    beginAtZero: true,
                    //min: 5000,
                    //max: 8000,
                    title: {
                        text: 'windspeed [m/s]',
                        display: true
                        },
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        callback: function(value:any) {
                            return  `${value}`
                            /* if (winspeedScale) {
                                return  `${value}`
                            } 
                            if (cloudCoverScale){
                                return `${value} %`
                            } 
                            if (sunPositionScale) {
                                return  `${value}`
                            } */
                        }
                    }
                },
                x: {
                    title: {
                        text: 'hour',
                        display: true
                    }
                }
            }
        }
}


export function displayData(dataSet, primaryConfig) {
    
    // console.log(primaryConfig, dataSet)

    var chartExist = Chart.getChart("meteoMatics"); 
    if (chartExist != undefined ) {
      chartExist.destroy(); 
    }

    

    const colours = dataSet.map((value) => value.diffNuclearRenewable < 0 ? 'red' : 'green');

    const config100:any = {
        data: {
            // labels: dataSet.data[0].coordinates[0].dates.map(row => row.date.slice(11, -4)),
            labels: dataSet.time,
            datasets: [
                
                   /*  {
                        type: 'line',
                        label: 'auxiliary',
                        data: dataSet,
                        borderWidth: 5,
                        fill: true,
                        borderColor: 'rgb(100, 100, 100)',
                        backgroundColor: 'rgb(10, 10, 100, 0.5)',
                        tension: 0.2,
                        parsing: {
                            xAxisKey: 'time',
                            yAxisKey: 'windspeedMeteomatics'
                        },
                    },  */
                    {
                        type: 'line',
                        label: 'total',
                        data: dataSet,
                        borderWidth: 5,
                        fill: true,
                        borderColor: 'rgb(100, 100, 100)',
                        backgroundColor: 'rgb(100, 10, 100, 0.1)',
                        tension: 0.2,
                        parsing: {
                            xAxisKey: 'time',
                            yAxisKey: 'actual'
                        },
                    },  
                    {
                        type: 'line',
                        stack: 'x',
                        label: 'nuclear',
                        data: dataSet,
                        borderWidth: 2,
                        fill: true,
                        borderColor: 'rgb(100, 100, 100)',
                        backgroundColor: 'rgb(150, 220, 150, 1.0)',
                        tension: 0.2,
                        parsing: {
                            xAxisKey: 'time',
                            yAxisKey: 'nuclear'
                        },
                    },  
                    {
                        type: 'line',
                        stack: 'x',
                        label: 'Hydro Pumped Storage',
                        data: dataSet,
                        borderWidth: 2,
                        fill: true,
                        borderColor: 'rgb(100, 100, 100)',
                        backgroundColor: 'rgb(100, 200, 200, 1.0)',
                        tension: 0.2,
                        parsing: {
                            xAxisKey: 'time',
                            yAxisKey: 'hydroPumped'
                        }
                    },
                    {
                        type: 'line',
                        stack: 'x',
                        label: 'Hydro Run-of-river and poundage',
                        data: dataSet,
                        borderWidth: 2,
                        fill: true,
                        borderColor: 'rgb(100, 100, 100)',
                        backgroundColor: 'rgb(200, 150, 200, 1.0)',
                        tension: 0.2,
                        parsing: {
                            xAxisKey: 'time',
                            yAxisKey: 'hydroRiver'
                        }
                    },
                    {
                        type: 'line',
                        stack: 'x',
                        label: 'Hydro Water Reservoir',
                        data: dataSet,
                        borderWidth: 2,
                        fill: true,
                        borderColor: 'rgb(100, 100, 100)',
                        backgroundColor: 'rgb(150, 120, 150, 0.3)',
                        tension: 0.2,
                        parsing: {
                            xAxisKey: 'time',
                            yAxisKey: 'hydroReservoir'
                        }
                    },
                    {
                        type: 'line',
                        stack: 'x',
                        label: 'Solar',
                        data: dataSet,
                        borderWidth: 2,
                        fill: true,
                        borderColor: 'rgb(100, 100, 100)',
                        backgroundColor: 'rgb(10, 100, 100, 0.3)',
                        tension: 0.2,
                        parsing: {
                            xAxisKey: 'time',
                            yAxisKey: 'solarpower'
                        }
                    },
                    
                ]
            },
            options: {
                animation: true,
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        enabled: true
                    },
                    title: {
                        display: true,
                        text: 'Wind Speed' 
                    }
                },
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true,
                        //min: 5000,
                        //max: 8000,
                        title: {
                            text: 'Power [MW]',
                            display: true
                            }
                    },
                    
                    x: {
                        title: {
                            text: 'Time of day',
                            display: true
                        }
                    }
                }
            }
    }

    
    const config2:any = {
        data: {
            labels: dataSet.time,
            datasets: [
                {
                    type: 'bar',
                    barThickness: 16,
                    label: 'difference',
                    data: dataSet,
                    borderWidth: 2,
                    fill: true,
                    borderColor: colours,
                    backgroundColor: colours,
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'diffNuclearRenewable'
                    },
                }, 
                {
                    type: 'line',
                    label: 'auxiliary',
                    data: dataSet,
                    borderWidth: 2,
                    fill: false,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(10, 10, 100, 0.1)',
                    tension: 0.3,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'windspeedMeteomatics'
                    },
                    yAxisID: 'auxiliary',
                    hidden: false
                },
                {
                    type: 'line',
                    label: 'total',
                    data: dataSet,
                    borderWidth: 5,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(100, 10, 100, 0.1)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'actual'
                    },
                },  
                {
                    type: 'line',
                    stack: 'x',
                    label: 'solar',
                    data: dataSet,
                    borderWidth: 2,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(150, 150, 250, 0.2)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'solarpowerSim'
                    },
                }, 
                {
                    type: 'line',
                    stack: 'x',
                    label: 'solar',
                    data: dataSet,
                    borderWidth: 2,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(100, 200, 250, 0.2)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'windPowerSim'
                    },
                }, 
                
                {
                    type: 'line',
                    stack: 'y',
                    label: 'nuclear',
                    data: dataSet,
                    borderWidth: 2,
                    fill: true,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(150, 220, 150, 0.2)',
                    tension: 0.2,
                    parsing: {
                        xAxisKey: 'time',
                        yAxisKey: 'nuclear'
                    },
                }, 
                
                
                ]
            },
            options: {
                animation: true,
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        enabled: true
                    },
                    title: {
                        display: true,
                        text: 'Wind Speed' 
                    }
                },
                aspectRatio: 2,
                scales: {
                    y: {
                        beginAtZero: true,
                        //min: 5000,
                        //max: 8000,
                        title: {
                            text: 'wind speed [m/s]',
                            display: true
                            }
                    },
                    auxiliary: {
                        display: true,
                        beginAtZero: true,
                        //min: 5000,
                        //max: 8000,
                        title: {
                            text: 'windspeed [m/s]',
                            display: true
                            },
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            callback: function(value:any) {
                                return  `${value}`
                                /* if (winspeedScale) {
                                    return  `${value}`
                                } 
                                if (cloudCoverScale){
                                    return `${value} %`
                                } 
                                if (sunPositionScale) {
                                    return  `${value}`
                                } */
                            }
                        }
                    },
                    x: {
                        title: {
                            text: 'hour',
                            display: true
                        }
                    }
                }
            }
    }

    
    const meteoMatics = new Chart('meteoMatics', primaryConfig ? config100 : config2)
    meteoMatics.update()
   
    
    
}



