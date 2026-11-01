// Einheitlicher Fehler für die Oberfläche: Code aus extensions.code, Text auf Deutsch
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

// Meldungen für Nutzer, Codes kommen vom Core über den GraphQL-Service
const MESSAGES: Record<string, string> = {
  UNAUTHORIZED: 'Bitte melde dich an.',
  LOGIN_FAILED: 'E-Mail oder Passwort ist falsch.',
  VALIDATION_ERROR: 'Bitte prüfe deine Eingaben.',
  EMAIL_TAKEN: 'Diese E-Mail-Adresse ist schon registriert.',
  USERNAME_TAKEN: 'Dieser Benutzername ist schon vergeben.',
  NOT_A_MEMBER: 'Du bist kein Mitglied dieser Tippgruppe.',
  GROUP_NOT_FOUND: 'Diese Tippgruppe gibt es nicht.',
  INVITE_INVALID: 'Der Einladungscode ist ungültig.',
  ALREADY_MEMBER: 'Du bist schon Mitglied dieser Tippgruppe.',
  GROUP_FULL: 'Diese Tippgruppe ist voll.',
  INVALID_SCORE: 'Bitte nur ganze Zahlen von 0 bis 20 eingeben.',
  TIP_LOCKED: 'Das Spiel hat begonnen, Tipps sind jetzt gesperrt.',
  MATCH_BEFORE_JOIN: 'Dieses Spiel hat vor deinem Beitritt begonnen.',
  MATCH_NOT_FOUND: 'Dieses Spiel gibt es nicht mehr. Bitte lade die Seite neu.',
  CORE_UNAVAILABLE: 'Der Server ist gerade nicht erreichbar. Bitte versuche es gleich noch einmal.',
  NETWORK_ERROR: 'Keine Verbindung zum Server. Bitte prüfe deine Internetverbindung.',
};

export function messageFor(code: string, fallback?: string): string {
  return MESSAGES[code] ?? fallback ?? 'Da ist etwas schiefgelaufen. Bitte versuche es noch einmal.';
}
