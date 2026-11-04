// KI-Log NS-27 "GraphQL mit Token im Header, geschützte Routen."
// Live-Umgebung: GraphQL-Service auf Heroku (URL wird beim Deployment eingetragen)
export const environment = {
  production: true,
  graphqlUrl: 'https://tipprunde-graphql-1d89bddb9da1.herokuapp.com/graphql',
  // MPA für Registrierung, Impressum und Datenschutz
  mpaUrl: 'https://tipprunde-team.github.io/tipprunde-web',
};
