import React from 'react';
import { GeminiAnalytics } from '../../../utilities/geminiAnalysis';
import { Lightbulb, TrendingUp, Target, Users, BedDouble, PenTool, AlertTriangle, Heart, Zap, BookOpen } from 'lucide-react';

const sectionCard = 'bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-6 mb-8 transition-transform hover:-translate-y-1 hover:shadow-2xl';
const sectionHeader = 'flex items-center gap-2 mb-4 text-2xl font-bold border-l-4 pl-3';
const tableBase = 'min-w-full rounded-xl overflow-hidden shadow-sm';
const thBase = 'px-4 py-2 text-left bg-blue-50 font-semibold';
const tdBase = 'px-4 py-2';
const zebra = 'even:bg-blue-50';
const pill = 'inline-block rounded-full px-3 py-1 text-xs font-semibold mr-2 mb-1 bg-blue-100 text-blue-700';
const insightBox = 'flex items-center gap-2 mt-4 p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl text-blue-900 text-sm font-medium shadow';

const TextualAnalysisTab: React.FC<{ analytics: GeminiAnalytics }> = ({ analytics }) => {
  return (
    <div className="space-y-10">
      {/* Vocabulary Shifts */}
      <section className={sectionCard} style={{animation: 'fadeIn 0.7s'}}>
        <div className={sectionHeader} style={{borderColor: '#60a5fa'}}>
          <BookOpen className="w-6 h-6 text-blue-400" /> Vocabulary Shifts
        </div>
        <table className={tableBase}>
          <thead>
            <tr>
              <th className={thBase}>Timeframe</th>
              <th className={thBase}>Distinctive Words</th>
              <th className={thBase}>Mood</th>
            </tr>
          </thead>
          <tbody>
            {analytics.vocabularyShifts.phases.map((phase, idx) => (
              <tr key={idx} className={zebra+" border-t border-blue-100 hover:bg-blue-100 transition"}>
                <td className={tdBase+" font-medium"}>{phase.phase}</td>
                <td className={tdBase}>
                  {phase.words.map((word, i) => (
                    <span key={i} className={pill}>{word}</span>
                  ))}
                </td>
                <td className={tdBase}>{phase.mood}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={insightBox}><Lightbulb className="w-4 h-4 text-yellow-500" /> <span className="italic">{analytics.vocabularyShifts.insight}</span></div>
      </section>

      {/* Major Milestones */}
      <section className={sectionCard} style={{animation: 'fadeIn 0.8s'}}>
        <div className={sectionHeader} style={{borderColor: '#818cf8'}}>
          <Target className="w-6 h-6 text-indigo-400" /> Major Milestones
        </div>
        <div className="space-y-4">
          {analytics.majorMilestones.milestones.map((m, idx) => (
            <div key={idx} className="bg-indigo-50 rounded-xl p-4 shadow-sm border-l-4 border-indigo-300">
              <div className="font-semibold text-indigo-700 mb-1">{m.date} - {m.title}</div>
              <div className="text-gray-800 mb-1">{m.description}</div>
              <div className="text-xs text-indigo-900 italic">{m.insight}</div>
            </div>
          ))}
        </div>
        <div className={insightBox.replace('blue', 'indigo')}><Lightbulb className="w-4 h-4 text-yellow-500" /> <span className="italic">{analytics.majorMilestones.insight}</span></div>
      </section>

      {/* Daily Rhythm Patterns */}
      <section className={sectionCard} style={{animation: 'fadeIn 0.9s'}}>
        <div className={sectionHeader} style={{borderColor: '#34d399'}}>
          <Zap className="w-6 h-6 text-emerald-400" /> Daily Rhythm
        </div>
        <table className={tableBase}>
          <thead>
            <tr>
              <th className={thBase}>Time Block</th>
              <th className={thBase}>Activities</th>
              <th className={thBase}>Note</th>
            </tr>
          </thead>
          <tbody>
            {analytics.dailyRhythmPatterns.blocks.map((block, idx) => (
              <tr key={idx} className={zebra+" border-t border-emerald-100 hover:bg-emerald-50 transition"}>
                <td className={tdBase+" font-medium"}>{block.block}</td>
                <td className={tdBase}>
                  {block.activities.map((act, i) => (
                    <span key={i} className={pill.replace('blue', 'emerald')}>{act}</span>
                  ))}
                </td>
                <td className={tdBase}>{block.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={insightBox.replace('blue', 'emerald')}><Lightbulb className="w-4 h-4 text-yellow-500" /> <span className="italic">{analytics.dailyRhythmPatterns.insight}</span></div>
      </section>

      {/* Emotional Triggers */}
      <section className={sectionCard} style={{animation: 'fadeIn 1.0s'}}>
        <div className={sectionHeader} style={{borderColor: '#f472b6'}}>
          <TrendingUp className="w-6 h-6 text-pink-400" /> Emotional Triggers
        </div>
        <table className={tableBase}>
          <thead>
            <tr>
              <th className={thBase}>Event</th>
              <th className={thBase}>Mood</th>
              <th className={thBase}>Timeframe</th>
              <th className={thBase}>Note</th>
            </tr>
          </thead>
          <tbody>
            {analytics.emotionalTriggers.map((trigger, idx) => (
              <tr key={idx} className={zebra+" border-t border-pink-100 hover:bg-pink-50 transition"}>
                <td className={tdBase+" font-medium"}>{trigger.event}</td>
                <td className={tdBase}>{trigger.mood}</td>
                <td className={tdBase}>{trigger.timeframe}</td>
                <td className={tdBase}>{trigger.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Energy-Level Tracking */}
      <section className={sectionCard} style={{animation: 'fadeIn 1.1s'}}>
        <div className={sectionHeader} style={{borderColor: '#fbbf24'}}>
          <Zap className="w-6 h-6 text-yellow-400" /> Energy-Level Tracking
        </div>
        <table className={tableBase}>
          <thead>
            <tr>
              <th className={thBase}>Time Block</th>
              <th className={thBase}>Energy (1-5)</th>
              <th className={thBase}>Mood</th>
              <th className={thBase}>Correlation</th>
            </tr>
          </thead>
          <tbody>
            {analytics.energyLevelTracking.map((row, idx) => (
              <tr key={idx} className={zebra+" border-t border-yellow-100 hover:bg-yellow-50 transition"}>
                <td className={tdBase+" font-medium"}>{row.timeBlock}</td>
                <td className={tdBase}>{row.energy}</td>
                <td className={tdBase}>{row.mood}</td>
                <td className={tdBase}>{row.correlation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Goal Progress Metrics */}
      <section className={sectionCard} style={{animation: 'fadeIn 1.2s'}}>
        <div className={sectionHeader} style={{borderColor: '#f59e42'}}>
          <Target className="w-6 h-6 text-orange-400" /> Goal Progress Metrics
        </div>
        <table className={tableBase}>
          <thead>
            <tr>
              <th className={thBase}>Goal</th>
              <th className={thBase}>Status</th>
              <th className={thBase}>Milestone</th>
              <th className={thBase}>Setback</th>
            </tr>
          </thead>
          <tbody>
            {analytics.goalProgressMetrics.map((row, idx) => (
              <tr key={idx} className={zebra+" border-t border-orange-100 hover:bg-orange-50 transition"}>
                <td className={tdBase+" font-medium"}>{row.goal}</td>
                <td className={tdBase}>{row.status}</td>
                <td className={tdBase}>{row.milestone}</td>
                <td className={tdBase}>{row.setback}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Social Interaction Impact */}
      <section className={sectionCard} style={{animation: 'fadeIn 1.3s'}}>
        <div className={sectionHeader} style={{borderColor: '#38bdf8'}}>
          <Users className="w-6 h-6 text-sky-400" /> Social Interaction Impact
        </div>
        <table className={tableBase}>
          <thead>
            <tr>
              <th className={thBase}>Interaction</th>
              <th className={thBase}>Mood Impact</th>
              <th className={thBase}>Note</th>
            </tr>
          </thead>
          <tbody>
            {analytics.socialInteractionImpact.map((row, idx) => (
              <tr key={idx} className={zebra+" border-t border-sky-100 hover:bg-sky-50 transition"}>
                <td className={tdBase+" font-medium"}>{row.interaction}</td>
                <td className={tdBase}>{row.moodImpact}</td>
                <td className={tdBase}>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Sleep & Rest Analysis */}
      <section className={sectionCard} style={{animation: 'fadeIn 1.4s'}}>
        <div className={sectionHeader} style={{borderColor: '#a78bfa'}}>
          <BedDouble className="w-6 h-6 text-violet-400" /> Sleep & Rest Analysis
        </div>
        <table className={tableBase}>
          <thead>
            <tr>
              <th className={thBase}>Date</th>
              <th className={thBase}>Duration</th>
              <th className={thBase}>Quality</th>
              <th className={thBase}>Productivity Correlation</th>
            </tr>
          </thead>
          <tbody>
            {analytics.sleepRestAnalysis.map((row, idx) => (
              <tr key={idx} className={zebra+" border-t border-violet-100 hover:bg-violet-50 transition"}>
                <td className={tdBase+" font-medium"}>{row.date}</td>
                <td className={tdBase}>{row.duration}</td>
                <td className={tdBase}>{row.quality}</td>
                <td className={tdBase}>{row.productivityCorrelation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Creative Output Log */}
      <section className={sectionCard} style={{animation: 'fadeIn 1.5s'}}>
        <div className={sectionHeader} style={{borderColor: '#f472b6'}}>
          <PenTool className="w-6 h-6 text-pink-400" /> Creative Output Log
        </div>
        <table className={tableBase}>
          <thead>
            <tr>
              <th className={thBase}>Date</th>
              <th className={thBase}>Output</th>
              <th className={thBase}>Time Block</th>
            </tr>
          </thead>
          <tbody>
            {analytics.creativeOutputLog.map((row, idx) => (
              <tr key={idx} className={zebra+" border-t border-pink-100 hover:bg-pink-50 transition"}>
                <td className={tdBase+" font-medium"}>{row.date}</td>
                <td className={tdBase}>{row.output}</td>
                <td className={tdBase}>{row.timeBlock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Stress Indicators */}
      <section className={sectionCard} style={{animation: 'fadeIn 1.6s'}}>
        <div className={sectionHeader} style={{borderColor: '#f87171'}}>
          <AlertTriangle className="w-6 h-6 text-red-400" /> Stress Indicators
        </div>
        <table className={tableBase}>
          <thead>
            <tr>
              <th className={thBase}>Term</th>
              <th className={thBase}>Context</th>
              <th className={thBase}>Event</th>
            </tr>
          </thead>
          <tbody>
            {analytics.stressIndicators.map((row, idx) => (
              <tr key={idx} className={zebra+" border-t border-red-100 hover:bg-red-50 transition"}>
                <td className={tdBase+" font-medium"}>{row.term}</td>
                <td className={tdBase}>{row.context}</td>
                <td className={tdBase}>{row.event}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Gratitude Tracking */}
      <section className={sectionCard} style={{animation: 'fadeIn 1.7s'}}>
        <div className={sectionHeader} style={{borderColor: '#fbbf24'}}>
          <Heart className="w-6 h-6 text-yellow-400" /> Gratitude Tracking
        </div>
        <table className={tableBase}>
          <thead>
            <tr>
              <th className={thBase}>Moment</th>
              <th className={thBase}>Positivity Trend</th>
            </tr>
          </thead>
          <tbody>
            {analytics.gratitudeTracking.map((row, idx) => (
              <tr key={idx} className={zebra+" border-t border-yellow-100 hover:bg-yellow-50 transition"}>
                <td className={tdBase+" font-medium"}>{row.moment}</td>
                <td className={tdBase}>{row.positivityTrend}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
};

export default TextualAnalysisTab; 