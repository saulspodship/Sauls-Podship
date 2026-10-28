import apps from './podshipApps.json';

/** The public, verified subdomain products of Saul's Podship. */
export const PODSHIP_APPS = apps;

export const ABOUT_META = {
  title: "About Saul's Podship | Christian Ministry & Study Apps",
  description: "Explore Saul's Podship: Bible study, numerology, word origins, children's learning, evangelism, 3D biblical imagery and FaithConnect Pro.",
  canonical: 'https://www.saulspodship.com/about',
  keywords: [
    "Saul's Podship", 'Christian ministry', 'Bible study apps', 'Biblical Languages',
    "Saul's Sunday School", 'Evangelism field guide', 'Biblical Cosmos 3D',
    'Biblical Numerology & Etymology', 'Gematria Lab', 'FaithConnect Pro',
    'South Asian Christian heritage',
  ],
  image: 'https://www.saulspodship.com/icons/brand-logo.png',
};

export const ABOUT_DIRECTORY_INTRO =
  "From children's Bible learning and original-language study to evangelism, biblical numerology and Christian community, our dedicated apps serve families, churches and curious readers in Pakistan and around the world.";

export const ABOUT_FAQ = {
  eyebrow: 'About the Podship family',
  summary: "Learn how Saul's Podship's resources connect Bible study, children's learning, evangelism, research and Christian community.",
  items: [
    {
      question: "What is Saul's Podship?",
      answer: "Saul's Podship is an open-access Christian digital ministry and scriptorium, with a 51-volume theological encyclopedia, sacred music and podcasts, and a family of dedicated apps.",
    },
    {
      question: "Which websites are part of Saul's Podship?",
      answer: `Our dedicated public apps are ${PODSHIP_APPS.map((app) => `${app.name} (${new URL(app.url).hostname})`).join('; ')}. Each is a Saul's Podship project with its own website.`,
    },
    {
      question: 'Where can I learn biblical Hebrew and Greek?',
      answer: 'Biblical Languages offers lessons and verse study in Biblical Hebrew, Koine Greek, Biblical Aramaic and Vulgate Latin, along with vocabulary and review tools.',
    },
    {
      question: 'Is there a Bible learning app for children?',
      answer: "Saul's Sunday School is a free, ad-free Bible learning app for children ages 3–12, with narrated stories, games, quizzes and memory verses.",
    },
    {
      question: 'What is the Evangelism field guide?',
      answer: 'Evangelism is a Scripture-rooted guide to sharing the good news of Jesus with clarity and respect. It includes conversation prompts, a testimony-writing aid and a library of practical field guides.',
    },
    {
      question: 'What is Biblical Cosmos 3D?',
      answer: 'Biblical Cosmos 3D is an interactive interpretation of biblical cosmological imagery with linked Scripture passages. It is a study aid, not a scientific or scale model of the universe.',
    },
    {
      question: 'What is Biblical Numerology & Etymology?',
      answer: 'Gematria Lab is a research workspace for exploring letter values, word histories and biblical text matches with transparent calculations and cited sources. Numerical patterns are not proof of meaning or causation.',
    },
    {
      question: 'What is FaithConnect Pro?',
      answer: 'FaithConnect Pro brings together a Christian community with career opportunities, networking, learning, prayer and a faith-based marketplace.',
    },
    {
      question: "Are Saul's Podship resources free and available worldwide?",
      answer: "Many Saul's Podship resources, including the Scriptorium, are free to explore online and available to readers around the world. Features and account requirements may vary by app. Saul's Sunday School also offers narration in English, Urdu, Hindi and Arabic.",
    },
  ],
};

/** The same visible directory is described to search and answer engines. */
export function aboutPageSchema() {
  const organization = {
    '@type': 'Organization',
    name: "Saul's Podship",
    url: 'https://www.saulspodship.com/',
    logo: ABOUT_META.image,
  };
  const listId = `${ABOUT_META.canonical}#podship-apps`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'AboutPage',
        '@id': `${ABOUT_META.canonical}#webpage`,
        url: ABOUT_META.canonical,
        name: ABOUT_META.title,
        description: ABOUT_META.description,
        inLanguage: 'en',
        about: organization,
        mainEntity: { '@id': listId },
      },
      {
        '@type': 'ItemList',
        '@id': listId,
        name: "Saul's Podship apps and subdomains",
        numberOfItems: PODSHIP_APPS.length,
        itemListElement: PODSHIP_APPS.map((app, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'WebApplication',
            name: app.name,
            url: app.url,
            description: app.description,
            image: new URL(app.logo, 'https://www.saulspodship.com').href,
            applicationCategory: app.applicationCategory,
            operatingSystem: 'Web browser',
            ...(app.isAccessibleForFree === null ? {} : { isAccessibleForFree: app.isAccessibleForFree }),
            publisher: organization,
          },
        })),
      },
    ],
  };
}
