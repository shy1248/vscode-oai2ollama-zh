declare const process: any;
declare const setTimeout: any;

import en from './en.json';
import zh from './zh-cn.json';

type LocaleMap = { [key: string]: string };

const locale = 'zh-cn';

const resources: { [locale: string]: LocaleMap } = {
    'en': en as any,
    'zh-cn': zh as any
};

function format(str: string, args: any[]) {
    return str.replace(/\{(\d+)\}/g, (_m, idx) => {
        const i = parseInt(idx, 10);
        return args[i] !== undefined ? String(args[i]) : '';
    });
}

export default function localize(key: string, defaultText: string, ...args: any[]) {
    try {
        const loc = (locale && resources[locale] && resources[locale][key])
            || resources['en'][key]
            || defaultText;
        return args.length ? format(loc, args) : loc;
    } catch (e) {
        return defaultText;
    }
}
