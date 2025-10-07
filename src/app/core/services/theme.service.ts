import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private themeKey = 'app-theme';
  private themeSubject = new BehaviorSubject<'light' | 'dark'>('light');
  
  // Observable for components to subscribe to theme changes
  theme$ = this.themeSubject.asObservable();

  setTheme(theme: 'light' | 'dark') {
    const html = document.documentElement;
    html.classList.remove('light', 'dark');
    html.classList.add(theme);
    localStorage.setItem(this.themeKey, theme);
    this.themeSubject.next(theme);
  }

  getTheme(): 'light' | 'dark' {
    // Check if user has previously set a preference
    const savedTheme = localStorage.getItem(this.themeKey);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    
    // If no saved preference, detect system preference
    return this.getSystemTheme();
  }

  getSystemTheme(): 'light' | 'dark' {
    // Check system preference using matchMedia
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  initTheme() {
    const theme = this.getTheme();
    this.setTheme(theme);
    
    // Listen for system theme changes if no user preference is saved
    if (!localStorage.getItem(this.themeKey)) {
      this.listenForSystemThemeChanges();
    }
  }

  private listenForSystemThemeChanges() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        // Only auto-change if user hasn't set a manual preference
        if (!localStorage.getItem(this.themeKey)) {
          this.setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }

  toggleTheme(): 'light' | 'dark' {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    return newTheme;
  }
}
