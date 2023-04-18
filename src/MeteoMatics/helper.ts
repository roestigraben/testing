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
        const password = "GoWui5ZjN2Kj"
        
        const authHeader = `Basic ${base64Encode(`${username}:${password}`)}`;

        await fetch(url, {headers: { 'Authorization' : authHeader}})
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

export async function getSimData():Promise<any> {
    return 9999999
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


export function displayData(dataSet, primaryConfig) {
    
    // console.log(primaryConfig, dataSet)

    var chartExist = Chart.getChart("meteoMatics"); 
    if (chartExist != undefined) {
      chartExist.destroy(); 
    }

    

    

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
                    type: 'line',
                    label: 'auxiliary',
                    data: dataSet,
                    borderWidth: 2,
                    fill: false,
                    borderColor: 'rgb(100, 100, 100)',
                    backgroundColor: 'rgb(10, 10, 100, 0.5)',
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
                ]
            },
            options: {
                animation: true,
                plugins: {
                    legend: {
                        display: false
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


