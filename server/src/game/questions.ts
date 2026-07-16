import { QuestionDef } from "./types";

// {{REGION}} wird clientseitig / serverseitig durch die passende Bezeichnung
// je nach Spielgrösse ersetzt: Stadt -> "Stadtkreis/Quartier", Kanton -> "Bezirk",
// Schweiz -> "Kanton".

export const QUESTIONS: QuestionDef[] = [
  // ---------------------------------------------------------------- GEOGRAPHY
  {
    id: "geo_direction",
    category: "GEOGRAPHY",
    title: "Himmelsrichtung",
    description:
      "Wählt einen Referenzort und eine Linie in eine Himmelsrichtung. Der Hider sagt, auf welcher Seite der Linie seine Hiding Zone liegt.",
    answerType: "CHOICE",
    hasStrongVariant: true,
  },
  {
    id: "geo_nearer_to",
    category: "GEOGRAPHY",
    title: "Näher an A oder B?",
    description:
      "Wählt zwei Orte. Der Hider sagt, welchem der beiden Orte seine Hiding Zone näher ist.",
    answerType: "CHOICE",
    hasStrongVariant: true,
  },
  {
    id: "geo_radius",
    category: "GEOGRAPHY",
    title: "Radius-Frage",
    description:
      "Wählt einen Ort und eine Distanz in km. Der Hider sagt, ob die Hiding Zone innerhalb dieses Radius liegt.",
    answerType: "BOOLEAN",
    hasStrongVariant: true,
  },
  {
    id: "geo_elevation",
    category: "GEOGRAPHY",
    title: "Höhenvergleich",
    description:
      "Wählt einen Referenzort. Der Hider sagt, ob seine Hiding Zone höher oder tiefer liegt als dieser Ort.",
    answerType: "CHOICE",
    hasStrongVariant: false,
  },
  {
    id: "geo_region",
    category: "GEOGRAPHY",
    title: "Gebietsfrage",
    description:
      "Nennt ein {{REGION}}. Der Hider sagt, ob seine Hiding Zone in diesem Gebiet liegt.",
    answerType: "BOOLEAN",
    hasStrongVariant: true,
    regionAware: true,
  },

  // -------------------------------------------------------------------- PHOTO
  {
    id: "photo_architecture",
    category: "PHOTO",
    title: "Architektur-Foto",
    description:
      "Der Hider fotografiert ein Gebäude mit einer für die Umgebung typischen Bauweise.",
    answerType: "PHOTO",
    hasStrongVariant: false,
  },
  {
    id: "photo_landscape",
    category: "PHOTO",
    title: "Landschaftstyp-Foto",
    description:
      "Der Hider fotografiert die vorherrschende Landschaft in Sichtweite (Wald, Feld, Wasser, urban, Berge ...).",
    answerType: "PHOTO",
    hasStrongVariant: false,
  },
  {
    id: "photo_transport",
    category: "PHOTO",
    title: "Verkehrsmittel-Foto",
    description:
      "Der Hider fotografiert ein Verkehrsmittel oder eine Haltestelle in Sichtweite.",
    answerType: "PHOTO",
    hasStrongVariant: true,
  },
  {
    id: "photo_color",
    category: "PHOTO",
    title: "Farbfoto",
    description:
      "Die Seeker geben eine Farbe vor. Der Hider fotografiert ein Objekt dieser Farbe in seiner Umgebung.",
    answerType: "PHOTO",
    hasStrongVariant: false,
  },
  {
    id: "photo_people",
    category: "PHOTO",
    title: "Belebtheits-Foto",
    description:
      "Der Hider macht ein Foto, das zeigt, wie belebt sein Standort gerade ist (Gesichter dürfen unkenntlich gemacht werden).",
    answerType: "PHOTO",
    hasStrongVariant: false,
  },

  // -------------------------------------------------------------------- VIDEO
  {
    id: "video_panorama",
    category: "VIDEO",
    title: "360°-Schwenk",
    description:
      "Der Hider nimmt ein kurzes Rundum-Video seiner unmittelbaren Umgebung auf.",
    answerType: "VIDEO",
    hasStrongVariant: true,
  },
  {
    id: "video_boarding",
    category: "VIDEO",
    title: "Ein-/Ausstieg",
    description:
      "Der Hider filmt sich selbst beim Ein- oder Ausstieg aus einem öffentlichen Verkehrsmittel.",
    answerType: "VIDEO",
    hasStrongVariant: false,
  },
  {
    id: "video_busyness",
    category: "VIDEO",
    title: "Betriebsamkeit",
    description:
      "Der Hider nimmt ein Video auf, das zeigt, wie belebt der Ort gerade ist.",
    answerType: "VIDEO",
    hasStrongVariant: false,
  },
  {
    id: "video_detail",
    category: "VIDEO",
    title: "Gebäudedetail",
    description:
      "Der Hider filmt ein charakteristisches Detail eines nahen Gebäudes (Fassade, Tür, Schild).",
    answerType: "VIDEO",
    hasStrongVariant: false,
  },
  {
    id: "video_soundscape",
    category: "VIDEO",
    title: "Typisches Geräusch",
    description:
      "Der Hider nimmt ein kurzes Video mit einem für die Umgebung typischen Hintergrundgeräusch auf.",
    answerType: "VIDEO",
    hasStrongVariant: true,
  },

  // -------------------------------------------------------------------- AUDIO
  {
    id: "audio_ambience",
    category: "AUDIO",
    title: "Umgebungsgeräusch",
    description:
      "Der Hider nimmt 15 Sekunden Umgebungsgeräusche auf, ohne zu verraten, wo er ist.",
    answerType: "AUDIO",
    hasStrongVariant: false,
  },
  {
    id: "audio_announcement",
    category: "AUDIO",
    title: "Durchsage",
    description:
      "Der Hider nimmt eine öffentliche Durchsage oder Ansage auf, falls vorhanden.",
    answerType: "AUDIO",
    hasStrongVariant: true,
  },
  {
    id: "audio_vehicle",
    category: "AUDIO",
    title: "Vorbeifahrt",
    description:
      "Der Hider nimmt das Geräusch des nächsten vorbeifahrenden Verkehrsmittels auf.",
    answerType: "AUDIO",
    hasStrongVariant: false,
  },
  {
    id: "audio_crowd",
    category: "AUDIO",
    title: "Stimmengewirr",
    description:
      "Der Hider nimmt anonymisiertes Stimmengewirr aus seiner Umgebung auf.",
    answerType: "AUDIO",
    hasStrongVariant: false,
  },
  {
    id: "audio_nature",
    category: "AUDIO",
    title: "Naturgeräusch",
    description:
      "Der Hider nimmt ein Naturgeräusch auf (Wind, Wasser, Vögel ...), falls vorhanden.",
    answerType: "AUDIO",
    hasStrongVariant: false,
  },

  // --------------------------------------------------------------------- TEXT
  {
    id: "text_first_letter",
    category: "TEXT",
    title: "Anfangsbuchstabe",
    description:
      "Der Hider nennt den ersten Buchstaben des Namens der nächstgelegenen Haltestelle.",
    answerType: "TEXT",
    hasStrongVariant: false,
  },
  {
    id: "text_letter_count",
    category: "TEXT",
    title: "Buchstabenanzahl",
    description:
      "Der Hider nennt die Anzahl Buchstaben im Namen des nächstgelegenen Ortes.",
    answerType: "NUMBER",
    hasStrongVariant: false,
  },
  {
    id: "text_sign_word",
    category: "TEXT",
    title: "Wort auf einem Schild",
    description:
      "Der Hider überträgt ein Wort von einem Schild in seiner Nähe (per Foto oder Abschrift).",
    answerType: "TEXT",
    hasStrongVariant: true,
  },
  {
    id: "text_postal_prefix",
    category: "TEXT",
    title: "PLZ-Region",
    description:
      "Der Hider nennt die ersten zwei Ziffern der Postleitzahl seines Standorts.",
    answerType: "TEXT",
    hasStrongVariant: true,
  },
  {
    id: "text_landmark_name",
    category: "TEXT",
    title: "Name einer Institution",
    description:
      "Der Hider nennt den Namen eines Geschäfts oder einer Institution in Sichtweite.",
    answerType: "TEXT",
    hasStrongVariant: false,
  },

  // ---------------------------------------------------------------- PHYSICAL
  {
    id: "phys_temperature",
    category: "PHYSICAL",
    title: "Temperatur",
    description:
      "Der Hider nennt die aktuelle Temperatur an seinem Standort, gerundet auf 5 °C.",
    answerType: "NUMBER",
    hasStrongVariant: false,
  },
  {
    id: "phys_elevation",
    category: "PHYSICAL",
    title: "Höhe über Meer",
    description:
      "Der Hider nennt seine Höhe über Meer, gerundet auf 100 m.",
    answerType: "NUMBER",
    hasStrongVariant: true,
  },
  {
    id: "phys_platform_count",
    category: "PHYSICAL",
    title: "Anzahl Gleise/Bahnsteige",
    description:
      "Der Hider nennt die Anzahl Gleise oder Bahnsteige der nächstgelegenen Station.",
    answerType: "NUMBER",
    hasStrongVariant: false,
  },
  {
    id: "phys_water_visible",
    category: "PHYSICAL",
    title: "Gewässer sichtbar?",
    description:
      "Der Hider sagt, ob von seinem Standort aus ein See oder Fluss sichtbar ist.",
    answerType: "BOOLEAN",
    hasStrongVariant: false,
  },
  {
    id: "phys_border_distance",
    category: "PHYSICAL",
    title: "Distanz zur Grenze",
    description:
      "Der Hider nennt die Distanz zur nächsten Kantons- oder Landesgrenze, gerundet auf 500 m.",
    answerType: "NUMBER",
    hasStrongVariant: true,
  },
];

export const QUESTION_BY_ID = new Map(QUESTIONS.map((q) => [q.id, q]));

export const CATEGORY_LABELS: Record<string, string> = {
  GEOGRAPHY: "Geografie",
  PHOTO: "Foto",
  VIDEO: "Video",
  AUDIO: "Audio",
  TEXT: "Text",
  PHYSICAL: "Umgebung",
};
