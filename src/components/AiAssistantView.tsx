import React, { useState } from 'react';
import { HardwareTelemetryInput } from '../utils/postProductionEngine';
import { Send, ShieldAlert, Cpu, CheckSquare, Square, Sparkles } from 'lucide-react';

interface AssistantReport {
  title: string;
  proactiveWarning: string;
  hardwareAlert: string;
  steps: string[];
  specTable: { parameter: string; standard: string; hazard: string }[];
  checklist: string[];
}

interface AiAssistantViewProps {
  projectCode: string;
  telemetry: HardwareTelemetryInput;
}

const INITIAL_REPORT: AssistantReport = {
  title: 'Sony FX3 H.265 10-bit 4:2:2 多机位混剪与 S-Log3 色彩还原主动防护方案',
  proactiveWarning:
    '【主动防护拦截】检测到您计划在 H.265 Long-GOP 素材上直接叠加变形稳定器与调色节点！Long-GOP 帧间预测编码在多轨回放与反向寻址时会导致解码器死锁、显存爆满及导出报错 (-1609629695)。必须先全量转码为 Intra-frame 的 Apple ProRes 422 Proxy 代理。',
  hardwareAlert:
    '当前硬件监控：GPU 温度与显存均处于受控状态。建议在剪辑阶段关闭时域降噪（Temporal NR），仅在最终切换回原片（Full Res Online）导出 ProRes 422 HQ 母版前开启。',
  steps: [
    'Step 1 (建立工业目录与转码代理)：将所有 Sony FX3 MP4 原片存入 `01_Footage/DAY01/A_CAM_RAW`，使用 Shutter Encoder 或 DaVinci Resolve 批量生成 1920×1080 Apple ProRes 422 Proxy (.mov)，严格保持源时间码（Source Timecode）与 48kHz 双声道。',
    'Step 2 (双系统时间码对齐)：核查同期录音 WAV 采样率是否为 48,000 Hz / 24-bit，确认视频与音频帧率同为 23.976 fps 或 25.00 fps，右键执行基于时间码的自动同步。',
    'Step 3 (构建 CST 色彩空间转换)：切勿使用来历不明的网红 LUT！在 DaVinci Resolve 中建立 CST 输入节点（Sony S-Gamut3.Cine / S-Log3 → DaVinci Wide Gamut）与 CST 输出节点（DaVinci Wide Gamut → Rec.709 Gamma 2.4），所有一级曝光与二级选区均在两节点之间完成。',
    'Step 4 (Mac QuickTime Gamma 偏移防护)：在最终交付 H.264 审阅带时，将色彩标签显式指定为 Rec.709-A (NCLC 1-1-1)，并先导出 ProRes 422 HQ 无损母带，再由母带压制 MP4。'
  ],
  specTable: [
    {
      parameter: '粗剪代理规格 (Offline Proxy)',
      standard: 'Apple ProRes 422 Proxy · 1920×1080 · Intra-frame',
      hazard: '直接剪辑 4K H.265 4:2:2 导致时间线严重卡顿与导出中断'
    },
    {
      parameter: '色彩管理管线 (Color Pipeline)',
      standard: 'S-Gamut3.Cine / S-Log3 → DWG → Rec.709 Gamma 2.4',
      hazard: '误选 S-Gamut3 或叠加双重 LUT 造成肤色断层与死黑'
    },
    {
      parameter: '音频交接标准 (Audio Turnover)',
      standard: '48,000 Hz / 24-bit PCM WAV · 48 Frames Handles',
      hazard: '混用 44.1kHz MP3 引发实时重采样噼啪杂音与声画漂移'
    }
  ],
  checklist: [
    '所有原片已完成双盘备份并通过 MHL XXHash64 校验',
    '时间线已彻底移除中文命名、空格及 Final_final 等违规标签',
    '导出正片前已核查所有代理开关均已切回原始高分辨率母带 (Full Resolution)',
    '成片已在 00:59:58:00 置入 2-Pop 同步信号（如需交接混音棚）并完成全片回放质检'
  ]
};

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ projectCode, telemetry }) => {
  const [promptInput, setPromptInput] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<AssistantReport>(INITIAL_REPORT);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({ 0: true });

  const presetPrompts = [
    '我用 Sony FX3 拍了 4K 10-bit 4:2:2 H.265 S-Log3 素材，准备直接在 Premiere 时间线上做多机位剪辑和 AE 动态链接合成，画面既发灰又卡顿，怎么规范处理？',
    'DaVinci Resolve 调色后导出的视频在电脑调色监视器上正常，但发给客户在 Mac QuickTime 和 iPhone 上看明显发灰泛白，且偶尔报错 GPU Memory Full，如何排查？',
    '现场双系统录音打板点已经对齐了，但是 15 分钟的长访谈剪到后面口型越来越慢（差了快1秒），而且导出 AAF 给 Pro Tools 混音师报错缺少帧余量，怎么救场？',
    '摄影师交了 4 张 SD 卡，里面文件名全是 C0001.MP4 到 C0080.MP4，现在从剪辑软件导出 XML 到调色房回批，一半镜头链接到了错误的卡上，如何零失误修复？'
  ];

  const handleConsult = async (customPrompt?: string) => {
    const query = (customPrompt !== undefined ? customPrompt : promptInput).trim();
    if (!query) {
      setValidationError('请输入具体的后期剪辑、编码、色彩空间或报错症状，剪辑助理将为您生成结构化排障方案。');
      return;
    }
    setValidationError('');
    setLoading(true);

    try {
      const vramUsagePercent = Math.round((telemetry.vramUsedGb / Math.max(1, telemetry.vramTotalGb)) * 100);
      const res = await fetch('/api/assistant/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          context: {
            projectCode,
            gpuTempC: telemetry.gpuTempC,
            cpuTempC: telemetry.cpuTempC,
            vramUsagePercent,
            activeCodecType: telemetry.activeCodecType
          }
        })
      });

      const data = await res.json();
      if (res.ok && data?.report) {
        setReport(data.report);
        setCheckedItems({});
      } else {
        setValidationError(data?.error || '诊断服务响应异常，请重试。');
      }
    } catch (_e) {
      setValidationError('网络请求失败，请检查本地服务连接。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <p className="text-xs text-amber-400/90 font-mono mb-1">
            04 · 影视后期总监级 AI 剪辑助理 · Senior AI Assistant Editor
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
            交互式工作流方案审计、色彩排障与报错诊断专家台
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono tabular-nums">
          <span>当前绑定工程: {projectCode}</span>
          <span aria-hidden="true">·</span>
          <span>GPU 遥测: {telemetry.gpuTempC}°C</span>
          <span aria-hidden="true">·</span>
          <span>输出原则: 零容忍 / 结构化 / 主动防护</span>
        </div>
      </div>

      {/* Input & Preset Scenarios */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
        <div className="mb-4">
          <p className="text-xs text-slate-400 mb-2">
            高频工业实战排障场景（点击一键载入诊断）：
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {presetPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setPromptInput(p);
                  handleConsult(p);
                }}
                className="text-left p-3 rounded-lg bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs text-slate-300 transition-colors cursor-pointer leading-relaxed"
              >
                <span className="font-mono text-amber-400 mr-1.5">0{idx + 1}.</span>
                {p}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleConsult();
          }}
          className="space-y-3"
        >
          <label htmlFor="assistant-prompt-input" className="block text-xs font-medium text-slate-300">
            向总监级剪辑助理提交您的剪辑/转码/调色/报错问题：
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="assistant-prompt-input"
              type="text"
              value={promptInput}
              onChange={(e) => {
                setPromptInput(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="例如：RED R3D 素材导入 Premiere 媒体离线，或者 S-Log3 转换 Rec.709 节点顺序怎么排？"
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? '正在执行工业级诊断...' : '生成总监级诊断方案'}</span>
            </button>
          </div>
          {validationError && (
            <p role="alert" className="text-xs text-rose-400">
              {validationError}
            </p>
          )}
        </form>
      </section>

      {/* Structured Diagnostic Output */}
      <section
        data-testid="assistant-report-container"
        className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <h2 className="text-lg font-semibold text-slate-100">{report.title}</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Industrial Protocol Report · {projectCode}
          </span>
        </div>

        {/* Proactive Protection & Hardware Alert */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-rose-950/30 border border-rose-800/80 rounded-lg p-4 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-rose-300 font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>主动防护与违规拦截 (Proactive Workflow Guard)</span>
            </div>
            <p className="text-rose-200/95 leading-relaxed">{report.proactiveWarning}</p>
          </div>

          <div className="bg-amber-950/25 border border-amber-800/80 rounded-lg p-4 text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <Cpu className="w-4 h-4 shrink-0" />
              <span>技术性硬件与散热预警 (Hardware & Thermal Advisory)</span>
            </div>
            <p className="text-amber-100/90 leading-relaxed">{report.hardwareAlert}</p>
          </div>
        </div>

        {/* Step-by-Step Execution Plan */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            分步执行方案 (Step-by-Step Industrial SOP)
          </h3>
          <div className="space-y-2.5 text-xs text-slate-200">
            {report.steps.map((step, i) => (
              <div key={i} className="bg-slate-900/80 border border-slate-800/80 rounded-lg p-3.5 leading-relaxed">
                {step}
              </div>
            ))}
          </div>
        </div>

        {/* Spec Table + Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              工业参数标准与违规风险对比表 (Specification Matrix)
            </h3>
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 border-b border-slate-800">
                    <th className="py-2.5 px-3 font-medium">技术维度</th>
                    <th className="py-2.5 px-3 font-medium">好莱坞/广告工业标准</th>
                    <th className="py-2.5 px-3 font-medium">违规操作后果</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {report.specTable.map((row, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium text-slate-200">{row.parameter}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-300">{row.standard}</td>
                      <td className="py-2.5 px-3 text-rose-300">{row.hazard}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">
              交付前零失误核查清单 (Zero-Defect Checklist)
            </h3>
            <div className="space-y-2">
              {report.checklist.map((item, idx) => {
                const checked = !!checkedItems[idx];
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }))}
                    className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                      checked
                        ? 'bg-emerald-950/25 border-emerald-700/70 text-emerald-200'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    )}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
