import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { FeedbackEntry, Sentiment } from '../types';
import { TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  data: FeedbackEntry[];
}

const COLORS = {
  [Sentiment.Positive]: '#10b981', // Emerald 500
  [Sentiment.Neutral]: '#94a3b8',  // Slate 400
  [Sentiment.Negative]: '#f59e0b', // Amber 500
  [Sentiment.Frustrated]: '#ef4444' // Red 500
};

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  // Aggregate data for Topic Sentiment
  const topicData = data.reduce((acc, curr) => {
    const existing = acc.find(i => i.name === curr.topic);
    if (existing) {
      existing[curr.sentiment]++;
    } else {
      acc.push({
        name: curr.topic,
        [Sentiment.Positive]: curr.sentiment === Sentiment.Positive ? 1 : 0,
        [Sentiment.Neutral]: curr.sentiment === Sentiment.Neutral ? 1 : 0,
        [Sentiment.Negative]: curr.sentiment === Sentiment.Negative ? 1 : 0,
        [Sentiment.Frustrated]: curr.sentiment === Sentiment.Frustrated ? 1 : 0,
      });
    }
    return acc;
  }, [] as any[]);

  // Calculate overall sentiment score
  const positiveCount = data.filter(d => d.sentiment === Sentiment.Positive).length;
  const sentimentScore = data.length > 0 ? Math.round((positiveCount / data.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Field Sentiment</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{sentimentScore}%</h3>
            </div>
            <div className={`p-3 rounded-full ${sentimentScore >= 50 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                {sentimentScore >= 50 ? <TrendingUp className="text-emerald-600" /> : <TrendingDown className="text-red-600" />}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4">Based on last {data.length} interactions</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Urgent Alerts</p>
                <h3 className="text-3xl font-bold text-slate-900 mt-2">{data.filter(d => d.urgency === 'High').length}</h3>
            </div>
            <div className="p-3 rounded-full bg-amber-100">
                <AlertTriangle className="text-amber-600" />
            </div>
           </div>
           <p className="text-xs text-slate-400 mt-4">Requires immediate PM attention</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-start">
            <div>
                <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">Top Issue</p>
                <h3 className="text-xl font-bold text-slate-900 mt-2 truncate max-w-[200px]">
                    {data.length > 0 ? data[data.length - 1].category : "N/A"}
                </h3>
            </div>
             <div className="p-3 rounded-full bg-blue-100">
                <TrendingDown className="text-blue-600" />
            </div>
            </div>
            <p className="text-xs text-slate-400 mt-4">Trending in last 24h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[400px]">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Sentiment by Topic</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              <Bar dataKey={Sentiment.Positive} stackId="a" fill={COLORS[Sentiment.Positive]} radius={[0, 0, 4, 4]} />
              <Bar dataKey={Sentiment.Neutral} stackId="a" fill={COLORS[Sentiment.Neutral]} />
              <Bar dataKey={Sentiment.Negative} stackId="a" fill={COLORS[Sentiment.Negative]} />
              <Bar dataKey={Sentiment.Frustrated} stackId="a" fill={COLORS[Sentiment.Frustrated]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Feed */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
           <h3 className="text-lg font-bold text-slate-800 mb-4">Recent Intel</h3>
           <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[300px]">
             {data.slice().reverse().map((entry) => (
               <div key={entry.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                 <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${
                        entry.urgency === 'High' ? 'bg-red-100 text-red-700' : 
                        entry.urgency === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                        {entry.urgency} Priority
                    </span>
                    <span className="text-xs text-slate-400">
                        {new Date(entry.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                 </div>
                 <p className="text-slate-700 text-sm mb-3">"{entry.text}"</p>
                 <div className="flex gap-2 text-xs">
                    <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">{entry.topic}</span>
                    <span className="bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">{entry.category}</span>
                 </div>
               </div>
             ))}
             {data.length === 0 && (
                <div className="text-center text-slate-400 py-10">No feedback captured yet.</div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
