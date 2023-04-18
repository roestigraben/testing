interface datesData {
    date: string,
    value: number
}

interface coordinatesData {
    lat:number,
    lon:number,
    dates: datesData[]
}

interface ValueData {
    parameter: string;
    coordinates: coordinatesData[]
}
interface RowData {
    status?: string;
    version?: string,
    user?: string,
    dateGenerated?: string,
    data?: ValueData[]
}

interface EData {
    label?: string,
    values?: number[]
}

interface dataSet {
    time?: string, 
    forecast?: number, 
    actual?: number,
    nuclear?: number,
    hydroReservoir?: number,
    hydroRiver?: number,
    hydroPumped?: number,
    cloudCover?: number,
    windspeedMeteomatics?: number,
    windspeedWindfinder?: number,
    solarpower?: number,
    solarRadiation?: number,
    solarpowerSim?: number
    windpower?: number,
    windPowerSim?: number
}

export { RowData, ValueData, coordinatesData, datesData, dataSet, EData }