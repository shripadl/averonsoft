export const EXAM_GENERATOR_SEO_SLUGS = ['aws', 'gcse', 'cbse', 'neet', 'a-level', 'nursing'] as const

export type ExamGeneratorSeoSlug = (typeof EXAM_GENERATOR_SEO_SLUGS)[number]

export interface CategorySeoBlock {
  slug: ExamGeneratorSeoSlug
  title: string
  description: string
  h1: string
  /** Plain paragraphs for static rendering (800–1200 words total target). */
  paragraphs: string[]
  faq: { question: string; answer: string }[]
}

const intro =
  'Averonsoft’s Exam Question Generator is a free micro‑utility that builds multiple‑choice study prompts from your topic and difficulty. Generation is deterministic and template‑based: there are no external AI calls, and content is designed as general revision material rather than copies of proprietary exams.'

export const CATEGORY_SEO: Record<ExamGeneratorSeoSlug, CategorySeoBlock> = {
  aws: {
    slug: 'aws',
    title: 'Free Cloud & IT Exam Question Generator | Averonsoft',
    description:
      'Generate deterministic MCQs for cloud and IT revision. Free for a limited period, no login. Template‑based practice—not official vendor exam items.',
    h1: 'Cloud & IT career prep question generator',
    paragraphs: [
      intro,
      'If you are exploring cloud roles or broad IT certification paths, structured practice questions help you check vocabulary, service models, and reliability concepts. Our generator maps your topic keywords to domains such as networking, databases, cloud fundamentals, security, operating systems, and general computing. You receive between ten and twenty items depending on difficulty, each with four options and a labelled correct answer.',
      'We deliberately avoid vendor‑specific wording in generated items. You will not see trademarked exam codes or dump‑style phrasing. Instead, stems focus on portable ideas: TCP versus UDP tradeoffs, DNS purpose, NAT behavior, database normalization, ACID transactions, horizontal scaling, least privilege, hashing with salts, and related foundations. This keeps practice appropriate for mixed curricula and classroom use while still feeling relevant to modern platforms.',
      'Use the tool by typing a topic such as “VPC networking basics” or “database indexing revision.” Pick easy, medium, or hard to control batch size. Easy returns ten questions, medium fifteen, and hard twenty. Because selection is seeded from your inputs, the same topic and difficulty produces a consistent set for a given release of the template bank—ideal for repeatable drills or comparing answers with a study group.',
      'Combine this utility with official documentation, labs, and accredited courses. Template questions are not substitutes for hands‑on experience. They shine as warm‑ups before deeper work: naming layers, articulating why TLS exists, explaining idempotent HTTP methods, or recalling what a covering index can do. Export a PDF when you want a paper‑friendly worksheet or an offline revision sheet.',
      'Teachers and mentors can use the generator to spin neutral prompts for quizzes without hunting for copyright‑sensitive material. Students can iterate topics quickly to expose gaps. If you are also preparing for formal credentials, treat these items as concept checks only; always align learning objectives with the provider’s published guides and skills lists.',
      'Internal quality checks screen topics and outputs for disallowed categories such as harmful instructions, political campaigning, or sensitive medical advice. Vendor‑specific product trivia is filtered from templates. When you are ready, open the main generator, enter your focus area, and download results as PDF for a tidy study pack.',
      'Employers hiring for cloud‑adjacent roles still care about how you narrate tradeoffs: cost versus latency, consistency models for data stores, and failure domains across regions. Use generated items as seeds for richer artifacts—sketch redundancy patterns, list monitoring signals you would watch, and note rollback steps. Discussing these extensions aloud converts recognition‑level MCQs into portfolio‑ready narratives. Rotate topics weekly so networking, security, and databases all receive airtime rather than over‑indexing on whichever chapter feels easiest.',
      'If you maintain a personal knowledge base or digital notes, paste stems into your system and tag them with the domain labels returned by the API. Over months you will visualize weak zones as clusters with fewer confident answers. Pair those clusters with official tutorials and hands‑on sandboxes. The generator’s value is pace and variety; your coursework and projects supply grounding evidence of skill.',
    ],
    faq: [
      {
        question: 'Does this tool copy official cloud certification exams?',
        answer:
          'No. Items are authored from generic templates and procedural variation. They are unrelated to any proprietary exam bank.',
      },
      {
        question: 'Why is generation deterministic?',
        answer:
          'Deterministic selection makes the tool fast, private, and predictable. The same inputs map to the same items for a given template release, with no third‑party AI calls.',
      },
      {
        question: 'Can I use PDFs in class?',
        answer:
          'Yes for educational practice, provided you respect your institution’s policies and attribute sources appropriately. Content is original template material from Averonsoft.',
      },
    ],
  },
  gcse: {
    slug: 'gcse',
    title: 'GCSE‑Style Free MCQ Generator | Averonsoft',
    description:
      'Create GCSE‑style revision MCQs from topics you choose. Deterministic, template‑based, no login. PDF export included.',
    h1: 'GCSE‑style revision with instant MCQs',
    paragraphs: [
      intro,
      'GCSE learners often balance many subjects at once. Short, targeted multiple‑choice drills make it easier to rehearse definitions, quantitative reasoning, and scientific literacy without committing to a full past paper every session. Our generator draws from maths, physics, chemistry, biology, general knowledge, and cross‑cutting IT literacy templates so you can align practice with STEM and numerate humanities topics common in UK secondary curricula.',
      'Difficulty maps to workload: easy gives ten questions for a quick starter; medium gives fifteen for a lesson segment; hard gives twenty for a longer revision block. Topics are interpreted with simple keyword mapping, so phrases like “probability basics” or “forces and motion” steer the bank toward relevant stems while still mixing adjacent skills for breadth.',
      'Because outputs are template‑based, you can trust predictable structure: a stem, four labelled options, and an indicated key. Export to PDF for offline study on the bus or at the kitchen table. Pair generated sets with mark schemes you build yourself—explaining why distractors are tempting is excellent metacognition and deepens understanding beyond simple recall.',
      'Parents supporting revision at home can generate fresh batches under different difficulties to track improvement over time. Tutors can spin neutral items quickly between sessions. Remember that exam boards publish unique specifications; use board‑approved resources for high‑stakes alignment, and treat this generator as flexible reinforcement rather than a specification substitute.',
      'Accessibility matters: the site keeps a minimal layout, large readable type in the tool cards, and keyboard‑friendly controls. The banner reminds you the product is free for a limited period with no login, lowering friction for spontaneous study bursts when motivation strikes.',
      'Ready to begin? Visit the main Exam Question Generator, type your module or skill focus, choose difficulty, and generate. Follow with spaced repetition: revisit the same topic a few days later with a new batch to consolidate long‑term memory.',
      'Modular revision schedules outperform marathon cramming. Split each evening into three micro‑blocks: ten MCQs, ten minutes of worked examples from your textbook, and five minutes summarizing mistakes in your own words. The MCQ block benefits from the generator’s speed; the worked examples restore depth; the summary anchors metacognition. Track streaks on a calendar to sustain motivation when coursework volume spikes before mocks.',
      'Cross‑link subjects intentionally. A stem on kinetic energy can prompt you to revisit related calculus tools; a question on cash flows can connect to percentage change work from maths. Synoptic thinking is increasingly rewarded in holistic assessments even when final papers remain modular. Use internal links on this site to hop between category guides and the live generator so you never lose the thread from reading to practice.',
    ],
    faq: [
      {
        question: 'Is this officially endorsed by an exam board?',
        answer:
          'No. Averonsoft is independent. Use board materials for syllabus alignment; use this tool for extra practice items.',
      },
      {
        question: 'Are maths answers always unique?',
        answer:
          'Templates use clear stems with single best answers. Always show your working on paper even when practicing with MCQs.',
      },
      {
        question: 'Can I print without an account?',
        answer: 'Yes. PDF export runs in your browser; we do not require login for the free promotional period.',
      },
    ],
  },
  cbse: {
    slug: 'cbse',
    title: 'CBSE‑Style Practice MCQ Generator | Averonsoft',
    description:
      'Free CBSE‑style MCQ batches for science, maths, and general studies topics. Deterministic generator with PDF download.',
    h1: 'CBSE‑style practice questions on demand',
    paragraphs: [
      intro,
      'CBSE classrooms emphasize conceptual clarity alongside exam technique. Multiple‑choice practice helps students reason under time pressure, discriminate between closely related definitions, and strengthen quantitative intuition in mathematics and the sciences. Our generator surfaces items from aligned domains: maths through calculus‑lite prompts, physics with mechanics and waves, chemistry with acid–base and kinetics framing, biology with cell biology and ecology, plus general knowledge crosslinks.',
      'Teachers can assign a generated PDF as a bell ringer or homework sheet. Students can self‑serve when they want extra items beyond textbook end‑of‑chapter sets. Keyword mapping recognizes common syllabus language—photosynthesis, probability, organic patterns at introductory level—so your topic line nudges selection toward relevant stems without manual curation.',
      'Deterministic generation means reproducibility: two classmates entering identical topics and difficulty receive the same items until the template bank updates. That supports fair take‑home practice and peer discussion. When you need variety, tweak the topic string slightly or switch difficulty to change the seeding pathway through the bank.',
      'Ethical use matters: these items are original templates, not scans or reproductions of board papers. They avoid sensitive medical or political content and avoid vendor‑certification trivia. Combine them with NCERT texts, exemplar problems, and school assessments for a complete preparation strategy.',
      'Technical reliability is straightforward: the tool runs on Averonsoft’s Next.js stack with a lightweight JSON API. No external AI services participate, which keeps latency low and avoids sending your study topics to remote model providers. Privacy‑conscious families and schools may appreciate that design choice.',
      'Start by opening the generator page, entering a concise topic (for example, “quadratic equations revision”), selecting medium difficulty for fifteen items, and exporting PDF if you want a printable set. Iterate daily for a week to see compounding gains in speed and accuracy.',
      'Numerical competency improves when students alternate exact arithmetic with estimation sense. After each generated maths item, try bounding the answer mentally before checking the key. For sciences, sketch diagrams even when the item is purely verbal—associating language with figures strengthens recall. Teachers can ask learners to annotate PDF printouts with tiny margin notes explaining why each distractor fails; those margin notes become excellent revision cards later.',
      'Collaborative study circles can split a PDF: each member presents two items to the group and must teach the underlying principle for two minutes without looking at notes. Teaching expectations clarify gaps faster than silent re‑reading. Rotate presenters so quieter students also receive speaking opportunities, building confidence for oral components and viva‑style interactions where boards include them.',
    ],
    faq: [
      {
        question: 'Does the generator follow the latest CBSE blueprint exactly?',
        answer:
          'It offers conceptual MCQs across STEM and general knowledge. Always cross‑check weighting and formats with your school’s latest blueprint.',
      },
      {
        question: 'Can Hindi or regional language topics be used?',
        answer:
          'The interface is English, but you may type transliterated topic phrases. Stems render in English because the template bank is English.',
      },
      {
        question: 'Are answers explained?',
        answer:
          'Items show the correct option label. Use classroom time or self‑study to write short justifications for each choice.',
      },
    ],
  },
  neet: {
    slug: 'neet',
    title: 'NEET‑Style Biology & Science MCQs (Study Aid) | Averonsoft',
    description:
      'Template‑based MCQs for biology and science vocabulary practice. Not a substitute for clinical training. Free generator with PDF export.',
    h1: 'NEET‑aligned study drills without sensitive clinical content',
    paragraphs: [
      intro,
      'NEET aspirants spend thousands of hours mastering biology, chemistry, and physics alongside time management. Our generator contributes lightweight, non‑clinical multiple‑choice drills that reinforce foundational science: cell structure, genetics vocabulary, energetics, evolution principles, and related chemistry concepts. We intentionally exclude diagnostic or prescribing scenarios to keep content appropriate for a general study tool.',
      'Keyword mapping recognizes ecology, enzymes, photosynthesis, organic basics, and mechanics language. That steers batches toward STEM templates while keeping language examination‑neutral. Use easy mode for a ten‑question warm‑up before a long problem session, or hard mode for twenty rapid recalls when energy is high.',
      'Deterministic generation supports deliberate practice: repeat a topic until explanations become fluent, then change the topic string to probe adjacent chapters. Export PDFs to simulate exam‑like linear reading without browser distractions. Pair each session with active recall—cover the options, predict the answer, then reveal.',
      'This is not medical advice and not a replica of any entrance examination. It is a micro‑utility for pattern recognition and vocabulary, best combined with accredited coaching, NCERT‑level reading, and full‑length supervised mocks. Always verify learning goals against the current official information bulletin.',
      'Safety filters block abusive topics and disallowed domains at the API layer. Vendor‑specific cloud trivia is excluded from templates so science students are not pulled into irrelevant certification jargon during biology revision.',
      'When you are ready, open the Exam Question Generator, enter a topic such as “genetics revision” or “thermodynamics basics,” pick difficulty, and generate. Save PDFs in a dated folder to track volume of practice over months.',
      'Test strategy still matters: learn to skip stuck items quickly, mark uncertain guesses clearly if your practice format allows, and return with fresh eyes. Use the generator’s labelled answers to audit error types—concept slip, careless arithmetic, vocabulary gap—rather than only recording right versus wrong. Error typing guides the next day’s reading list so preparation becomes data‑informed instead of anxious repetition of familiar chapters.',
      'Sleep and nutrition influence recall as much as question volume. Schedule hardest batches earlier in the study day when attention is highest; use shorter easy batches as wind‑down routines that avoid overstimulation before bed. The deterministic tool supports habit building because friction is low: no accounts, no paywall during the promotional window, and predictable output length tied to difficulty.',
    ],
    faq: [
      {
        question: 'Will this predict my NEET rank?',
        answer:
          'No predictive claims are made. The tool is for practice only; outcomes depend on comprehensive preparation and examination conditions.',
      },
      {
        question: 'Why no clinical vignettes?',
        answer:
          'Public micro‑utilities should avoid simulated medical decision‑making. Use official and educator‑vetted clinical resources where appropriate.',
      },
      {
        question: 'Can institutions block external AI here?',
        answer:
          'There is no external AI in the pipeline—only deterministic template rendering—simplifying compliance conversations.',
      },
    ],
  },
  'a-level': {
    slug: 'a-level',
    title: 'A‑Level‑Style MCQ Generator | Averonsoft',
    description:
      'Free deterministic MCQs for A‑Level style revision in maths, sciences, and business studies. PDF export, no login during the promotional period.',
    h1: 'A‑Level style retrieval practice',
    paragraphs: [
      intro,
      'A‑Level learners often need rapid retrieval sets between longer structured questions. Multiple‑choice prompts help check definitions, quantitative moves, and business concepts like elasticity, cash flows, and stakeholder framing. Our bank spans maths, physics, chemistry, biology, business studies, and supporting general knowledge so you can rotate domains in one sitting.',
      'Difficulty controls batch size: ten, fifteen, or twenty items. Topic lines such as “differentiation basics,” “market structures revision,” or “organic mechanisms drill” influence domain mapping. Templates favor portable explanations suitable across awarding organization families while remaining academically substantive.',
      'Deterministic output supports study groups: everyone can load the same PDF and debate distractors rigorously. Tutors can snapshot a batch for slide decks by exporting PDF and importing pages into presentation tools, respecting your local copyright policies for classroom display.',
      'The generator complements past papers; it does not replace them. Use board‑specific mark schemes for extended responses, and use this tool for warm‑ups, homework starters, and vocabulary tightening. Over time, track which topics repeatedly confuse you and aim additional batches there.',
      'Technical architecture keeps the experience fast: a single API route validates input, maps domains, assembles items, and returns JSON immediately. Client‑side PDF creation avoids server rendering costs and keeps documents entirely under your control once downloaded.',
      'Begin at the main /exam-generator page, choose a topic and difficulty, then export PDF. Revisit weekly with varied topics to distribute practice across the specification rather than cramming a single unit.',
      'Synoptic questions reward linking mechanisms across topics. After a business studies batch on elasticity, attempt to connect the language to maths gradients on demand curves you sketch yourself. After a physics item on waves, revisit corresponding maths on periodicity. The generator supplies anchors; your notebooks supply integrations. Examiners can tell when students understand relationships rather than isolated facts because explanations chain causes across chapters.',
      'Timeboxing helps avoid perfectionism. Give yourself twelve minutes for a medium PDF, then stop even if unfinished, review mistakes immediately, and schedule a retest two days later. The stopwatch habit mirrors examination halls where incomplete papers still benefit from partial credit on later structured questions informed by sharper vocabulary from earlier MCQs.',
    ],
    faq: [
      {
        question: 'Are maths questions examination board‑specific?',
        answer:
          'They are generic A‑Level‑style stems. Validate notation and depth against your specification with your teacher.',
      },
      {
        question: 'Can I use this for EPQ research breaks?',
        answer:
          'Yes—short MCQ bursts can reset focus between long writing sessions without opening social feeds.',
      },
      {
        question: 'Does the site store my topics?',
        answer:
          'Generation is stateless on the server side for this route; PDFs are created locally in your browser when you export.',
      },
    ],
  },
  nursing: {
    slug: 'nursing',
    title: 'Nursing Fundamentals MCQ Study Aid | Averonsoft',
    description:
      'High‑level science vocabulary MCQs suitable for early nursing theory revision. Not for clinical decision training. Free generator with PDF.',
    h1: 'Nursing fundamentals: safe, general MCQ practice',
    paragraphs: [
      intro,
      'Nursing education blends anatomy and physiology, communication, ethics, and supervised clinical skills. This generator offers only non‑clinical, template‑based multiple‑choice items drawn from biology and general science vocabulary—useful for refreshing terminology before deeper coursework. It does not simulate patient scenarios, drug dosing, or diagnostic reasoning, which belong in accredited simulators and supervised settings.',
      'Students may practice items on cell biology, homeostasis language, and general chemistry vocabulary that often underpins physiology courses. Business communication templates occasionally appear when topics mention leadership or stakeholders; skip those batches if irrelevant by tightening your topic wording toward anatomy and physiology keywords.',
      'Deterministic batches help you schedule predictable study volume: ten quick items before lab, fifteen during a commute review, or twenty for a weekend recap. Export PDFs for offline access in clinical buildings with variable connectivity—remember to follow local policies on personal devices at placements.',
      'Programs should continue to rely on validated assessment banks and human faculty for high‑stakes evaluation. Averonsoft’s tool is a micro‑utility for breadth and warm‑ups, not a licensure predictor. Combine with textbooks, skills labs, and reflective practice.',
      'Safety filters block sensitive medical advice patterns in outputs and block abusive topic requests. Vendor cloud trivia is excluded so sessions stay focused on educational fundamentals rather than unrelated certification marketing.',
      'To start, open the generator, enter a topic such as “cell biology revision” or “acid base vocabulary,” select difficulty, and generate. Save PDFs with dates to monitor volume of auxiliary practice alongside your formal curriculum.',
      'Communication and ethics vocabulary also underpins professional nursing even when this tool focuses on science basics. Pair factual recall with reflective journaling: after each batch, write two sentences about how a concept might matter to patient education at a lay level without inventing clinical details. That habit strengthens plain‑language skills valued in bedside teaching while keeping this utility within its safe scope.',
      'Peer learning groups in nursing programs can trade PDFs and quiz one another verbally, which builds confidence for oral assessments and concept checks before simulations. Always defer clinical reasoning to licensed instructors and approved scenarios. The generator’s role is to keep scientific language fresh between richer learning experiences that integrate motor skills, empathy, and protocols.',
    ],
    faq: [
      {
        question: 'Can this replace simulation lab quizzes?',
        answer:
          'No. It is a supplemental vocabulary tool only. Use program‑approved assessments for clinical readiness.',
      },
      {
        question: 'Are dosage calculations included?',
        answer:
          'No. Dosage and prescribing style content are intentionally out of scope for this public generator.',
      },
      {
        question: 'Is an account required?',
        answer:
          'During the promotional period, no login is required, as stated in the on‑page banner.',
      },
    ],
  },
}

export function isExamGeneratorSeoSlug(s: string): s is ExamGeneratorSeoSlug {
  return (EXAM_GENERATOR_SEO_SLUGS as readonly string[]).includes(s)
}
