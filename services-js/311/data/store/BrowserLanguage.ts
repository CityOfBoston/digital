import { IncomingMessage } from 'http';
import languageParser from 'accept-language-parser';

export type LanguagePreference = {
  code: string;
  region: string | null;
  quality: number;
};

/**
 * Parses the "Accept-Language" header from the given request and returns the
 * array of LanguagePreference objects.
 */
export default function parseLanguagePreferences(
  req: IncomingMessage | undefined
): Array<LanguagePreference> {
  // process.browser check to allow dead code removal to clear out the parsing
  // module in the client build, where webpack has that set to true.
  return req && !process.browser
    ? languageParser.parse(req.headers['accept-language'])
    : [];
}
