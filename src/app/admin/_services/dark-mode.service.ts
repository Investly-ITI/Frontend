import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DarkModeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  public darkMode$ = this.darkModeSubject.asObservable();

  constructor() {
    // Load dark mode preference from localStorage on service initialization
    const savedDarkMode = localStorage.getItem('darkMode');
    const isDarkMode = savedDarkMode === 'true';
    this.darkModeSubject.next(isDarkMode);
    this.applyDarkMode(isDarkMode);
  }

  toggleDarkMode(): void {
    const newDarkMode = !this.darkModeSubject.value;
    this.darkModeSubject.next(newDarkMode);
    this.applyDarkMode(newDarkMode);
    // Save preference to localStorage
    localStorage.setItem('darkMode', newDarkMode.toString());
  }

  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }

  private applyDarkMode(isDark: boolean): void {
    // Apply to parent3 for app components
    const parentDiv = document.querySelector('.parent3');
    if (parentDiv) {
      if (isDark) {
        parentDiv.classList.add('dark');
      } else {
        parentDiv.classList.remove('dark');
      }
    }

    // Apply to body for toastr and global components
    const body = document.body;
    if (body) {
      if (isDark) {
        body.classList.add('dark');
      } else {
        body.classList.remove('dark');
      }
    }

    // Apply to html element
    const html = document.documentElement;
    if (html) {
      if (isDark) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
  }
}
