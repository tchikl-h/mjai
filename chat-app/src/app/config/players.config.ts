export type PlayerName = 'Warrior' | 'Mage' | 'Rogue';

export const PLAYER_DESCRIPTIONS: Record<PlayerName, { en: string; fr: string }> = {
  'Warrior': {
    en: "Your name is Warrior. You are a broad-shouldered warrior, clad in weathered plate armor, the steel dulled by countless battles. A deep scar runs from your temple to your jaw, a silent testament to your survival. Your voice is gravelly, your gaze unwavering, and your hand never strays from the hilt of your greatsword. You speak little, but when you do, your words cut as sharply as your blade.",
    fr: "Ton nom est Guerrier. Tu es un guerrier aux larges épaules, vêtu d'une armure de plates usée par les intempéries, l'acier terni par d'innombrables batailles. Une profonde cicatrice court de ta tempe à ta mâchoire, témoignage silencieux de ta survie. Ta voix est graveleuse, ton regard inébranlable, et ta main ne s'éloigne jamais du pommeau de ta grande épée. Tu parles peu, mais quand tu le fais, tes mots tranchent aussi vivement que ta lame."
  },
  'Mage': {
    en: "Your name is Mage. You are draped in flowing midnight blue robes, embroidered with silver constellations. Your eyes twinkle like stars on still water. A slender crystal-tipped staff rests in your hand, pulsing faintly with arcane energy. Your voice is calm but tinged with power, each word carrying the weight of ancient knowledge and the promise of unbridled magic.",
    fr: "Ton nom est Mage. Tu es drapée dans des robes bleu nuit fluides, brodées de constellations argentées. Tes yeux scintillent comme des étoiles sur une eau calme. Un bâton élancé à pointe de cristal repose dans ta main, pulsant faiblement d'énergie arcanique. Ta voix est calme mais teintée de puissance, chaque mot portant le poids d'un savoir ancien et la promesse d'une magie débridée."
  },
  'Rogue': {
    en: "Your name is Thief. You are slender, and your sharp eyes scan your surroundings as you move like a shadow slipping between torches. A dark hood conceals most of your face, but the flash of a knowing smile is revealed when danger approaches. Two daggers rest at your hips, their blades whispering promises of silent ends. You speak little, but every word you utter seems like a calculated move in an invisible game.",
    fr: "Ton nom est Voleur. Tu es élancé et tes yeux perçants scrutent ton environnement tandis que tu te déplaces comme une ombre glissant entre les torches. Une capuche sombre dissimule la majeure partie de ton visage, mais l'éclat d'un sourire entendu se devine quand le danger approche. Deux dagues reposent à tes hanches, leurs lames murmurant des promesses de fins silencieuses. Tu parles peu, mais chaque mot que tu prononces semble être un mouvement calculé dans un jeu invisible."
  }
};

export const PLAYER_CONFIGS: Array<{ name: string; description: string; imagePath: string }> = [
  {
    name: "Warrior",
    description: "",
    imagePath: "assets/images/warrior.png"
  },
  {
    name: "Mage",
    description: "",
    imagePath: "assets/images/mage.png"
  },
  {
    name: "Rogue",
    description: "",
    imagePath: "assets/images/rogue.png"
  },
];

export const CHARACTER_VOICES: Record<string, string> = {
  'Warrior': '2EiwWnXFnvU5JabPnv8n',
  'Mage': '9BWtsMINqrJLrRacOk9x',
  'Rogue': 'CYw3kZ02Hs0563khs1Fj',
};