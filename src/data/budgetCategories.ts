import {
  Building,
  Utensils,
  Wine,
  Armchair,
  Flower,
  Camera,
  Video,
  Music,
  Disc,
  Cake,
  Scissors,
  Hotel,
  Car,
  Pizza,
  BookOpen,
  Shirt,
  Users,
  DollarSign,
  Package
} from 'lucide-react';

// First 50% of budget
export const essentialCategories = [
  {
    id: 'venue',
    name: 'Venue site fee',
    icon: Building,
    defaultPercentage: 20, // 20% of the first 50% (10% of total)
    isEssential: true
  },
  {
    id: 'catering',
    name: 'Catering',
    icon: Utensils,
    defaultPercentage: 50, // 50% of the first 50% (25% of total)
    isEssential: true
  },
  {
    id: 'alcohol',
    name: 'Alcohol/Beverages',
    icon: Wine,
    defaultPercentage: 30, // 30% of the first 50% (15% of total)
    isEssential: true
  }
];

// Remaining 50% of budget
export const budgetCategories = [
  {
    id: 'rentals',
    name: 'Rentals',
    icon: Armchair,
    defaultPercentage: 0, // Client didn't specify percentage
    isEssential: false
  },
  {
    id: 'florist',
    name: 'Florist',
    icon: Flower,
    defaultPercentage: 20, // 20% of the remaining 50% (10% of total)
    isEssential: false
  },
  {
    id: 'photographer',
    name: 'Photographer',
    icon: Camera,
    defaultPercentage: 15, // 15% of the remaining 50% (7.5% of total)
    isEssential: false
  },
  {
    id: 'videographer',
    name: 'Videographer',
    icon: Video,
    defaultPercentage: 8, // 8% of the remaining 50% (4% of total)
    isEssential: false
  },
  {
    id: 'band',
    name: 'Band',
    icon: Music,
    defaultPercentage: 20, // 20% of the remaining 50% (10% of total)
    isEssential: false
  },
  {
    id: 'dj',
    name: 'DJ',
    icon: Disc,
    defaultPercentage: 6, // 6% of the remaining 50% (3% of total)
    isEssential: false
  },
  {
    id: 'cake',
    name: 'Cake',
    icon: Cake,
    defaultPercentage: 3, // 3% of the remaining 50% (1.5% of total)
    isEssential: false
  },
  {
    id: 'hairMakeup',
    name: 'Hair and makeup',
    icon: Scissors,
    defaultPercentage: 6, // 6% of the remaining 50% (3% of total)
    isEssential: false
  },
  {
    id: 'hotelBlocks',
    name: 'Hotel Blocks',
    icon: Hotel,
    defaultPercentage: 0, // 0% as per client requirements (courtesy block)
    isEssential: false
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: Car,
    defaultPercentage: 7, // 7% of the remaining 50% (3.5% of total)
    isEssential: false
  },
  {
    id: 'lateNightFood',
    name: 'Late Night Food',
    icon: Pizza,
    defaultPercentage: 3, // 3% of the remaining 50% (1.5% of total)
    isEssential: false
  },
  {
    id: 'officiant',
    name: 'Officiant',
    icon: BookOpen,
    defaultPercentage: 2, // 2% of the remaining 50% (1% of total)
    isEssential: false
  },
  {
    id: 'weddingAttire',
    name: 'Wedding Attire',
    icon: Shirt,
    defaultPercentage: 15, // 15% of the remaining 50% (7.5% of total)
    isEssential: false
  },
  {
    id: 'weddingPartyAttire',
    name: 'Wedding Party Attire',
    icon: Users,
    defaultPercentage: 6, // 6% of the remaining 50% (3% of total)
    isEssential: false
  },
  {
    id: 'vendorTips',
    name: 'Tips (for vendors)',
    icon: DollarSign,
    defaultPercentage: 15, // 15% of the remaining 50% (7.5% of total)
    isEssential: false
  },
  {
    id: 'miscellaneous',
    name: 'Miscellaneous',
    icon: Package,
    defaultPercentage: 5, // 5% of the remaining 50% (2.5% of total)
    isEssential: false
  }
];

// Combined categories for convenience
export const allCategories = [...essentialCategories, ...budgetCategories];
