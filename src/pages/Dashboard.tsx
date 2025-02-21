// @ts-nocheck
import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  CheckSquare,
  Heart,
  DollarSign,
  Truck,
  CalendarClock,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CommentSystem from '../components/Comments/CommentSystem';

interface DashboardData {
  weddingDate?: string;
  totalBudget: number;
  spentBudget: number;
  totalGuests: number;
  confirmedGuests: number;
  declinedGuests: number;
  pendingGuests: number;
  completedTasks: number;
  totalTasks: number;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    type: string;
  }>;
  upcomingTasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: string;
  }>;
  recentVendors: Array<{
    id: string;
    name: string;
    category: string;
    status: string;
  }>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData>({
    totalBudget: 0,
    spentBudget: 0,
    totalGuests: 0,
    confirmedGuests: 0,
    declinedGuests: 0,
    pendingGuests: 0,
    completedTasks: 0,
    totalTasks: 0,
    upcomingEvents: [],
    upcomingTasks: [],
    recentVendors: []
  });

  useEffect(() => {
    // Load wedding date
    const savedDate = localStorage.getItem('wedding-date');
    
    // Load budget data
    const budgetData = localStorage.getItem('wedding-budget');
    const budget = budgetData ? JSON.parse(budgetData) : [];
    const totalBudget = budget.reduce((sum: number, item: any) => sum + (item.budget || 0), 0);
    const spentBudget = budget.reduce((sum: number, item: any) => sum + (item.spent || 0), 0);

    // Load guest data
    const guestData = localStorage.getItem('wedding-guests');
    const guests = guestData ? JSON.parse(guestData) : [];
    const confirmedGuests = guests.filter((g: any) => g.status === 'confirmed').length;
    const declinedGuests = guests.filter((g: any) => g.status === 'declined').length;
    const pendingGuests = guests.filter((g: any) => g.status === 'invited').length;

    // Load task data
    const taskData = localStorage.getItem('wedding-checklist');
    const tasks = taskData ? JSON.parse(taskData) : [];
    const completedTasks = tasks.filter((t: any) => t.completed).length;

    // Load event data
    const eventData = localStorage.getItem('wedding-events');
    const events = eventData ? JSON.parse(eventData) : [];
    const upcomingEvents = events
      .filter((e: any) => new Date(e.date) > new Date())
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3);

    // Load vendor data
    const vendorData = localStorage.getItem('wedding-vendors');
    const vendors = vendorData ? JSON.parse(vendorData) : [];
    const recentVendors = vendors
      .sort((a: any, b: any) => b.id - a.id)
      .slice(0, 3);

    // Get upcoming tasks
    const upcomingTasks = tasks
      .filter((t: any) => !t.completed && t.dueDate)
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);

    setData({
      weddingDate: savedDate || undefined,
      totalBudget,
      spentBudget,
      totalGuests: guests.length,
      confirmedGuests,
      declinedGuests,
      pendingGuests,
      completedTasks,
      totalTasks: tasks.length,
      upcomingEvents,
      upcomingTasks,
      recentVendors
    });
  }, []);

  const getDaysUntilWedding = () => {
    if (!data.weddingDate) return null;
    const today = new Date();
    const wedding = new Date(data.weddingDate);
    const diffTime = wedding.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilWedding = getDaysUntilWedding();

  const sections = [
    {
      id: 'budget',
      title: 'Budget',
      content: (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Budget</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                ${data.spentBudget.toLocaleString()}
                <span className="text-sm font-normal text-gray-500">
                  /${data.totalBudget.toLocaleString()}
                </span>
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-rose-600" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-rose-600 h-2 rounded-full"
                style={{
                  width: `${
                    data.totalBudget
                      ? (data.spentBudget / data.totalBudget) * 100
                      : 0
                  }%`
                }}
              />
            </div>
          </div>
          <CommentSystem section="budget" title="Budget Comments" />
        </div>
      ),
    },
    {
      id: 'guest-list',
      title: 'Guest List',
      content: (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Guest List</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {data.confirmedGuests}
                <span className="text-sm font-normal text-gray-500">
                  /{data.totalGuests} confirmed
                </span>
              </p>
            </div>
            <Users className="w-8 h-8 text-rose-600" />
          </div>
          <div className="mt-4 flex space-x-4 text-sm">
            <span className="text-emerald-600">{data.confirmedGuests} confirmed</span>
            <span className="text-rose-600">{data.declinedGuests} declined</span>
            <span className="text-amber-600">{data.pendingGuests} pending</span>
          </div>
          <CommentSystem section="guest-list" title="Guest List Comments" />
        </div>
      ),
    },
    {
      id: 'tasks',
      title: 'Tasks',
      content: (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Tasks</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {data.completedTasks}
                <span className="text-sm font-normal text-gray-500">
                  /{data.totalTasks} completed
                </span>
              </p>
            </div>
            <CheckSquare className="w-8 h-8 text-rose-600" />
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-rose-600 h-2 rounded-full"
                style={{
                  width: `${
                    data.totalTasks
                      ? (data.completedTasks / data.totalTasks) * 100
                      : 0
                  }%`
                }}
              />
            </div>
          </div>
          <CommentSystem section="tasks" title="Task Comments" />
        </div>
      ),
    },
    {
      id: 'vendors',
      title: 'Vendors',
      content: (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Vendors</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">
                {data.recentVendors.length} recent updates
              </p>
            </div>
            <Truck className="w-8 h-8 text-rose-600" />
          </div>
          <div className="mt-4 text-sm text-gray-500">
            {data.recentVendors.length > 0
              ? `Last updated ${new Date(
                  Math.max(
                    ...data.recentVendors.map(v =>
                      parseInt(v.id)
                    )
                  )
                ).toLocaleDateString()}`
              : 'No vendors added yet'}
          </div>
          <CommentSystem section="vendors" title="Vendor Comments" />
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Wedding Countdown */}
      <div className="bg-rose-600 text-white rounded-xl shadow-sm p-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Wedding Dashboard</h1>
            {data.weddingDate ? (
              <>
                <p className="mt-2 text-rose-100">
                  Your wedding date is set for{' '}
                  {new Date(data.weddingDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                {daysUntilWedding && daysUntilWedding > 0 && (
                  <p className="mt-4 text-2xl font-semibold">
                    {daysUntilWedding} days until your wedding!
                  </p>
                )}
              </>
            ) : (
              <p className="mt-2 text-rose-100">
                Welcome to your wedding planning dashboard
              </p>
            )}
          </div>
          <Calendar className="w-16 h-16 text-rose-100" />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {sections.map((section) => (
          <div key={section.id}>{section.content}</div>
        ))}
      </div>

      {/* Upcoming Events & Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <Link
              to="/events"
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {data.upcomingEvents.map(event => (
              <div
                key={event.id}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <CalendarClock className="w-6 h-6 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {event.type}
                  </span>
                </div>
              </div>
            ))}
            {data.upcomingEvents.length === 0 && (
              <div className="text-center py-4">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No upcoming events
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add your first event to get started.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
            <Link
              to="/checklist"
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {data.upcomingTasks.map(task => (
              <div
                key={task.id}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{task.title}</p>
                  <p className="text-sm text-gray-500">
                    Due {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
            {data.upcomingTasks.length === 0 && (
              <div className="text-center py-4">
                <CheckSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No upcoming tasks
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add tasks to your checklist to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          to="/budget"
          className="bg-white rounded-xl shadow-sm p-6 hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-rose-600 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Budget</h3>
                <p className="text-sm text-gray-500">
                  Track expenses and manage your budget
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>

        <Link
          to="/vendors"
          className="bg-white rounded-xl shadow-sm p-6 hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Truck className="w-8 h-8 text-rose-600 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Vendors</h3>
                <p className="text-sm text-gray-500">
                  Manage your wedding vendors
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>

        <Link
          to="/vision-board"
          className="bg-white rounded-xl shadow-sm p-6 hover:bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-rose-600 mr-4" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Vision Board</h3>
                <p className="text-sm text-gray-500">
                  Collect and organize inspiration
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </Link>
      </div>

      {/* Overall Comments Section */}
      <div className="mt-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Overall Wedding Planning Notes</h2>
          </div>
          <div className="text-sm text-gray-500 mb-2">
            Use this section for general notes, ideas, and discussions about the overall wedding planning.
          </div>
          <CommentSystem 
            section="overall" 
            title="General Planning Discussion"
          />
        </div>
      </div>
    </div>
  );
}
