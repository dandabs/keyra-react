import { Http } from '@capacitor-community/http';

const fuelStationSources: { [key: string]: string } = {
    "gasvatkin": "https://raw.githubusercontent.com/gasvaktin/gasvaktin/refs/heads/master/vaktin/gas.json",
    "applegreen": "https://applegreenstores.com/fuel-prices/data.json",
    "ascona": "https://fuelprices.asconagroup.co.uk/newfuel.json",
    "asda": "https://storelocator.asda.com/fuel_prices_data.json",
    "bp": "https://www.bp.com/en_gb/united-kingdom/home/fuelprices/fuel_prices_data.json",
    "esso": "https://fuelprices.esso.co.uk/latestdata.json",
    "jet": "https://jetlocal.co.uk/fuel_prices_data.json",
    "karan": "https://api2.krlmedia.com/integration/live_price/krl",
    "morrisons": "https://www.morrisons.com/fuel-prices/fuel.json",
    "moto": "https://moto-way.com/fuel-price/fuel_prices.json",
    "motorFuel": "https://fuel.motorfuelgroup.com/fuel_prices_data.json",
    "rontec": "https://www.rontec-servicestations.co.uk/fuel-prices/data/fuel_prices_data.json",
    "sainsburys": "https://api.sainsburys.co.uk/v1/exports/latest/fuel_prices_data.json",
    "shell": "https://www.shell.co.uk/fuel-prices-data.html",
    "sgn": "https://www.sgnretail.uk/files/data/SGN_daily_fuel_prices.json",
    "tesco": "https://www.tesco.com/fuel_prices/fuel_prices_data.json"
};

export async function getFuelData(source: string) {
    console.log(`Getting fuel data for source: ${source}`);

    const url = fuelStationSources[source];
    if (!url) {
        throw new Error(`Unknown source: ${source}`);
    }

    console.log(`Getting fuel data from url: ${url}`);
    const response = await Http.request({ method: 'GET', url });

    console.log(`Got fuel data for source ${source}`, response.data.stations);
    return await response.data.stations || [];
}

export async function getFuelPriceByTag(tag: string) {
    // examples of tags: tesco-gcg81d29xn2d-prices.E10, gasvatkin-ao_001-bensin95
    console.log(`Getting fuel price for tag: ${tag}`);

    const [source, id, type] = tag.split('-');
    const data = await getFuelData(source);
    const station = data.find((station: any) => station.site_id === id || station.key == id);
    if (!station) throw new Error(`Station not found: ${id}`);
    const typeParts = type.split('.');
    let result = station;
    for (const part of typeParts) {
        result = result[part];
        if (result === undefined) {
            throw new Error(`Type not found: ${type}`);
        }
    }

    const parsedResult = parseFloat(result);
    console.log(`Got fuel price for tag ${tag}`, parsedResult);
    return source == 'gasvatkin' ? parsedResult : parsedResult / 100;
}

export default fuelStationSources;