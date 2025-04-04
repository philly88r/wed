import { useState, useEffect } from 'react';
import { Download, RefreshCw, X, Check, Info } from 'lucide-react';
import { essentialCategories, budgetCategories, allCategories } from '../data/budgetCategories';

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
}

export default function Budget() {
  const [budget, setBudget] = useState<BudgetState>({
    totalBudget: 100000,
    guestCount: 100,
    essentials: {},
    discretionary: {}
  });
  
  // Track which vendors are enabled/disabled
  const [disabledVendors, setDisabledVendors] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('wedding-budget-data-v2');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        setBudget(data.budget);
        setDisabledVendors(data.disabledVendors || []);
      } catch (e) {
        // If there's an error parsing the saved data, initialize with defaults
        initializeBudget(100000, 100);
      }
    } else {
      initializeBudget(100000, 100);
    }
  }, []);

  useEffect(() => {
    const data = { 
      budget,
      disabledVendors
    };
    localStorage.setItem('wedding-budget-data-v2', JSON.stringify(data));
  }, [budget, disabledVendors]);

  const initializeBudget = (amount: number, guests: number) => {
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
    
    setBudget({
      totalBudget: amount,
      guestCount: guests,
      essentials,
      discretionary
    });
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

  const getTotalEssentialAllocated = () => {
    return Object.values(budget.essentials).reduce((total, item) => 
      total + item.allocated, 0);
  };

  const getTotalDiscretionaryAllocated = () => {
    return Object.values(budget.discretionary).reduce((total, item) => 
      item.enabled ? total + item.allocated : total, 0);
  };

  const getTotalEssentialSpent = () => {
    return Object.values(budget.essentials).reduce((total, item) => 
      total + item.spent, 0);
  };

  const getTotalDiscretionarySpent = () => {
    return Object.values(budget.discretionary).reduce((total, item) => 
      item.enabled ? total + item.spent : total, 0);
  };

  const getTotalSpent = () => {
    return getTotalEssentialSpent() + getTotalDiscretionarySpent();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-8">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Wedding Budget Calculator</h2>
          <div className="flex space-x-3">
            <button
              onClick={resetBudget}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </button>
            <button
              onClick={exportBudget}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-md hover:bg-rose-700"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Total Budget
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                value={budget.totalBudget}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value > 0) {
                    initializeBudget(value, budget.guestCount);
                  }
                }}
                className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Number of Guests
            </label>
            <input
              type="number"
              value={budget.guestCount}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value > 0) {
                  setBudget(prev => ({...prev, guestCount: value}));
                }
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
        </div>
      </div>

      {/* Budget Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Budget Summary</h2>
        
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
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Essential Budget (50% - {formatCurrency(budget.totalBudget * 0.5)})
        </h2>
        
        <div className="space-y-4">
          {essentialCategories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <category.icon className="h-5 w-5 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                </div>
                <div className="text-lg font-semibold">
                  {formatCurrency(budget.essentials[category.id]?.allocated || 0)}
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500"
                  />
                </div>
              </div>
              
              <div className="mt-2 text-sm text-gray-500">
                {category.defaultPercentage}% of essential budget ({(category.defaultPercentage / 2).toFixed(1)}% of total)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discretionary Budget (Remaining 50%) */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Discretionary Budget (50% - {formatCurrency(budget.totalBudget * 0.5)})
        </h2>
        
        <div className="space-y-4">
          {budgetCategories.map((category) => {
            const isEnabled = budget.discretionary[category.id]?.enabled !== false;
            return (
              <div 
                key={category.id} 
                className={`border rounded-lg p-4 ${!isEnabled ? 'opacity-50 bg-gray-50' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleVendor(category.id)}
                      className={`flex items-center justify-center w-6 h-6 rounded-full border ${isEnabled ? 'border-green-500' : 'border-red-500'}`}
                      title={isEnabled ? "Click to exclude this vendor" : "Click to include this vendor"}
                    >
                      {isEnabled ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </button>
                    <category.icon className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                  </div>
                  {isEnabled && (
                    <div className="text-lg font-semibold">
                      {formatCurrency(budget.discretionary[category.id]?.allocated || 0)}
                    </div>
                  )}
                </div>
                
                {isEnabled && (
                  <>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Allocated
                        </label>
                        <input
                          type="number"
                          value={budget.discretionary[category.id]?.allocated || 0}
                          disabled={true} // Automatically calculated based on percentages
                          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500"
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm text-gray-500">
                      {category.defaultPercentage}% of discretionary budget ({(category.defaultPercentage / 2).toFixed(1)}% of total)
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
