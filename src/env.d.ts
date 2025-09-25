/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare global {
  interface Window {
    toggleLanguageMenu: () => void;
    translatePage: (langCode: string) => void;
  }
}