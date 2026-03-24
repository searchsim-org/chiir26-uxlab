export interface ProcedureStep {
  id: number;
  type: 'briefing' | 'questionnaire' | 'condition' | 'block' | 'pause' | 'end';
  title: string;
  content?: string;
  isCounterbalanced?: boolean;
  randomizeOrder?: boolean;
  backend?: string;
  backend_config_id?: number;
  duration?: string;
  pauseDuration?: number;
  pauseUnit?: 'minutes' | 'hours' | 'days';
  children?: ProcedureStep[];
  required?: boolean;
  allowSkip?: boolean;
  showInProgress?: boolean;
  questionnaireType?: string;
  questions?: QuestionnaireQuestion[];
  externalUrl?: string;
}

export interface QuestionnaireQuestion {
  id: string;
  text: string;
  type: 'scale' | 'integer' | 'choice' | 'text' | 'likert';
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleLabels?: string[];
  required?: boolean;
}
