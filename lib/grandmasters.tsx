import type { Grandmaster } from "./types"

export const grandmasters: Grandmaster[] = [
  {
    id: "kasparov",
    name: "Garry Kasparov",
    years: "1963 - present",
    description:
      "Known for his dynamic and aggressive style, Kasparov dominated chess for over 20 years. He combined deep strategic understanding with tactical brilliance and relentless attacking play.",
    playstyle: {
      aggression: 0.9,
      positional: 0.8,
      tactical: 0.95,
      defensive: 0.7,
      riskTaking: 0.85,
      endgame: 0.8,
      openingRepertoire: ["Sicilian Defense", "King's Indian Defense", "Queen's Gambit"],
    },
    achievements: [
      "World Chess Champion (1985-2000)",
      "Highest rating in history (2851) until surpassed by Magnus Carlsen",
      "Winner of 11 Chess Oscars",
    ],
    famousGame: "Kasparov vs. Topalov, Wijk aan Zee 1999 - featuring the famous queen sacrifice",
    imagePath: "/images/gm/kasparov.jpg",
  },
  {
    id: "carlsen",
    name: "Magnus Carlsen",
    years: "1990 - present",
    description:
      "Carlsen is known for his versatile and universal style. He excels in all phases of the game, particularly in converting small advantages in the endgame. His intuitive positional understanding is unmatched.",
    playstyle: {
      aggression: 0.6,
      positional: 0.95,
      tactical: 0.85,
      defensive: 0.9,
      riskTaking: 0.5,
      endgame: 0.98,
      openingRepertoire: ["Ruy Lopez", "Queen's Gambit", "English Opening"],
    },
    achievements: [
      "World Chess Champion (2013-present)",
      "Highest classical rating in history (2882)",
      "World Rapid and Blitz Champion multiple times",
    ],
    famousGame: "Carlsen vs. Karjakin, World Championship 2016 - Game 10, showing his endgame mastery",
    imagePath: "/images/gm/carlsen.jpg",
  },
  {
    id: "tal",
    name: "Mikhail Tal",
    years: "1936 - 1992",
    description:
      "Known as 'The Magician from Riga', Tal was famous for his sacrificial attacking style and tactical wizardry. He would often sacrifice material for initiative and attacking chances, creating complications that confounded his opponents.",
    playstyle: {
      aggression: 0.98,
      positional: 0.6,
      tactical: 0.98,
      defensive: 0.5,
      riskTaking: 0.98,
      endgame: 0.7,
      openingRepertoire: ["Sicilian Defense", "King's Indian Defense", "Nimzo-Indian Defense"],
    },
    achievements: [
      "World Chess Champion (1960-1961)",
      "Eight-time Soviet Champion",
      "Winner of multiple international tournaments",
    ],
    famousGame: "Tal vs. Botvinnik, World Championship 1960 - Game 6, featuring a stunning queen sacrifice",
    imagePath: "/images/gm/tal.jpg",
  },
  {
    id: "capablanca",
    name: "José Raúl Capablanca",
    years: "1888 - 1942",
    description:
      "Known as 'The Chess Machine', Capablanca was renowned for his clean, positional style and unparalleled endgame mastery. His play appeared effortless, with a natural talent for smoothly transitioning into winning endgames.",
    playstyle: {
      aggression: 0.3,
      positional: 0.98,
      tactical: 0.70,
      defensive: 0.92,
      riskTaking: 0.2,
      endgame: 1.0,
      openingRepertoire: ["Queen's Gambit", "Ruy Lopez", "Nimzo-Indian Defense"],
    },
    achievements: [
      "World Chess Champion (1921-1927)",
      "Went eight years without losing a single game (1916-1924)",
      "Considered one of the greatest endgame players of all time",
    ],
    famousGame:
      "Capablanca vs. Marshall, New York 1918 - demonstrating his defensive skills and endgame precision against Marshall's aggressive play",
    imagePath: "/images/gm/capablanca.jpg",
  },
  {
    id: "fischer",
    name: "Bobby Fischer",
    years: "1943 - 2008",
    description:
      "Fischer combined exceptional tactical ability with deep strategic understanding. His precise, clear style and opening innovations revolutionized chess. Known for his determination and uncompromising approach, Fischer left a lasting mark on the chess world.",
    playstyle: {
      aggression: 0.75,
      positional: 0.9,
      tactical: 0.95,
      defensive: 0.85,
      riskTaking: 0.65,
      endgame: 0.95,
      openingRepertoire: ["Sicilian Defense", "Ruy Lopez", "King's Indian Defense"],
    },
    achievements: [
      "World Chess Champion (1972-1975)",
      "Won the 'Match of the Century' against Boris Spassky",
      "Achieved the first 6-0 score in a Candidates match (vs. Taimanov)",
    ],
    famousGame:
      "Fischer vs. Spassky, World Championship 1972 - Game 6, regarded as one of the greatest games ever played",
    imagePath: "/images/gm/fischer.jpg",
  },
  {
    id: "karpov",
    name: "Anatoly Karpov",
    years: "1951 - present",
    description:
      "Karpov is known for his suffocating positional style and strategic finesse. His play is characterized by precise maneuvering and gradual accumulation of advantages, earning him a reputation as one of the most formidable defensive strategists.",
    playstyle: {
      aggression: 0.35,
      positional: 0.99,
      tactical: 0.80,
      defensive: 0.97,
      riskTaking: 0.15,
      endgame: 0.95,
      openingRepertoire: ["Ruy Lopez", "Queen's Gambit", "Caro-Kann Defense"],
    },
    achievements: [
      "World Chess Champion (1975-1985)",
      "Over 160 first-place tournament finishes",
      "Five epic World Championship matches against Garry Kasparov",
    ],
    famousGame: "Karpov vs. Kasparov, World Championship 1985 - Game 16, demonstrating his meticulous positional mastery",
    imagePath: "/images/gm/karpov.jpg",
  },
  {
    id: "anand",
    name: "Viswanathan Anand",
    years: "1969 - present",
    description:
      "Known as 'The Lightning Kid' for his rapid play, Anand is celebrated for his blend of tactical sharpness and solid positional foundations. His quick thinking and extensive opening preparation make him a formidable opponent in any format.",
    playstyle: {
      aggression: 0.55,
      positional: 0.75,
      tactical: 0.95,
      defensive: 0.65,
      riskTaking: 0.4,
      endgame: 0.7,
      openingRepertoire: ["Sicilian Defense", "Queen's Gambit", "Ruy Lopez"],
    },
    achievements: [
      "World Chess Champion (2000-2002, 2007-2013)",
      "First Asian to become World Champion",
      "Won World Championship in multiple formats (Tournament, Match, Knockout)",
    ],
    famousGame: "Anand vs. Kramnik, World Championship 2008 - Game 3, exhibiting his deep opening expertise",
    imagePath: "/images/gm/anand.jpg",
  },
  {
    id: "kramnik",
    name: "Vladimir Kramnik",
    years: "1975 - present",
    description:
      "Kramnik is recognized for his calm, solid style and deep strategic insights. His game is marked by brilliant defensive play and precise calculation, often neutralizing his opponent's initiatives.",
    playstyle: {
      aggression: 0.45,
      positional: 0.95,
      tactical: 0.85,
      defensive: 0.95,
      riskTaking: 0.4,
      endgame: 0.9,
      openingRepertoire: ["Berlin Defense", "Catalan Opening", "Queen's Gambit"],
    },
    achievements: [
      "World Chess Champion (2000-2007)",
      "Defeated Garry Kasparov in the 2000 World Championship",
      "Unified the World Chess Championship in 2006",
    ],
    famousGame: "Kramnik vs. Kasparov, World Championship 2000 - Game 2, featuring his innovative Berlin Defense",
    imagePath: "/images/gm/kramnik.jpeg",
  },
  {
    id: "nakamura",
    name: "Hikaru Nakamura",
    years: "1987 - present",
    description:
      "Hikaru Nakamura is renowned for his speed, tactical prowess, and innovative approach to modern chess. Beyond his over-the-board success, he has redefined online chess with his dynamic streaming and rapid play.",
    playstyle: {
      aggression: 0.8,
      positional: 0.75,
      tactical: 0.9,
      defensive: 0.8,
      riskTaking: 0.85,
      endgame: 0.8,
      openingRepertoire: ["Sicilian Defense", "King's Indian Defense", "Reti Opening"],
    },
    achievements: [
      "Multiple-time U.S. Chess Champion",
      "World-class blitz and rapid tournament successes",
      "Pioneer of the online chess streaming revolution",
    ],
    famousGame: "Nakamura in various online blitz battles where his creative tactics often turned the tide in his favor",
    imagePath: "/images/gm/hikaru.jpg",
  },
]
