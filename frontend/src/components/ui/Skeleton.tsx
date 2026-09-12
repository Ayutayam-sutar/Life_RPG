import React from 'react';

export const ShimmerBar: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`relative overflow-hidden bg-slate-200/70 rounded-md ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/80 to-transparent" />
  </div>
);

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 rounded-2xl p-6 shadow-sm relative overflow-hidden space-y-5">
      {/* Top Profile HUD Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <ShimmerBar className="w-16 h-16 rounded-xl !bg-amber-50 dark:bg-amber-950/400/10" />
          <div className="space-y-2">
            <ShimmerBar className="w-48 h-6 rounded" />
            <ShimmerBar className="w-32 h-4 rounded" />
          </div>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <ShimmerBar className="w-28 h-10 rounded-xl" />
          <ShimmerBar className="w-28 h-10 rounded-xl" />
          <ShimmerBar className="w-20 h-10 rounded-xl" />
        </div>
      </div>

      {/* Main Level Progress Bar Skeleton */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <ShimmerBar className="w-40 h-4 rounded" />
          <ShimmerBar className="w-12 h-4 rounded" />
        </div>
        <ShimmerBar className="w-full h-3.5 rounded-full" />
        <div className="flex justify-between items-center">
          <ShimmerBar className="w-32 h-3 rounded" />
          <ShimmerBar className="w-40 h-3 rounded" />
        </div>
      </div>

      {/* Attributes 3-Col Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/80 rounded-xl space-y-2.5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShimmerBar className="w-8 h-8 rounded-lg" />
                <ShimmerBar className="w-20 h-4 rounded" />
              </div>
              <ShimmerBar className="w-12 h-4 rounded" />
            </div>
            <ShimmerBar className="w-full h-2 rounded-full" />
            <div className="flex justify-end">
              <ShimmerBar className="w-16 h-3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const QuestCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900 flex items-start gap-3.5 shadow-xs">
      <ShimmerBar className="w-7 h-7 rounded-lg mt-1 flex-shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="flex items-center gap-2">
          <ShimmerBar className="w-16 h-4 rounded" />
          <ShimmerBar className="w-14 h-4 rounded" />
          <ShimmerBar className="w-20 h-4 rounded" />
        </div>
        <ShimmerBar className="w-3/4 h-5 rounded" />
        <ShimmerBar className="w-1/2 h-3.5 rounded" />
        <div className="flex items-center gap-2.5 pt-1">
          <ShimmerBar className="w-16 h-5 rounded-lg" />
          <ShimmerBar className="w-14 h-5 rounded-lg" />
          <ShimmerBar className="w-16 h-5 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const QuestBoardSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-4">
      {/* Search & Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/90 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ShimmerBar key={i} className="w-20 h-8 rounded-lg flex-shrink-0" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ShimmerBar className="w-48 h-8 rounded-xl" />
          <ShimmerBar className="w-28 h-8 rounded-xl flex-shrink-0" />
        </div>
      </div>

      {/* Quest Cards Skeleton List */}
      <div className="space-y-2.5">
        {[1, 2, 3, 4].map((i) => (
          <QuestCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};

