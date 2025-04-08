import { useState, useEffect } from 'react';
import { Download, RefreshCw, X, Check } from 'lucide-react';
import { essentialCategories, budgetCategories } from '../data/budgetCategories';

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
      <div 
        className="bg-white p-6 space-y-6"
        style={{
          border: '1px solid rgba(5, 70, 151, 0.1)',
          boxShadow: '0 4px 20px rgba(5, 70, 151, 0.05)',
          position: 'relative'
        }}
      >
        <div 
          style={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '4px',
            height: '100%',
            backgroundColor: '#054697'
          }}
        ></div>
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
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h2 
          className="text-xl font-semibold"
          style={{ 
            fontFamily: "'Giaza', serif", 
            color: '#054697',
            letterSpacing: '-0.05em'
          }}
        >
          Essential Budget (50% - {formatCurrency(budget.totalBudget * 0.5)})
        </h2>
        
        <div className="space-y-4">
          {essentialCategories.map((category) => (
            <div key={category.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <category.icon className="h-5 w-5 text-gray-400" />
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500"
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
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500"
                    style={{ 
                      fontFamily: 'Poppins, sans-serif', 
                      color: '#054697'
                    }}
                  />
                </div>
              </div>
              
              <div 
                className="text-sm"
                style={{ 
                  fontFamily: 'Poppins, sans-serif', 
                  color: '#054697',
                  opacity: 0.6
                }}
              >
                {category.defaultPercentage}% of essential budget ({(category.defaultPercentage / 2).toFixed(1)}% of total)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Discretionary Budget (Remaining 50%) */}
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <h2 
          className="text-xl font-semibold"
          style={{ 
            fontFamily: "'Giaza', serif", 
            color: '#054697',
            letterSpacing: '-0.05em'
          }}
        >
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
                      style={{ 
                        backgroundColor: 'transparent',
                        color: '#054697',
                        border: '1px solid #E8B4B4',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: 400,
                        textTransform: 'uppercase'
                      }}
                    >
                      {isEnabled ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </button>
                    <category.icon className="h-5 w-5 text-gray-400" />
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
                          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm"
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
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-rose-500 focus:border-rose-500"
                          style={{ 
                            fontFamily: 'Poppins, sans-serif', 
                            color: '#054697'
                          }}
                        />
                      </div>
                    </div>
                    
                    <div 
                      className="text-sm"
                      style={{ 
                        fontFamily: 'Poppins, sans-serif', 
                        color: '#054697',
                        opacity: 0.6
                      }}
                    >
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
