import { CantonRef, CityDef, StationDef } from "./types";

// Kantone nach offizieller BFS-Kantonsnummer (entspricht den Properties
// im mitgelieferten client/public/data/cantons.geojson).
export const CANTONS: CantonRef[] = [
  { num: 1, name: "Zürich" },
  { num: 2, name: "Bern" },
  { num: 3, name: "Luzern" },
  { num: 4, name: "Uri" },
  { num: 5, name: "Schwyz" },
  { num: 6, name: "Obwalden" },
  { num: 7, name: "Nidwalden" },
  { num: 8, name: "Glarus" },
  { num: 9, name: "Zug" },
  { num: 10, name: "Fribourg" },
  { num: 11, name: "Solothurn" },
  { num: 12, name: "Basel-Stadt" },
  { num: 13, name: "Basel-Landschaft" },
  { num: 14, name: "Schaffhausen" },
  { num: 15, name: "Appenzell Ausserrhoden" },
  { num: 16, name: "Appenzell Innerrhoden" },
  { num: 17, name: "St. Gallen" },
  { num: 18, name: "Graubünden" },
  { num: 19, name: "Aargau" },
  { num: 20, name: "Thurgau" },
  { num: 21, name: "Ticino" },
  { num: 22, name: "Vaud" },
  { num: 23, name: "Valais" },
  { num: 24, name: "Neuchâtel" },
  { num: 25, name: "Genève" },
  { num: 26, name: "Jura" },
];

const CANTON_NAME: Record<number, string> = Object.fromEntries(
  CANTONS.map((c) => [c.num, c.name])
);

let autoId = 0;
function station(
  name: string,
  lat: number,
  lon: number,
  cantonNum: number,
  tier: StationDef["tier"],
  city?: string
): StationDef {
  autoId += 1;
  return {
    id: `st_${autoId}_${name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    name,
    lat,
    lon,
    cantonNum,
    cantonName: CANTON_NAME[cantonNum],
    tier,
    city,
  };
}

// Bahnhöfe pro Kanton. HUB = national/regional bedeutsam (wird u.a. für die
// Spielgrösse "Ganze Schweiz" als Anker verwendet), REGIONAL = zusätzliche
// Anker für die Spielgrösse "Kanton".
export const STATIONS: StationDef[] = [
  // 1 Zürich
  station("Zürich HB", 47.3779, 8.5403, 1, "HUB"),
  station("Winterthur", 47.5, 8.7237, 1, "HUB"),
  station("Uster", 47.3474, 8.7208, 1, "REGIONAL"),
  station("Dietikon", 47.4009, 8.4004, 1, "REGIONAL"),
  station("Wetzikon", 47.3228, 8.7982, 1, "REGIONAL"),
  station("Bülach", 47.5217, 8.5406, 1, "REGIONAL"),
  station("Horgen", 47.2589, 8.5977, 1, "REGIONAL"),
  station("Dübendorf", 47.3979, 8.6183, 1, "REGIONAL"),

  // 2 Bern
  station("Bern HB", 46.9489, 7.4394, 2, "HUB"),
  station("Thun", 46.758, 7.628, 2, "HUB"),
  station("Biel/Bienne", 47.1368, 7.2468, 2, "HUB"),
  station("Interlaken Ost", 46.6912, 7.8637, 2, "REGIONAL"),
  station("Burgdorf", 47.0592, 7.628, 2, "REGIONAL"),
  station("Langenthal", 47.2119, 7.7936, 2, "REGIONAL"),
  station("Spiez", 46.6867, 7.677, 2, "REGIONAL"),

  // 3 Luzern
  station("Luzern", 47.0502, 8.3093, 3, "HUB"),
  station("Emmenbrücke", 47.0778, 8.2814, 3, "REGIONAL"),
  station("Sursee", 47.1706, 8.1097, 3, "REGIONAL"),
  station("Willisau", 47.1226, 7.999, 3, "REGIONAL"),
  station("Hochdorf", 47.1667, 8.2889, 3, "REGIONAL"),

  // 4 Uri
  station("Flüelen", 46.9075, 8.6244, 4, "HUB"),
  station("Altdorf UR", 46.8817, 8.6428, 4, "REGIONAL"),
  station("Erstfeld", 46.8189, 8.6438, 4, "REGIONAL"),
  station("Andermatt", 46.6361, 8.5934, 4, "REGIONAL"),

  // 5 Schwyz
  station("Pfäffikon SZ", 47.2006, 8.7789, 5, "HUB"),
  station("Schwyz", 47.0207, 8.6533, 5, "REGIONAL"),
  station("Brunnen", 46.9989, 8.6039, 5, "REGIONAL"),
  station("Einsiedeln", 47.1276, 8.7469, 5, "REGIONAL"),
  station("Küssnacht am Rigi", 47.0847, 8.4478, 5, "REGIONAL"),

  // 6 Obwalden
  station("Sarnen", 46.8968, 8.2461, 6, "HUB"),
  station("Engelberg", 46.8218, 8.4055, 6, "REGIONAL"),
  station("Giswil", 46.8317, 8.1425, 6, "REGIONAL"),

  // 7 Nidwalden
  station("Stans", 46.9578, 8.3661, 7, "HUB"),
  station("Stansstad", 46.9767, 8.3389, 7, "REGIONAL"),
  station("Beckenried", 46.9631, 8.4831, 7, "REGIONAL"),

  // 8 Glarus
  station("Glarus", 47.0411, 9.0678, 8, "HUB"),
  station("Näfels-Mollis", 47.0847, 9.0733, 8, "REGIONAL"),
  station("Schwanden GL", 47.0, 9.0667, 8, "REGIONAL"),

  // 9 Zug
  station("Zug", 47.1725, 8.5155, 9, "HUB"),
  station("Cham", 47.1817, 8.4642, 9, "REGIONAL"),
  station("Baar", 47.1962, 8.528, 9, "REGIONAL"),
  station("Rotkreuz", 47.1417, 8.4306, 9, "REGIONAL"),

  // 10 Fribourg
  station("Fribourg/Freiburg", 46.8031, 7.1517, 10, "HUB"),
  station("Bulle", 46.6183, 7.0578, 10, "REGIONAL"),
  station("Murten/Morat", 46.9297, 7.1197, 10, "REGIONAL"),
  station("Romont", 46.6931, 6.9117, 10, "REGIONAL"),

  // 11 Solothurn
  station("Olten", 47.35, 7.9058, 11, "HUB"),
  station("Solothurn", 47.2077, 7.5386, 11, "HUB"),
  station("Grenchen Nord", 47.1975, 7.39, 11, "REGIONAL"),
  station("Balsthal", 47.3167, 7.6903, 11, "REGIONAL"),

  // 12 Basel-Stadt
  station("Basel SBB", 47.5474, 7.5896, 12, "HUB"),
  station("Basel Bad. Bahnhof", 47.5661, 7.5947, 12, "REGIONAL"),

  // 13 Basel-Landschaft
  station("Liestal", 47.4841, 7.7343, 13, "HUB"),
  station("Binningen", 47.5414, 7.5769, 13, "REGIONAL"),
  station("Sissach", 47.4664, 7.8125, 13, "REGIONAL"),
  station("Reinach BL", 47.4931, 7.5883, 13, "REGIONAL"),

  // 14 Schaffhausen
  station("Schaffhausen", 47.697, 8.6339, 14, "HUB"),
  station("Neuhausen am Rheinfall", 47.6858, 8.6169, 14, "REGIONAL"),
  station("Stein am Rhein", 47.6597, 8.86, 14, "REGIONAL"),

  // 15 Appenzell Ausserrhoden
  station("Herisau", 47.3853, 9.2792, 15, "HUB"),
  station("Heiden", 47.4489, 9.5292, 15, "REGIONAL"),
  station("Teufen AR", 47.3711, 9.3086, 15, "REGIONAL"),

  // 16 Appenzell Innerrhoden
  station("Appenzell", 47.3319, 9.4083, 16, "HUB"),

  // 17 St. Gallen
  station("St. Gallen", 47.4239, 9.3697, 17, "HUB"),
  station("Rapperswil", 47.2258, 8.8175, 17, "HUB"),
  station("Wil SG", 47.4644, 9.0453, 17, "REGIONAL"),
  station("Buchs SG", 47.1667, 9.4744, 17, "REGIONAL"),
  station("Sargans", 47.0464, 9.4344, 17, "REGIONAL"),

  // 18 Graubünden
  station("Chur", 46.8508, 9.532, 18, "HUB"),
  station("Davos Platz", 46.8007, 9.836, 18, "REGIONAL"),
  station("St. Moritz", 46.4908, 9.8355, 18, "REGIONAL"),
  station("Landquart", 46.9628, 9.5567, 18, "REGIONAL"),
  station("Thusis", 46.6989, 9.4381, 18, "REGIONAL"),
  station("Samedan", 46.5325, 9.8781, 18, "REGIONAL"),

  // 19 Aargau
  station("Aarau", 47.3919, 8.0442, 19, "HUB"),
  station("Baden", 47.4761, 8.3061, 19, "HUB"),
  station("Brugg AG", 47.4808, 8.2072, 19, "REGIONAL"),
  station("Wohlen AG", 47.3494, 8.2789, 19, "REGIONAL"),
  station("Rheinfelden", 47.5539, 7.7942, 19, "REGIONAL"),
  station("Zofingen", 47.2872, 7.9439, 19, "REGIONAL"),

  // 20 Thurgau
  station("Frauenfeld", 47.5584, 8.8989, 20, "HUB"),
  station("Kreuzlingen", 47.6467, 9.175, 20, "REGIONAL"),
  station("Weinfelden", 47.5675, 9.105, 20, "REGIONAL"),
  station("Arbon", 47.5158, 9.4319, 20, "REGIONAL"),

  // 21 Ticino
  station("Lugano", 46.0053, 8.9463, 21, "HUB"),
  station("Bellinzona", 46.1944, 9.0175, 21, "HUB"),
  station("Locarno", 46.167, 8.7943, 21, "REGIONAL"),
  station("Chiasso", 45.8306, 9.0289, 21, "REGIONAL"),
  station("Mendrisio", 45.8681, 8.9792, 21, "REGIONAL"),

  // 22 Vaud
  station("Lausanne", 46.517, 6.6293, 22, "HUB"),
  station("Montreux", 46.4312, 6.9107, 22, "REGIONAL"),
  station("Yverdon-les-Bains", 46.7785, 6.6414, 22, "REGIONAL"),
  station("Nyon", 46.3833, 6.2394, 22, "REGIONAL"),
  station("Vevey", 46.4628, 6.8419, 22, "REGIONAL"),
  station("Morges", 46.5089, 6.4983, 22, "REGIONAL"),

  // 23 Valais
  station("Sion", 46.2294, 7.3603, 23, "HUB"),
  station("Brig", 46.3022, 7.9878, 23, "HUB"),
  station("Martigny", 46.1023, 7.0722, 23, "REGIONAL"),
  station("Monthey", 46.2536, 6.9481, 23, "REGIONAL"),
  station("Visp", 46.2939, 7.8817, 23, "REGIONAL"),
  station("Zermatt", 46.0207, 7.7491, 23, "REGIONAL"),

  // 24 Neuchâtel
  station("Neuchâtel", 46.9999, 6.9385, 24, "HUB"),
  station("La Chaux-de-Fonds", 47.1039, 6.8253, 24, "REGIONAL"),
  station("Fleurier", 46.9089, 6.5847, 24, "REGIONAL"),

  // 25 Genève
  station("Genève", 46.21, 6.1425, 25, "HUB"),
  station("Genève-Aéroport", 46.2308, 6.1089, 25, "REGIONAL"),
  station("Carouge-Bachet", 46.1839, 6.1275, 25, "REGIONAL"),

  // 26 Jura
  station("Delémont", 47.3644, 7.3444, 26, "HUB"),
  station("Porrentruy", 47.4161, 7.0764, 26, "REGIONAL"),
  station("Saignelégier", 47.2531, 7.0011, 26, "REGIONAL"),
];

// Für die Spielgrösse "Stadt": kuratierte ÖV-Haltestellen / markante Orte
// innerhalb der unterstützten Städte (tier CITY_STOP).
export const CITIES: CityDef[] = [
  { id: "city_zuerich", name: "Zürich", cantonNum: 1, lat: 47.3769, lon: 8.5417 },
  { id: "city_basel", name: "Basel", cantonNum: 12, lat: 47.5596, lon: 7.5886 },
  { id: "city_bern", name: "Bern", cantonNum: 2, lat: 46.948, lon: 7.4474 },
  { id: "city_geneve", name: "Genève", cantonNum: 25, lat: 46.2044, lon: 6.1432 },
  { id: "city_lausanne", name: "Lausanne", cantonNum: 22, lat: 46.5197, lon: 6.6323 },
  { id: "city_luzern", name: "Luzern", cantonNum: 3, lat: 47.0502, lon: 8.3093 },
  { id: "city_stgallen", name: "St. Gallen", cantonNum: 17, lat: 47.4245, lon: 9.3767 },
  { id: "city_winterthur", name: "Winterthur", cantonNum: 1, lat: 47.5, lon: 8.7237 },
  { id: "city_lugano", name: "Lugano", cantonNum: 21, lat: 46.0037, lon: 8.9511 },
  { id: "city_fribourg", name: "Fribourg", cantonNum: 10, lat: 46.8065, lon: 7.1608 },
  { id: "city_biel", name: "Biel/Bienne", cantonNum: 2, lat: 47.1368, lon: 7.2468 },
  { id: "city_thun", name: "Thun", cantonNum: 2, lat: 46.7580, lon: 7.6280 },
];

const CITY_STOPS: Array<[string, string, number, number]> = [
  // Zürich
  ["city_zuerich", "Zürich HB", 47.3779, 8.5403],
  ["city_zuerich", "Stadelhofen", 47.3667, 8.5486],
  ["city_zuerich", "Bellevue", 47.3667, 8.5453],
  ["city_zuerich", "Central", 47.3833, 8.5406],
  ["city_zuerich", "Paradeplatz", 47.37, 8.539],
  ["city_zuerich", "Escher-Wyss-Platz", 47.3897, 8.5219],
  ["city_zuerich", "Oerlikon", 47.4108, 8.5442],
  ["city_zuerich", "Enge", 47.3639, 8.5314],
  ["city_zuerich", "Wiedikon", 47.3717, 8.5136],
  ["city_zuerich", "Altstetten", 47.3908, 8.4881],
  ["city_zuerich", "Wollishofen", 47.3444, 8.5314],
  ["city_zuerich", "Seebach", 47.4211, 8.5406],

  // Basel
  ["city_basel", "Basel SBB", 47.5474, 7.5896],
  ["city_basel", "Basel Bad. Bahnhof", 47.5661, 7.5947],
  ["city_basel", "Marktplatz", 47.5585, 7.5885],
  ["city_basel", "Barfüsserplatz", 47.5556, 7.588],
  ["city_basel", "Schifflände", 47.5595, 7.5915],
  ["city_basel", "Aeschenplatz", 47.5514, 7.594],
  ["city_basel", "St. Johann", 47.5714, 7.5794],
  ["city_basel", "Wettsteinplatz", 47.5658, 7.6057],

  // Bern
  ["city_bern", "Bern HB", 46.9489, 7.4394],
  ["city_bern", "Zytglogge", 46.9481, 7.4475],
  ["city_bern", "Bärenplatz", 46.9469, 7.4453],
  ["city_bern", "Bundesplatz", 46.9466, 7.4441],
  ["city_bern", "Breitenrain", 46.9603, 7.4436],
  ["city_bern", "Wankdorf", 46.9678, 7.4636],
  ["city_bern", "Bern Bethlehem", 46.9333, 7.3833],

  // Genève
  ["city_geneve", "Gare Cornavin", 46.21, 6.1425],
  ["city_geneve", "Bel-Air", 46.2019, 6.1467],
  ["city_geneve", "Rive", 46.2036, 6.1508],
  ["city_geneve", "Plainpalais", 46.1953, 6.1394],
  ["city_geneve", "Eaux-Vives", 46.2011, 6.1583],
  ["city_geneve", "Nations", 46.2214, 6.14],

  // Lausanne
  ["city_lausanne", "Lausanne Gare", 46.517, 6.6293],
  ["city_lausanne", "Flon", 46.5219, 6.6328],
  ["city_lausanne", "St-François", 46.5192, 6.6339],
  ["city_lausanne", "Ouchy", 46.5069, 6.6283],
  ["city_lausanne", "Riponne", 46.5236, 6.6353],

  // Luzern
  ["city_luzern", "Luzern Bahnhof", 47.0502, 8.3093],
  ["city_luzern", "Schwanenplatz", 47.0517, 8.3053],
  ["city_luzern", "Löwenplatz", 47.0553, 8.3081],
  ["city_luzern", "Rathaus-Quai", 47.0508, 8.3067],
  ["city_luzern", "Allmend/Messe", 47.0328, 8.3086],

  // St. Gallen
  ["city_stgallen", "St. Gallen Bahnhof", 47.4239, 9.3697],
  ["city_stgallen", "Marktplatz", 47.4239, 9.3767],
  ["city_stgallen", "Klosterplatz", 47.4236, 9.3772],
  ["city_stgallen", "Rosenberg", 47.4278, 9.3672],

  // Winterthur
  ["city_winterthur", "Winterthur Bahnhof", 47.5, 8.7237],
  ["city_winterthur", "Stadthausstrasse", 47.5011, 8.7239],
  ["city_winterthur", "Neuwiesen", 47.4972, 8.7092],
  ["city_winterthur", "Grüze", 47.5044, 8.7422],

  // Lugano
  ["city_lugano", "Lugano Stazione FFS", 46.0053, 8.9463],
  ["city_lugano", "Lugano Centro", 46.0037, 8.9511],
  ["city_lugano", "Paradiso", 45.9908, 8.9522],
  ["city_lugano", "Cassarate", 46.0111, 8.9578],

  // Fribourg
  ["city_fribourg", "Fribourg Gare", 46.8031, 7.1517],
  ["city_fribourg", "Bourg", 46.8064, 7.1608],
  ["city_fribourg", "Beauregard", 46.7972, 7.1497],

  // Biel/Bienne
  ["city_biel", "Biel/Bienne Bahnhof", 47.1368, 7.2468],
  ["city_biel", "Zentralplatz", 47.1394, 7.2461],
  ["city_biel", "Bözingenfeld", 47.1481, 7.2636],

  // Thun
  ["city_thun", "Thun Bahnhof", 46.758, 7.628],
  ["city_thun", "Rathausplatz", 46.7594, 7.6272],
  ["city_thun", "Allmendingen", 46.7469, 7.6244],
];

for (const [cityId, name, lat, lon] of CITY_STOPS) {
  const city = CITIES.find((c) => c.id === cityId)!;
  STATIONS.push(station(name, lat, lon, city.cantonNum, "CITY_STOP", cityId));
}

export const STATION_BY_ID = new Map(STATIONS.map((s) => [s.id, s]));
export const CITY_BY_ID = new Map(CITIES.map((c) => [c.id, c]));

export function stationsForCanton(cantonNum: number): StationDef[] {
  return STATIONS.filter(
    (s) => s.cantonNum === cantonNum && s.tier !== "CITY_STOP"
  );
}

export function stationsForCountry(): StationDef[] {
  return STATIONS.filter((s) => s.tier === "HUB");
}

export function stationsForCity(cityId: string): StationDef[] {
  return STATIONS.filter((s) => s.tier === "CITY_STOP" && s.city === cityId);
}
