import { useCallback, useRef } from "react";

interface PredictionSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export function PredictionSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
}: PredictionSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const computeValue = useCallback(
    (clientX: number) => {
      if (!sliderRef.current) return value;
      const rect = sliderRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const steppedValue = Math.round(pct / step) * step;
      return Math.max(min, Math.min(max, steppedValue));
    },
    [min, max, step, value],
  );

  const handleSliderClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !sliderRef.current) return;
      onChange(computeValue(e.clientX));
    },
    [disabled, computeValue, onChange],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      e.preventDefault();
      isDragging.current = true;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      onChange(computeValue(e.clientX));
    },
    [disabled, computeValue, onChange],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging.current) return;
      onChange(computeValue(e.clientX));
    },
    [computeValue, onChange],
  );

  const handlePointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = parseInt(e.target.value, 10);
      if (!isNaN(newValue)) {
        onChange(Math.max(min, Math.min(max, newValue)));
      }
    },
    [min, max, onChange],
  );

  const percentage = ((value - min) / (max - min)) * 100;

  // Determine color based on value
  const getColor = () => {
    if (value <= 30) return "bg-danger-500";
    if (value <= 70) return "bg-warning-500";
    return "bg-success-500";
  };

  return (
    <div className="space-y-3">
      {/* Slider Track */}
      <div
        ref={sliderRef}
        onClick={handleSliderClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`relative h-3 rounded-full bg-muted cursor-pointer touch-none ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {/* Fill */}
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-none ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />

        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white shadow-md transition-none ${getColor()} ${
            disabled ? "" : "hover:scale-110"
          }`}
          style={{ left: `${percentage}%` }}
        />
      </div>

      {/* Value Display and Input */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-2">
          {[0, 25, 50, 75, 100].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => !disabled && onChange(preset)}
              disabled={disabled}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                value === preset
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {preset}%
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="w-16 px-2 py-1 text-center text-sm rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>
    </div>
  );
}
