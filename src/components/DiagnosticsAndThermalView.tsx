import React, { useState, useMemo } from 'react';
import {
  NLE_DIAGNOSTIC_CASES,
  evaluateHardwareTelemetry,
  HardwareTelemetryInput
} from '../utils/postProductionEngine';
import { Cpu, Wrench, AlertOctagon, CheckSquare, Square, Thermometer } from 'lucide-react';

interface DiagnosticsAndThermalViewProps {
  telemetry: HardwareTelemetryInput;
  onTelemetryChange: (next: HardwareTelemetryInput) => void;
}

export const DiagnosticsAndThermalView: React.FC<DiagnosticsAndThermalViewProps> = ({
  telemetry,
  onTelemetryChange
}) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(NLE_DIAGNOSTIC_CASES[0].id);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const riskAssessment = useMemo(() => evaluateHardwareTelemetry(telemetry), [telemetry]);

  const activeCase = useMemo(
    () => NLE_DIAGNOSTIC_CASES.find((c) => c.id === selectedCaseId) || NLE_DIAGNOSTIC_CASES[0],
    [selectedCaseId]
  );

  const toggleChecklist = (key: string) => {
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const applyPresetScenario = (preset: 'normal_offline' | 'heavy_4k_vfx' | 'thermal_crisis') => {
    if (preset === 'normal_offline') {
      onTelemetryChange({
        gpuTempC: 62,
        cpuTempC: 65,
        vramUsedGb: 9,
        vramTotalGb: 24,
        ramUsedGb: 28,
        ramTotalGb: 64,
        storageReadMbps: 950,
        activeStreams: 2,
        activeCodecType: 'Intra-frame'
      });
    } else if (preset === 'heavy_4k_vfx') {
      onTelemetryChange({
        gpuTempC: 79,
        cpuTempC: 84,
        vramUsedGb: 20,
        vramTotalGb: 24,
        ramUsedGb: 52,
        ramTotalGb: 64,
        storageReadMbps: 520,
        activeStreams: 3,
        activeCodecType: 'Long-GOP'
      });
    } else {
      onTelemetryChange({
        gpuTempC: 88,
        cpuTempC: 93,
        vramUsedGb: 23,
        vramTotalGb: 24,
        ramUsedGb: 60,
        ramTotalGb: 64,
        storageReadMbps: 220,
        activeStreams: 4,
        activeCodecType: 'RAW'
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <p className="text-xs text-amber-400/90 font-mono mb-1">
            03 · 故障排查与硬件热降频监控 · Error Diagnostics & Thermal Guard
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
            非编软件报错排障手册与实时硬件资源/过热降频预警台
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono tabular-nums">
          <span>支持软件: Resolve · Premiere · FCP · Avid</span>
          <span aria-hidden="true">·</span>
          <span>GPU 温控安全线: &lt; 83°C</span>
          <span aria-hidden="true">·</span>
          <span>VRAM 警戒线: 88%</span>
        </div>
      </div>

      {/* Section 1: Hardware Resource & Thermal Throttling Guard */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <Thermometer className="w-4 h-4 text-amber-400 shrink-0" />
            <h2 className="text-base font-semibold text-slate-100">
              01. 工作站硬件资源与热降频实时仿真预警 (Hardware Resource & Thermal Guard)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">快速模拟工作负载：</span>
            <button
              type="button"
              onClick={() => applyPresetScenario('normal_offline')}
              className="px-3 py-1.5 text-xs font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-200 transition-colors cursor-pointer"
            >
              ProRes Proxy 粗剪 (正常)
            </button>
            <button
              type="button"
              onClick={() => applyPresetScenario('heavy_4k_vfx')}
              className="px-3 py-1.5 text-xs font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-amber-300 transition-colors cursor-pointer"
            >
              Long-GOP 多轨合成 (警告)
            </button>
            <button
              type="button"
              onClick={() => applyPresetScenario('thermal_crisis')}
              className="px-3 py-1.5 text-xs font-medium bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-rose-400 transition-colors cursor-pointer"
            >
              8K RAW + 降噪满载 (高危过热)
            </button>
          </div>
        </div>

        {/* Sliders and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 bg-slate-950 border border-slate-800 rounded-lg p-4">
          <div>
            <label htmlFor="gpu-temp-range" className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>GPU 核心温度</span>
              <span className="font-mono tabular-nums text-slate-100">{telemetry.gpuTempC}°C</span>
            </label>
            <input
              id="gpu-temp-range"
              type="range"
              min={40}
              max={98}
              value={telemetry.gpuTempC}
              onChange={(e) => onTelemetryChange({ ...telemetry, gpuTempC: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <label htmlFor="cpu-temp-range" className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>CPU 核心温度</span>
              <span className="font-mono tabular-nums text-slate-100">{telemetry.cpuTempC}°C</span>
            </label>
            <input
              id="cpu-temp-range"
              type="range"
              min={40}
              max={100}
              value={telemetry.cpuTempC}
              onChange={(e) => onTelemetryChange({ ...telemetry, cpuTempC: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <label htmlFor="vram-used-range" className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>GPU 显存占用</span>
              <span className="font-mono tabular-nums text-slate-100">
                {telemetry.vramUsedGb}/{telemetry.vramTotalGb} GB
              </span>
            </label>
            <input
              id="vram-used-range"
              type="range"
              min={2}
              max={telemetry.vramTotalGb}
              value={telemetry.vramUsedGb}
              onChange={(e) => onTelemetryChange({ ...telemetry, vramUsedGb: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <label htmlFor="disk-io-range" className="flex justify-between text-xs text-slate-400 mb-1.5">
              <span>磁盘读取速率</span>
              <span className="font-mono tabular-nums text-slate-100">{telemetry.storageReadMbps} MB/s</span>
            </label>
            <input
              id="disk-io-range"
              type="range"
              min={100}
              max={2500}
              step={50}
              value={telemetry.storageReadMbps}
              onChange={(e) => onTelemetryChange({ ...telemetry, storageReadMbps: Number(e.target.value) })}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <label htmlFor="active-streams-select" className="block text-xs text-slate-400 mb-1.5">
              并发视频轨道数 (Streams)
            </label>
            <select
              id="active-streams-select"
              value={telemetry.activeStreams}
              onChange={(e) => onTelemetryChange({ ...telemetry, activeStreams: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono tabular-nums text-slate-100"
            >
              <option value={1}>1 轨 (单机位时间线)</option>
              <option value={2}>2 轨 (画中画 / 双机位)</option>
              <option value={4}>4 轨 (四机位同步剪辑)</option>
              <option value={6}>6 轨 (重度多机位叠加)</option>
            </select>
          </div>

          <div>
            <label htmlFor="active-codec-select" className="block text-xs text-slate-400 mb-1.5">
              时间线源编码类型
            </label>
            <select
              id="active-codec-select"
              value={telemetry.activeCodecType}
              onChange={(e) =>
                onTelemetryChange({
                  ...telemetry,
                  activeCodecType: e.target.value as HardwareTelemetryInput['activeCodecType']
                })
              }
              className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-slate-100"
            >
              <option value="Intra-frame">Intra-frame (ProRes / DNxHR)</option>
              <option value="Long-GOP">Long-GOP (H.265 / H.264)</option>
              <option value="RAW">Camera RAW (ARRIRAW / R3D)</option>
            </select>
          </div>
        </div>

        {/* KPI Readout Bar + Alerts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 font-mono tabular-nums">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
            <span className="block text-xs text-slate-400 font-sans">硬件综合健康状态</span>
            <span
              data-testid="hardware-overall-status"
              className={`text-base font-semibold ${
                riskAssessment.overallStatus === 'Nominal'
                  ? 'text-emerald-400'
                  : riskAssessment.overallStatus === 'Warning'
                  ? 'text-amber-300'
                  : 'text-rose-400'
              }`}
            >
              {riskAssessment.overallStatus === 'Nominal'
                ? '正常 (NOMINAL)'
                : riskAssessment.overallStatus === 'Warning'
                ? '负载预警 (WARNING)'
                : '高危拦截 (CRITICAL)'}
            </span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
            <span className="block text-xs text-slate-400 font-sans">显存负载率 (VRAM Load)</span>
            <span className="text-base font-semibold text-slate-100">{riskAssessment.vramUsagePercent}%</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
            <span className="block text-xs text-slate-400 font-sans">实时所需磁盘吞吐量</span>
            <span className="text-base font-semibold text-amber-300">{riskAssessment.requiredBandwidthMbps} MB/s</span>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5">
            <span className="block text-xs text-slate-400 font-sans">过热降频风险 (Throttling)</span>
            <span className={`text-base font-semibold ${riskAssessment.thermalThrottleRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
              {riskAssessment.thermalThrottleRisk ? '即将触发降频' : '温度受控'}
            </span>
          </div>
        </div>

        {riskAssessment.alerts.length === 0 ? (
          <div className="bg-emerald-950/20 border border-emerald-800/60 rounded-lg p-3.5 text-xs text-emerald-300">
            当前硬件温度、显存容量与磁盘阵列读取带宽完全满足时间线实时回放与渲染要求，无过热降频风险。
          </div>
        ) : (
          <div className="space-y-2.5">
            {riskAssessment.alerts.map((alert, i) => (
              <div
                key={i}
                className={`rounded-lg p-4 border text-xs ${
                  alert.level === 'Critical'
                    ? 'bg-rose-950/30 border-rose-800 text-rose-200'
                    : 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 font-semibold mb-1">
                  <span>
                    [{alert.level.toUpperCase()}] {alert.component}
                  </span>
                </div>
                <p className="mb-1.5">{alert.message}</p>
                <p className="text-emerald-300 font-medium">防崩溃处置方案：{alert.mitigation}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: NLE Error Diagnostics & Step-by-Step Playbooks */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
            <h2 className="text-base font-semibold text-slate-100">
              02. 剪辑软件核心故障排错手册 (DaVinci Resolve / Premiere / FCP / Avid)
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            {NLE_DIAGNOSTIC_CASES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedCaseId(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCaseId === item.id
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {item.nle} · {item.category === 'media_offline' ? '媒体离线' : item.category === 'gpu_render' ? 'GPU/渲染崩溃' : item.category === 'audio_sync' ? '音画脱节/爆音' : 'XML/AAF 套底'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Cols: Root Causes & Step-by-Step Fix */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-xs font-mono text-amber-400">
                  目标软件: {activeCase.nle} · 严重等级: {activeCase.severity}
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-2">{activeCase.title}</h3>
              <p className="text-xs font-mono text-rose-300 bg-rose-950/30 border border-rose-900/60 rounded px-3 py-2">
                典型报错 / 症状: {activeCase.errorCodeOrSymptom}
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-slate-200 mb-2.5">
                根因剖析 (Root Cause Analysis)
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {activeCase.rootCauses.map((cause, idx) => (
                  <li key={idx} className="leading-relaxed">
                    • {cause}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
              <h4 className="text-xs font-semibold text-amber-300 mb-2.5">
                步进式排障执行方案 (Step-by-Step Resolution)
              </h4>
              <div className="space-y-2.5 text-xs text-slate-200">
                {activeCase.stepByStepFix.map((step, idx) => (
                  <div key={idx} className="bg-slate-900/80 border border-slate-800/80 rounded p-3 leading-relaxed">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Interactive Prevention Checklist */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-950 border border-slate-800 rounded-lg p-5">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertOctagon className="w-4 h-4 text-amber-400 shrink-0" />
                <h4 className="text-sm font-semibold text-slate-100">
                  工业零失误防复发核查清单 (Interactive QC Checklist)
                </h4>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                在重新导出或向调色/混音部门移交工程前，请逐项勾选确认以下防呆要求：
              </p>

              <div className="space-y-2.5">
                {activeCase.preventionChecklist.map((item, idx) => {
                  const key = `${activeCase.id}-${idx}`;
                  const isChecked = !!checkedItems[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleChecklist(key)}
                      className={`w-full flex items-start gap-3 p-3 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-950/25 border-emerald-700/70 text-emerald-200'
                          : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <span className="leading-relaxed">{item}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between font-mono tabular-nums">
              <span>当前项目核查进度</span>
              <span className="text-amber-300 font-semibold">
                {activeCase.preventionChecklist.filter((_, idx) => checkedItems[`${activeCase.id}-${idx}`]).length} /{' '}
                {activeCase.preventionChecklist.length} 已确认
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
