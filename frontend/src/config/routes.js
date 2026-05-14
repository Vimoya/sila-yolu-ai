export const TURKEY_DESTINATIONS = [
  'Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya',
  'Konya', 'Adana', 'Gaziantep', 'Trabzon', 'Samsun',
  'Kayseri', 'Sivas', 'Erzurum', 'Diyarbakir',
]

export const EUROPE_STARTS = [
  'Berlin', 'München', 'Hamburg', 'Frankfurt', 'Stuttgart',
  'Paris', 'Lyon', 'Amsterdam', 'Rotterdam', 'Brüssel',
  'Wien', 'Zürich', 'Bern', 'Rom', 'Mailand',
  'Madrid', 'Barcelona', 'London', 'Kopenhagen', 'Stockholm',
  'Luxemburg', 'Den Haag',
]

export const ROUTE_TEMPLATES = {
  austria_hungary: {
    name: 'Österreich-Ungarn Route',
    countries: ['Deutschland', 'Österreich', 'Ungarn', 'Serbien', 'Bulgarien', 'Türkei'],
    flags: ['🇩🇪', '🇦🇹', '🇭🇺', '🇷🇸', '🇧🇬', '🇹🇷'],
    km: 2150,
    hours: 22,
    vignettes: ['Österreich', 'Ungarn'],
    borders: ['Kapıkule'],
    toll: 35,
    vignetteCost: 22,
    recommended: true,
  },
  croatia_route: {
    name: 'Kroatien Route',
    countries: ['Deutschland', 'Österreich', 'Slowenien', 'Kroatien', 'Serbien', 'Bulgarien', 'Türkei'],
    flags: ['🇩🇪', '🇦🇹', '🇸🇮', '🇭🇷', '🇷🇸', '🇧🇬', '🇹🇷'],
    km: 2380,
    hours: 25,
    vignettes: ['Österreich', 'Slowenien'],
    borders: ['Kapıkule'],
    toll: 55,
    vignetteCost: 31,
    recommended: false,
  },
  romania_route: {
    name: 'Rumänien Route',
    countries: ['Deutschland', 'Österreich', 'Ungarn', 'Rumänien', 'Bulgarien', 'Türkei'],
    flags: ['🇩🇪', '🇦🇹', '🇭🇺', '🇷🇴', '🇧🇬', '🇹🇷'],
    km: 2290,
    hours: 24,
    vignettes: ['Österreich', 'Ungarn', 'Rumänien'],
    borders: ['Kapıkule'],
    toll: 30,
    vignetteCost: 34,
    recommended: false,
  },
}

export const BORDERS = [
  { id: 'kapikule', name: 'Kapıkule', country: 'TR/BG', lat: 41.571, lng: 26.357 },
  { id: 'hamzabeyli', name: 'Hamzabeyli', country: 'TR/BG', lat: 41.751, lng: 26.626 },
  { id: 'ipsala', name: 'İpsala', country: 'TR/GR', lat: 40.923, lng: 26.384 },
  { id: 'horgos', name: 'Horgoš', country: 'RS/HU', lat: 46.156, lng: 19.977 },
  { id: 'roszke', name: 'Röszke', country: 'HU/RS', lat: 46.175, lng: 20.007 },
  { id: 'kalotina', name: 'Kalotina', country: 'BG/RS', lat: 43.006, lng: 22.592 },
]
