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
import { GramNlp } from '../../common/text/nlp/gram.nlp';
import { TextClean } from '../../common/text/text-clean';
import { TextSentence } from '../../common/text/text-sentence';
import { TextWord } from '../../common/text/text-word';
import { WordToVectorNlp } from '../../common/text/nlp/word-to-vector.nlp';
import { fnConsoleLog } from '../../common/fn/console.fn';

export class AutoTagMediator {
  private static readonly META_PROPERTIES = [
    'og:title',
    'og:description',
    'twitter:title',
    'twitter:description',
    'description',
    'news_keywords'
  ];

  static precompute(): void {
    this.captureKeywordData();
  }

  static analyse(element: HTMLElement): void {
    fnConsoleLog('AutoTagMediator->analyse->TODO', element.innerText);
  }

  private static captureKeywordData(): void {
    fnConsoleLog('KEYWORDS START !!!');
    const keywords = Array.from(new Set([...Array.from(this.captureMeta()), ...Array.from(this.captureLdJson())]));

    for (const keyword of keywords) {
      fnConsoleLog('KEYWORD : ', keyword);
      GramNlp.addGram(keyword);
    }
    // Old way
    const words = [];
    for (const keyword of keywords) {
      const clean = TextClean.allTextClean(keyword);
      const sentences = TextSentence.split(clean);
      for (const sentence of sentences) {
        let wordList = TextWord.split(sentence);
        wordList = TextClean.wordClean(wordList);
        words.push(...wordList);
      }
    }
    fnConsoleLog('WORDS !!!', words);
    try {
      const vectors = [];
      for (const word of words) {
        const vec = WordToVectorNlp.word2vec(word, GramNlp.gramNum);
        vectors.push(vec);
      }
      const wordsRollback = [];
      for (const vector of vectors) {
        wordsRollback.push(WordToVectorNlp.vec2word(vector, GramNlp.numGram));
      }
      fnConsoleLog('WORDS ROLLBACK !!!', wordsRollback);
    } catch (e) {
      fnConsoleLog('ERROR VECTOR', e);
    }
  }

  private static captureMeta(): Set<string> {
    const metaList = Array.from(document.querySelectorAll('meta[property], meta[name]'));
    const out = new Set<string>();
    for (const meta of metaList) {
      const property = meta.getAttribute('property');
      const name = meta.getAttribute('name');
      const content = meta.getAttribute('content');
      if (property && content && this.META_PROPERTIES.includes(property)) {
        out.add(content);
      }
      if (name && content && this.META_PROPERTIES.includes(name)) {
        out.add(content);
      }
    }
    return out;
  }

  private static captureLdJson(): Set<string> {
    const out = new Set<string>();
    const ldJsonScript = Array.from(document.getElementsByTagName('script')).filter(
      (s) => s.getAttribute('type') && s.getAttribute('type') == 'application/ld+json'
    );
    for (const script of ldJsonScript) {
      try {
        const content = JSON.parse(script.innerText);
        if (content['@type'] === 'NewsArticle' || content['@type'] === 'Article') {
          if (content['description']) out.add(content['description']);
          if (content['headline']) out.add(content['headline']);
        }
      } catch (e) {
        fnConsoleLog('captureLdJson->Error', e);
      }
    }
    return out;
  }
}
