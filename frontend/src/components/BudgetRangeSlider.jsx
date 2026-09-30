import { BUDGET_STEPS, formatCompact, indexToValue, valueToIndex } from "../lib/currency";

export default function BudgetRangeSlider({ minValue, maxValue, onChange, showMin = true }) {
  const minIndex = minValue ? valueToIndex(minValue) : 0;
  const maxIndex = maxValue ? valueToIndex(maxValue) : BUDGET_STEPS.length - 1;

  function handleMinChange(e) {
    const idx = Math.min(Number(e.target.value), maxIndex);
    onChange({ min: showMin ? indexToValue(idx) : minValue, max: indexToValue(maxIndex) });
  }

  function handleMaxChange(e) {
    const idx = Math.max(Number(e.target.value), minIndex);
    onChange({ min: showMin ? indexToValue(minIndex) : minValue, max: indexToValue(idx) });
  }

  const minPct = (minIndex / (BUDGET_STEPS.length - 1)) * 100;
  const maxPct = (maxIndex / (BUDGET_STEPS.length - 1)) * 100;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        {showMin && (
          <span className="font-mono text-sm text-marigold">{formatCompact(indexToValue(minIndex))}</span>
        )}
        <span className="font-mono text-sm text-marigold ml-auto">
          {maxIndex === BUDGET_STEPS.length - 1 ? "No max" : `up to ${formatCompact(indexToValue(maxIndex))}`}
        </span>
      </div>

      <div className="relative h-6 flex items-center">
        <div className="absolute w-full h-1.5 bg-hairline rounded-full" />
        <div
          className="absolute h-1.5 bg-marigold rounded-full"
          style={{ left: `${showMin ? minPct : 0}%`, right: `${100 - maxPct}%` }}
        />
        {showMin && (
          <input
            type="range"
            min={0}
            max={BUDGET_STEPS.length - 1}
            value={minIndex}
            onChange={handleMinChange}
            className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-marigold [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
          />
        )}
        <input
          type="range"
          min={0}
          max={BUDGET_STEPS.length - 1}
          value={maxIndex}
          onChange={handleMaxChange}
          className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-marigold [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
        />
      </div>

      <div className="flex justify-between text-[10px] text-muted mt-1 font-mono">
        <span>{formatCompact(BUDGET_STEPS[0])}</span>
        <span>{formatCompact(BUDGET_STEPS[BUDGET_STEPS.length - 1])}</span>
      </div>
    </div>
  );
}