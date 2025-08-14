import { Injectable, signal, computed } from '@angular/core';

export type SupportedLanguage = 'en' | 'fr';

interface TranslationKeys {
  // UI Components
  'app.title': string;
  'turn.order': string;
  'turn.number': string;
  'dice.roller': string;
  'player.challenges': string;
  'game.master': string;
  'message.placeholder': string;
  'send.button': string;
  'eliminated': string;
  'current.player': string;
  
  // Player Actions
  'health.remove': string;
  'health.add': string;
  'challenge.resolve': string;
  'challenge.unresolved': string;
  'player.eliminated': string;
  
  // Game Messages
  'player.revived': string;
  'player.died': string;
  'new.turn.starting': string;
  'no.players.alive': string;
  
  // Error Messages
  'api.error': string;
  'connection.failed': string;
  'timeout.error': string;
  
  // Fallback Responses
  'fallback.nods': string;
  'fallback.considers': string;
  'fallback.thinks': string;
  'fallback.cautious': string;
  'fallback.alert': string;

  // Game End Messages
  'game.won.all.challenges': string;
  'game.won.challenges.details': string;
  'game.over.all.dead': string;
  'game.over.all.dead.details': string;
  'game.over.too.many.turns': string;
  'game.over.turn.limit.details': string;
  'game.restart': string;
  'game.congratulations': string;
  'game.final.stats': string;
}

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLanguage = signal<SupportedLanguage>('en');
  
  // Computed signal that returns the current language
  language = computed(() => this.currentLanguage());

  private translations: Record<SupportedLanguage, TranslationKeys> = {
    en: {
      // UI Components
      'app.title': 'MJ AI',
      'turn.order': 'Turn Order',
      'turn.number': 'Turn',
      'dice.roller': 'Dice Roller',
      'player.challenges': 'Player Challenges',
      'game.master': 'Game Master',
      'message.placeholder': 'Type your message...',
      'send.button': 'Send',
      'eliminated': 'ELIMINATED',
      'current.player': 'Current Player',
      
      // Player Actions
      'health.remove': 'Click to remove health',
      'health.add': 'Click to add health',
      'challenge.resolve': 'Mark as resolved',
      'challenge.unresolved': 'Mark as unresolved',
      'player.eliminated': 'Player is eliminated',
      
      // Game Messages
      'player.revived': 'has been revived!',
      'player.died': 'has been eliminated!',
      'new.turn.starting': 'New turn starting! Generating new turn order...',
      'no.players.alive': 'No players alive! Game over.',
      
      // Error Messages
      'api.error': 'API request failed',
      'connection.failed': 'Connection failed',
      'timeout.error': 'Request timed out',
      
      // Fallback Responses
      'fallback.nods': 'nods thoughtfully',
      'fallback.considers': 'considers the situation carefully',
      'fallback.thinks': 'takes a moment to think',
      'fallback.cautious': 'looks around cautiously',
      'fallback.alert': 'remains alert and ready',

      // Game End Messages
      'game.won.all.challenges': 'Victory! All Challenges Completed!',
      'game.won.challenges.details': '{{playerCount}} players completed all challenges in {{turnNumber}} turns!',
      'game.over.all.dead': 'Game Over - All Players Eliminated',
      'game.over.all.dead.details': 'All party members have fallen in battle.',
      'game.over.too.many.turns': 'Game Over - Time Limit Exceeded',
      'game.over.turn.limit.details': 'The adventure exceeded the {{maxTurns}} turn limit.',
      'game.restart': 'Start New Game',
      'game.congratulations': 'Congratulations!',
      'game.final.stats': 'Final Statistics'
    },
    fr: {
      // UI Components
      'app.title': 'MJ IA',
      'turn.order': 'Ordre des Tours',
      'turn.number': 'Tour',
      'dice.roller': 'Lanceur de Dés',
      'player.challenges': 'Défis des Joueurs',
      'game.master': 'Maître du Jeu',
      'message.placeholder': 'Tapez votre message...',
      'send.button': 'Envoyer',
      'eliminated': 'ÉLIMINÉ',
      'current.player': 'Joueur Actuel',
      
      // Player Actions
      'health.remove': 'Cliquez pour retirer de la santé',
      'health.add': 'Cliquez pour ajouter de la santé',
      'challenge.resolve': 'Marquer comme résolu',
      'challenge.unresolved': 'Marquer comme non résolu',
      'player.eliminated': 'Le joueur est éliminé',
      
      // Game Messages
      'player.revived': 'a été ressuscité !',
      'player.died': 'a été éliminé !',
      'new.turn.starting': 'Nouveau tour qui commence ! Génération du nouvel ordre...',
      'no.players.alive': 'Aucun joueur vivant ! Fin de partie.',
      
      // Error Messages
      'api.error': 'Échec de la requête API',
      'connection.failed': 'Échec de la connexion',
      'timeout.error': 'Délai d\'attente dépassé',
      
      // Fallback Responses
      'fallback.nods': 'hoche la tête pensivement',
      'fallback.considers': 'considère la situation attentivement',
      'fallback.thinks': 'prend un moment pour réfléchir',
      'fallback.cautious': 'regarde autour prudemment',
      'fallback.alert': 'reste vigilant et prêt',

      // Game End Messages
      'game.won.all.challenges': 'Victoire ! Tous les Défis Accomplis !',
      'game.won.challenges.details': '{{playerCount}} joueurs ont accompli tous les défis en {{turnNumber}} tours !',
      'game.over.all.dead': 'Fin de Partie - Tous les Joueurs Éliminés',
      'game.over.all.dead.details': 'Tous les membres du groupe sont tombés au combat.',
      'game.over.too.many.turns': 'Fin de Partie - Limite de Temps Dépassée',
      'game.over.turn.limit.details': 'L\'aventure a dépassé la limite de {{maxTurns}} tours.',
      'game.restart': 'Nouvelle Partie',
      'game.congratulations': 'Félicitations !',
      'game.final.stats': 'Statistiques Finales'
    }
  };

  constructor() {
    // Load saved language preference
    const savedLang = localStorage.getItem('app-language') as SupportedLanguage;
    if (savedLang && (savedLang === 'en' || savedLang === 'fr')) {
      this.currentLanguage.set(savedLang);
    }
  }

  setLanguage(language: SupportedLanguage): void {
    this.currentLanguage.set(language);
    localStorage.setItem('app-language', language);
  }

  translate(key: keyof TranslationKeys): string {
    const lang = this.currentLanguage();
    return this.translations[lang][key] || key;
  }

  // Helper method for formatted translations
  translateWithParams(key: keyof TranslationKeys, params: Record<string, string>): string {
    let translation = this.translate(key);
    
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{{${param}}}`, value);
    });
    
    return translation;
  }

  // Get all available languages
  getAvailableLanguages(): Array<{code: SupportedLanguage, name: string}> {
    return [
      { code: 'en', name: 'English' },
      { code: 'fr', name: 'Français' }
    ];
  }

  // Check if current language is RTL (not applicable for EN/FR but good practice)
  isRTL(): boolean {
    return false; // Neither English nor French are RTL
  }
}