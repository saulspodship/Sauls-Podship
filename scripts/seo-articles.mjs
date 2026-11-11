/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Short, source-aware organic-search guides for the new Comparative Religion
 * material in Volume 15. Shared by the HTML prerenderer and postbuild corpus so
 * the visible page, its Markdown companion, and llms-full.txt stay in sync.
 */
export const SEO_ARTICLES = [
  {
    slug: 'world-religions-comparison-chart',
    title: 'World Religions Compared: Beliefs & Sacred Texts',
    publishedDate: '2026-11-10',
    updatedDate: '2026-11-10',
    description: 'Compare Christianity, Judaism, Islam, Hindu traditions and Buddhism in a careful chart of sacred texts, ultimate reality, humanity and religious goals.',
    keywords: [
      'world religions comparison chart',
      'compare Christianity Judaism Islam Hinduism Buddhism',
      'world religions beliefs and sacred texts',
      'religions compared salvation and God',
    ],
    answer: 'A world religions comparison is most useful when it compares the same questions—authoritative texts, ultimate reality, the human condition and the goal of religious life—without pretending that any tradition is internally uniform. This chart offers a broad orientation to Judaism, Christianity, Islam, Hindu traditions and Buddhism; each includes diverse schools and communities.',
    sections: [
      {
        heading: 'World religions comparison chart',
        table: {
          caption: 'A high-level guide to five religious traditions; summaries are deliberately broad.',
          headings: ['Tradition', 'Texts (examples)', 'Ultimate reality (broad view)', 'Human condition and goal (broad view)'],
          rows: [
            ['Judaism', 'Tanakh (Torah, Prophets and Writings); later rabbinic literature', 'One God; covenant, worship and ethical life are central.', 'Repentance, justice and faithful communal life matter; Jewish views of the Messiah and the world to come vary.'],
            ['Christianity', 'Old and New Testaments', 'One God confessed as Father, Son and Holy Spirit; Jesus is the Messiah and divine Son.', 'Humanity needs reconciliation with God; Christians center salvation on Jesus’ life, death and resurrection, with traditions differing on how to describe its application.'],
            ['Islam', 'Qur’an; Hadith have distinct roles across schools', 'Tawhid: the oneness of God; worship and accountability before God are central.', 'People are accountable to God and seek faithful worship, repentance and mercy; Jesus is honored as Messiah and prophet, not as God.'],
            ['Hindu traditions', 'Vedas, Upanishads, Bhagavad Gita and other texts, with differing authority by school', 'Views range across devotional theism, nondual and other accounts of ultimate reality.', 'Karma and samsara are important in many schools; moksha is sought through paths that may emphasize devotion, knowledge or disciplined action.'],
            ['Buddhism', 'Pali Canon / Nikāyas and diverse Mahāyāna and other sutras', 'A creator God is not the organizing focus of most Buddhist teaching; schools differ in cosmology and practice.', 'Teachings address dukkha and its causes; the Noble Eightfold Path leads toward nirvana, with no single description covering every Buddhist school.'],
          ],
        },
      },
      {
        heading: 'How to read a comparison chart accurately',
        paragraphs: [
          'A comparison chart can clarify where traditions agree and disagree, but a one-line description cannot stand in for a community’s own teachers, history or practice. “Hinduism,” “Buddhism,” “Judaism” and “Christianity” each contain internal diversity; Islam also has multiple legal, theological and spiritual schools.',
          'The words used for similar questions are not always equivalent. For example, moksha and nirvana are not interchangeable labels, and the Christian doctrine of the Trinity is not a claim that Christians worship three gods. Read the tradition’s own primary texts and note the perspective from which a comparison is written.',
        ],
      },
      {
        heading: 'Primary-text trail',
        paragraphs: [
          'For a first-hand comparison, start with representative primary texts: the Tanakh; the Christian Bible; the Qur’an; selections from the Vedas, Upanishads and Bhagavad Gita; and Buddhist discourses and sutras. These examples are a reading path, not a claim that every school gives each text the same authority.',
        ],
      },
    ],
    sourceNotes: [
      'Illustrative primary-text families: Tanakh / Hebrew Bible; Christian Old and New Testaments; Qur’an; Vedas, Upanishads and Bhagavad Gita; Pali Nikāyas and Mahāyāna sutras.',
      'This guide is a broad comparative introduction, not a statement of what every adherent believes. See Volume 15 for the longer source-labelled comparison and its editorial framework.',
    ],
    faqs: [
      {
        question: 'What is the main difference between the major world religions?',
        answer: 'They differ in their accounts of God or ultimate reality, authoritative revelation, the human condition and the path or goal of religious life. The chart is a starting point: schools within Judaism, Christianity, Islam, Hindu traditions and Buddhism do not all explain these questions in the same way.',
      },
      {
        question: 'Are moksha and nirvana the same thing?',
        answer: 'No. Both are associated with liberation in South Asian religions, but they arise in different teachings. Hindu traditions explain moksha in varied ways, while Buddhist traditions describe nirvana in relation to the ending of craving and suffering; neither word should be used as a simple synonym for the other.',
      },
      {
      question: 'Can one chart describe every Christian, Muslim, Hindu, Buddhist or Jewish belief?',
      answer: 'No. A chart can summarize broad themes, but it cannot capture every denomination, school, historical period or individual practice. Use it to form questions, then read the primary texts and consult sources that represent the particular community and period being discussed.',
      },
    ],
    relatedVolumes: ['comparative-religion', 'apologetics-40-critical-questions', 'jesus-is-god-full-references-ot-nt'],
    relatedPages: [{ href: '/comparative-apologetics', label: 'Comparative Apologetics Codex' }],
  },
  {
    slug: 'christianity-judaism-islam',
    title: 'Christianity, Judaism & Islam: Key Differences',
    publishedDate: '2026-11-10',
    updatedDate: '2026-11-10',
    description: 'Compare Christianity, Judaism and Islam on God, scripture, Jesus and salvation, with primary-text references and careful notes on internal diversity.',
    keywords: [
      'Christianity Judaism Islam differences',
      'Christianity vs Islam vs Judaism',
      'what Judaism and Islam teach about Jesus',
      'Bible Tanakh Quran comparison',
    ],
    answer: 'Christianity, Judaism and Islam share a history of monotheistic faith and reverence for many biblical figures, but they differ sharply over Jesus, scripture and the meaning of revelation. Christians confess Jesus as the incarnate Son and risen Messiah; Judaism does not accept Christian claims about him, and Islam honors Jesus as Messiah and prophet while rejecting his divinity and the Trinity. Those distinctions are central to comparison.',
    sections: [
      {
        heading: 'A focused comparison',
        table: {
          caption: 'Broad descriptions of major teachings; each tradition has varied schools and interpretations.',
          headings: ['Question', 'Christianity', 'Judaism', 'Islam'],
          rows: [
            ['Who is God?', 'One God; historic Christian creeds confess Father, Son and Holy Spirit as the Trinity.', 'One God; Jewish theology and practice are diverse across communities and history.', 'One God (tawhid); the Qur’an rejects associating partners with God.'],
            ['Which scriptures are central?', 'The Old and New Testaments; Christian canons vary by tradition.', 'The Tanakh, especially the Torah, alongside interpretive traditions such as the Mishnah and Talmud.', 'The Qur’an; Hadith and other scholarship have distinct roles across Muslim traditions.'],
            ['How is Jesus understood?', 'The Messiah, divine Son, crucified and risen; central to Christian worship and salvation.', 'Not accepted as the divine Messiah of Christian belief; Jewish understandings of messianic expectation differ.', 'A revered Messiah and prophet, born of Mary, but not divine; Qur’anic passages on the crucifixion receive interpretation.'],
            ['What is the human response?', 'Trust in God’s grace through Jesus, expressed in faith, repentance and a life of discipleship.', 'Covenant faithfulness, repentance, prayer, justice and communal practice; emphasis varies by movement.', 'Worship and obedience to God, repentance and ethical life, in hope of God’s mercy.'],
          ],
        },
      },
      {
        heading: 'Why Jesus is the central point of disagreement',
        paragraphs: [
          'The New Testament identifies Jesus with the divine Word and presents his death and resurrection as decisive for salvation. The Qur’an calls Jesus the Messiah and messenger of God, while denying that he is God or God’s son. Qur’anic passages about the crucifixion are interpreted in different ways, so a careful comparison should cite the passage and describe the interpretation rather than flattening all Muslim views into a slogan.',
          'Judaism shares the Tanakh with Christianity but does not accept the New Testament as scripture or the Christian identification of Jesus as divine Messiah. Jewish expectations of a messianic age and its interpretation vary. These are real theological disagreements, even while the traditions share historical figures and ethical concerns.',
        ],
      },
      {
        heading: 'Primary-text references',
        paragraphs: [
          'For Christian claims, compare John 1:1–18, 1 Corinthians 15:3–8 and the Gospel narratives. For Jewish scripture and context, begin with the Tanakh itself. For Islamic teaching, consult Qur’an 4:157, 4:171, 5:72–75 and Surah 112 in context, together with Muslim commentaries that represent the interpretation under discussion.',
        ],
      },
    ],
    sourceNotes: [
      'Primary texts named here: Tanakh / Hebrew Bible; Christian New Testament; Qur’an 4:157, 4:171, 5:72–75 and 112.',
      'The comparison distinguishes each tradition’s self-description from Christian theological interpretation; it does not claim that every adherent or school uses identical language.',
    ],
    faqs: [
      {
        question: 'Do Judaism and Islam believe in Jesus?',
        answer: 'Both traditions give Jesus an important place but understand him differently from Christianity. Islam honors Jesus as Messiah and prophet while rejecting his divinity. Judaism does not accept the Christian claim that Jesus is the divine Messiah; Jewish views of messianic expectation are diverse.',
      },
      {
        question: 'Do Christians believe in three gods?',
        answer: 'Historic Christian teaching says no: the Trinity is the confession of one God in three persons, Father, Son and Holy Spirit. Judaism and Islam reject that doctrine and emphasize God’s oneness in different theological frameworks. A fair comparison should explain what each tradition means by its own terms.',
      },
      {
        question: 'What is shared by Christianity, Judaism and Islam?',
        answer: 'All three are monotheistic traditions with historical connections to Abrahamic narratives, prayer, scripture and moral accountability. Those shared themes do not erase important differences in canon, covenant, Jesus, revelation and salvation, which are central to comparative religion and dialogue today.',
      },
    ],
    relatedVolumes: ['comparative-religion', 'jesus-is-god-full-references-ot-nt', 'names-of-god', 'apologetics-40-critical-questions'],
    relatedPages: [{ href: '/comparative-apologetics', label: 'Comparative Apologetics Codex' }],
  },
  {
    slug: 'hinduism-buddhism-comparison',
    title: 'Hinduism vs Buddhism: Beliefs, Texts & Goals',
    publishedDate: '2026-11-10',
    updatedDate: '2026-11-10',
    description: 'Understand Hinduism and Buddhism side by side: their varied teachings on ultimate reality, self, karma, liberation, sacred texts and practice.',
    keywords: [
      'Hinduism vs Buddhism comparison',
      'difference between Hinduism and Buddhism',
      'Hinduism Buddhism karma rebirth liberation',
      'Hindu and Buddhist sacred texts',
    ],
    answer: 'Hinduism and Buddhism both developed in South Asia and discuss karma, rebirth and liberation, but they are not the same religion. Hindu traditions include diverse accounts of God, Brahman and the self; Buddhist teachings characteristically reject a permanent self and focus on the causes of suffering and the path to nirvana. Both traditions contain many schools.',
    sections: [
      {
        heading: 'Hinduism and Buddhism at a glance',
        table: {
          caption: 'A broad comparison; the terms and practices below are not uniform across every school.',
          headings: ['Topic', 'Hindu traditions', 'Buddhist traditions'],
          rows: [
            ['Texts', 'Vedas, Upanishads, Bhagavad Gita, epics and Puranas; authority differs across traditions.', 'Pali Canon / Nikāyas, Mahāyāna sutras and other canons; collections differ by school.'],
            ['Ultimate reality', 'Accounts range from devotion to a personal deity to nondual accounts of Brahman and other frameworks.', 'A creator God is not the center of most Buddhist paths; cosmology and devotional practices differ across schools.'],
            ['Self and personhood', 'Some schools teach an enduring self (ātman) or explain its relation to Brahman; views differ.', 'Anattā / anātman denies a permanent, independent self in early Buddhist teaching; later schools develop the analysis in different ways.'],
            ['Goal', 'Moksha, liberation from samsara, is explained through varied paths including devotion, knowledge and disciplined action.', 'Nirvana and awakening are described through the ending of craving and ignorance; the Noble Eightfold Path is a central early Buddhist teaching.'],
          ],
        },
      },
      {
        heading: 'Shared vocabulary does not mean identical doctrine',
        paragraphs: [
          'Karma and rebirth appear in both Hindu and Buddhist settings, but each tradition explains them within a different account of personhood, causation and liberation. In particular, comparing Hindu ātman and Buddhist anattā can clarify a major doctrinal difference; it should not be reduced to “both teach the same soul.”',
          '“Hinduism” is an umbrella term for traditions with different scriptures, rituals and philosophies. Buddhism also includes Theravāda, Mahāyāna, Vajrayāna and other lineages, with distinct texts and practices. The short chart is an orientation, not a substitute for a tradition-specific source.',
        ],
      },
      {
        heading: 'Primary texts for further study',
        paragraphs: [
          'Read a selected passage from the Bhagavad Gita alongside an early Buddhist discourse such as the Dhammacakkappavattana Sutta (SN 56.11) or the Anattalakkhaṇa Sutta (SN 22.59). For Hindu philosophical variety, compare more than one Upanishad and school; for Buddhism, include the relevant tradition’s own canon and commentary.',
        ],
      },
    ],
    sourceNotes: [
      'Illustrative texts: Vedas, Upanishads and Bhagavad Gita; Pali Nikāyas (including SN 56.11 and SN 22.59); diverse Mahāyāna sutras.',
      'This guide uses qualified summaries because neither Hinduism nor Buddhism has a single creed shared by every community.',
    ],
    faqs: [
      {
        question: 'What is the main difference between Hinduism and Buddhism?',
        answer: 'There is no single difference that captures every school, but one major philosophical contrast concerns the self: many Hindu traditions affirm an enduring ātman or explain its relation to ultimate reality, while Buddhist teaching emphasizes anattā, the absence of a permanent independent self. Their scriptures and paths of liberation also differ.',
      },
      {
        question: 'Do Hinduism and Buddhism both teach karma and rebirth?',
        answer: 'Karma and rebirth are important in many Hindu and Buddhist traditions, but the concepts are explained differently. In Buddhism they are discussed alongside dependent arising and no-self; Hindu schools relate them to distinct teachings about the self, God, duty and liberation.',
      },
      {
        question: 'Are moksha and nirvana the same?',
        answer: 'They are not interchangeable. Moksha is a Hindu term for liberation, explained in different ways among Hindu schools; nirvana is a Buddhist goal associated with ending craving and suffering. A useful comparison asks what each school means rather than assuming the words name the same doctrine.',
      },
    ],
    relatedVolumes: ['comparative-religion', 'apologetics-40-critical-questions'],
    relatedPages: [{ href: '/comparative-apologetics', label: 'Comparative Apologetics Codex' }],
  },
  {
    slug: 'world-religions-timeline',
    title: 'World Religions Timeline: Biblical & Scholarly Dates',
    metaTitle: 'World Religions Timeline: Biblical vs Scholarly',
    publishedDate: '2026-11-10',
    updatedDate: '2026-11-10',
    description: 'World religions timeline: compare biblical-view and scholarly dates, see why origins differ, and learn how Volume 15 labels evidence and interpretation.',
    keywords: [
      'world religions timeline',
      'origins of world religions timeline',
      'biblical and scholarly dates of religions',
      'founders and sacred texts timeline',
    ],
    answer: 'There is no single, uncontested calendar of world-religion origins. A biblical-view timeline and a historical-scholarship timeline answer different questions and rely on different methods. Volume 15’s family tree displays those date columns separately, identifies its Ussher-based biblical framework, and labels claims as biblical, traditional, contested or speculative rather than merging them into one date.',
    sections: [
      {
        heading: 'What a world-religions timeline can—and cannot—date',
        table: {
          caption: 'Illustrative historical orientation; these ranges do not claim a single founding moment for complex traditions.',
          headings: ['Tradition or movement', 'Historical dating commonly discussed', 'Why the date is approximate'],
          rows: [
            ['Hindu traditions', 'Vedic literature has roots in the second millennium BCE; later schools and texts developed over many centuries.', 'The tradition is layered: oral composition, ritual practice, manuscripts and later movements do not share one start date.'],
            ['Judaism / ancient Israelite religion', 'Israelite religion is studied through biblical texts, inscriptions and archaeology; later forms of Judaism developed over time.', 'The date of a text, the practice it describes and the formation of a community are different historical questions.'],
            ['Buddhism', 'The historical Buddha is commonly placed in the first millennium BCE, with proposed dates varying among scholars and traditions.', 'Ancient sources are later than the events they describe, and chronologies differ.'],
            ['Christianity', 'The movement begins in the first century CE around the life and early followers of Jesus.', 'Texts, communities and later institutions have distinct histories.'],
            ['Islam', 'Islam emerged in seventh-century Arabia, with the Qur’an and earliest community central to historical study.', 'The development of texts, communities and institutions is studied through different types of evidence.'],
          ],
        },
      },
      {
        heading: 'Why the biblical and scholarly columns are separate',
        paragraphs: [
          'The Volume 15 tree uses a specific biblical chronology associated with Archbishop James Ussher and a reading of the Genesis narrative; its notes identify the chronology used and the claimed biblical anchor for an entry. That is a theological framework. It is not presented here as a consensus archaeological date for Babel or as a substitute for historical scholarship.',
          'Historical researchers date texts, people and institutions using evidence such as manuscripts, inscriptions, archaeology, comparative language study and critical analysis of sources. Evidence can support a range rather than an exact year, and a religion may have no known single founder. The tree marks missing or disputed data instead of pretending precision.',
        ],
      },
      {
        heading: 'How the Volume 15 family tree labels claims',
        paragraphs: [
          'Its source labels distinguish “Bible,” “Tradition,” “Contested,” “None stated” and “Speculation.” The “Occult view” field records what a named esoteric tradition claims; the “Historical check” field is kept separate. These labels help readers trace the status and viewpoint of an origin claim and see why adherents may disagree with the tree’s biblical interpretation.',
          'For a tradition-specific entry, open Volume 15 and inspect the founder, sacred-text, symbol and date fields together with the source notes. Do not read a tree’s placement as proof that historians agree with its theological chronology.',
        ],
      },
    ],
    sourceNotes: [
      'The biblical-view column in Volume 15 explicitly identifies its Ussher chronology and labels the relevant claims; it is a confessional interpretive framework, not a universally accepted historical timeline.',
      'Historical dates for religious movements are approximate and can refer to different things: a founder’s lifetime, an oral tradition, a text, an organized community or a later institution.',
    ],
    faqs: [
      {
        question: 'Are biblical and scholarly dates of religions meant to match?',
        answer: 'No. A biblical-view chronology applies a theological reading of biblical genealogies and events, while historical scholarship evaluates texts, inscriptions, archaeology and other evidence. The timelines may differ because they use different premises and may date different things; Volume 15 keeps the columns separate.',
      },
      {
        question: 'Does the world religions family tree prove that all religions began at Babel?',
        answer: 'No. Volume 15 presents a biblical-view family tree that uses its stated Ussher chronology and labels the source and status of each origin claim. Its Babel framework is a theological interpretation, not a claim that archaeology has established Babel as a dated historical starting point for every religion.',
      },
      {
        question: 'Why do dates for the origins of religions vary?',
        answer: 'A tradition may develop over centuries, and “origin” can mean a founder, an early community, a text, a ritual or an institution. Evidence is also incomplete and differently interpreted. Responsible timelines give ranges, identify the event being dated and mark uncertainty rather than assigning false precision.',
      },
    ],
    relatedVolumes: ['comparative-religion', 'forbidden-knowledge-the-watchers', 'primeval-world-timeline-ancient-civilizations'],
    relatedPages: [{ href: '/scholarly-standards', label: 'Scholarly Standards and source method' }],
  },
];
