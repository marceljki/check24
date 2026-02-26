import type { FormDefinition } from '../types'

export const anlageSonderausgaben2025: FormDefinition = {
  id: 'anlage_sonderausgaben',
  name: 'Anlage Sonderausgaben 2025',
  description: 'Für Ausgaben wie Spenden, Kirchensteuer, Unterhalt und Ausbildungskosten',
  triggerKeywords: ['spenden', 'kirchensteuer', 'unterhalt', 'sonderausgaben', 'ausbildung', 'studium', 'schulgeld'],
  fields: [
    {
      id: 'spendenBetrag',
      label: 'Spenden und Mitgliedsbeiträge',
      question: 'Haben Sie im Jahr 2025 Spenden oder Mitgliedsbeiträge an steuerbegünstigte Organisationen gezahlt? Wenn ja, wie viel insgesamt?',
      type: 'number',
      required: false,
      hint: 'In Euro, Spendenbescheinigungen bereithalten',
    },
    {
      id: 'politischeSpenden',
      label: 'Spenden an politische Parteien',
      question: 'Haben Sie Mitgliedsbeiträge oder Spenden an politische Parteien gezahlt?',
      type: 'number',
      required: false,
      hint: 'In Euro',
    },
    {
      id: 'kirchensteuerGezahlt',
      label: 'Gezahlte Kirchensteuer',
      question: 'Wie viel Kirchensteuer haben Sie im Jahr 2025 insgesamt gezahlt? Dies umfasst einbehaltene und nachgezahlte Beträge.',
      type: 'number',
      required: false,
      hint: 'In Euro',
    },
    {
      id: 'unterhaltGezahlt',
      label: 'Unterhalt an Ehegatten',
      question: 'Haben Sie Unterhaltszahlungen an Ihren geschiedenen oder getrennt lebenden Ehegatten geleistet?',
      type: 'number',
      required: false,
      hint: 'In Euro, maximal 13.805 Euro absetzbar',
    },
    {
      id: 'schulgeld',
      label: 'Schulgeld',
      question: 'Haben Sie Schulgeld für eine Privatschule oder anerkannte Ersatzschule gezahlt?',
      type: 'number',
      required: false,
      hint: 'In Euro, 30% der Kosten absetzbar',
    },
    {
      id: 'berufsausbildungskosten',
      label: 'Berufsausbildungskosten (Erststudium)',
      question: 'Hatten Sie Kosten für eine erstmalige Berufsausbildung oder ein Erststudium?',
      type: 'number',
      required: false,
      hint: 'In Euro, maximal 6.000 Euro als Sonderausgaben',
    },
  ],
}
