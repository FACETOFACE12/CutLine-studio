import React, { useState, useMemo } from 'react';
import {
  convertSmpteTimecodeAndDuration,
  SmpteConversionInput
} from '../utils/postProductionEngine';
import { Calculator, ArrowLeftRight, Copy, Check, AlertTriangle } from 'lucide-react';

const FPS_OPTIONS = [
  { value: 23.976, label: '23.976 fps (NTSC Film · 24000/1001)' },
  { value: 24, label: '24.000 fps (True Cinema · 24.00)' },
  { value: 25, label: '25.000 fps (PAL Broadcast · 25.00)' },
  { value: 29.97, label: '29.970 fps (NTSC Broadcast · 30000/1001)' },
  { value: 30, label: '30.000 fps (Digital 30.00)' },
  { value: 50, label: '50.000 fps (PAL HFR)' },
  { value: 59.94, label: '59.940 fps (NTSC HFR)' },
  { value: 60, label: '60.000 fps (High Frame Rate)' }
];

const CONFORM_PRESETS = [
  {
    id: '23976-to-25',
    label: '23.976 → 25 PAL 交接',
    sourceFps: 23.976,
    targetFps: 25,
    sourceTc: '01:00:00:00',
    secondaryTc: '01:02:30:12',
    operation: 'span' as const,
    handleFrames: 48
  },
  {
    id: '25-to-23976',
    label: '25 → 23.976 电影套底',
    sourceFps: 25,
    targetFps: 23.976,
    sourceTc: '00:01:00:00',
    secondaryTc: '00:03:15:20',
    operation: 'span' as const,
    handleFrames: 48
  },
  {
    id: '24-to-23976',
    label: '24.00 → 23.976 Pull-down',
    sourceFps: 24,
    targetFps: 23.976,
    sourceTc: '01:00:00:00',
    secondaryTc: '02:00:00:00',
    operation: 'span' as const,
    handleFrames: 24
  },
  {
    id: '23976-to-2997',
    label: '23.976 → 29.97 广电母版',
    sourceFps: 23.976,
    targetFps: 29.97,
    sourceTc: '01:00:10:00',
    secondaryTc: '01:01:40:00',
    operation: 'span' as const,
    handleFrames: 24
  }
];

export const SmpteTimecodeCalculator: React.FC = () => {
  const [sourceTc, setSourceTc] = useState<string>('01:00:00:00');
  const [secondaryTc, setSecondaryTc] = useState<string>('01:02:30:12');
  const [operation, setOperation] = useState<SmpteConversionInput['operation']>('span');
  const [sourceFps, setSourceFps] = useState<number>(23.976);
  const [targetFps, setTargetFps] = useState<number>(25);
  const [handleFrames, setHandleFrames] = useState<number>(48);
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  const conversion = useMemo(
    () =>
      convertSmpteTimecodeAndDuration({
        sourceTc,
        secondaryTc,
        operation,
        sourceFps,
        targetFps,
        handleFrames
      }),
    [sourceTc, secondaryTc, operation, sourceFps, targetFps, handleFrames]
  );

  const handleSwapFps = () => {
    setSourceFps(targetFps);
    setTargetFps(sourceFps);
  };

  const handleApplyPreset = (preset: (typeof CONFORM_PRESETS)[number]) => {
    setSourceFps(preset.sourceFps);
    setTargetFps(preset.targetFps);
    setSourceTc(preset.sourceTc);
    setSecondaryTc(preset.secondaryTc);
    setOperation(preset.operation);
    setHandleFrames(preset.handleFrames);
  };

  const handleCopyConformReport = () => {
    if (!conversion.valid) return;
    const summaryText = [
      `[SMPTE TIMECODE & FRAME-RATE CONFORM REPORT]`,
      `Source FPS      : ${sourceFps} fps (Timebase ${conversion.sourceTimebase})`,
      `Target FPS      : ${targetFps} fps (Timebase ${conversion.targetTimebase})`,
      `Primary TC (In) : ${sourceTc} (${conversion.sourceTotalFrames}f | Real: ${conversion.sourceRealFormatted})`,
      `Secondary TC    : ${secondaryTc} (${conversion.secondaryTotalFrames}f)`,
      `1:1 Frame Match : ${conversion.targetTcFrameMatch} @ ${targetFps}fps (Speed: ${conversion.speedRatioPercent}%, Pitch: ${conversion.pitchShiftSemitones >= 0 ? '+' : ''}${conversion.pitchShiftSemitones} st)`,
      `Real-Time Match : ${conversion.targetTcRealtime} @ ${targetFps}fps (${conversion.targetRealtimeFrames}f)`,
      `Span / Result   : ${conversion.resultTcSource} (${conversion.resultFramesSource}f | ${conversion.resultRealFormatted})`,
      `With ±${conversion.handleFramesPerSide}f Handles : ${conversion.totalTcWithHandlesSource} (${conversion.totalFramesWithHandlesSource}f @ Source) / ${conversion.totalTcWithHandlesTarget} (${conversion.totalFramesWithHandlesTarget}f @ Target)`
    ].join('\n');

    navigator.clipboard?.writeText(summaryText).catch(() => {});
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 1800);
  };

  return (
    <section
      aria-label="SMPTE 时间码跨帧率转换与时长换算器"
      className="bg-slate-900/70 border border-slate-800 rounded-xl p-6"
    >
      {/* Top Header & Quick Conform Presets */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Calculator className="w-4 h-4 text-amber-400 shrink-0" />
            <h2 className="text-base font-semibold text-slate-100">
              05. SMPTE 时间码跨帧率转换与时长换算器
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            支持 23.976 / 24 / 25 / 29.97 多帧率素材交接对位，提供「逐帧 1:1 变速映射」与「恒定物理时长重采样」双模式对比及 VFX/混音把手（Handles）换算。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs text-slate-400 mr-1 whitespace-nowrap">常用交接预设:</span>
          {CONFORM_PRESETS.map((preset) => {
            const isActive =
              Math.abs(sourceFps - preset.sourceFps) < 0.01 &&
              Math.abs(targetFps - preset.targetFps) < 0.01 &&
              sourceTc === preset.sourceTc &&
              secondaryTc === preset.secondaryTc;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-semibold'
                    : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-slate-100'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 12-Col Split: Left Controls (5 Cols) + Right Dual-Mode Readouts (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-5 items-stretch">
        {/* Left 5 Cols: Input Controls */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            {/* Operation Mode Selector */}
            <div>
              <span className="block text-xs text-slate-400 mb-1.5">
                时间码运算模式 (Calculation Mode)
              </span>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setOperation('span')}
                  className={`py-1.5 px-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    operation === 'span'
                      ? 'bg-slate-800 text-amber-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  入出点时长 (Out - In)
                </button>
                <button
                  type="button"
                  onClick={() => setOperation('add')}
                  className={`py-1.5 px-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    operation === 'add'
                      ? 'bg-slate-800 text-amber-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  时间码累加 (TC A + B)
                </button>
                <button
                  type="button"
                  onClick={() => setOperation('subtract')}
                  className={`py-1.5 px-2.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    operation === 'subtract'
                      ? 'bg-slate-800 text-amber-300 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  时间码相减 (TC A - B)
                </button>
              </div>
            </div>

            {/* Source & Target FPS Selectors with Swap Button */}
            <div className="grid grid-cols-1 sm:grid-cols-11 gap-2.5 items-end">
              <div className="sm:col-span-5">
                <label htmlFor="smpte-source-fps" className="block text-xs text-slate-400 mb-1">
                  源素材帧率 (Source FPS)
                </label>
                <select
                  id="smpte-source-fps"
                  value={sourceFps}
                  onChange={(e) => setSourceFps(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {FPS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={handleSwapFps}
                  aria-label="互换源帧率与目标帧率"
                  title="互换源帧率与目标帧率"
                  className="p-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              <div className="sm:col-span-5">
                <label htmlFor="smpte-target-fps" className="block text-xs text-slate-400 mb-1">
                  目标交接帧率 (Target FPS)
                </label>
                <select
                  id="smpte-target-fps"
                  value={targetFps}
                  onChange={(e) => setTargetFps(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {FPS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Primary & Secondary Timecode Inputs + Handles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="smpte-primary-tc" className="block text-xs text-slate-400 mb-1">
                  {operation === 'span' ? '起始入点 (In-Point TC)' : '主时间码 (Primary TC A)'}
                </label>
                <input
                  id="smpte-primary-tc"
                  type="text"
                  value={sourceTc}
                  onChange={(e) => setSourceTc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="01:00:00:00"
                />
              </div>

              <div>
                <label htmlFor="smpte-secondary-tc" className="block text-xs text-slate-400 mb-1">
                  {operation === 'span' ? '结束出点 (Out-Point TC)' : '次时间码 (Secondary TC B)'}
                </label>
                <input
                  id="smpte-secondary-tc"
                  type="text"
                  value={secondaryTc}
                  onChange={(e) => setSecondaryTc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="01:02:30:12"
                />
              </div>

              <div>
                <label htmlFor="smpte-handles-input" className="block text-xs text-slate-400 mb-1">
                  单边余量把手 (Handles f)
                </label>
                <input
                  id="smpte-handles-input"
                  type="number"
                  min={0}
                  max={240}
                  value={handleFrames}
                  onChange={(e) => setHandleFrames(Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Copy Report Button */}
          <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-800/80">
            <span className="text-xs text-slate-400 font-mono tabular-nums">
              时间基: {conversion.sourceTimebase}f → {conversion.targetTimebase}f · 把手 ±{conversion.handleFramesPerSide}f
            </span>
            <button
              type="button"
              onClick={handleCopyConformReport}
              disabled={!conversion.valid}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedReport ? '已复制换算报告' : '复制交接换算单'}</span>
            </button>
          </div>
        </div>

        {/* Right 7 Cols: Conversion Results & Duration Matrix */}
        <div className="lg:col-span-7">
          {!conversion.valid ? (
            <div
              role="alert"
              className="bg-rose-950/40 border border-rose-800 rounded-lg p-4 flex items-start gap-2.5 text-xs text-rose-300"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{conversion.error}</span>
            </div>
          ) : (
            <div className="space-y-3.5">
              {/* Top Row: Primary Timecode Frame-Rate Conversion (1:1 Frame Match vs Constant Real-Time) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mode 1: 1:1 Frame-for-Frame (Cinema Tools / Interpret Footage) */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-1">
                    <span className="whitespace-nowrap">模式 A · 逐帧 1:1 对位 ({targetFps} fps)</span>
                    <span className="font-mono text-amber-300 whitespace-nowrap shrink-0">
                      变速 {conversion.speedRatioPercent}%
                    </span>
                  </div>
                  <div
                    data-testid="target-tc-frame-match"
                    className="text-xl font-mono font-semibold tabular-nums text-amber-300"
                  >
                    {conversion.targetTcFrameMatch}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                    <span>总帧数: {conversion.sourceTotalFrames}f</span>
                    <span aria-hidden="true">·</span>
                    <span>物理时长: {conversion.targetFrameMatchRealFormatted}</span>
                    <span aria-hidden="true">·</span>
                    <span>
                      音高: {conversion.pitchShiftSemitones >= 0 ? `+${conversion.pitchShiftSemitones}` : conversion.pitchShiftSemitones}st
                    </span>
                  </div>
                </div>

                {/* Mode 2: Constant Real-Time Duration Resample (NLE Timeline Drop) */}
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-400 mb-1">
                    <span className="whitespace-nowrap">模式 B · 恒定时长重采样 ({targetFps} fps)</span>
                    <span className="font-mono text-emerald-400 whitespace-nowrap shrink-0">
                      需光流/插帧
                    </span>
                  </div>
                  <div
                    data-testid="target-tc-realtime"
                    className="text-xl font-mono font-semibold tabular-nums text-slate-100"
                  >
                    {conversion.targetTcRealtime}
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400 font-mono tabular-nums">
                    <span>重采样: {conversion.targetRealtimeFrames}f</span>
                    <span aria-hidden="true">·</span>
                    <span>恒定时长: {conversion.sourceRealFormatted}</span>
                    <span aria-hidden="true">·</span>
                    <span>({conversion.sourceRealSeconds}s)</span>
                  </div>
                </div>
              </div>

              {/* Middle Row: Span / Arithmetic Duration & Handle Summary Table */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800/80 text-xs">
                  <span className="font-semibold text-slate-200">
                    {operation === 'span'
                      ? '入出点净时长与交接余量换算 (In-to-Out Span & Turnover Handles)'
                      : operation === 'add'
                      ? '双时间码累加时长换算 (Cumulative Duration)'
                      : '双时间码差值换算 (Subtracted Duration)'}
                  </span>
                  <span className="font-mono tabular-nums text-slate-400">
                    真实物理秒数: <strong className="text-slate-100">{conversion.resultRealSeconds} 秒</strong> ({conversion.resultRealFormatted})
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono tabular-nums">
                  <div>
                    <span className="block text-xs text-slate-400 font-sans">源帧率结果 ({sourceFps} fps)</span>
                    <span data-testid="span-tc-source" className="text-base font-semibold text-slate-100">
                      {conversion.resultTcSource}
                    </span>
                    <span className="block text-xs text-slate-400">{conversion.resultFramesSource} 帧</span>
                  </div>

                  <div>
                    <span className="block text-xs text-slate-400 font-sans">目标逐帧对位 ({targetFps} fps)</span>
                    <span data-testid="span-tc-target-frame" className="text-base font-semibold text-amber-300">
                      {conversion.resultTcTargetFrameMatch}
                    </span>
                    <span className="block text-xs text-slate-400">{conversion.resultFramesSource} 帧 (1:1)</span>
                  </div>

                  <div>
                    <span className="block text-xs text-slate-400 font-sans">目标恒定时长 ({targetFps} fps)</span>
                    <span data-testid="span-tc-target-realtime" className="text-base font-semibold text-emerald-400">
                      {conversion.resultTcTargetRealtime}
                    </span>
                    <span className="block text-xs text-slate-400">{conversion.resultFramesTargetRealtime} 帧 (重采样)</span>
                  </div>

                  <div>
                    <span className="block text-xs text-slate-400 font-sans">
                      含双边把手 (±{conversion.handleFramesPerSide}f)
                    </span>
                    <span data-testid="span-tc-with-handles" className="text-base font-semibold text-slate-100">
                      {conversion.totalTcWithHandlesSource}
                    </span>
                    <span className="block text-xs text-slate-400">
                      共 {conversion.totalFramesWithHandlesSource} 帧 (VFX/AAF)
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Conform Engineering Advisory */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-300 leading-relaxed">
                <span className="font-semibold text-amber-300">交接对位工程建议：</span>
                {conversion.conformAdvisory}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
