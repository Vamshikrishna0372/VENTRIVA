import React from 'react';
import { Link } from 'react-router-dom';
import { Lightbulb, ArrowRight, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const InsightCard = ({ insight }) => {
  const priorityVariant = {
    critical: 'rose',
    high: 'amber',
    medium: 'indigo',
    low: 'slate',
  }[insight.priority] || 'slate';

  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
            <h4 className="font-bold text-slate-100 text-sm line-clamp-1">{insight.title}</h4>
          </div>
          <Badge variant={priorityVariant} size="xs">
            {insight.priority} Priority
          </Badge>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{insight.description}</p>

        {insight.actionUrl && (
          <div className="pt-2 border-t border-slate-800 flex justify-end">
            <Link to={insight.actionUrl}>
              <Button variant="primary" size="sm" icon={ArrowRight}>
                {insight.actionLabel || 'Take Action'}
              </Button>
            </Link>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default InsightCard;
