"use client"

import React from 'react';
import { Lightbulb, ArrowRight } from "lucide-react";
import CollapsibleCard from '@/components/CollapsibleCard';
import { useRouter } from 'next/navigation';

interface PromptData {
  text: string;
  explanation: string;
}

const DailyPrompt = ({ prompt }: { prompt: PromptData }) => {
  const router = useRouter();

  const handleNewEntry = () => {
    router.push('/user/journal-entry');
  };

  return (
    <CollapsibleCard 
      title="Today's Writing Prompt" 
      icon={<Lightbulb className="h-5 w-5" />}
      defaultOpen={true}
    >
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 rounded-lg">
        <p className="text-md font-medium">{prompt.text}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {prompt.explanation}
        </p>
        <div className="flex justify-end mt-4">
          <button 
            onClick={handleNewEntry}
            className="text-primary flex items-center text-sm font-medium hover:underline"
          >
            Start writing
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </div>
    </CollapsibleCard>
  );
};

export default DailyPrompt;