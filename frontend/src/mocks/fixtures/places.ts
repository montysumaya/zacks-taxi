import type { Place } from "@/types";

export const places = {
  airport: {
    id: "place_bey",
    kind: "airport",
    name: {
      en: "Beirut–Rafic Hariri International Airport",
      ar: "مطار رفيق الحريري الدولي - بيروت",
    },
    address: { en: "Airport Road, Beirut", ar: "طريق المطار، بيروت" },
    location: { lat: 33.8209, lng: 35.4884 },
  },
  downtown: {
    id: "place_downtown",
    kind: "landmark",
    name: { en: "Downtown Beirut", ar: "وسط بيروت" },
    address: { en: "Martyrs' Square, Beirut", ar: "ساحة الشهداء، بيروت" },
    location: { lat: 33.8959, lng: 35.5056 },
  },
  hamra: {
    id: "place_hamra",
    kind: "address",
    name: { en: "Hamra Street", ar: "شارع الحمرا" },
    address: { en: "Hamra, Beirut", ar: "الحمرا، بيروت" },
    location: { lat: 33.8963, lng: 35.4822 },
  },
  achrafieh: {
    id: "place_achrafieh",
    kind: "address",
    name: { en: "Sassine Square", ar: "ساحة ساسين" },
    address: { en: "Achrafieh, Beirut", ar: "الأشرفية، بيروت" },
    location: { lat: 33.8869, lng: 35.5196 },
  },
  jounieh: {
    id: "place_jounieh",
    kind: "city",
    name: { en: "Jounieh", ar: "جونية" },
    location: { lat: 33.9808, lng: 35.6178 },
  },
  byblos: {
    id: "place_byblos",
    kind: "city",
    name: { en: "Byblos", ar: "جبيل" },
    location: { lat: 34.123, lng: 35.6519 },
  },
  batroun: {
    id: "place_batroun",
    kind: "city",
    name: { en: "Batroun", ar: "البترون" },
    location: { lat: 34.2553, lng: 35.6581 },
  },
  tripoli: {
    id: "place_tripoli",
    kind: "city",
    name: { en: "Tripoli", ar: "طرابلس" },
    location: { lat: 34.4367, lng: 35.8497 },
  },
  sidon: {
    id: "place_sidon",
    kind: "city",
    name: { en: "Sidon", ar: "صيدا" },
    location: { lat: 33.5631, lng: 35.3689 },
  },
  tyre: {
    id: "place_tyre",
    kind: "city",
    name: { en: "Tyre", ar: "صور" },
    location: { lat: 33.2704, lng: 35.2038 },
  },
  zahle: {
    id: "place_zahle",
    kind: "city",
    name: { en: "Zahle", ar: "زحلة" },
    location: { lat: 33.8463, lng: 35.902 },
  },
  faraya: {
    id: "place_faraya",
    kind: "landmark",
    name: { en: "Faraya", ar: "فاريا" },
    location: { lat: 34.0057, lng: 35.8289 },
  },
} satisfies Record<string, Place>;

export const placeList: Place[] = Object.values(places);
