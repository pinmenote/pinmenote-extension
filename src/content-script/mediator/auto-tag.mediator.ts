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
import { WordFactory } from '../../common/text/word.factory';
import { fnConsoleLog } from '../../common/fn/fn-console';

export class AutoTagMediator {
  private static readonly META_PROPERTIES = [
    'og:title',
    'og:description',
    'twitter:title',
    'twitter:description',
    'description',
    'news_keywords'
  ];

  private static readonly REMOVE_LINK_REGEX = new RegExp(
    '(https?:\\/\\/)?([\\da-z\\.-]+)\\.([a-z\\.]{2,6})([\\/\\w \\.-]*)',
    'g'
  );

  static computeTags = (element: HTMLElement): string[] => {
    let tagList: string[] = [];
    const language = DetectLanguage.detect(document.body.innerText);
    if (element instanceof HTMLBodyElement) {
      const sentence = this.captureKeywordData();
      const keywords = this.calculateTags(sentence, language);
      tagList = this.calculateNeighbours(keywords, language);
    } else {
      const link = this.getLink();
      const sentence = `${link} ${element.innerText} ${document.title}`;
      tagList = this.calculateTags(sentence, language);
    }
    fnConsoleLog('CLEAN WORD LIST', tagList);
    return tagList;
  };

  private static calculateNeighbours(keywords: string[], language?: string): string[] {
    const tagList = WordFactory.toWordList(document.body.innerText.split('\n').join(' '));
    const keySet = new Set<string>(keywords);
    const newTags = new Set<string>();
    for (let i = 1; i < tagList.length - 1; i++) {
      const tag = tagList[i];
      if (keySet.has(tag)) {
        const prev = tagList[i - 1];
        if (prev.length > 3) newTags.add(prev);
        const next = tagList[i + 1];
        if (next.length > 3) newTags.add(next);
      }
    }
    let outTags = Array.from(keySet).sort();
    outTags.push(...newTags);
    if (language) outTags = StopWordRemove.execute(language, outTags);
    return outTags;
  }

  private static calculateTags(sentence: string, language?: string): string[] {
    let tagList = WordFactory.toWordList(sentence);

    fnConsoleLog('LANGUAGE', language, 'WITH STOPWORDS', tagList);
    // TODO maybe check if anything removed - if not maybe take second guess from detected language
    if (language) tagList = StopWordRemove.execute(language, tagList);

    return tagList;
  }

  private static captureKeywordData(): string {
    const link = this.getLink();
    const meta = this.captureMeta();
    const ldJson = this.captureLdJson();
    return `${link} ${meta} ${ldJson} ${document.title}`;
  }

  private static captureMeta(): string {
    const metaList = Array.from(document.querySelectorAll('meta[property], meta[name]'));
    const out = new Set<string>();
    for (const meta of metaList) {
      const property = meta.getAttribute('property');
      const name = meta.getAttribute('name');
      const content = meta.getAttribute('content');
      if (property && content && this.META_PROPERTIES.includes(property)) {
        out.add(content.replaceAll(this.REMOVE_LINK_REGEX, ''));
      }
      if (name && content && this.META_PROPERTIES.includes(name)) {
        out.add(content.replaceAll(this.REMOVE_LINK_REGEX, ''));
      }
    }
    return Array.from(out).join(' ');
  }

  private static captureLdJson(): string {
    const out = new Set<string>();
    const ldJsonScript = Array.from(document.getElementsByTagName('script')).filter(
      (s) => s.getAttribute('type') && s.getAttribute('type') == 'application/ld+json'
    );
    for (const script of ldJsonScript) {
      try {
        const content = JSON.parse(script.innerText);
        if (content['@type'] === 'NewsArticle' || content['@type'] === 'Article') {
          if (content['description'])
            out.add((content['description'] as string).replaceAll(this.REMOVE_LINK_REGEX, ''));
          if (content['headline']) out.add((content['headline'] as string).replaceAll(this.REMOVE_LINK_REGEX, ''));
        }
      } catch (e) {
        fnConsoleLog('captureLdJson->Error', e);
      }
    }
    return Array.from(out).join(' ');
  }

  private static getLink(): string {
    // filter <3 letters - this will deal with prefix iso2 language and most of the suffixes
    // not best but should mostly work
    const hostname = window.location.host
      .split('.')
      .filter((a) => a.length > 3)
      .join(' ');
    const uri = decodeURI(window.location.pathname.replaceAll('.html', ''));
    return `${hostname} ${uri}`;
  }
}
