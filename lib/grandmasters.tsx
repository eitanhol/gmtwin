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
    imagePath: "/images/gm/kasparov.jpeg",
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
    imagePath: "/images/gm/carlsen.jpeg",
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
    imagePath: "/images/gm/tal.jpeg",
  },
  {
    id: "capablanca",
    name: "José Raúl Capablanca",
    years: "1888 - 1942",
    description:
      "Known as 'The Chess Machine', Capablanca was renowned for his clean, positional style and endgame mastery. He made chess look effortless with his elegant and precise play, rarely making tactical errors.",
    playstyle: {
      aggression: 0.4,
      positional: 0.98,
      tactical: 0.8,
      defensive: 0.95,
      riskTaking: 0.25,
      endgame: 0.98,
      openingRepertoire: ["Queen's Gambit", "Ruy Lopez", "Nimzo-Indian Defense"],
    },
    achievements: [
      "World Chess Champion (1921-1927)",
      "Went eight years without losing a single game (1916-1924)",
      "Considered one of the greatest endgame players of all time",
    ],
    famousGame:
      "Capablanca vs. Marshall, New York 1918 - demonstrating his defensive skills against Marshall's famous attack",
    imagePath: "/images/gm/capablanca.jpeg",
  },
  {
    id: "fischer",
    name: "Bobby Fischer",
    years: "1943 - 2008",
    description:
      "Fischer combined exceptional tactical ability with deep strategic understanding. His precise, clear style and opening innovations revolutionized chess. He was known for his determination and uncompromising approach.",
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
      "Fischer vs. Spassky, World Championship 1972 - Game 6, considered one of the greatest games ever played",
    imagePath: "/images/gm/fischer.jpeg",
  },
  {
    id: "karpov",
    name: "Anatoly Karpov",
    years: "1951 - present",
    description:
      "Karpov is known for his positional and strategic style, often described as 'boa constrictor' chess. He would gradually accumulate small advantages and squeeze his opponents without giving them counterplay.",
    playstyle: {
      aggression: 0.35,
      positional: 0.98,
      tactical: 0.8,
      defensive: 0.95,
      riskTaking: 0.25,
      endgame: 0.95,
      openingRepertoire: ["Ruy Lopez", "Queen's Gambit", "Caro-Kann Defense"],
    },
    achievements: [
      "World Chess Champion (1975-1985)",
      "Over 160 first-place tournament finishes",
      "Played five epic World Championship matches against Garry Kasparov",
    ],
    famousGame: "Karpov vs. Kasparov, World Championship 1985 - Game 16, showing his positional mastery",
    imagePath: "/images/gm/karpov.jpeg",
  },
  {
    id: "anand",
    name: "Viswanathan Anand",
    years: "1969 - present",
    description:
      "Known as 'The Lightning Kid' for his quick play, Anand is a universal player with a balanced style. He combines tactical sharpness with solid positional understanding and is known for his opening preparation.",
    playstyle: {
      aggression: 0.45,
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
    famousGame: "Anand vs. Kramnik, World Championship 2008 - Game 3, showing his deep opening preparation",
    imagePath: "/images/gm/anand.jpeg",
  },
  {
    id: "kramnik",
    name: "Vladimir Kramnik",
    years: "1975 - present",
    description:
      "Kramnik is known for his solid, technical style and deep strategic understanding. He combines strong positional play with excellent defensive skills and precise calculation.",
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
      "Defeated Garry Kasparov in 2000 World Championship",
      "Unified the World Chess Championship in 2006",
    ],
    famousGame: "Kramnik vs. Kasparov, World Championship 2000 - Game 2, featuring his Berlin Defense",
    imagePath: "/images/gm/kramnik.jpeg",
  },
]
