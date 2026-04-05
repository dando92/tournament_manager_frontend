type Props = {
  divisionCount: number;
  playerCount: number;
  matchCount: number;
};

export default function TournamentOverviewSummary({
  divisionCount,
  playerCount,
  matchCount,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="text-sm text-gray-500">Divisions</div>
        <div className="mt-2 text-3xl font-black text-primary-dark">{divisionCount}</div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="text-sm text-gray-500">Players / Matches</div>
        <div className="mt-2 text-3xl font-black text-primary-dark">
          {playerCount} / {matchCount}
        </div>
      </div>
    </div>
  );
}
