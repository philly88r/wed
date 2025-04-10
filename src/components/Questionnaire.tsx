import React, { useState } from 'react';
import { getSupabase } from '../supabaseClient';

interface QuestionnaireProps {
  onComplete: (answers: Record<string, string>) => void;
}

const questions = [
  { id: 'full_name', label: 'Name:', placeholder: 'Enter your name' },
  { id: 'partner_name', label: "Partner's Name:", placeholder: "Enter your partner's name" },
  { id: 'wedding_date', label: 'Wedding date:', type: 'date' },
  { id: 'wedding_location', label: 'Wedding venue, city or state:', placeholder: 'Enter wedding location' },
  { id: 'guest_count', label: 'Estimated guest count:', type: 'number', placeholder: 'Enter estimated number of guests' },
  { id: 'budget', label: 'Estimated wedding budget:', type: 'number', placeholder: 'Enter estimated budget' },
];

export const Questionnaire: React.FC<QuestionnaireProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnswer = async (value: string) => {
    const newAnswers = {
      ...answers,
      [questions[currentQuestion].id]: value
    };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      try {
        const supabaseClient = getSupabase();
        const {
          data: { user },
          error: authError,
        } = await supabaseClient.auth.getUser();

        if (authError) throw authError;
        if (!user) throw new Error('No user found');

        // Convert string values to appropriate types
        const profileData = {
          full_name: newAnswers.full_name,
          partner_name: newAnswers.partner_name,
          wedding_date: newAnswers.wedding_date,
          wedding_location: newAnswers.wedding_location,
          guest_count: parseInt(newAnswers.guest_count),
          budget: parseFloat(newAnswers.budget),
          onboarding_completed: true
        };

        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update(profileData)
          .eq('id', user.id);

        if (updateError) throw updateError;

        setIsComplete(true);
        onComplete(newAnswers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error saving questionnaire answers:', err);
      }
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-white rounded-lg shadow-lg">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={() => setError(null)}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-emerald-600 mb-6">Thank you!</h2>
        <p className="text-xl text-gray-700 mb-8">Let's go!</p>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-white rounded-lg shadow-lg">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            <span className="text-sm text-gray-500">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <label className="block text-xl font-medium text-gray-700 mb-4">
          {currentQ.label}
        </label>
        
        <input
          type={currentQ.type || 'text'}
          placeholder={currentQ.placeholder}
          className="w-full px-4 py-2 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          onChange={(e) => handleAnswer(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.currentTarget.value) {
              handleAnswer(e.currentTarget.value);
            }
          }}
          autoFocus
        />
      </div>
    </div>
  );
};

export default Questionnaire;
