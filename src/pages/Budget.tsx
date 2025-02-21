import { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { budgetCategories } from '../data/budgetCategories';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

interface Expense {
  allocated: number;
  spent: number;
}

interface CategoryExpenses {
  [key: string]: Expense;
}

interface AllExpenses {
  [key: string]: CategoryExpenses;
}

export default function Budget() {
  const [totalBudget, setTotalBudget] = useState(50000);
  const [expenses, setExpenses] = useState<AllExpenses>({});
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    const savedData = localStorage.getItem('wedding-budget-data');
    if (savedData) {
      const data = JSON.parse(savedData);
      setTotalBudget(data.totalBudget);
      setExpenses(data.expenses);
    } else {
      initializeBudget(50000);
    }
  }, []);

  useEffect(() => {
    const data = { totalBudget, expenses };
    localStorage.setItem('wedding-budget-data', JSON.stringify(data));
  }, [totalBudget, expenses]);

  const initializeBudget = (amount: number) => {
    const newExpenses: AllExpenses = {};
    budgetCategories.forEach(category => {
      newExpenses[category.id] = {};
      const categoryAmount = amount * (category.defaultPercentage / 100);
      
      category.items.forEach(item => {
        newExpenses[category.id][item.id] = {
          allocated: categoryAmount * (item.defaultPercentage / 100),
          spent: 0
        };
      });
    });
    setExpenses(newExpenses);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const updateExpense = (categoryId: string, itemId: string, field: keyof Expense, value: number) => {
    setExpenses(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [itemId]: {
          ...prev[categoryId][itemId],
          [field]: value
        }
      }
    }));
  };

  const getTotalAllocated = () => {
    return Object.values(expenses).reduce((total, category) => 
      total + Object.values(category).reduce((catTotal, item) => 
        catTotal + item.allocated, 0), 0);
  };

  const getTotalSpent = () => {
    return Object.values(expenses).reduce((total, category) => 
      total + Object.values(category).reduce((catTotal, item) => 
        catTotal + item.spent, 0), 0);
  };

  const exportBudget = () => {
    const data = {
      totalBudget,
      expenses,
      summary: {
        totalAllocated: getTotalAllocated(),
        totalSpent: getTotalSpent(),
        remaining: totalBudget - getTotalSpent()
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
      localStorage.removeItem('wedding-budget-data');
      initializeBudget(totalBudget);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">Wedding Budget</h2>
          <div className="flex space-x-3">
            <button
              onClick={resetBudget}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={exportBudget}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-md hover:bg-rose-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
            Total Budget
          </label>
          <input
            type="number"
            id="budget"
            value={totalBudget}
            onChange={(e) => setTotalBudget(Number(e.target.value))}
            className="mt-1 block w-full px-4 py-3 text-2xl font-bold text-gray-900 border-2 border-gray-200 rounded-lg focus:ring-rose-500 focus:border-rose-500"
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-emerald-50 rounded-lg p-4">
            <div className="text-sm font-medium text-emerald-600">Allocated</div>
            <div className="mt-1 text-2xl font-bold text-emerald-700">
              {formatCurrency(getTotalAllocated())}
            </div>
            <div className="text-sm text-emerald-600">
              {((getTotalAllocated() / totalBudget) * 100).toFixed(1)}% of budget
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-600">Spent</div>
            <div className="mt-1 text-2xl font-bold text-blue-700">
              {formatCurrency(getTotalSpent())}
            </div>
            <div className="text-sm text-blue-600">
              {((getTotalSpent() / totalBudget) * 100).toFixed(1)}% of budget
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-sm font-medium text-purple-600">Remaining</div>
            <div className="mt-1 text-2xl font-bold text-purple-700">
              {formatCurrency(totalBudget - getTotalSpent())}
            </div>
            <div className="text-sm text-purple-600">
              {(((totalBudget - getTotalSpent()) / totalBudget) * 100).toFixed(1)}% of budget
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {budgetCategories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                <category.icon className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-500">
                  {formatCurrency(
                    Object.values(expenses[category.id] || {}).reduce(
                      (total, item) => total + item.spent,
                      0
                    )
                  )}
                  {' / '}
                  {formatCurrency(
                    Object.values(expenses[category.id] || {}).reduce(
                      (total, item) => total + item.allocated,
                      0
                    )
                  )}
                </span>
              </div>
            </button>

            {expandedCategories.includes(category.id) && (
              <div className="px-6 pb-4">
                <div className="space-y-4">
                  {category.items.map((item) => (
                    <div key={item.id} className="grid grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {item.name}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={expenses[category.id]?.[item.id]?.allocated || 0}
                        onChange={(e) =>
                          updateExpense(category.id, item.id, 'allocated', Number(e.target.value))
                        }
                        className="px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Allocated"
                      />
                      <input
                        type="number"
                        value={expenses[category.id]?.[item.id]?.spent || 0}
                        onChange={(e) =>
                          updateExpense(category.id, item.id, 'spent', Number(e.target.value))
                        }
                        className="px-3 py-2 text-gray-900 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                        placeholder="Spent"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
