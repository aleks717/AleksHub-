import { LimitedItem, RobuxPackage, RobloxPlusOption } from '../types';

export const LIMITED_ITEM: LimitedItem = {
  id: 'crown-ozymandias',
  title: 'Goldene Krone von Ozymandias',
  seller: 'Roblox',
  sellerVerified: true,
  daysRemaining: 19,
  robuxPrice: 24000,
  originalRobuxPrice: 22500,
  extraRobux: 1500,
  euroPrice: '199,99 €',
  imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
};

export const ROBUX_PACKAGES: RobuxPackage[] = [
  {
    id: 'pkg-11000',
    robuxAmount: 11000,
    originalRobux: 10000,
    bonusRobux: 1000,
    priceEur: '119,99 €',
  },
  {
    id: 'pkg-5250',
    robuxAmount: 5250,
    originalRobux: 4500,
    bonusRobux: 750,
    priceEur: '59,99 €',
  },
  {
    id: 'pkg-3625',
    robuxAmount: 3625,
    originalRobux: 3150,
    bonusRobux: 475,
    priceEur: '39,99 €',
  },
  {
    id: 'pkg-2000',
    robuxAmount: 2000,
    originalRobux: 1700,
    bonusRobux: 300,
    priceEur: '23,99 €',
  },
  {
    id: 'pkg-1500',
    robuxAmount: 1500,
    originalRobux: 1200,
    bonusRobux: 300,
    priceEur: '17,99 €',
  },
  {
    id: 'pkg-1000',
    robuxAmount: 1000,
    originalRobux: 800,
    bonusRobux: 200,
    priceEur: '11,99 €',
  },
  {
    id: 'pkg-500',
    robuxAmount: 500,
    originalRobux: 400,
    bonusRobux: 100,
    priceEur: '5,99 €',
  },
];

export interface FAQItem {
  question: string;
  answer: string;
  bullets?: string[];
}

export function getFaqItems(lang: string = 'en'): FAQItem[] {
  if (lang === 'de') {
    return [
      {
        question: 'Was sind Robux?',
        answer:
          'Robux ist die virtuelle Währung von Roblox. Du kannst damit Anpassungen für deinen Avatar, spezielle Fähigkeiten in Spielen oder exklusive Items kaufen.',
      },
      {
        question: 'Wo sind meine Robux?',
        answer:
          'Deine Robux werden oben rechts im Robux-Symbol angezeigt. Detaillierte Transaktionen findest du in deinen Kontoeinstellungen unter Meine Transaktionen.',
      },
      {
        question: 'Verfallen Robux?',
        answer:
          'Nein, Robux verfallen niemals! Einmal gekaufte oder erhaltene Robux bleiben dauerhaft auf deinem Konto gespeichert.',
      },
      {
        question: 'Wie kannst du deine Geschenkkarte einlösen?',
        answer:
          'Roblox-Geschenkkarten können ganz einfach auf roblox.com/redeem oder in der Roblox-App unter Guthaben einlösen eingegeben werden.',
      },
    ];
  }

  if (lang === 'es') {
    return [
      {
        question: '¿Qué son los Robux?',
        answer:
          'Robux es la moneda virtual de Roblox. Puedes usarla para comprar mejoras para tu avatar, habilidades especiales en juegos o artículos exclusivos.',
      },
      {
        question: '¿Dónde están mis Robux?',
        answer:
          'Tus Robux aparecen arriba a la derecha junto al icono de Robux. Puedes ver tus transacciones detalladas en la configuración de tu cuenta.',
      },
      {
        question: '¿Los Robux caducan?',
        answer:
          '¡No, los Robux nunca caducan! Los Robux que compras o recibes permanecen permanentemente en tu cuenta.',
      },
      {
        question: '¿Cómo canjeo una tarjeta de regalo?',
        answer:
          'Las tarjetas de regalo de Roblox se pueden canjear en roblox.com/redeem o dentro de la aplicación de Roblox en la sección Canjear tarjeta.',
      },
    ];
  }

  if (lang === 'fr') {
    return [
      {
        question: 'Que sont les Robux ?',
        answer:
          'Les Robux sont la monnaie virtuelle de Roblox. Vous pouvez les utiliser pour acheter des améliorations pour votre avatar ou des objets exclusifs.',
      },
      {
        question: 'Où sont mes Robux ?',
        answer:
          'Vos Robux s’affichent en haut à droite près de l’icône Robux. Consultez vos transactions détaillées dans vos paramètres de compte.',
      },
      {
        question: 'Les Robux expirent-ils ?',
        answer:
          'Non, les Robux n’expirent jamais ! Les Robux achetés ou reçus restent définitivement sur votre compte.',
      },
      {
        question: 'Comment utiliser une carte-cadeau ?',
        answer:
          'Les cartes-cadeaux Roblox peuvent être utilisées sur roblox.com/redeem ou dans l’application Roblox sous Utiliser un code.',
      },
    ];
  }

  // Default English
  return [
    {
      question: 'What are Robux?',
      answer:
        'Robux is the virtual currency of Roblox. You can use it to buy avatar upgrades, game passes, special abilities, or exclusive virtual items.',
    },
    {
      question: 'Where are my Robux?',
      answer:
        'Your Robux balance is displayed in the top-right corner next to the Robux icon. You can review detailed transaction history in your Account Settings under My Transactions.',
    },
    {
      question: 'Do Robux expire?',
      answer:
        'No, Robux never expire! Once purchased or earned, your Robux will stay in your account balance permanently until you spend them.',
    },
    {
      question: 'How can you redeem a Gift Card?',
      answer:
        'Roblox Gift Cards can be easily redeemed on roblox.com/redeem or inside the Roblox app under Redeem Gift Card & Codes.',
    },
  ];
}

export function getRobloxPlusOptions(lang: string = 'en'): RobloxPlusOption[] {
  if (lang === 'de') {
    return [
      {
        id: 'rplus-basic',
        title: 'Roblox Plus',
        priceMonth: '5,99 €',
        features: [
          '10 % Rabatt auf In-Game-Artikel, Avatare und mehr',
          'Kostenlose private Server',
          'Robux kostenlos senden',
        ],
      },
      {
        id: 'rplus-500',
        title: 'Plus 500',
        priceMonth: '10,99 €',
        originalPriceMonth: '11,98 €',
        valueTotal: '11,98 € Gesamtwert',
        features: [
          'Alles in Plus',
          '+500 Robux jeden Monat',
          '11,98 € Gesamtwert',
        ],
      },
      {
        id: 'rplus-1000',
        title: 'Plus 1000',
        priceMonth: '15,99 €',
        originalPriceMonth: '17,98 €',
        valueTotal: '17,98 € Gesamtwert',
        features: [
          'Alles in Plus',
          '+1.000 Robux jeden Monat',
          '17,98 € Gesamtwert',
        ],
      },
      {
        id: 'rplus-2000',
        title: 'Plus 2000',
        priceMonth: '26,39 €',
        originalPriceMonth: '29,98 €',
        valueTotal: '29,98 € Gesamtwert',
        features: [
          'Alles in Plus',
          '+2.000 Robux jeden Monat',
          '29,98 € Gesamtwert',
        ],
      },
    ];
  }

  if (lang === 'es') {
    return [
      {
        id: 'rplus-basic',
        title: 'Roblox Plus',
        priceMonth: '5,99 €',
        features: [
          '10% de descuento en artículos, avatares y más',
          'Servidores privados gratuitos',
          'Envío de Robux sin comisiones',
        ],
      },
      {
        id: 'rplus-500',
        title: 'Plus 500',
        priceMonth: '10,99 €',
        originalPriceMonth: '11,98 €',
        valueTotal: '11,98 € valor total',
        features: [
          'Todo lo de Plus',
          '+500 Robux cada mes',
          '11,98 € valor total',
        ],
      },
      {
        id: 'rplus-1000',
        title: 'Plus 1000',
        priceMonth: '15,99 €',
        originalPriceMonth: '17,98 €',
        valueTotal: '17,98 € valor total',
        features: [
          'Todo lo de Plus',
          '+1.000 Robux cada mes',
          '17,98 € valor total',
        ],
      },
      {
        id: 'rplus-2000',
        title: 'Plus 2000',
        priceMonth: '26,39 €',
        originalPriceMonth: '29,98 €',
        valueTotal: '29,98 € valor total',
        features: [
          'Todo lo de Plus',
          '+2.000 Robux cada mes',
          '29,98 € valor total',
        ],
      },
    ];
  }

  if (lang === 'fr') {
    return [
      {
        id: 'rplus-basic',
        title: 'Roblox Plus',
        priceMonth: '5,99 €',
        features: [
          '10 % de réduction sur les objets et avatars',
          'Serveurs privés gratuits',
          'Envoi de Robux sans frais',
        ],
      },
      {
        id: 'rplus-500',
        title: 'Plus 500',
        priceMonth: '10,99 €',
        originalPriceMonth: '11,98 €',
        valueTotal: '11,98 € valeur totale',
        features: [
          'Tout dans Plus',
          '+500 Robux chaque mois',
          '11,98 € valeur totale',
        ],
      },
      {
        id: 'rplus-1000',
        title: 'Plus 1000',
        priceMonth: '15,99 €',
        originalPriceMonth: '17,98 €',
        valueTotal: '17,98 € valeur totale',
        features: [
          'Tout dans Plus',
          '+1 000 Robux chaque mois',
          '17,98 € valeur totale',
        ],
      },
      {
        id: 'rplus-2000',
        title: 'Plus 2000',
        priceMonth: '26,39 €',
        originalPriceMonth: '29,98 €',
        valueTotal: '29,98 € valeur totale',
        features: [
          'Tout dans Plus',
          '+2 000 Robux chaque mois',
          '29,98 € valeur totale',
        ],
      },
    ];
  }

  // Default English
  return [
    {
      id: 'rplus-basic',
      title: 'Roblox Plus',
      priceMonth: '$5.99',
      features: [
        '10% off in-game items, avatars and more',
        'Free private servers access',
        'Send Robux instantly with no fees',
      ],
    },
    {
      id: 'rplus-500',
      title: 'Plus 500',
      priceMonth: '$9.99',
      originalPriceMonth: '$11.98',
      valueTotal: '$11.98 total value',
      features: [
        'Everything in Plus',
        '+500 Robux every month',
        '$11.98 total value included',
      ],
    },
    {
      id: 'rplus-1000',
      title: 'Plus 1000',
      priceMonth: '$14.99',
      originalPriceMonth: '$17.98',
      valueTotal: '$17.98 total value',
      features: [
        'Everything in Plus',
        '+1,000 Robux every month',
        '$17.98 total value included',
      ],
    },
    {
      id: 'rplus-2000',
      title: 'Plus 2000',
      priceMonth: '$24.99',
      originalPriceMonth: '$29.98',
      valueTotal: '$29.98 total value',
      features: [
        'Everything in Plus',
        '+2,000 Robux every month',
        '$29.98 total value included',
      ],
    },
  ];
}

export const FAQ_ITEMS: FAQItem[] = getFaqItems('en');
export const ROBLOX_PLUS_OPTIONS: RobloxPlusOption[] = getRobloxPlusOptions('en');
