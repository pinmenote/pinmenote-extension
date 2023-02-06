// Generated by Snowball 2.2.0 - https://snowballstem.org/
import {BaseStemmer} from "./base-stemmer";

/**@constructor*/
export const ArmenianStemmer = function() {
    const base = new BaseStemmer();
    /** @const */ const a_0 = [
        ["\u0580\u0578\u0580\u0564", -1, 1],
        ["\u0565\u0580\u0578\u0580\u0564", 0, 1],
        ["\u0561\u056C\u056B", -1, 1],
        ["\u0561\u056F\u056B", -1, 1],
        ["\u0578\u0580\u0561\u056F", -1, 1],
        ["\u0565\u0572", -1, 1],
        ["\u0561\u056F\u0561\u0576", -1, 1],
        ["\u0561\u0580\u0561\u0576", -1, 1],
        ["\u0565\u0576", -1, 1],
        ["\u0565\u056F\u0565\u0576", 8, 1],
        ["\u0565\u0580\u0565\u0576", 8, 1],
        ["\u0578\u0580\u0567\u0576", -1, 1],
        ["\u056B\u0576", -1, 1],
        ["\u0563\u056B\u0576", 12, 1],
        ["\u0578\u057E\u056B\u0576", 12, 1],
        ["\u056C\u0561\u0575\u0576", -1, 1],
        ["\u057E\u0578\u0582\u0576", -1, 1],
        ["\u057A\u0565\u057D", -1, 1],
        ["\u056B\u057E", -1, 1],
        ["\u0561\u057F", -1, 1],
        ["\u0561\u057E\u0565\u057F", -1, 1],
        ["\u056F\u0578\u057F", -1, 1],
        ["\u0562\u0561\u0580", -1, 1]
    ];

    /** @const */ const a_1 = [
        ["\u0561", -1, 1],
        ["\u0561\u0581\u0561", 0, 1],
        ["\u0565\u0581\u0561", 0, 1],
        ["\u057E\u0565", -1, 1],
        ["\u0561\u0581\u0580\u056B", -1, 1],
        ["\u0561\u0581\u056B", -1, 1],
        ["\u0565\u0581\u056B", -1, 1],
        ["\u057E\u0565\u0581\u056B", 6, 1],
        ["\u0561\u056C", -1, 1],
        ["\u0568\u0561\u056C", 8, 1],
        ["\u0561\u0576\u0561\u056C", 8, 1],
        ["\u0565\u0576\u0561\u056C", 8, 1],
        ["\u0561\u0581\u0576\u0561\u056C", 8, 1],
        ["\u0565\u056C", -1, 1],
        ["\u0568\u0565\u056C", 13, 1],
        ["\u0576\u0565\u056C", 13, 1],
        ["\u0581\u0576\u0565\u056C", 15, 1],
        ["\u0565\u0581\u0576\u0565\u056C", 16, 1],
        ["\u0579\u0565\u056C", 13, 1],
        ["\u057E\u0565\u056C", 13, 1],
        ["\u0561\u0581\u057E\u0565\u056C", 19, 1],
        ["\u0565\u0581\u057E\u0565\u056C", 19, 1],
        ["\u057F\u0565\u056C", 13, 1],
        ["\u0561\u057F\u0565\u056C", 22, 1],
        ["\u0578\u057F\u0565\u056C", 22, 1],
        ["\u056F\u0578\u057F\u0565\u056C", 24, 1],
        ["\u057E\u0561\u056E", -1, 1],
        ["\u0578\u0582\u0574", -1, 1],
        ["\u057E\u0578\u0582\u0574", 27, 1],
        ["\u0561\u0576", -1, 1],
        ["\u0581\u0561\u0576", 29, 1],
        ["\u0561\u0581\u0561\u0576", 30, 1],
        ["\u0561\u0581\u0580\u056B\u0576", -1, 1],
        ["\u0561\u0581\u056B\u0576", -1, 1],
        ["\u0565\u0581\u056B\u0576", -1, 1],
        ["\u057E\u0565\u0581\u056B\u0576", 34, 1],
        ["\u0561\u056C\u056B\u057D", -1, 1],
        ["\u0565\u056C\u056B\u057D", -1, 1],
        ["\u0561\u057E", -1, 1],
        ["\u0561\u0581\u0561\u057E", 38, 1],
        ["\u0565\u0581\u0561\u057E", 38, 1],
        ["\u0561\u056C\u0578\u057E", -1, 1],
        ["\u0565\u056C\u0578\u057E", -1, 1],
        ["\u0561\u0580", -1, 1],
        ["\u0561\u0581\u0561\u0580", 43, 1],
        ["\u0565\u0581\u0561\u0580", 43, 1],
        ["\u0561\u0581\u0580\u056B\u0580", -1, 1],
        ["\u0561\u0581\u056B\u0580", -1, 1],
        ["\u0565\u0581\u056B\u0580", -1, 1],
        ["\u057E\u0565\u0581\u056B\u0580", 48, 1],
        ["\u0561\u0581", -1, 1],
        ["\u0565\u0581", -1, 1],
        ["\u0561\u0581\u0580\u0565\u0581", 51, 1],
        ["\u0561\u056C\u0578\u0582\u0581", -1, 1],
        ["\u0565\u056C\u0578\u0582\u0581", -1, 1],
        ["\u0561\u056C\u0578\u0582", -1, 1],
        ["\u0565\u056C\u0578\u0582", -1, 1],
        ["\u0561\u0584", -1, 1],
        ["\u0581\u0561\u0584", 57, 1],
        ["\u0561\u0581\u0561\u0584", 58, 1],
        ["\u0561\u0581\u0580\u056B\u0584", -1, 1],
        ["\u0561\u0581\u056B\u0584", -1, 1],
        ["\u0565\u0581\u056B\u0584", -1, 1],
        ["\u057E\u0565\u0581\u056B\u0584", 62, 1],
        ["\u0561\u0576\u0584", -1, 1],
        ["\u0581\u0561\u0576\u0584", 64, 1],
        ["\u0561\u0581\u0561\u0576\u0584", 65, 1],
        ["\u0561\u0581\u0580\u056B\u0576\u0584", -1, 1],
        ["\u0561\u0581\u056B\u0576\u0584", -1, 1],
        ["\u0565\u0581\u056B\u0576\u0584", -1, 1],
        ["\u057E\u0565\u0581\u056B\u0576\u0584", 69, 1]
    ];

    /** @const */ const a_2 = [
        ["\u0578\u0580\u0564", -1, 1],
        ["\u0578\u0582\u0575\u0569", -1, 1],
        ["\u0578\u0582\u0570\u056B", -1, 1],
        ["\u0581\u056B", -1, 1],
        ["\u056B\u056C", -1, 1],
        ["\u0561\u056F", -1, 1],
        ["\u0575\u0561\u056F", 5, 1],
        ["\u0561\u0576\u0561\u056F", 5, 1],
        ["\u056B\u056F", -1, 1],
        ["\u0578\u0582\u056F", -1, 1],
        ["\u0561\u0576", -1, 1],
        ["\u057A\u0561\u0576", 10, 1],
        ["\u057D\u057F\u0561\u0576", 10, 1],
        ["\u0561\u0580\u0561\u0576", 10, 1],
        ["\u0565\u0572\u0567\u0576", -1, 1],
        ["\u0575\u0578\u0582\u0576", -1, 1],
        ["\u0578\u0582\u0569\u0575\u0578\u0582\u0576", 15, 1],
        ["\u0561\u056E\u0578", -1, 1],
        ["\u056B\u0579", -1, 1],
        ["\u0578\u0582\u057D", -1, 1],
        ["\u0578\u0582\u057D\u057F", -1, 1],
        ["\u0563\u0561\u0580", -1, 1],
        ["\u057E\u0578\u0580", -1, 1],
        ["\u0561\u057E\u0578\u0580", 22, 1],
        ["\u0578\u0581", -1, 1],
        ["\u0561\u0576\u0585\u0581", -1, 1],
        ["\u0578\u0582", -1, 1],
        ["\u0584", -1, 1],
        ["\u0579\u0565\u0584", 27, 1],
        ["\u056B\u0584", 27, 1],
        ["\u0561\u056C\u056B\u0584", 29, 1],
        ["\u0561\u0576\u056B\u0584", 29, 1],
        ["\u057E\u0561\u056E\u0584", 27, 1],
        ["\u0578\u0582\u0575\u0584", 27, 1],
        ["\u0565\u0576\u0584", 27, 1],
        ["\u0578\u0576\u0584", 27, 1],
        ["\u0578\u0582\u0576\u0584", 27, 1],
        ["\u0574\u0578\u0582\u0576\u0584", 36, 1],
        ["\u056B\u0579\u0584", 27, 1],
        ["\u0561\u0580\u0584", 27, 1]
    ];

    /** @const */ const a_3 = [
        ["\u057D\u0561", -1, 1],
        ["\u057E\u0561", -1, 1],
        ["\u0561\u0574\u0562", -1, 1],
        ["\u0564", -1, 1],
        ["\u0561\u0576\u0564", 3, 1],
        ["\u0578\u0582\u0569\u0575\u0561\u0576\u0564", 4, 1],
        ["\u057E\u0561\u0576\u0564", 4, 1],
        ["\u0578\u057B\u0564", 3, 1],
        ["\u0565\u0580\u0564", 3, 1],
        ["\u0576\u0565\u0580\u0564", 8, 1],
        ["\u0578\u0582\u0564", 3, 1],
        ["\u0568", -1, 1],
        ["\u0561\u0576\u0568", 11, 1],
        ["\u0578\u0582\u0569\u0575\u0561\u0576\u0568", 12, 1],
        ["\u057E\u0561\u0576\u0568", 12, 1],
        ["\u0578\u057B\u0568", 11, 1],
        ["\u0565\u0580\u0568", 11, 1],
        ["\u0576\u0565\u0580\u0568", 16, 1],
        ["\u056B", -1, 1],
        ["\u057E\u056B", 18, 1],
        ["\u0565\u0580\u056B", 18, 1],
        ["\u0576\u0565\u0580\u056B", 20, 1],
        ["\u0561\u0576\u0578\u0582\u0574", -1, 1],
        ["\u0565\u0580\u0578\u0582\u0574", -1, 1],
        ["\u0576\u0565\u0580\u0578\u0582\u0574", 23, 1],
        ["\u0576", -1, 1],
        ["\u0561\u0576", 25, 1],
        ["\u0578\u0582\u0569\u0575\u0561\u0576", 26, 1],
        ["\u057E\u0561\u0576", 26, 1],
        ["\u056B\u0576", 25, 1],
        ["\u0565\u0580\u056B\u0576", 29, 1],
        ["\u0576\u0565\u0580\u056B\u0576", 30, 1],
        ["\u0578\u0582\u0569\u0575\u0561\u0576\u0576", 25, 1],
        ["\u0565\u0580\u0576", 25, 1],
        ["\u0576\u0565\u0580\u0576", 33, 1],
        ["\u0578\u0582\u0576", 25, 1],
        ["\u0578\u057B", -1, 1],
        ["\u0578\u0582\u0569\u0575\u0561\u0576\u057D", -1, 1],
        ["\u057E\u0561\u0576\u057D", -1, 1],
        ["\u0578\u057B\u057D", -1, 1],
        ["\u0578\u057E", -1, 1],
        ["\u0561\u0576\u0578\u057E", 40, 1],
        ["\u057E\u0578\u057E", 40, 1],
        ["\u0565\u0580\u0578\u057E", 40, 1],
        ["\u0576\u0565\u0580\u0578\u057E", 43, 1],
        ["\u0565\u0580", -1, 1],
        ["\u0576\u0565\u0580", 45, 1],
        ["\u0581", -1, 1],
        ["\u056B\u0581", 47, 1],
        ["\u057E\u0561\u0576\u056B\u0581", 48, 1],
        ["\u0578\u057B\u056B\u0581", 48, 1],
        ["\u057E\u056B\u0581", 48, 1],
        ["\u0565\u0580\u056B\u0581", 48, 1],
        ["\u0576\u0565\u0580\u056B\u0581", 52, 1],
        ["\u0581\u056B\u0581", 48, 1],
        ["\u0578\u0581", 47, 1],
        ["\u0578\u0582\u0581", 47, 1]
    ];

    /** @const */ const /** Array<int> */ g_v = [209, 4, 128, 0, 18];

    let /** number */ I_p2 = 0;
    let /** number */ I_pV = 0;


    /** @return {boolean} */
    function r_mark_regions() {
        I_pV = base.limit;
        I_p2 = base.limit;
        let /** number */ v_1 = base.cursor;
        lab0: {
            golab1: while(true)
            {
                lab2: {
                    if (!(base.in_grouping(g_v, 1377, 1413)))
                    {
                        break lab2;
                    }
                    break golab1;
                }
                if (base.cursor >= base.limit)
                {
                    break lab0;
                }
                base.cursor++;
            }
            I_pV = base.cursor;
            golab3: while(true)
            {
                lab4: {
                    if (!(base.out_grouping(g_v, 1377, 1413)))
                    {
                        break lab4;
                    }
                    break golab3;
                }
                if (base.cursor >= base.limit)
                {
                    break lab0;
                }
                base.cursor++;
            }
            golab5: while(true)
            {
                lab6: {
                    if (!(base.in_grouping(g_v, 1377, 1413)))
                    {
                        break lab6;
                    }
                    break golab5;
                }
                if (base.cursor >= base.limit)
                {
                    break lab0;
                }
                base.cursor++;
            }
            golab7: while(true)
            {
                lab8: {
                    if (!(base.out_grouping(g_v, 1377, 1413)))
                    {
                        break lab8;
                    }
                    break golab7;
                }
                if (base.cursor >= base.limit)
                {
                    break lab0;
                }
                base.cursor++;
            }
            I_p2 = base.cursor;
        }
        base.cursor = v_1;
        return true;
    };

    /** @return {boolean} */
    function r_R2() {
        if (!(I_p2 <= base.cursor))
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_adjective() {
        base.ket = base.cursor;
        if (base.find_among_b(a_0) === 0)
        {
            return false;
        }
        base.bra = base.cursor;
        if (!base.slice_del())
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_verb() {
        base.ket = base.cursor;
        if (base.find_among_b(a_1) === 0)
        {
            return false;
        }
        base.bra = base.cursor;
        if (!base.slice_del())
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_noun() {
        base.ket = base.cursor;
        if (base.find_among_b(a_2) === 0)
        {
            return false;
        }
        base.bra = base.cursor;
        if (!base.slice_del())
        {
            return false;
        }
        return true;
    };

    /** @return {boolean} */
    function r_ending() {
        base.ket = base.cursor;
        if (base.find_among_b(a_3) === 0)
        {
            return false;
        }
        base.bra = base.cursor;
        if (!r_R2())
        {
            return false;
        }
        if (!base.slice_del())
        {
            return false;
        }
        return true;
    };

    this.stem = /** @return {boolean} */ function() {
        r_mark_regions();
        base.limit_backward = base.cursor; base.cursor = base.limit;
        if (base.cursor < I_pV)
        {
            return false;
        }
        let /** number */ v_3 = base.limit_backward;
        base.limit_backward = I_pV;
        let /** number */ v_4 = base.limit - base.cursor;
        r_ending();
        base.cursor = base.limit - v_4;
        let /** number */ v_5 = base.limit - base.cursor;
        r_verb();
        base.cursor = base.limit - v_5;
        let /** number */ v_6 = base.limit - base.cursor;
        r_adjective();
        base.cursor = base.limit - v_6;
        let /** number */ v_7 = base.limit - base.cursor;
        r_noun();
        base.cursor = base.limit - v_7;
        base.limit_backward = v_3;
        base.cursor = base.limit_backward;
        return true;
    };

    /**@return{string}*/
    this['stemWord'] = function(/**string*/word) {
        base.setCurrent(word);
        this.stem();
        return base.getCurrent();
    };
};
