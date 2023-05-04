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
import { DetectLanguage } from '../../common/text/detect-language';
import { StopWordRemove } from '../../common/text/stop-word/stop-word-remove';
import { WordIndex } from '../../common/text/index/word.index';
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

  static computeTags = (element: HTMLElement): string[] => {
    let keywords: string[];
    if (element instanceof HTMLBodyElement) {
      keywords = this.captureKeywordData();
    } else {
      keywords = [...element.innerText.split(' '), document.title];
    }
    const tagList = this.calculateTags(keywords);
    fnConsoleLog('CLEAN WORD LIST', tagList);
    return tagList;
  };

  private static calculateTags(keywords: string[]): string[] {
    let tagList = [];
    for (const keyword of keywords) {
      const words = WordIndex.toWordList(keyword);
      for (const word of words) {
        if (word.length <= 1) continue;
        tagList.push(word);
      }
    }
    tagList = Array.from(new Set(tagList));

    const language = DetectLanguage.detect(document.body.innerText);
    fnConsoleLog('LANGUAGE', language);
    // TODO maybe check if anything removed - if not maybe take second guess from detected language
    if (language) tagList = StopWordRemove.execute(language, tagList);

    return tagList;
  }

  private static captureKeywordData(): string[] {
    return Array.from(
      new Set([...Array.from(this.captureMeta()), ...Array.from(this.captureLdJson()), document.title])
    );
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
