"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BetTemplate {
  id: string;
  title: string;
  description?: string;
  category?: string;
}

interface Step1GoalProps {
  value: {
    goal: string;
    description: string;
    templateId?: string;
  };
  onChange: (value: { goal: string; description: string; templateId?: string }) => void;
  templates?: BetTemplate[];
}

export function Step1Goal({ value, onChange, templates = [] }: Step1GoalProps) {
  const [isCustom, setIsCustom] = useState(!value.templateId);
  const [goal, setGoal] = useState(value.goal || "");
  const [description, setDescription] = useState(value.description || "");

  const mockTemplates: BetTemplate[] = templates.length > 0 ? templates : [
    { id: "1", title: "Run a Marathon", description: "Complete a 26.2 mile run", category: "fitness" },
    { id: "2", title: "Lose 20 Pounds", description: "Reach your target weight goal", category: "health" },
    { id: "3", title: "Quit Smoking", description: "Stop smoking completely", category: "health" },
    { id: "4", title: "Read 24 Books", description: "Read one book every two weeks", category: "productivity" },
    { id: "5", title: "Learn a New Language", description: "Become conversational in a new language", category: "productivity" },
    { id: "6", title: "Meditate Daily", description: "Meditate for at least 10 minutes every day", category: "wellness" },
  ];

  const popularTemplates = mockTemplates.filter((t) => t.category === "fitness" || t.category === "health");

  const handleTemplateSelect = (template: BetTemplate) => {
    setGoal(template.title);
    setDescription(template.description || "");
    setIsCustom(false);
    onChange({ goal: template.title, description: template.description || "", templateId: template.id });
  };

  const handleCustomToggle = () => {
    setIsCustom(true);
    setGoal("");
    setDescription("");
    onChange({ goal: "", description: "" });
  };

  const handleGoalChange = (newGoal: string) => {
    setGoal(newGoal);
    onChange({ goal: newGoal, description, templateId: isCustom ? undefined : value.templateId });
  };

  const handleDescriptionChange = (newDescription: string) => {
    setDescription(newDescription);
    onChange({ goal, description: newDescription, templateId: isCustom ? undefined : value.templateId });
  };

  const isValid = goal.trim().length >= 10;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">What's Your Goal?</h2>
        <p className="text-muted-foreground">
          Choose a template or create your own bet goal
        </p>
      </div>

      {!isCustom ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Popular Templates
            </h3>
            <Button variant="ghost" size="sm" onClick={handleCustomToggle}>
              <Edit3 className="h-4 w-4 mr-2" />
              Custom Goal
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {mockTemplates.map((template) => (
              <Card
                key={template.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md hover:border-primary",
                  value.templateId === template.id && "border-primary border-2 shadow-md"
                )}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  {template.description && (
                    <CardDescription>{template.description}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>

          {value.goal && (
            <Card className="border-primary border-2">
              <CardHeader>
                <CardTitle>Selected Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-semibold mb-2">{goal}</p>
                {description && <p className="text-sm text-muted-foreground">{description}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Edit3 className="h-5 w-5" />
              Custom Goal
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setIsCustom(false)}>
              <Sparkles className="h-4 w-4 mr-2" />
              Browse Templates
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Enter Your Goal</CardTitle>
              <CardDescription>
                Be specific about what you want to achieve
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="goal" className="text-sm font-medium mb-2 block">
                  Goal Title *
                </label>
                <Input
                  id="goal"
                  placeholder="e.g., I will run a marathon this year"
                  value={goal}
                  onChange={(e) => handleGoalChange(e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {goal.length}/10 minimum characters
                </p>
              </div>

              <div>
                <label htmlFor="description" className="text-sm font-medium mb-2 block">
                  Description (Optional)
                </label>
                <Textarea
                  id="description"
                  placeholder="Add more details about your goal..."
                  value={description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!isValid && goal.length > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Goal must be at least 10 characters long
          </p>
        </div>
      )}
    </div>
  );
}

