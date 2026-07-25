/**
 * Tema (claro/oscuro) compartido por toda la app, incluido el Login.
 * La preferencia se guarda en localStorage y se aplica al <html> como data-theme.
 */
export const THEME_KEY = 'gopic.theme';

export type Tema = 'light' | 'dark';

export function leerTema(): Tema {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light';
}

export function aplicarTema(tema: Tema): void {
  document.documentElement.setAttribute('data-theme', tema);
  localStorage.setItem(THEME_KEY, tema);
}
