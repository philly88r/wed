import { useState, useEffect } from 'react';
import { Download, RefreshCw, X, Check, Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { getSupabase } from '../supabaseClient';
import { essentialCategories, budgetCategories } from '../data/budgetCategories';
import VendorSelector from '../components/budget/VendorSelector';
import CategoryVendor from '../components/budget/CategoryVendor';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

interface CategoryBudget {
  allocated: number;
  spent: number;
  enabled: boolean;
}

interface BudgetState {
  totalBudget: number;
  guestCount: number;
  essentials: Record<string, CategoryBudget>;
  discretionary: Record<string, CategoryBudget>;
  customVendors: Array<{
    id: string;
    name: string;
    allocated: number;
    spent: number;
    categoryId?: string;
  }>;
}

// Function to handle adding a custom vendor to a specific category
const addCustomVendorToCategory = async (name: string, allocated: number, categoryId: string, user: User | null) => {
  if (!user) return;
  
  try {
    // First save to database
    const supabase = getSupabase();
    if (!supabase) {
      console.error('Supabase client is null');
      return;
    }
    
    const { data, error } = await supabase
      .from('custom_vendors')
      .insert([
        {
          user_id: user.id,
          name,
          allocated,
          spent: 0,
          category_id: categoryId
        }
      ])
      .select('*')
      .single();
    
    if (error) {
      console.error('Error adding custom vendor:', error);
      return;
    }
    
    // Then update local state
    if (data) {
      const newVendor = {
        id: data.id as string,
        name: data.name as string,
        allocated: typeof data.allocated === 'string' ? parseFloat(data.allocated) : Number(data.allocated),
        spent: typeof data.spent === 'string' ? parseFloat(data.spent) : Number(data.spent),
        categoryId
      };
      
      return newVendor;
    }
  } catch (error) {
    console.error('Error adding custom vendor:', error);
  }
  
  return null;
};

// Define database types

interface DbBudgetData {
  id: string;
  user_id: string;
  total_budget: number;
  guest_count: number;
  essential_categories: Record<string, CategoryBudget>;
  discretionary_categories: Record<string, CategoryBudget>;
  disabled_vendors: string[];
  created_at?: string;
  updated_at?: string;
}

export default function Budget() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [budget, setBudget] = useState<BudgetState>({
    totalBudget: 100000,
    guestCount: 100,
    essentials: {},
    discretionary: {},
    customVendors: []
  });
  
  // Track which vendors are enabled/disabled
  const [disabledVendors, setDisabledVendors] = useState<string[]>([]);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      setIsLoading(true);
      const supabase = getSupabase();
      if (!supabase) {
        console.error('Supabase client is null');
        setIsLoading(false);
        return;
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };
    
    getUser();
  }, []);

  // Load budget data from database
  useEffect(() => {
    if (!user) return;
    
    // Load budget data from database
    loadBudgetData();
    
    // Load custom vendors from database
    loadCustomVendors();
  }, [user]);
  
  // Load budget data from database
  const loadBudgetData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.error('Supabase client is null');
        setIsLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('budget_data')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // No data found, initialize with defaults and save to database
          console.log('No budget data found, initializing with defaults');
          initializeBudget(100000, 100, true);
        } else {
          console.error('Error loading budget data:', error);
        }
        return;
      }
      
      if (data) {
        // Load budget data from database
        const budgetData = data as unknown as DbBudgetData;
        setBudget({
          totalBudget: Number(budgetData.total_budget),
          guestCount: budgetData.guest_count,
          essentials: budgetData.essential_categories as Record<string, CategoryBudget>,
          discretionary: budgetData.discretionary_categories as Record<string, CategoryBudget>,
          customVendors: []
        });
        
        // Load disabled vendors
        setDisabledVendors(budgetData.disabled_vendors || []);
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
      // Fall back to defaults
      initializeBudget(100000, 100);
    } finally {
      setIsLoading(false);
    }
  };

  // Save budget data to database whenever it changes
  useEffect(() => {
    if (!user) return;
    
    // Save to localStorage as a backup
    const data = { 
      budget,
      disabledVendors
    };
    localStorage.setItem('wedding-budget-data-v2', JSON.stringify(data));
    
    // Save to database
    saveBudgetData();
  }, [budget, disabledVendors, user]);
  
  // Save budget data to database
  const saveBudgetData = async () => {
    if (!user) return;
    
    try {
      const supabase = getSupabase();
      if (!supabase) {
        console.error('Supabase client is null');
        return;
      }
      
      // Check if budget data exists for this user
      const { data: existingData, error: checkError } = await supabase
        .from('budget_data')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking budget data:', checkError);
        return;
      }
      
      const budgetData: {
        user_id: string;
        total_budget: number;
        guest_count: number;
        essential_categories: Record<string, CategoryBudget>;
        discretionary_categories: Record<string, CategoryBudget>;
        disabled_vendors: string[];
        updated_at: string;
      } = {
        user_id: user.id,
        total_budget: budget.totalBudget,
        guest_count: budget.guestCount,
        essential_categories: budget.essentials,
        discretionary_categories: budget.discretionary,
        disabled_vendors: disabledVendors,
        updated_at: new Date().toISOString()
      };
      
      if (existingData) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('budget_data')
          .update(budgetData)
          .eq('id', existingData.id);
          
        if (updateError) {
          console.error('Error updating budget data:', updateError);
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('budget_data')
          .insert([budgetData]);
          
        if (insertError) {
          console.error('Error inserting budget data:', insertError);
        }
      }
    } catch (error) {
      console.error('Error saving budget data:', error);
    }
  };
  
  // Load custom vendors from database
  const loadCustomVendors = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('custom_vendors')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading custom vendors:', error);
        return;
      }
      
      if (data && data.length > 0) {
        // Convert database vendors to the format used in the component
        const dbVendors = data.map((vendor: any) => ({
          id: vendor.id,
          name: vendor.name,
          allocated: typeof vendor.allocated === 'string' ? parseFloat(vendor.allocated) : vendor.allocated,
          spent: typeof vendor.spent === 'string' ? parseFloat(vendor.spent) : vendor.spent,
          categoryId: vendor.category_id || undefined
        }));
        
        // Update the budget state with the loaded vendors
        setBudget(prev => ({
          ...prev,
          customVendors: dbVendors
        }));
      }
    } catch (error) {
      console.error('Error loading custom vendors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeBudget = (amount: number, guests: number, saveToDb: boolean = false) => {
    const essentialAmount = amount * 0.5; // 50% of total budget
    const discretionaryAmount = amount * 0.5; // Remaining 50%
    
    // Initialize essentials (first 50%)
    const essentials: Record<string, CategoryBudget> = {};
    essentialCategories.forEach(category => {
      const categoryAmount = essentialAmount * (category.defaultPercentage / 100);
      essentials[category.id] = {
        allocated: categoryAmount,
        spent: 0,
        enabled: true // Essential categories cannot be disabled
      };
    });
    
    // Initialize discretionary categories (remaining 50%)
    const discretionary: Record<string, CategoryBudget> = {};
    budgetCategories.forEach(category => {
      const categoryAmount = discretionaryAmount * (category.defaultPercentage / 100);
      discretionary[category.id] = {
        allocated: categoryAmount,
        spent: 0,
        enabled: true // Can be toggled by user
      };
    });
    
    // Keep existing custom vendors when reinitializing
    const existingCustomVendors = budget?.customVendors || [];
    
    const newBudget = {
      totalBudget: amount,
      guestCount: guests,
      essentials,
      discretionary,
      customVendors: existingCustomVendors
    };
    
    setBudget(newBudget);
    
    // If saveToDb is true, save the initialized budget to the database
    if (saveToDb && user) {
      const budgetData: {
        user_id: string;
        total_budget: number;
        guest_count: number;
        essential_categories: Record<string, CategoryBudget>;
        discretionary_categories: Record<string, CategoryBudget>;
        disabled_vendors: string[];
        updated_at: string;
      } = {
        user_id: user.id,
        total_budget: amount,
        guest_count: guests,
        essential_categories: essentials,
        discretionary_categories: discretionary,
        disabled_vendors: disabledVendors,
        updated_at: new Date().toISOString()
      };
      
      const supabase = getSupabase();
      if (!supabase) {
        console.error('Supabase client is null');
        return;
      }
      
      supabase
        .from('budget_data')
        .insert([budgetData])
        .then(({ error }: { error: any }) => {
          if (error) {
            console.error('Error saving initialized budget:', error);
          }
        });
    }
  };

  const toggleVendor = (vendorId: string) => {
    setBudget(prev => {
      // Only allow toggling discretionary vendors
      if (vendorId in prev.discretionary) {
        const newDiscretionary = {...prev.discretionary};
        newDiscretionary[vendorId] = {
          ...newDiscretionary[vendorId],
          enabled: !newDiscretionary[vendorId].enabled
        };
        
        return {
          ...prev,
          discretionary: newDiscretionary
        };
      }
      return prev;
    });
    
    // Update disabled vendors list
    setDisabledVendors(prev => {
      if (prev.includes(vendorId)) {
        return prev.filter(id => id !== vendorId);
      } else {
        return [...prev, vendorId];
      }
    });
  };

  const recalculateDiscretionaryBudget = () => {
    setBudget(prev => {
      const discretionaryAmount = prev.totalBudget * 0.5;
      const newDiscretionary = {...prev.discretionary};
      
      // Get total percentage of enabled vendors
      const enabledVendors = budgetCategories.filter(cat => 
        !disabledVendors.includes(cat.id));
      
      const totalEnabledPercentage = enabledVendors.reduce(
        (sum, cat) => sum + cat.defaultPercentage, 0);
      
      // Redistribute budget to enabled vendors
      if (totalEnabledPercentage > 0) {
        enabledVendors.forEach(category => {
          // Calculate adjusted percentage (relative to enabled vendors)
          const adjustedPercentage = 
            (category.defaultPercentage / totalEnabledPercentage) * 100;
          
          // Update allocation
          newDiscretionary[category.id] = {
            ...newDiscretionary[category.id],
            allocated: discretionaryAmount * (adjustedPercentage / 100)
          };
        });
      }
      
      return {
        ...prev,
        discretionary: newDiscretionary
      };
    });
  };

  // Call recalculate whenever disabled vendors change
  useEffect(() => {
    recalculateDiscretionaryBudget();
  }, [disabledVendors]);

  const updateEssentialAllocation = (categoryId: string, value: number) => {
    setBudget(prev => ({
      ...prev,
      essentials: {
        ...prev.essentials,
        [categoryId]: {
          ...prev.essentials[categoryId],
          allocated: value
        }
      }
    }));
  };

  const updateSpentAmount = (section: 'essentials' | 'discretionary', categoryId: string, value: number) => {
    setBudget(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [categoryId]: {
          ...prev[section][categoryId],
          spent: value
        }
      }
    }));
  };

  const exportBudget = () => {
    const data = {
      budget,
      disabledVendors,
      summary: {
        totalBudget: budget.totalBudget,
        essentialBudget: budget.totalBudget * 0.5,
        discretionaryBudget: budget.totalBudget * 0.5,
        totalSpent: getTotalSpent(),
        essentialSpent: getTotalEssentialSpent(),
        discretionarySpent: getTotalDiscretionarySpent(),
        customVendorsSpent: getTotalCustomVendorsSpent(),
        customVendorsCount: budget.customVendors.length,
        remaining: budget.totalBudget - getTotalSpent()
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding-budget.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetBudget = () => {
    if (window.confirm('Are you sure you want to reset all budget data? This cannot be undone.')) {
      localStorage.removeItem('wedding-budget-data-v2');
      setDisabledVendors([]);
      initializeBudget(budget.totalBudget, budget.guestCount);
    }
  };

  const getTotalEssentialSpent = () => {
    return Object.values(budget.essentials).reduce((total, item) => 
      total + item.spent, 0);
  };

  const getTotalDiscretionarySpent = () => {
    return Object.values(budget.discretionary).reduce((total, item) => 
      item.enabled ? total + item.spent : total, 0);
  };

  const getTotalCustomVendorsSpent = () => {
    return budget.customVendors.reduce((total, vendor) => 
      total + (vendor.spent || 0), 0);
  };
  
  // Get custom vendors for a specific category
  const getCategoryVendors = (categoryId: string) => {
    return budget.customVendors.filter(vendor => vendor.categoryId === categoryId);
  };
  
  // Category expansion functionality was removed
  
  // Handle adding a vendor to a category
  const handleAddVendorToCategory = async (name: string, allocated: number, categoryId: string) => {
    if (!user) return;
    
    const newVendor = await addCustomVendorToCategory(name, allocated, categoryId, user);
    
    if (newVendor) {
      setBudget(prev => ({
        ...prev,
        customVendors: [...prev.customVendors, newVendor]
      }));
    }
  };
  
  // Handle selecting a vendor from the vendor directory
  const handleSelectVendor = (vendorName: string, categoryId: string) => {
    // Default allocation is 10% of the category budget or 5% of total if no category budget
    let defaultAllocation = budget.totalBudget * 0.05;
    
    if (categoryId in budget.essentials) {
      defaultAllocation = budget.essentials[categoryId].allocated * 0.1;
    } else if (categoryId in budget.discretionary) {
      defaultAllocation = budget.discretionary[categoryId].allocated * 0.1;
    }
    
    handleAddVendorToCategory(vendorName, Math.round(defaultAllocation), categoryId);
  };

  const getTotalSpent = () => {
    return getTotalEssentialSpent() + getTotalDiscretionarySpent() + getTotalCustomVendorsSpent();
  };

  // Display loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto" style={{ color: '#054697' }} />
          <p className="mt-4 text-lg" style={{ color: '#054697', opacity: 0.8, fontFamily: "'Poppins', sans-serif" }}>Loading your budget data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      <div 
        className="bg-white p-6 space-y-6"
        style={{
          border: '1px solid rgba(5, 70, 151, 0.1)',
          boxShadow: '0 4px 20px rgba(5, 70, 151, 0.05)',
          borderRadius: '4px'
        }}
      >
        <div className="flex items-center justify-between">
          <h2 
            className="text-2xl font-semibold"
            style={{ 
              fontFamily: "'Giaza', serif", 
              color: '#054697',
              letterSpacing: '-0.05em'
            }}
          >
            Wedding Budget Calculator
          </h2>
          <div className="flex space-x-3">
            <button 
              onClick={exportBudget}
              className="inline-flex items-center px-3 py-2 text-sm"
              style={{
                backgroundColor: 'transparent',
                color: '#054697',
                border: '1px solid #E8B4B4',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                textTransform: 'uppercase'
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button 
              onClick={resetBudget}
              className="inline-flex items-center px-3 py-2 text-sm"
              style={{
                backgroundColor: 'transparent',
                color: '#054697',
                border: '1px solid #E8B4B4',
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                textTransform: 'uppercase'
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </button>
          </div>
        </div>
        
        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div 
            className="p-4"
            style={{
              border: '1px solid rgba(5, 70, 151, 0.1)',
              backgroundColor: 'rgba(5, 70, 151, 0.05)'
            }}
          >
            <div className="text-sm uppercase mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: '#054697', opacity: 0.8 }}>Total Budget</div>
            <div className="flex items-end">
              <input
                type="number"
                value={budget.totalBudget}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    initializeBudget(value, budget.guestCount);
                  }
                }}
                className="text-2xl font-bold bg-transparent border-b-2 w-full focus:outline-none"
                style={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  color: '#054697',
                  borderBottomColor: '#E8B4B4'
                }}
              />
            </div>
          </div>
          
          <div 
            className="p-4"
            style={{
              border: '1px solid rgba(5, 70, 151, 0.1)',
              backgroundColor: 'rgba(5, 70, 151, 0.05)'
            }}
          >
            <div className="text-sm uppercase mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: '#054697', opacity: 0.8 }}>Guest Count</div>
            <div className="flex items-end">
              <input
                type="number"
                value={budget.guestCount}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    setBudget(prev => ({...prev, guestCount: value}));
                  }
                }}
                className="text-2xl font-bold bg-transparent border-b-2 w-full focus:outline-none"
                style={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  color: '#054697',
                  borderBottomColor: '#E8B4B4'
                }}
              />
            </div>
            <div className="text-sm mt-1" style={{ fontFamily: 'Poppins, sans-serif', color: '#054697', opacity: 0.6 }}>
              ${Math.round(budget.totalBudget / budget.guestCount)} per guest
            </div>
          </div>
          
          <div 
            className="p-4"
            style={{
              border: '1px solid rgba(5, 70, 151, 0.1)',
              backgroundColor: 'rgba(5, 70, 151, 0.05)'
            }}
          >
            <div className="text-sm uppercase mb-1" style={{ fontFamily: 'Poppins, sans-serif', color: '#054697', opacity: 0.8 }}>Remaining</div>
            <div 
              className="text-2xl font-bold"
              style={{ 
                fontFamily: 'Poppins, sans-serif', 
                color: '#054697'
              }}
            >
              {formatCurrency(budget.totalBudget - getTotalSpent())}
            </div>
            <div className="w-full bg-gray-200 h-2 mt-2">
              <div 
                className="h-2" 
                style={{
                  width: `${(getTotalSpent() / budget.totalBudget) * 100}%`,
                  backgroundColor: '#E8B4B4'
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 
          className="text-xl font-semibold"
          style={{ 
            fontFamily: "'Giaza', serif", 
            color: '#054697',
            letterSpacing: '-0.05em'
          }}
        >
          Budget Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-rose-50 rounded-lg p-4">
            <div className="text-sm font-medium text-rose-600">Total Budget</div>
            <div className="mt-1 text-2xl font-bold text-rose-700">
              {formatCurrency(budget.totalBudget)}
            </div>
            <div className="text-sm text-rose-600">
              Per Guest: {formatCurrency(budget.totalBudget / budget.guestCount)}
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-600">Spent</div>
            <div className="mt-1 text-2xl font-bold text-blue-700">
              {formatCurrency(getTotalSpent())}
            </div>
            <div className="text-sm text-blue-600">
              {((getTotalSpent() / budget.totalBudget) * 100).toFixed(1)}% of budget
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-600">Remaining</div>
            <div className="mt-1 text-2xl font-bold text-purple-700">
              {formatCurrency(budget.totalBudget - getTotalSpent())}
            </div>
            <div className="text-sm text-purple-600">
              {(((budget.totalBudget - getTotalSpent()) / budget.totalBudget) * 100).toFixed(1)}% of budget
            </div>
          </div>
        </div>
      </div>

      {/* Essential Budget (First 50%) */}
      <div className="bg-white p-6 space-y-6" style={{ boxShadow: '0 4px 20px rgba(5, 70, 151, 0.05)', position: 'relative' }}>
        
        <div className="flex items-center justify-between">
          <h2 
            className="text-2xl font-semibold"
            style={{ 
              fontFamily: "'Giaza', serif", 
              color: '#054697',
              letterSpacing: '-0.05em'
            }}
          >
            Essential Budget
          </h2>
          <div className="text-lg font-medium" style={{ color: '#054697', fontFamily: 'Poppins, sans-serif' }}>
            {formatCurrency(budget.totalBudget * 0.5)} <span className="text-sm opacity-70">(50%)</span>
          </div>
        </div>
        
        <div className="space-y-6 mt-4">
          {essentialCategories.map((category) => {
            const categoryVendors = getCategoryVendors(category.id);

            
            return (
              <div 
                key={category.id} 
                className="border border-[#B8BDD7]/30 p-5 relative"
                style={{ 
                  boxShadow: '0 2px 10px rgba(5, 70, 151, 0.03)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    backgroundColor: '#054697'
                  }}
                ></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-[#E8B4B4]/30 text-[#054697]">
                      <category.icon className="h-5 w-5" />
                    </div>
                    <h3 
                      className="text-lg font-medium"
                      style={{ 
                        fontFamily: "'Giaza', serif", 
                        color: '#054697',
                        letterSpacing: '-0.05em'
                      }}
                    >
                      {category.name}
                    </h3>
                  </div>
                  <div 
                    className="text-lg font-semibold"
                    style={{ 
                      fontFamily: "'Giaza', serif", 
                      color: '#054697',
                      letterSpacing: '-0.05em'
                    }}
                  >
                    {formatCurrency(budget.essentials[category.id]?.allocated || 0)}
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label 
                      className="block text-sm font-medium"
                      style={{ 
                        fontFamily: 'Poppins, sans-serif', 
                        color: '#054697',
                        opacity: 0.8
                      }}
                    >
                      Allocated
                    </label>
                    <input
                      type="number"
                      value={budget.essentials[category.id]?.allocated || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 0) {
                          updateEssentialAllocation(category.id, value);
                        }
                      }}
                      className="mt-1 block w-full border-[#B8BDD7] shadow-sm focus:ring-[#054697] focus:border-[#054697]"
                      style={{ 
                        fontFamily: 'Poppins, sans-serif', 
                        color: '#054697'
                      }}
                    />
                  </div>
                  <div>
                    <label 
                      className="block text-sm font-medium"
                      style={{ 
                        fontFamily: 'Poppins, sans-serif', 
                        color: '#054697',
                        opacity: 0.8
                      }}
                    >
                      Spent
                    </label>
                    <input
                      type="number"
                      value={budget.essentials[category.id]?.spent || 0}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value) && value >= 0) {
                          updateSpentAmount('essentials', category.id, value);
                        }
                      }}
                      className="mt-1 block w-full border-[#B8BDD7] shadow-sm focus:ring-[#054697] focus:border-[#054697]"
                      style={{ 
                        fontFamily: 'Poppins, sans-serif', 
                        color: '#054697'
                      }}
                    />
                  </div>
                </div>
                
                <div 
                  className="text-sm mt-2"
                  style={{ 
                    fontFamily: 'Poppins, sans-serif', 
                    color: '#054697',
                    opacity: 0.6
                  }}
                >
                  {category.defaultPercentage}% of essential budget ({(category.defaultPercentage / 2).toFixed(1)}% of total)
                </div>
                
                {/* Vendor Selection Tools */}
                <div className="mt-3 pt-3 border-t border-[#B8BDD7]/30">
                  <div className="flex space-x-4">
                    <VendorSelector 
                      categoryId={category.id} 
                      onSelectVendor={handleSelectVendor} 
                    />
                    
                    <CategoryVendor 
                      categoryId={category.id} 
                      onAddVendor={handleAddVendorToCategory} 
                    />
                  </div>
                  
                  {/* Category Vendors */}
                  {categoryVendors.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 
                        className="text-sm font-medium"
                        style={{ 
                          fontFamily: 'Poppins, sans-serif', 
                          color: '#054697'
                        }}
                      >
                        Vendors for {category.name}
                      </h4>
                      
                      <div className="space-y-2">
                        {categoryVendors.map(vendor => (
                          <div 
                            key={vendor.id} 
                            className="p-3 bg-[#E8B4B4]/5 border border-[#E8B4B4]/20 flex justify-between items-center"
                          >
                            <div>
                              <div 
                                className="font-medium"
                                style={{ 
                                  fontFamily: 'Poppins, sans-serif', 
                                  color: '#054697'
                                }}
                              >
                                {vendor.name}
                              </div>
                              <div 
                                className="text-sm"
                                style={{ 
                                  fontFamily: 'Poppins, sans-serif', 
                                  color: '#054697',
                                  opacity: 0.7
                                }}
                              >
                                Allocated: {formatCurrency(vendor.allocated)} | 
                                Spent: {formatCurrency(vendor.spent)}
                              </div>
                            </div>
                            
                            <button
                              onClick={async () => {
                                if (!user) return;
                                
                                try {
                                  const supabase = getSupabase();
                                  // Remove from database first
                                  const { error } = await supabase
                                    .from('custom_vendors')
                                    .delete()
                                    .eq('id', vendor.id)
                                    .eq('user_id', user.id);
                                    
                                  if (error) {
                                    console.error('Error removing vendor:', error);
                                    return;
                                  }
                                  
                                  // Then update local state
                                  setBudget(prev => ({
                                    ...prev,
                                    customVendors: prev.customVendors.filter(v => v.id !== vendor.id)
                                  }));
                                } catch (error) {
                                  console.error('Error removing vendor:', error);
                                }
                              }}
                              className="text-xs px-2 py-1"
                              style={{ 
                                backgroundColor: '#FFE8E4', 
                                color: '#054697',
                                fontFamily: 'Poppins, sans-serif',
                                fontWeight: 400,
                                textTransform: 'uppercase'
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discretionary Budget (Remaining 50%) */}
      <div className="bg-white p-6 space-y-6" style={{ 
          boxShadow: '0 4px 20px rgba(5, 70, 151, 0.05)', 
          borderRadius: '4px',
          border: '1px solid rgba(5, 70, 151, 0.1)'
        }}>
        
        <div className="flex items-center justify-between">
          <h2 
            className="text-2xl font-semibold"
            style={{ 
              fontFamily: "'Giaza', serif", 
              color: '#054697',
              letterSpacing: '-0.05em'
            }}
          >
            Discretionary Budget
          </h2>
          <div className="text-lg font-medium" style={{ color: '#054697', fontFamily: 'Poppins, sans-serif' }}>
            {formatCurrency(budget.totalBudget * 0.5)} <span className="text-sm opacity-70">(50%)</span>
          </div>
        </div>
        
        <div className="space-y-6 mt-4">
          {budgetCategories.map((category) => {
            const isEnabled = budget.discretionary[category.id]?.enabled !== false;
            const categoryVendors = getCategoryVendors(category.id);

            
            return (
              <div 
                key={category.id} 
                className={`border border-[#B8BDD7]/30 p-5 relative ${!isEnabled ? 'opacity-50 bg-[#F9F9FF]' : ''}`}
                style={{ 
                  boxShadow: '0 2px 10px rgba(5, 70, 151, 0.03)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '4px',
                    height: '100%',
                    backgroundColor: '#054697'
                  }}
                ></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleVendor(category.id)}
                      className="flex items-center justify-center w-8 h-8 border border-[#E8B4B4]"
                      title={isEnabled ? "Click to exclude this vendor" : "Click to include this vendor"}
                      style={{ 
                        backgroundColor: isEnabled ? '#E8B4B4' : 'transparent',
                        color: '#054697'
                      }}
                    >
                      {isEnabled ? (
                        <Check className="h-4 w-4 text-[#054697]" />
                      ) : (
                        <X className="h-4 w-4 text-[#054697]" />
                      )}
                    </button>
                    <div className="w-10 h-10 flex items-center justify-center bg-[#E8B4B4]/30 text-[#054697]">
                      <category.icon className="h-5 w-5" />
                    </div>
                    <h3 
                      className="text-lg font-medium"
                      style={{ 
                        fontFamily: "'Giaza', serif", 
                        color: '#054697',
                        letterSpacing: '-0.05em'
                      }}
                    >
                      {category.name}
                    </h3>
                  </div>
                  {isEnabled && (
                    <div 
                      className="text-lg font-semibold"
                      style={{ 
                        fontFamily: "'Giaza', serif", 
                        color: '#054697',
                        letterSpacing: '-0.05em'
                      }}
                    >
                      {formatCurrency(budget.discretionary[category.id]?.allocated || 0)}
                    </div>
                  )}
                </div>
                
                {isEnabled && (
                  <>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label 
                          className="block text-sm font-medium"
                          style={{ 
                            fontFamily: 'Poppins, sans-serif', 
                            color: '#054697',
                            opacity: 0.8
                          }}
                        >
                          Allocated
                        </label>
                        <input
                          type="number"
                          value={budget.discretionary[category.id]?.allocated || 0}
                          disabled={true} // Automatically calculated based on percentages
                          className="mt-1 block w-full border-[#B8BDD7] bg-[#F9F9FF] shadow-sm"
                          style={{ 
                            fontFamily: 'Poppins, sans-serif', 
                            color: '#054697'
                          }}
                        />
                      </div>
                      <div>
                        <label 
                          className="block text-sm font-medium"
                          style={{ 
                            fontFamily: 'Poppins, sans-serif', 
                            color: '#054697',
                            opacity: 0.8
                          }}
                        >
                          Spent
                        </label>
                        <input
                          type="number"
                          value={budget.discretionary[category.id]?.spent || 0}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 0) {
                              updateSpentAmount('discretionary', category.id, value);
                            }
                          }}
                          className="mt-1 block w-full border-[#B8BDD7] shadow-sm focus:ring-[#054697] focus:border-[#054697]"
                          style={{ 
                            fontFamily: 'Poppins, sans-serif', 
                            color: '#054697'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div 
                      className="text-sm mt-2"
                      style={{ 
                        fontFamily: 'Poppins, sans-serif', 
                        color: '#054697',
                        opacity: 0.6
                      }}
                    >
                      {category.defaultPercentage}% of discretionary budget ({(category.defaultPercentage / 2).toFixed(1)}% of total)
                    </div>
                    
                    {/* Vendor Selection Tools */}
                    <div className="mt-3 pt-3 border-t border-[#B8BDD7]/30">
                      <div className="flex space-x-4">
                        <VendorSelector 
                          categoryId={category.id} 
                          onSelectVendor={handleSelectVendor} 
                        />
                        
                        <CategoryVendor 
                          categoryId={category.id} 
                          onAddVendor={handleAddVendorToCategory} 
                        />
                      </div>
                      
                      {/* Category Vendors */}
                      {categoryVendors.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <h4 
                            className="text-sm font-medium"
                            style={{ 
                              fontFamily: 'Poppins, sans-serif', 
                              color: '#054697'
                            }}
                          >
                            Vendors for {category.name}
                          </h4>
                          
                          <div className="space-y-2">
                            {categoryVendors.map(vendor => (
                              <div 
                                key={vendor.id} 
                                className="p-3 bg-[#E8B4B4]/5 border border-[#E8B4B4]/20 flex justify-between items-center"
                              >
                                <div>
                                  <div 
                                    className="font-medium"
                                    style={{ 
                                      fontFamily: 'Poppins, sans-serif', 
                                      color: '#054697'
                                    }}
                                  >
                                    {vendor.name}
                                  </div>
                                  <div 
                                    className="text-sm"
                                    style={{ 
                                      fontFamily: 'Poppins, sans-serif', 
                                      color: '#054697',
                                      opacity: 0.7
                                    }}
                                  >
                                    Allocated: {formatCurrency(vendor.allocated)} | 
                                    Spent: {formatCurrency(vendor.spent)}
                                  </div>
                                </div>
                                
                                <button
                                  onClick={async () => {
                                    if (!user) return;
                                    
                                    try {
                                      // Remove from database first
                                      const { error } = await supabase
                                        .from('custom_vendors')
                                        .delete()
                                        .eq('id', vendor.id)
                                        .eq('user_id', user.id);
                                        
                                      if (error) {
                                        console.error('Error removing vendor:', error);
                                        return;
                                      }
                                      
                                      // Then update local state
                                      setBudget(prev => ({
                                        ...prev,
                                        customVendors: prev.customVendors.filter(v => v.id !== vendor.id)
                                      }));
                                    } catch (error) {
                                      console.error('Error removing vendor:', error);
                                    }
                                  }}
                                  className="text-xs px-2 py-1"
                                  style={{ 
                                    backgroundColor: '#FFE8E4', 
                                    color: '#054697',
                                    fontFamily: 'Poppins, sans-serif',
                                    fontWeight: 400,
                                    textTransform: 'uppercase'
                                  }}
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
          
          {/* Show all uncategorized vendors */}
          {budget.customVendors.filter(vendor => !vendor.categoryId).length > 0 && (
            <div className="mt-8 p-5 border-t border-[#B8BDD7]/30">
              <h3 
                className="text-lg font-medium mb-4"
                style={{ 
                  fontFamily: "'Giaza', serif", 
                  color: '#054697',
                  letterSpacing: '-0.05em'
                }}
              >
                Uncategorized Vendors
              </h3>
              
              <div className="space-y-3">
                {budget.customVendors.filter(vendor => !vendor.categoryId).map(vendor => (
                  <div 
                    key={vendor.id} 
                    className="p-3 bg-[#E8B4B4]/5 border border-[#E8B4B4]/20 flex justify-between items-center"
                  >
                    <div>
                      <div 
                        className="font-medium"
                        style={{ 
                          fontFamily: 'Poppins, sans-serif', 
                          color: '#054697'
                        }}
                      >
                        {vendor.name}
                      </div>
                      <div 
                        className="text-sm"
                        style={{ 
                          fontFamily: 'Poppins, sans-serif', 
                          color: '#054697',
                          opacity: 0.7
                        }}
                      >
                        Allocated: {formatCurrency(vendor.allocated)} | 
                        Spent: {formatCurrency(vendor.spent)}
                      </div>
                    </div>
                    
                    <button
                      onClick={async () => {
                        if (!user) return;
                        
                        try {
                          // Remove from database first
                          const supabaseClient = getSupabase();
                          const { error } = await supabaseClient
                            .from('custom_vendors')
                            .delete()
                            .eq('id', vendor.id)
                            .eq('user_id', user.id);
                            
                          if (error) {
                            console.error('Error removing vendor:', error);
                            return;
                          }
                          
                          // Then update local state
                          setBudget(prev => ({
                            ...prev,
                            customVendors: prev.customVendors.filter(v => v.id !== vendor.id)
                          }));
                        } catch (error) {
                          console.error('Error removing vendor:', error);
                        }
                      }}
                      className="text-xs px-2 py-1"
                      style={{ 
                        backgroundColor: '#FFE8E4', 
                        color: '#054697',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 400,
                        textTransform: 'uppercase'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
