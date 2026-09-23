export enum WeatherNamesEnum {
    CLOUDY,
    SUN,
    RAIN,
    THUNDER,
    PARTLY_CLOUDY
}

export const weatherNameLabels: Record<WeatherNamesEnum, string> = {
    [WeatherNamesEnum.SUN]: 'Ensolarado',
    [WeatherNamesEnum.CLOUDY]: 'Nublado',
    [WeatherNamesEnum.PARTLY_CLOUDY]: 'Parcialmente nublado',
    [WeatherNamesEnum.RAIN]: 'Chuva',
    [WeatherNamesEnum.THUNDER]: 'Tempestade'
}