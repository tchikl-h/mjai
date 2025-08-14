import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService, SupportedLanguage } from '../../services/i18n.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-switcher.component.html',
  styleUrls: ['./language-switcher.component.css']
})
export class LanguageSwitcherComponent {
  availableLanguages = this.i18n.getAvailableLanguages();

  constructor(protected i18n: I18nService) {}

  switchLanguage(language: SupportedLanguage): void {
    this.i18n.setLanguage(language);
  }

  isCurrentLanguage(language: SupportedLanguage): boolean {
    return this.i18n.language() === language;
  }
}