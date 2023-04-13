import { ConstraintsNlp } from './constraints.nlp';
import { fnConsoleLog } from '../../fn/console.fn';

export class GramNlp {
  private static gram2Map: { [key: string]: number } = {};
  private static numToGram2: { [key: number]: string } = {};
  private static gram2NextMap: { [key: number]: number[] } = {};
  private static gram2Counter = 1;

  static get gramNum() {
    return this.gram2Map;
  }

  static get numGram() {
    return this.numToGram2;
  }

  static addGram(sentence: string): void {
    let gram2 = '';
    let key = '';
    for (let i = 0; i < sentence.length; i++) {
      key = sentence.charAt(i).toLowerCase();
      // convert keys
      if (ConstraintsNlp.KEY_MAP[key]) key = ConstraintsNlp.KEY_MAP[key];
      // skip punct characters
      if (ConstraintsNlp.PUNCT_CHARS.has(key)) {
        continue;
      }
      gram2 += key;
      // start from last character
      if (gram2.length === 2) {
        if (!(gram2 in this.gram2Map)) {
          this.gram2Map[gram2] = this.gram2Counter;
          this.numToGram2[this.gram2Counter] = gram2;
          this.gram2Counter++;
        }
        gram2 = gram2.charAt(1);
      }
    }

    fnConsoleLog('GRAM 2 !!!', Object.keys(this.gram2Map).length, this.gram2Counter, this.gram2Map);
  }

  private static pushNextMap(currentGram: number, prevGram?: number): void {
    if (!prevGram) return;
    if (!this.gram2NextMap[prevGram]) {
      this.gram2NextMap[prevGram] = [currentGram];
    } else {
      this.gram2NextMap[prevGram].push(currentGram);
    }
  }
}
