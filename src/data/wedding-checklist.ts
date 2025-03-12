import { TimelineItem } from '../components/ui/wedding-timeline';

export const weddingChecklistData: TimelineItem[] = [
  {
    id: '1-1',
    quarter: 1,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Create a guest list',
    resources: [
      {
        title: 'Guest List Manager',
        description: 'Use our guest list manager to easily organize and track your invitations',
        link: '/guests',
        type: 'internal'
      },
      {
        title: 'Guest List Tips',
        description: 'Consider creating A, B, and C lists to manage your guest count if venue capacity is a concern',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-2',
    quarter: 1,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Create a budget in minutes with us or on your own',
    note: 'Pop-up offer for budget tool',
    resources: [
      {
        title: 'Budget Planner',
        description: 'Use our budget tool to track expenses and stay on target',
        link: '/budget',
        type: 'internal'
      },
      {
        title: 'Budget Breakdown',
        description: 'Typical wedding budget breakdown: 50% reception, 10% attire, 10% flowers, 10% entertainment, 10% photography, 10% miscellaneous',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-3',
    quarter: 1,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Gather all guest\'s addresses and e-mails',
    note: 'Pop-up offer to use address tool',
    resources: [
      {
        title: 'Address Collection Tool',
        description: 'Send a link to your guests to collect their information automatically',
        link: '/guests/questionnaire',
        type: 'tool'
      },
      {
        title: 'Guest Directory',
        description: 'Organize all your guest information in one place',
        link: '/guests/directory',
        type: 'internal'
      }
    ]
  },
  {
    id: '1-4',
    quarter: 1,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Research and book venue',
    resources: [
      {
        title: 'Venue Layout Planner',
        description: 'Plan your venue layout with our interactive tool',
        link: '/venue-layout',
        type: 'internal'
      },
      {
        title: 'Venue Checklist',
        description: 'Questions to ask: capacity, availability, catering options, pricing structure, cancellation policy, and accessibility',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-5',
    quarter: 1,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Discuss negotiables + non-negotiables to prioritize vendors',
    note: 'Place for them to rank vendors and integrate into list?',
    resources: [
      {
        title: 'Vendor Prioritization Tool',
        description: 'Rank your vendors by importance to help with budgeting decisions',
        link: '/vendors',
        type: 'internal'
      },
      {
        title: 'Priority Guide',
        description: 'Consider what matters most to you: food quality, photography style, music, or atmosphere',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-6',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Research your vendors and get quotes',
    note: '• Dropdown menu with checkbox option\n• If user is located in an area with a vendor directory, have a pop-up offer for vendor directory',
    resources: [
      {
        title: 'Vendor Directory',
        description: 'Browse our curated list of local wedding vendors',
        link: '/vendor-directory',
        type: 'internal'
      },
      {
        title: 'Vendor Comparison Tool',
        description: 'Compare quotes and services side by side',
        link: '/vendors',
        type: 'tool'
      }
    ]
  },
  {
    id: '1-7',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: '➡️ Catering',
    resources: [
      {
        title: 'Catering Checklist',
        description: 'Questions to ask: menu options, dietary accommodations, service style, staffing ratio, and tasting policy',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-8',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: '➡️ Rentals, if catering isn\'t managing',
    resources: [
      {
        title: 'Rental Calculator',
        description: 'Estimate how many tables, chairs, linens, and place settings you need',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-9',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: '➡️ Florals',
    resources: [
      {
        title: 'Seasonal Flower Guide',
        description: 'See which flowers are in season for your wedding date to save on costs',
        type: 'tip'
      },
      {
        title: 'Vision Board',
        description: 'Create a vision board to share with your florist',
        link: '/vision-board',
        type: 'internal'
      }
    ]
  },
  {
    id: '1-10',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: '➡️ Lighting',
    resources: [
      {
        title: 'Lighting Options',
        description: 'Consider string lights, uplighting, or downlighting to create the perfect ambiance',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-11',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: '➡️ DJ',
    resources: [
      {
        title: 'DJ Checklist',
        description: 'Questions to ask: playlist options, equipment, and emcee services',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-12',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: '➡️ Band or Musicians',
    resources: [
      {
        title: 'Band or Musicians Checklist',
        description: 'Questions to ask: playlist options, equipment, and performance style',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-13',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: '➡️ Photography',
    resources: [
      {
        title: 'Photography Checklist',
        description: 'Questions to ask: style, equipment, and delivery timeline',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-14',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: '➡️ Videography',
    resources: [
      {
        title: 'Videography Checklist',
        description: 'Questions to ask: style, equipment, and delivery timeline',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-15',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: '➡️ Hair & Make-up',
    resources: [
      {
        title: 'Hair & Make-up Checklist',
        description: 'Questions to ask: services offered, trial options, and timing',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-16',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: '➡️ Photobooth',
    resources: [
      {
        title: 'Photobooth Checklist',
        description: 'Questions to ask: props, backdrops, and printing options',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-17',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: '➡️ Officiant, if paying for one',
    resources: [
      {
        title: 'Officiant Checklist',
        description: 'Questions to ask: ceremony style, licensing, and rehearsal attendance',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-18',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: '➡️ Tent',
    resources: [
      {
        title: 'Tent Checklist',
        description: 'Questions to ask: size, style, and installation requirements',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-19',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: '➡️ [Option to add own]',
  },
  {
    id: '1-20',
    quarter: 1,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Order Save the Dates',
  },
  {
    id: '1-21',
    quarter: 1,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Book vendors',
    note: 'Populate list based off of vendors selected above',
    resources: [
      {
        title: 'Vendor Contracts',
        description: 'Make sure to review all contracts carefully before signing',
        type: 'tip'
      },
      {
        title: 'Vendor Management',
        description: 'Track all your vendor information in one place',
        link: '/vendors',
        type: 'internal'
      }
    ]
  },
  {
    id: '1-22',
    quarter: 1,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Create Registry',
    resources: [
      {
        title: 'Registry Tips',
        description: 'Include items at various price points to give guests options',
        type: 'tip'
      },
      {
        title: 'Registry Checklist',
        description: 'Don\'t forget kitchen, bedroom, bathroom, and entertainment items',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-23',
    quarter: 1,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Create wedding website',
    resources: [
      {
        title: 'Website Content',
        description: 'Include your love story, wedding details, registry, and RSVP information',
        type: 'tip'
      }
    ]
  },
  {
    id: '1-24',
    quarter: 1,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Start dress shopping, if either or both marriers want to order a custom dress',
    resources: [
      {
        title: 'Dress Shopping Tips',
        description: 'Start early for custom dresses - they can take 6-9 months to create',
        type: 'tip'
      },
      {
        title: 'Style Inspiration',
        description: 'Save dress styles you love to share with boutiques',
        link: '/vision-board',
        type: 'internal'
      }
    ]
  },
  {
    id: '1-25',
    quarter: 1,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Send out Save The Dates',
    resources: [
      {
        title: 'Guest List',
        description: 'Make sure your guest list is finalized before sending',
        link: '/guests',
        type: 'internal'
      },
      {
        title: 'Save The Date Tips',
        description: 'Include your names, wedding date, location (city/state), and website',
        type: 'tip'
      }
    ]
  },
  {
    id: '2-1',
    quarter: 2,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Research additional venues, if having other events',
    note: 'Dropdown menu with checkbox option',
    resources: [
      {
        title: 'Venue Layout',
        description: 'Plan your venue layout for additional events',
        link: '/venue-layout',
        type: 'internal'
      },
      {
        title: 'Venue Checklist',
        description: 'Consider capacity, availability, and proximity to your main venue',
        type: 'tip'
      }
    ]
  },
  {
    id: '2-2',
    quarter: 2,
    deadline: 'First',
    status: 'NOT STARTED',
    task: '➡️ Rehearsal Dinner or Welcome Party',
    resources: [
      {
        title: 'Guest List',
        description: 'Typically includes wedding party, immediate family, and out-of-town guests',
        type: 'tip'
      },
      {
        title: 'Timeline Planning',
        description: 'Plan your rehearsal dinner timeline',
        link: '/timeline',
        type: 'internal'
      }
    ]
  },
  {
    id: '2-3',
    quarter: 2,
    deadline: 'First',
    status: 'NOT STARTED',
    task: '➡️ After Party',
    resources: [
      {
        title: 'After Party Tips',
        description: 'Consider a more casual venue with late-night food options',
        type: 'tip'
      }
    ]
  },
  {
    id: '2-4',
    quarter: 2,
    deadline: 'First',
    status: 'NOT STARTED',
    task: '➡️ [Option to add own]',
  },
  {
    id: '2-5',
    quarter: 2,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Research hotel blocks or lodging options for guests',
    resources: [
      {
        title: 'Hotel Block Tips',
        description: 'Book blocks at 2-3 hotels at different price points near your venue',
        type: 'tip'
      },
      {
        title: 'Guest Information',
        description: 'Add hotel information to your wedding website',
        type: 'tip'
      }
    ]
  },
  {
    id: '2-6',
    quarter: 2,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Research transportation, if needed',
    resources: [
      {
        title: 'Transportation Tips',
        description: 'Consider shuttles between hotels and venue, especially if alcohol will be served',
        type: 'tip'
      }
    ]
  },
  {
    id: '2-7',
    quarter: 2,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Order wedding dress',
    displayCondition: 'dress shopping',
    resources: [
      {
        title: 'Dress Timeline',
        description: 'Allow 6-8 months for delivery and 2-3 months for alterations',
        type: 'tip'
      }
    ]
  },
  {
    id: '2-8',
    quarter: 2,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Book hair and makeup trials',
    resources: [
      {
        title: 'Hair & Makeup Tips',
        description: 'Schedule trials 3-4 months before the wedding, and bring photos of your desired look',
        type: 'tip'
      },
      {
        title: 'Style Inspiration',
        description: 'Save hairstyle and makeup ideas to show your artists',
        link: '/vision-board',
        type: 'internal'
      }
    ]
  },
  {
    id: '2-9',
    quarter: 2,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Book hotel blocks',
    resources: [
      {
        title: 'Hotel Block Management',
        description: 'Keep track of your reserved room blocks and guest bookings',
        type: 'tip'
      }
    ]
  },
  {
    id: '2-10',
    quarter: 2,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Book transportation',
    resources: [
      {
        title: 'Transportation Checklist',
        description: 'Consider transportation for wedding party, family, and guests between venues',
        type: 'tip'
      }
    ]
  },
  {
    id: '2-11',
    quarter: 2,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Book rehearsal dinner venue',
    resources: [
      {
        title: 'Rehearsal Dinner Planning',
        description: 'Traditionally hosted by the groom\'s parents, but can be hosted by anyone',
        type: 'tip'
      }
    ]
  },
  {
    id: '2-12',
    quarter: 2,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Finalize wedding party',
    resources: [
      {
        title: 'Wedding Party Gifts',
        description: 'Start thinking about thank-you gifts for your wedding party',
        type: 'tip'
      },
      {
        title: 'Wedding Party Management',
        description: 'Keep track of your wedding party members and their responsibilities',
        link: '/guests',
        type: 'internal'
      }
    ]
  },
  {
    id: '2-13',
    quarter: 2,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Shop for wedding party attire',
    resources: [
      {
        title: 'Attire Coordination',
        description: 'Consider color schemes and styles that complement your wedding theme',
        type: 'tip'
      }
    ]
  },
  {
    id: '2-14',
    quarter: 2,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Shop for wedding bands',
    resources: [
      {
        title: 'Ring Shopping Tips',
        description: 'Consider lifestyle, comfort, and how it pairs with engagement rings',
        type: 'tip'
      }
    ]
  },
  {
    id: '2-15',
    quarter: 2,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Start thinking about personal touches that you can infuse into your wedding, including favors',
  },
  {
    id: '2-16',
    quarter: 2,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Starting looking into wedding rings',
  },
  {
    id: '2-17',
    quarter: 2,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Start thinking about Honeymoon',
  },
  {
    id: '2-18',
    quarter: 2,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Start thinking about day of paper items',
  },
  {
    id: '2-19',
    quarter: 2,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Both marriers start ordering attire',
  },
  {
    id: '2-20',
    quarter: 2,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Book wedding stationers',
  },
  {
    id: '3-1',
    quarter: 3,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Finalize menu',
    resources: [
      {
        title: 'Menu Planning Tips',
        description: 'Consider dietary restrictions and seasonal ingredients',
        type: 'tip'
      },
      {
        title: 'Budget Tracker',
        description: 'Update your budget with final catering costs',
        link: '/budget',
        type: 'internal'
      }
    ]
  },
  {
    id: '3-2',
    quarter: 3,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Finalize flowers',
    resources: [
      {
        title: 'Floral Design Tips',
        description: 'Consider seasonal availability and your color palette',
        type: 'tip'
      },
      {
        title: 'Floral Inspiration',
        description: 'Save floral arrangement ideas to share with your florist',
        link: '/vision-board',
        type: 'internal'
      }
    ]
  },
  {
    id: '3-3',
    quarter: 3,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Finalize decor',
    resources: [
      {
        title: 'Decor Planning',
        description: 'Create a cohesive look with your venue, flowers, and overall theme',
        type: 'tip'
      },
      {
        title: 'Vendor Coordination',
        description: 'Ensure your florist and decorator are aligned on your vision',
        link: '/vendors',
        type: 'internal'
      }
    ]
  },
  {
    id: '3-4',
    quarter: 3,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Finalize wedding day timeline',
    resources: [
      {
        title: 'Timeline Builder',
        description: 'Create a detailed timeline for your wedding day',
        link: '/timeline',
        type: 'internal'
      },
      {
        title: 'Timeline Tips',
        description: 'Add buffer time between events and share with all vendors',
        type: 'tip'
      }
    ]
  },
  {
    id: '3-5',
    quarter: 3,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Finalize ceremony details',
    resources: [
      {
        title: 'Ceremony Planning',
        description: 'Work with your officiant to create a meaningful ceremony',
        type: 'tip'
      },
      {
        title: 'Ceremony Checklist',
        description: 'Don\'t forget readings, music, and any cultural traditions',
        type: 'tip'
      }
    ]
  },
  {
    id: '3-6',
    quarter: 3,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Order wedding bands',
    resources: [
      {
        title: 'Ring Timeline',
        description: 'Allow 6-8 weeks for custom rings and sizing',
        type: 'tip'
      }
    ]
  },
  {
    id: '3-7',
    quarter: 3,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Order invitations',
  },
  {
    id: '3-8',
    quarter: 3,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Finish ordering personal items and favors',
  },
  {
    id: '3-9',
    quarter: 3,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Reach back out to all vendors to check-in and see what they will need from you and when',
  },
  {
    id: '3-10',
    quarter: 3,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Schedule hair & make-up trial',
  },
  {
    id: '3-11',
    quarter: 3,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Send out invitations',
  },
  {
    id: '3-12',
    quarter: 3,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Take a moment to look over the WEDDING DAY CHECKLIST to see what you might need there.',
    note: 'Pop-up offer for checklist',
  },
  {
    id: '3-13',
    quarter: 3,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Update this checklist with vendor deadlines (eg when final counts, music choices, and other info is needed)',
  },
  {
    id: '3-14',
    quarter: 3,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Update website with transportation, lodging, and any other info',
  },
  {
    id: '3-15',
    quarter: 3,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Print out table numbers/welcome signs and non specific paper items',
  },
  {
    id: '4-1',
    quarter: 4,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Start your timeline with us or on your own',
    note: 'Pop-up offer for timeline',
  },
  {
    id: '4-2',
    quarter: 4,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Start your seating chart with us or on your own',
    note: 'Pop-up offer for seating chart tool',
  },
  {
    id: '4-3',
    quarter: 4,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Visit the venue for a final walkthrough with the caterer',
  },
  {
    id: '4-4',
    quarter: 4,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Attire should be ready',
  },
  {
    id: '4-5',
    quarter: 4,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Follow-up on any missing RSVPs',
  },
  {
    id: '4-6',
    quarter: 4,
    deadline: 'First',
    status: 'NOT STARTED',
    task: 'Begin Writing Vows',
  },
  {
    id: '4-7',
    quarter: 4,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Begin assigning dinner seating',
  },
  {
    id: '4-8',
    quarter: 4,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Complete photo shot list and send to photographer',
  },
  {
    id: '4-9',
    quarter: 4,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Finish seating chart',
  },
  {
    id: '4-10',
    quarter: 4,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Print seating charts, escort cards & other specific paper items.',
  },
  {
    id: '4-11',
    quarter: 4,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Make necessary adjustments to seating assignments',
  },
  {
    id: '4-12',
    quarter: 4,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Final Menu Selections Made',
  },
  {
    id: '4-13',
    quarter: 4,
    deadline: 'Second',
    status: 'NOT STARTED',
    task: 'Finalize count with rehearsal dinner',
  },
  {
    id: '4-14',
    quarter: 4,
    deadline: '30 Days Before WD',
    status: 'NOT STARTED',
    task: 'Finalize guest count with ALL vendors',
  },
  {
    id: '4-15',
    quarter: 4,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Organize cash for vendor tips',
  },
  {
    id: '4-16',
    quarter: 4,
    deadline: 'Third',
    status: 'NOT STARTED',
    task: 'Meet with all vendors to review timeline and floor plan',
  },
  {
    id: '4-17',
    quarter: 4,
    deadline: '10 Days Before WD',
    status: 'NOT STARTED',
    task: 'Finish timeline and send to all vendors',
  },
  {
    id: '4-18',
    quarter: 4,
    deadline: '1 Day Before WD',
    status: 'NOT STARTED',
    task: 'Enjoy your rehearsal dinner/welcome party',
    condition: 'Only show if selected earlier',
  },
  {
    id: '4-19',
    quarter: 4,
    deadline: 'WD',
    status: 'NOT STARTED',
    task: 'Celebrate! It\'s your wedding day!',
  },
  {
    id: '4-20',
    quarter: 4,
    deadline: '1 Day After WD',
    status: 'NOT STARTED',
    task: 'Say goodbye to your guests with your final event!',
    condition: 'Only show if selected earlier',
  },
];
