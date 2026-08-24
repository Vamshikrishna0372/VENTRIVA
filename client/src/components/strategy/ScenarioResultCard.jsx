import React from 'react';
import { Cpu, Trash2 } from 'lucide-react';
import { Card, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';

export const ScenarioResultCard = ({ scenario, onDelete }) => {
  const { _id, name, scenarioType, projectedCapital, projectedPortfolioValue, projectedMOIC, assumptions } = scenario;

  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h4 className="font-bold text-slate-100 text-sm">{name}</h4>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="cyan">SIMULATION</Badge>
            <Badge variant="brand">{scenarioType}</Badge>
            {onDelete && (
              <button
                onClick={() => onDelete(_id)}
                className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                title="Delete Simulation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Simulated Capital</span>
            <span className="font-bold text-slate-200">${(projectedCapital || 0).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Projected Value</span>
            <span className="font-bold text-emerald-400">${(projectedPortfolioValue || 0).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Projected MOIC</span>
            <span className="font-bold text-cyan-400">{projectedMOIC}x</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-mono bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
          Assumptions: {assumptions?.valuationChangePercentage > 0 ? `+${assumptions.valuationChangePercentage}%` : `${assumptions?.valuationChangePercentage || 0}%`} valuation change, +${(assumptions?.newCapitalDeployment || 0).toLocaleString()} deployment.
        </p>
      </CardBody>
    </Card>
  );
};

export default ScenarioResultCard;
