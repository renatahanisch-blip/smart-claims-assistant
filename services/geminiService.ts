import { GoogleGenAI, Type } from "@google/genai";
import { ClaimAnalysis, CrmProfile, InsurerDraft } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_MODEL = "gemini-2.5-flash";
const DRAFTING_MODEL = "gemini-2.5-flash";

export const analyzeClaimEmail = async (emailBody: string, crmProfile: CrmProfile): Promise<ClaimAnalysis> => {
  const prompt = `
    Analysiere die folgende E-Mail im Kontext eines VERSICHERUNGSBROKERS.
    Prüfe das CRM-Portfolio des Kunden auf Deckung.
    
    Kunde: ${JSON.stringify(crmProfile)}
    E-Mail: "${emailBody}"

    Aufgaben:
    1. Kategorisiere den Schaden.
    2. Prüfe anhand der Policen im CRM-Profil, welche Versicherungen involviert sind.
    3. Identifiziere ALLE zuständigen Versicherer (involvedInsurers).
    4. Prüfe, ob wichtige Unterlagen fehlen.
    5. Bewerte die Dringlichkeit (1-10).
    
    WICHTIG:
    - Sprache: Schweizer Hochdeutsch (KEIN 'ß', nur 'ss').
    - Gib "isCovered": true zurück, wenn mindestens eine Police greift.

    SPEZIALREGEL WASSERSCHADEN (SCHWEIZ):
    - Wenn Schaden am Gebäude UND Hausrat möglich ist, müssen BEIDE Versicherungen identifiziert werden.
    - Fülle 'involvedInsurers' Array mit Objekten: 
      - { "name": "Name der Gebäudeversicherung", "reason": "Zuständig für Bausubstanz & Trocknung" }
      - { "name": "Name der Hausratversicherung", "reason": "Zuständig für Mobiliar" }
    
    SPEZIALREGEL VERKEHRSUNFALL / FREMDVERSCHULDEN:
    - Wenn Gegner schuld: { "name": "Haftpflichtversicherung des Unfallgegners", "reason": "Fremdverschulden" }
  `;

  const response = await ai.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          category: { type: Type.STRING },
          sentiment: { type: Type.STRING, enum: ["POSITIVE", "NEUTRAL", "NEGATIVE", "ANGRY"] },
          urgencyScore: { type: Type.INTEGER, description: "Urgency scale from 1 (low) to 10 (critical/emergency)." },
          keyFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
          isCovered: { type: Type.BOOLEAN },
          coverageReason: { type: Type.STRING },
          missingDocuments: { type: Type.ARRAY, items: { type: Type.STRING } },
          insurerName: { type: Type.STRING, description: "Primary insurer name for display purposes." },
          involvedInsurers: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                reason: { type: Type.STRING }
              }
            },
            description: "List of all insurers that need to be contacted."
          },
          suggestedAction: { type: Type.STRING }
        },
        required: ["category", "sentiment", "urgencyScore", "keyFacts", "isCovered", "coverageReason", "missingDocuments", "suggestedAction"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  
  return JSON.parse(text) as ClaimAnalysis;
};

export const generateResponseDrafts = async (
  emailBody: string, 
  analysis: ClaimAnalysis,
  crmProfile: CrmProfile,
  agentName: string = "Renata Hanisch"
): Promise<{ customerDraft: string; insurerDrafts: InsurerDraft[] }> => {
  
  const prompt = `
    Du bist ${agentName}, erfahrene Kundenberaterin eines Versicherungsbrokers.
    
    Szenario:
    - Kunde: ${crmProfile.customerName}
    - Analyse: ${JSON.stringify(analysis)}
    - Involvierte Versicherer: ${JSON.stringify(analysis.involvedInsurers)}
    - E-Mail des Kunden: "${emailBody}"
    
    REGELN:
    1. FORMATIERUNG: Verwende grosszügige Abstände. Füge ZWINGEND eine Leerzeile zwischen ALLEN Absätzen, Anreden und Grussformeln ein (\n\n).
    2. Sprache: Schweizer Hochdeutsch.
    3. ANREDE: ZWINGEND KEIN KOMMA nach der Anrede (z.B. "Guten Tag Frau Tobler" -> neue Zeile). Der Satz danach beginnt Gross.
    4. SIGNATUR: Unterschreibe IMMER mit "Freundliche Grüsse\n\n${agentName}". Verwende KEINE Team-Bezeichnung wie "Ihr REMAlino Team".
    
    AUFGABE 1: E-Mail an den KUNDEN.
    - Informiere über das Vorgehen.
    - FALL WASSERSCHADEN:
      - Erkläre Trennung Gebäude (Trocknung, Parkett) vs. Hausrat (Möbel).
      - Bestätige, dass wir BEIDE Versicherer anschreiben.
      - WICHTIG: Kunde soll NICHT selbst anrufen. WIR (Broker) organisieren den Trocknungsdienst über die Gebäudeversicherung und melden uns wieder.
      - Bitte um Fotos VOR Trocknung.
    - FALL UNFALL/KFZ: 
      - Bedanke dich für Europäisches Protokoll falls erwähnt.
      - WICHTIG GARAGENWAHL: Bestätige dem Kunden explizit, dass er FREIE GARAGENWAHL hat. 
      - Schreibe sinngemäss: "Sie können Ihr Fahrzeug direkt zur von Ihnen gewünschten Garage (z.B. Garage Meier) bringen."
      - WICHTIG BEI FREMDVERSCHULDEN (z.B. Auffahrunfall): 
        - Informiere: "Wir melden den Schaden direkt der Haftpflichtversicherung des Unfallgegners, da dieser die Schuld zugegeben hat."
        - Integriere diesen Inhalt: "Die Verantwortung für den Schaden liegt vollständig bei der Haftpflichtversicherung des Unfallgegners. Diese Versicherung deckt die Reparaturkosten, eine allfällige Wertminderung Ihres Fahrzeugs sowie die Kosten für einen Mietwagen, falls Sie während der Reparatur einen benötigen."

    AUFGABE 2: E-Mails an VERSICHERER.
    - Generiere für JEDEN Eintrag in 'involvedInsurers' (falls vorhanden) eine eigene E-Mail.
    - "insurerDrafts" soll ein Array sein.
    
    INHALT VERSICHERER-MAILS:
    - Melde den Schaden spezifisch für deren Zuständigkeit.
    - Bei Gebäudeversicherung: Dringende Bitte um Trocknungsdienst / Partnerfirma.
    - Bei KFZ-Versicherung (Fremdverschulden): Melde den Schaden zur Information. Erwähne klar, dass die Haftung beim Gegner liegt und wir/der Kunde den Schaden direkt dort geltend macht.
    
    Format:
    JSON mit "customerDraft" (string) und "insurerDrafts" (Array von Objekten { "insurerName": string, "body": string }).
  `;

  const response = await ai.models.generateContent({
    model: DRAFTING_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          customerDraft: { type: Type.STRING },
          insurerDrafts: { 
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                insurerName: { type: Type.STRING },
                body: { type: Type.STRING }
              },
              required: ["insurerName", "body"]
            }
          },
        },
        required: ["customerDraft", "insurerDrafts"],
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Error generating drafts");
  
  const json = JSON.parse(text);
  return {
    customerDraft: json.customerDraft,
    insurerDrafts: json.insurerDrafts || []
  };
};