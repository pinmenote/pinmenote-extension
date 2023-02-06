/*
 * This file is part of the pinmenote-extension distribution (https://github.com/pinmenote/pinmenote-extension).
 * Copyright (c) 2023 Michal Szczepanski.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import { ArabicStemmer } from '../../../vendor/text/stem/snowball/arabic-stemmer';
import { CzechStemmer } from '../../../vendor/text/stem/snowball/czech-stemmer';
import { DanishStemmer } from '../../../vendor/text/stem/snowball/danish-stemmer';
import { DutchStemmer } from '../../../vendor/text/stem/snowball/dutch-stemmer';
import { EnglishStemmer } from '../../../vendor/text/stem/snowball/english-stemmer';
import { EstonianStemmer } from '../../../vendor/text/stem/snowball/estonian-stemmer';
import { FinnishStemmer } from '../../../vendor/text/stem/snowball/finnish-stemmer';
import { FrenchStemmer } from '../../../vendor/text/stem/snowball/french-stemmer';
import { GermanStemmer } from '../../../vendor/text/stem/snowball/german-stemmer';
import { GreekStemmer } from '../../../vendor/text/stem/snowball/greek-stemmer';
import { HindiStemmer } from '../../../vendor/text/stem/snowball/hindi-stemmer';
import { HungarianStemmer } from '../../../vendor/text/stem/snowball/hungarian-stemmer';
import { IndonesianStemmer } from '../../../vendor/text/stem/snowball/indonesian-stemmer';
import { IrishStemmer } from '../../../vendor/text/stem/snowball/irish-stemmer';
import { ItalianStemmer } from '../../../vendor/text/stem/snowball/italian-stemmer';
import { LithuanianStemmer } from '../../../vendor/text/stem/snowball/lithuanian-stemmer';
import { NepaliStemmer } from '../../../vendor/text/stem/snowball/nepali-stemmer';
import { NorwegianStemmer } from '../../../vendor/text/stem/snowball/norwegian-stemmer';
import { PolishStemmer } from '../../../vendor/text/stem/snowball/polish-stemmer';
import { PortugueseStemmer } from '../../../vendor/text/stem/snowball/portuguese-stemmer';
import { RomanianStemmer } from '../../../vendor/text/stem/snowball/romanian-stemmer';
import { RussianStemmer } from '../../../vendor/text/stem/snowball/russian-stemmer';
import { SlovakStemmer } from '../../../vendor/text/stem/snowball/slovak-stemmer';
import { SpanishStemmer } from '../../../vendor/text/stem/snowball/spanish-stemmer';
import { StemmerBn } from '../../../vendor/text/stem/nlp-js/stemmer-bn';
import { StemmerLt } from '../../../vendor/text/stem/nlp-js/stemmer-lt';
import { StemmerSl } from '../../../vendor/text/stem/nlp-js/stemmer-sl';
import { StemmerTl } from '../../../vendor/text/stem/nlp-js/stemmer-tl';
import { SwedishStemmer } from '../../../vendor/text/stem/snowball/swedish-stemmer';
import { TamilStemmer } from '../../../vendor/text/stem/snowball/tamil-stemmer';
import { TurkishStemmer } from '../../../vendor/text/stem/snowball/turkish-stemmer';
import { UkrainianStemmer } from '../../../vendor/text/stem/snowball/ukrainian-stemmer';

export class LanguageStem {
  // stop word missing from language detect 'kn','mk','ml','ne','pa','sq','ta','te',
  // language detect missing from stop word 'br','ca','eo','eu','ga','gl','ha','ha','hy','ku','la','ms','st','yo','zu'

  // Language detection common with stop word files
  // 'af', 'ar', 'bg', 'bn', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'fa', 'fi', 'fr', 'gu', 'he', 'hi', 'hr', 'hu',
  // 'id', 'it', 'ja', 'ko', 'lt', 'lv', 'mr', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sk', 'sl', 'so', 'sv', 'sw', 'th',
  // 'tl', 'tr', 'uk', 'ur', 'vi', 'zh-cn', 'zh-tw'

  // Steamers
  private static languageIso2Map: { [key: string]: any } = {
    af: null, //'Afrikaans',
    ar: ArabicStemmer, //'Arabic',
    bg: null, //'Bulgarian',
    bn: StemmerBn, //'Bengali',
    br: null, //'Breton',
    ca: null, //'Catalan',
    cs: CzechStemmer, //'Czech',
    da: DanishStemmer, //'Danish',
    de: GermanStemmer,
    el: GreekStemmer, //'Greek',
    en: EnglishStemmer, //'English',
    eo: null, // 'Esperanto',
    es: SpanishStemmer, // 'Spanish',
    et: EstonianStemmer, //'Estonian',
    eu: null, //'Basque',
    fa: null, //'Persian',
    fi: FinnishStemmer, //'Finnish',
    fr: FrenchStemmer, //'French',
    ga: IrishStemmer, //'Irish',
    gl: null, //'Galician',
    gu: null, //'Gujarati',
    ha: null, //'Hausa',
    he: null, //'Hebrew',
    hi: HindiStemmer, //'Hindi',
    hr: null, //'Croatian',
    hu: HungarianStemmer, //'Hungarian',
    hy: null, //'Armenian',
    id: IndonesianStemmer, //'Indonesian',
    it: ItalianStemmer, //'Italian',
    ja: null, //'Japanese',
    kn: null, //'Kannada',
    ko: null, //'Korean',
    ku: null, //'Kurdish',
    la: null, //'Latin',
    lt: LithuanianStemmer, //'Lithuanian',
    lv: StemmerLt, //'Latvian',
    mk: null, //'Macedonian',
    ml: null, //'Malayalam',
    ms: null, //'Malay',
    mr: null, //'Marathi',
    ne: NepaliStemmer, //'Nepali',
    nl: DutchStemmer, //'Dutch',
    no: NorwegianStemmer, //'Norwegian',
    pa: null, //'Punjabi',
    pl: PolishStemmer,
    pt: PortugueseStemmer, //'Portuguese',
    ro: RomanianStemmer, //'Romanian',
    ru: RussianStemmer, //'Russian',
    sk: SlovakStemmer, //'Slovak',
    sl: StemmerSl, //'Slovenian',
    so: null, //'Somali',
    sq: null, //'Albanian',
    st: null, //'Southern Sotho',
    sv: SwedishStemmer, //'Swedish',
    sw: null, //'Swahili',
    ta: TamilStemmer, //'Tamil',
    te: null, //'Tegulu',
    th: null, //'Thai',
    tl: StemmerTl, //'Tagalog',
    tr: TurkishStemmer, //'Turkish',
    uk: UkrainianStemmer, //'Ukrainian',
    ur: null, //'Urdu',
    vi: null, //'Vietnam',
    yo: null, //Yoruba,
    zh: null, //'Chinese',
    zu: null //'Zulu',
  };

  static stemWord(iso2lang: string, inputWords: string[]): string[] {
    if (!this.languageIso2Map[iso2lang]) return inputWords;
    //eslint-disable-next-line @typescript-eslint/no-unsafe-call
    const stemmer = new this.languageIso2Map[iso2lang]();
    const out = [];
    for (let word of inputWords) {
      //eslint-disable-next-line
      word = stemmer.stemWord(word);
      out.push(word);
    }
    return out;
  }
}
