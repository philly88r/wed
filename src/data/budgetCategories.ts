import {
  Building,
  Shirt,
  PartyPopper,
  Camera,
  UtensilsCrossed,
  Mail,
  Car,
  Music,
  Gift,
  MoreHorizontal
} from 'lucide-react';

export const budgetCategories = [
  {
    id: 'venue',
    name: 'Venue and Location',
    icon: Building,
    defaultPercentage: 25,
    items: [
      { id: 'ceremony', name: 'Ceremony Venue Rental', defaultPercentage: 30 },
      { id: 'reception', name: 'Reception Venue Rental', defaultPercentage: 60 },
      { id: 'rehearsal', name: 'Rehearsal Dinner Location', defaultPercentage: 10 }
    ]
  },
  {
    id: 'attire',
    name: 'Attire and Accessories',
    icon: Shirt,
    defaultPercentage: 10,
    items: [
      { id: 'dress', name: 'Wedding Dress', defaultPercentage: 50 },
      { id: 'suit', name: 'Suit/Tuxedo', defaultPercentage: 25 },
      { id: 'accessories', name: 'Shoes and Accessories', defaultPercentage: 15 },
      { id: 'beauty', name: 'Hair and Makeup', defaultPercentage: 10 }
    ]
  },
  {
    id: 'ceremony',
    name: 'Ceremony and Reception',
    icon: PartyPopper,
    defaultPercentage: 15,
    items: [
      { id: 'decor', name: 'Decor (flowers, candles, etc.)', defaultPercentage: 40 },
      { id: 'setup', name: 'Ceremony Setup Fees', defaultPercentage: 20 },
      { id: 'rentals', name: 'Rentals (tables, chairs, linens)', defaultPercentage: 30 },
      { id: 'lighting', name: 'Lighting', defaultPercentage: 10 }
    ]
  },
  {
    id: 'photo',
    name: 'Photography and Videography',
    icon: Camera,
    defaultPercentage: 12,
    items: [
      { id: 'photographer', name: 'Photographer Fees', defaultPercentage: 50 },
      { id: 'videographer', name: 'Videographer Fees', defaultPercentage: 40 },
      { id: 'photobooth', name: 'Photo Booth', defaultPercentage: 10 }
    ]
  },
  {
    id: 'food',
    name: 'Food and Beverage',
    icon: UtensilsCrossed,
    defaultPercentage: 20,
    items: [
      { id: 'catering', name: 'Catering per Head', defaultPercentage: 60 },
      { id: 'bar', name: 'Beverages/Bar Service', defaultPercentage: 30 },
      { id: 'cake', name: 'Cake or Dessert', defaultPercentage: 10 }
    ]
  },
  {
    id: 'stationery',
    name: 'Invitations and Stationery',
    icon: Mail,
    defaultPercentage: 3,
    items: [
      { id: 'invitations', name: 'Save-the-dates and Invitations', defaultPercentage: 60 },
      { id: 'thankyou', name: 'Thank You Cards', defaultPercentage: 20 },
      { id: 'placecards', name: 'Place Cards and Menus', defaultPercentage: 20 }
    ]
  },
  {
    id: 'transport',
    name: 'Transportation',
    icon: Car,
    defaultPercentage: 3,
    items: [
      { id: 'couple', name: 'Bride and Groom Transport', defaultPercentage: 60 },
      { id: 'guests', name: 'Guest Shuttles', defaultPercentage: 40 }
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: Music,
    defaultPercentage: 5,
    items: [
      { id: 'band', name: 'Live Band/DJ', defaultPercentage: 80 },
      { id: 'extra', name: 'Extra Entertainment', defaultPercentage: 20 }
    ]
  },
  {
    id: 'gifts',
    name: 'Favors and Gifts',
    icon: Gift,
    defaultPercentage: 2,
    items: [
      { id: 'favors', name: 'Guest Favors', defaultPercentage: 40 },
      { id: 'party', name: 'Wedding Party Gifts', defaultPercentage: 40 },
      { id: 'parents', name: 'Parents\' Gifts', defaultPercentage: 20 }
    ]
  },
  {
    id: 'misc',
    name: 'Other Miscellaneous',
    icon: MoreHorizontal,
    defaultPercentage: 5,
    items: [
      { id: 'planner', name: 'Wedding Planner/Coordinator', defaultPercentage: 70 },
      { id: 'license', name: 'Marriage License', defaultPercentage: 10 },
      { id: 'tips', name: 'Tips and Gratuities', defaultPercentage: 20 }
    ]
  }
];
