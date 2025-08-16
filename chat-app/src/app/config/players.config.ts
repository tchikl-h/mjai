import { Player } from '../models/player.model';

export type PlayerName = 'Warrior' | 'Mage' | 'Rogue';

export const PLAYERS: Record<PlayerName, Omit<Player, 'isAlive'>> = {
  'Warrior': {
    name: 'Warrior',
    backstory: "Ton nom est Guerrier. Tu es un guerrier aux larges épaules, vêtu d'une armure de plates usée par les intempéries, l'acier terni par d'innombrables batailles. Une profonde cicatrice court de ta tempe à ta mâchoire, témoignage silencieux de ta survie. Ta voix est graveleuse, ton regard inébranlable, et ta main ne s'éloigne jamais du pommeau de ta grande épée. Tu parles peu, mais quand tu le fais, tes mots tranchent aussi vivement que ta lame.",
    imageUri: 'assets/images/warrior.png',
    health: 3,
    inventory: '',
    traits: '',
    attacks: '',
    voiceId: '2EiwWnXFnvU5JabPnv8n'
  },
  'Mage': {
    name: 'Mage',
    backstory: "Ton nom est Mage. Tu es drapée dans des robes bleu nuit fluides, brodées de constellations argentées. Tes yeux scintillent comme des étoiles sur une eau calme. Un bâton élancé à pointe de cristal repose dans ta main, pulsant faiblement d'énergie arcanique. Ta voix est calme mais teintée de puissance, chaque mot portant le poids d'un savoir ancien et la promesse d'une magie débridée.",
    imageUri: 'assets/images/mage.png',
    health: 3,
    inventory: '',
    traits: '',
    attacks: '',
    voiceId: '9BWtsMINqrJLrRacOk9x'
  },
  'Rogue': {
    name: 'Rogue',
    backstory: "Ton nom est Voleur. Tu es élancé et tes yeux perçants scrutent ton environnement tandis que tu te déplaces comme une ombre glissant entre les torches. Une capuche sombre dissimule la majeure partie de ton visage, mais l'éclat d'un sourire entendu se devine quand le danger approche. Deux dagues reposent à tes hanches, leurs lames murmurant des promesses de fins silencieuses. Tu parles peu, mais chaque mot que tu prononces semble être un mouvement calculé dans un jeu invisible.",
    imageUri: 'assets/images/rogue.png',
    health: 3,
    inventory: '',
    traits: '',
    attacks: '',
    voiceId: 'CYw3kZ02Hs0563khs1Fj'
  }
};

// Helper exports for backward compatibility
export const PLAYER_DESCRIPTIONS: Record<PlayerName, string> = Object.fromEntries(
  Object.entries(PLAYERS).map(([key, config]) => [key, config.backstory])
) as Record<PlayerName, string>;

export const PLAYER_CONFIGS: Array<{ name: string; backstory: string; imagePath: string }> = 
  Object.values(PLAYERS).map(config => ({
    name: config.name,
    backstory: config.backstory,
    imagePath: config.imageUri
  }));

export const CHARACTER_VOICES: Record<string, string> = Object.fromEntries(
  Object.entries(PLAYERS).map(([key, config]) => [key, config.voiceId])
);