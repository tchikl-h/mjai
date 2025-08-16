import { Injectable, signal, computed } from '@angular/core';

export type SupportedLanguage = 'en' | 'fr';

interface TranslationKeys {
  // UI Components
  'app.title': string;
  'turn.order': string;
  'turn.number': string;
  'dice.roller': string;
  'game.master': string;
  'message.placeholder': string;
  'send.button': string;
  'eliminated': string;
  'current.player': string;
  
  // Player Actions
  'health.remove': string;
  'health.add': string;
  'player.eliminated': string;
  
  // Player Management
  'player.add': string;
  'player.edit': string;
  'player.name': string;
  'player.name.required': string;
  'player.name.placeholder': string;
  'player.backstory': string;
  'player.backstory.placeholder': string;
  'player.image': string;
  'player.image.placeholder': string;
  'player.health': string;
  'player.voiceId': string;
  'player.voiceId.placeholder': string;
  'player.traits': string;
  'player.traits.placeholder': string;
  'player.inventory': string;
  'player.inventory.placeholder': string;
  'player.attacks': string;
  'player.attacks.placeholder': string;
  'cancel': string;
  'create': string;
  'update': string;
  
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
  private currentLanguage = signal<SupportedLanguage>('fr');
  
  // Computed signal that returns the current language
  language = computed(() => this.currentLanguage());

  private translations: Record<SupportedLanguage, TranslationKeys> = {
    en: {
      // UI Components
      'app.title': 'MJ AI',
      'turn.order': 'Turn Order',
      'turn.number': 'Turn',
      'dice.roller': 'Dice Roller',
      'game.master': 'Game Master',
      'message.placeholder': 'Type your message...',
      'send.button': 'Send',
      'eliminated': 'ELIMINATED',
      'current.player': 'Current Player',
      
      // Player Actions
      'health.remove': 'Click to remove health',
      'health.add': 'Click to add health',
      'player.eliminated': 'Player is eliminated',
      
      // Player Management
      'player.add': 'Add Player',
      'player.edit': 'Edit Player',
      'player.name': 'Name',
      'player.name.required': 'Player name is required',
      'player.name.placeholder': 'Enter player name',
      'player.backstory': 'Backstory',
      'player.backstory.placeholder': 'Enter player backstory...',
      'player.image': 'Image Path',
      'player.image.placeholder': 'assets/images/player.png',
      'player.health': 'Health',
      'player.voiceId': 'Voice ID',
      'player.voiceId.placeholder': 'Enter voice ID for TTS',
      'player.traits': 'Traits',
      'player.traits.placeholder': 'Enter personality traits...',
      'player.inventory': 'Inventory',
      'player.inventory.placeholder': 'Enter inventory items...',
      'player.attacks': 'Attacks',
      'player.attacks.placeholder': 'Enter available attacks...',
      'cancel': 'Cancel',
      'create': 'Create',
      'update': 'Update',
      
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
      'game.master': 'Maître du Jeu',
      'message.placeholder': 'Tapez votre message...',
      'send.button': 'Envoyer',
      'eliminated': 'ÉLIMINÉ',
      'current.player': 'Joueur Actuel',
      
      // Player Actions
      'health.remove': 'Cliquez pour retirer de la santé',
      'health.add': 'Cliquez pour ajouter de la santé',
      'player.eliminated': 'Le joueur est éliminé',
      
      // Player Management
      'player.add': 'Ajouter un Joueur',
      'player.edit': 'Modifier le Joueur',
      'player.name': 'Nom',
      'player.name.required': 'Le nom du joueur est requis',
      'player.name.placeholder': 'Entrez le nom du joueur',
      'player.backstory': 'Histoire',
      'player.backstory.placeholder': 'Entrez l\'histoire du joueur...',
      'player.image': 'Chemin de l\'Image',
      'player.image.placeholder': 'assets/images/joueur.png',
      'player.health': 'Santé',
      'player.voiceId': 'ID Voix',
      'player.voiceId.placeholder': 'Entrez l\'ID voix pour TTS',
      'player.traits': 'Traits',
      'player.traits.placeholder': 'Entrez les traits de personnalité...',
      'player.inventory': 'Inventaire',
      'player.inventory.placeholder': 'Entrez les objets de l\'inventaire...',
      'player.attacks': 'Attaques',
      'player.attacks.placeholder': 'Entrez les attaques disponibles...',
      'cancel': 'Annuler',
      'create': 'Créer',
      'update': 'Mettre à jour',
      
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