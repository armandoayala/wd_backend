'use strict'

var i18n = require('i18n');
var path = require('path');

i18n.configure({
  locales: ['en', 'es'],
  defaultLocale: 'en',
  queryParameter: 'lang',
  directory: path.join('./', 'locales'),
  api: {
    '__': 'translate',
    '__n': 'translateN'
  },
});

const i18nProvider=i18n;

function getCurrentLocale() {
    return i18nProvider.getLocale();
}

function getLocales() {
    return i18nProvider.getLocales();
}

function setLocale(locale) {
    if (getLocales().indexOf(locale) !== -1) {
      i18nProvider.setLocale(locale)
    }
}

function translate(string, lang = undefined) {
    if(lang)
    {
      return i18nProvider.__({phrase: string, locale: lang});
    }
    else
    {
       return i18nProvider.__(string)
    }

}

function translatePlurals(phrase, count) {
    return i18nProvider.__n(phrase, count)
}

module.exports=
{
  getCurrentLocale,
  getLocales,
  setLocale,
  translate,
  translatePlurals
}
