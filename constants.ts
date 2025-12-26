import { Claim, ClaimStatus } from './types';

export const MOCK_CLAIMS: Claim[] = [
  {
    id: 'CLM-002',
    status: ClaimStatus.NEW,
    insurerDrafts: [],
    crmProfile: {
      customerName: 'Vreni Tobler',
      isVip: true,
      familyMembers: [
        { name: 'Hans Tobler', relation: 'Ehemann', inHousehold: true },
        { name: 'Lukas Tobler', relation: 'Sohn', inHousehold: true }
      ],
      policies: [
        { id: 'POL-101', name: 'Haushaltversicherung (Hausrat)', company: 'Mobiliar', number: 'HR-774411', coverageDetails: 'Feuer, Elementar, Wasser, Diebstahl. Zusatz: 24h Home Assistance.' },
        { id: 'POL-102', name: 'Gebäudeversicherung', company: 'GVZ (Gebäudeversicherung Kanton Zürich)', number: 'GVZ-8822', coverageDetails: 'Feuer & Elementar' }
      ]
    },
    email: {
      id: 'MSG-102',
      fromName: 'Vreni Tobler',
      fromEmail: 'vreni.tobler@bluewin.ch',
      subject: 'Wasserschaden Ferrachstrasse Rüti',
      receivedDate: '2023-10-27T14:30:00Z',
      body: `Grüezi mitenand,

als ich heute in unser Haus an der Ferrachstrasse in Rüti zurückkam, stand die Küche unter Wasser. Offenbar ist der Schlauch vom Geschirrspüler geplatzt.

Der Parkett im angrenzenden Wohnbereich ist auch schon aufgequollen. Hans hat das Wasser abgestellt, aber wir brauchen dringend einen Trocknungsservice, bevor sich Schimmel bildet.

Ist das über die Hausrat gedeckt oder müssen wir das der Gebäudeversicherung melden?

Freundliche Grüsse,
Vreni Tobler`
    }
  },
  {
    id: 'CLM-003',
    status: ClaimStatus.NEW,
    insurerDrafts: [],
    crmProfile: {
      customerName: 'ZüriOberland Logistik AG',
      isVip: false,
      familyMembers: [],
      companyAffiliation: undefined,
      policies: [
        { id: 'POL-201', name: 'Transportversicherung', company: 'Helvetia', number: 'TV-888-99', coverageDetails: 'Warentransport All Risk, Güter bis CHF 100\'000' }
      ]
    },
    email: {
      id: 'MSG-103',
      fromName: 'Beat Egli',
      fromEmail: 'dispo@zo-logistik.ch',
      subject: 'Ladungsschaden Lager Hinwil',
      receivedDate: '2023-10-26T11:00:00Z',
      body: `Sali zäme,

wir haben ein Problem mit einer Lieferung ab unserem Lager im Industriegebiet Hinwil. Beim Verlad auf der Rampe ist eine Palette mit Elektronikteilen (Wert ca. CHF 12'000) vom Stapler gekippt.

Die Ware ist komplett hinüber. Das war unser eigener Staplerfahrer (Lernender).

Greift hier unsere Transportversicherung oder ist das ein Fall für die Betriebshaftpflicht? Bitte um kurze Rückmeldung, damit wir die Nachbestellung auslösen können.

Merci und Gruess,
Beat Egli
Leiter Disposition`
    }
  },
  {
    id: 'CLM-004',
    status: ClaimStatus.NEW,
    insurerDrafts: [],
    crmProfile: {
      customerName: 'Sandra Hürlimann',
      isVip: false,
      familyMembers: [],
      policies: [
        { id: 'POL-401', name: 'Privathaftpflicht', company: 'Allianz', number: 'PH-445566', coverageDetails: 'Privathaftpflicht Einzelperson, Selbstbehalt CHF 200' },
        { id: 'POL-402', name: 'Haushaltversicherung', company: 'Allianz', number: 'HR-223344', coverageDetails: 'Feuer, Wasser, Einbruchdiebstahl zu Hause. (Kein Glasbruch, keine Kasko)' }
      ]
    },
    email: {
      id: 'MSG-104',
      fromName: 'Sandra Hürlimann',
      fromEmail: 'sandra.h@gmx.ch',
      subject: 'Brille kaputt',
      receivedDate: '2023-10-28T08:45:00Z',
      body: `Guten Tag,

mir ist gestern ein Missgeschick passiert. Ich habe mich versehentlich auf meine eigene Lesebrille gesetzt, die auf dem Sofa lag. Das Gestell ist gebrochen.

Die Brille war sehr teuer (ca. 800 Franken). Über welche Versicherung läuft das? Privathaftpflicht oder Hausrat?

Besten Dank für die Abklärung.

Freundliche Grüsse
Sandra Hürlimann`
    }
  },
  {
    id: 'CLM-001',
    status: ClaimStatus.NEW,
    insurerDrafts: [],
    crmProfile: {
      customerName: 'Reto Keller',
      isVip: false,
      familyMembers: [{ name: 'Silvia Keller', relation: 'Ehefrau', inHousehold: true }],
      policies: [
        { id: 'POL-001', name: 'Motorfahrzeugversicherung', company: 'Allianz Suisse', number: 'MF-ZH-998877', coverageDetails: 'Vollkasko, Parkschaden, Bonusschutz, Freie Garagewahl' },
        { id: 'POL-002', name: 'Privathaftpflicht', company: 'AXA', number: 'PH-112233', coverageDetails: 'Weltweit, Mieterschäden' }
      ],
      companyAffiliation: {
        companyName: 'Keller Gartenbau Wetzikon',
        role: 'Inhaber',
        policies: [
           { id: 'POL-CORP-1', name: 'Betriebshaftpflicht', company: 'Zürich', number: 'BH-555', coverageDetails: 'Personenschäden bis 5 Mio.' }
        ]
      }
    },
    email: {
      id: 'MSG-101',
      fromName: 'Reto Keller',
      fromEmail: 'reto.keller@beispiel.ch',
      subject: 'Auffahrunfall A53 Uster Nord',
      receivedDate: '2023-10-27T09:15:00Z',
      body: `Hoi zäme,

mir ist gestern auf dem Heimweg nach Wetzikon einer hinten reingedonnert. Das war auf der A53 kurz vor der Ausfahrt Uster Nord im Feierabendverkehr.

Mein Audi hat hinten links ordentlich was abbekommen. Der Kofferraumdeckel ist verzogen und die Stossstange hängt runter.

Der Unfallgegner hat seine Schuld zugegeben. Das europäische Unfallprotokoll haben wir ausgefüllt. Ich habe es euch eingescannt und sende es hiermit im Anhang.

Soll ich den Wagen direkt zur Garage Meier in Wetzikon bringen oder habt ihr eine Partnergarage in der Nähe?

Gruess,
Reto

[Anhang: Europäisches_Unfallprotokoll_Keller.pdf]`
    }
  }
];