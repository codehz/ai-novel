"use client";

import { useEventHandler } from "@/hooks/useEventHandler";
import { CATEGORY_HUES } from "@/src/constants/colors";
import { clsx } from "clsx";
import { Button } from "./button";
import { Dropdown } from "./dropdown";

interface HueColorPickerProps {
  value?: number;
  onChange: (hue?: number) => void;
  disabled?: boolean;
  className?: string;
}

const PRESET_HUES = [
  { label: "红", value: CATEGORY_HUES.DESTRUCTIVE },
  { label: "橙", value: 30 },
  { label: "黄", value: CATEGORY_HUES.WARNING },
  { label: "绿", value: CATEGORY_HUES.SUCCESS },
  { label: "青", value: CATEGORY_HUES.CYAN },
  { label: "蓝", value: CATEGORY_HUES.PRIMARY },
  { label: "紫", value: CATEGORY_HUES.SECONDARY },
  { label: "粉", value: CATEGORY_HUES.PINK },
];

interface PresetButtonProps {
  preset: (typeof PRESET_HUES)[number];
  isSelected: boolean;
  onChange: (value: number) => void;
}

function PresetButton({ preset, isSelected, onChange }: PresetButtonProps) {
  const handleClick = useEventHandler(() => {
    onChange(preset.value);
  });

  return (
    <button
      key={preset.value}
      type="button"
      onClick={handleClick}
      className={clsx(
        "px-1 py-1.5 text-[10px] rounded-lg border transition-all flex flex-col items-center gap-1.5",
        isSelected
          ? "border-primary bg-primary/10 text-primary font-medium"
          : "border-border bg-background hover:border-primary/50 text-muted-foreground",
      )}
    >
      <div
        className="w-full h-2 rounded-full shadow-inner"
        style={{ backgroundColor: `hsl(${preset.value}, 70%, 50%)` }}
      />
      {preset.label}
    </button>
  );
}

export function HueColorPicker({ value, onChange, disabled = false, className = "" }: HueColorPickerProps) {
  const hue = value ?? 0;
  const hasValue = value !== undefined;

  const handleClear = useEventHandler(() => {
    onChange(undefined);
  });

  const handleNumberChange = useEventHandler((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val === "" ? undefined : Math.min(360, Math.max(0, parseInt(val))));
  });

  const handleSliderChange = useEventHandler((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseInt(e.target.value));
  });

  return (
    <Dropdown
      content={() => (
        <div className="p-4 bg-background border border-input rounded-xl shadow-xl z-50 space-y-4 popover-content">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-muted-foreground">调整颜色</span>
            {hasValue && (
              <Button type="button" variant="destructive-link" size="xs" onClick={handleClear}>
                清除选择
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-medium text-muted-foreground ml-1">色相值 (0-360)</label>
              <input
                type="number"
                min="0"
                max="360"
                value={hasValue ? hue : ""}
                onChange={handleNumberChange}
                placeholder="0-360"
                className="w-full p-1.5 text-xs rounded border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* 滑块输入 */}
          <div className="relative h-6 flex items-center">
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={handleSliderChange}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-white"
              style={{
                background:
                  "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
              }}
            />
          </div>

          {/* 预设按钮 */}
          <div className="grid grid-cols-4 gap-2">
            {PRESET_HUES.map((preset) => (
              <PresetButton
                key={preset.value}
                preset={preset}
                isSelected={value === preset.value}
                onChange={onChange}
              />
            ))}
          </div>
        </div>
      )}
    >
      <button
        type="button"
        disabled={disabled}
        className={clsx(
          "rounded-xl border border-border shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary/20",
          className,
        )}
        style={{
          backgroundColor: hasValue ? `hsl(${hue}, 70%, 50%)` : "transparent",
          boxShadow: hasValue ? `0 0 10px hsl(${hue}, 70%, 50%, 0.2)` : "none",
        }}
        title={hasValue ? `HSL(${hue}, 70%, 50%)` : "点击选择颜色"}
      />
    </Dropdown>
  );
}
