import React, { useState } from 'react';
import { CODEC_DATABASE, COLOR_PIPELINES } from '../utils/postProductionEngine';
import { Palette, Film, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const ColorAndCodecView: React.FC = () => {
  const [selectedPipelineKey, setSelectedPipelineKey] = useState<string>('slog3-rec709');
  const [selectedCodecFilter, setSelectedCodecFilter] = useState<'all' | 'Intra-frame' | 'Long-GOP'>('all');
  const [activeTaskCheck, setActiveTaskCheck] = useState<'multicam_edit' | 'vfx_comp' | 'color_master' | 'client_review'>('vfx_comp');

  const activePipeline = COLOR_PIPELINES[selectedPipelineKey] || COLOR_PIPELINES['slog3-rec709'];

  const filteredCodecs = CODEC_DATABASE.filter((c) =>
    selectedCodecFilter === 'all' ? true : c.compression === selectedCodecFilter
  );

  const taskRecommendation = {
    multicam_edit: {
      title: '多机位同步粗剪 (4~9 机位同屏回放)',
      recommended: 'Apple ProRes 422 Proxy 或 Avid DNxHR LB (1920×1080)',
      prohibited: 'H.265 / H.264 4K Long-GOP 原片直剪',
      reason: '多机位同屏需要同时解码多条视频流。Long-GOP 必须同时缓存前后数十帧计算预测帧，会导致 CPU 100% 满载与回放严重掉帧；Intra-frame 代理单帧独立解码，可实现 9 机位零延迟切换。'
    },
    vfx_comp: {
      title: '复杂视效合成、绿幕抠像与光流变速 (Fusion / Nuke / AE)',
      recommended: '16-bit OpenEXR (PIZ/DWAA) 序列 或 Apple ProRes 4444 (12-bit)',
      prohibited: '任何 8-bit 4:2:0 或 Long-GOP H.264/H.265 素材',
      reason: '主动防护红线：在 Long-GOP 编码上做复杂视效合成会导致双向预测帧寻址错乱（出现莫名闪帧或报错崩溃），且 4:2:0 色度抽样丢失 75% 色彩分辨率，抠像边缘必定产生锯齿与溢色。'
    },
    color_master: {
      title: 'DI 调色母版交付与跨机房套底 (Online / Color Grading)',
      recommended: 'Apple ProRes 422 HQ / ProRes 4444 或 Avid DNxHR HQX (10/12-bit)',
      prohibited: 'H.264 MP4 或 ProRes 422 Proxy',
      reason: '调色母版必须具备至少 10-bit 4:2:2 位深与极低世代损耗（Generation Loss），确保多次渲染无断层（Banding）。'
    },
    client_review: {
      title: '导演/客户审片带上传 (Frame.io / 飞书审阅)',
      recommended: 'H.264 MP4 (1080p, 15~25 Mbps CBR/2-Pass VBR, 烧录 BITC 时间码, Rec.709-A 标签)',
      prohibited: '未烧录时间码与版本号的裸片',
      reason: '审片带必须烧录上半部分源文件名/版本、下半部分序列时间码（Record TC），防止客户用“大概第2分半钟那个镜头”等模糊表述沟通导致改错镜头。'
    }
  }[activeTaskCheck];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <p className="text-xs text-amber-400/90 font-mono mb-1">
            02 · 编解码器与色彩空间专家 · Codecs & Color Science
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
            ACES / DaVinci CST 色彩转换节点树与工业编码器安全矩阵
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono tabular-nums">
          <span>ACES 版本: 1.3 (Gamut Compress)</span>
          <span aria-hidden="true">·</span>
          <span>中间色彩空间: DaVinci Wide Gamut</span>
          <span aria-hidden="true">·</span>
          <span>Mac 交付修正: NCLC 1-1-1 (Rec.709-A)</span>
        </div>
      </div>

      {/* Section 1: Color Science Node Tree & Troubleshooter */}
      <section className="bg-slate-900/70 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <Palette className="w-4 h-4 text-amber-400 shrink-0" />
            <h2 className="text-base font-semibold text-slate-100">
              01. 色彩空间管理 (Color Management) 与标准 CST / ACES 节点管线
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-lg">
            {Object.values(COLOR_PIPELINES).map((pipe) => (
              <button
                key={pipe.sourceId}
                type="button"
                onClick={() => setSelectedPipelineKey(pipe.sourceId)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedPipelineKey === pipe.sourceId
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {pipe.sourceLabel}
              </button>
            ))}
          </div>
        </div>

        {/* Metadata Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950 border border-slate-800 rounded-lg p-4 mb-6 text-xs font-mono">
          <div>
            <span className="block text-slate-400 font-sans mb-0.5">输入色域 / 曲线 (Input)</span>
            <span className="text-slate-100 font-semibold">
              {activePipeline.inputColorSpace} · {activePipeline.inputGamma}
            </span>
          </div>
          <div>
            <span className="block text-slate-400 font-sans mb-0.5">工作色彩空间 (Working Space)</span>
            <span className="text-amber-300 font-semibold">{activePipeline.workingSpace}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-sans mb-0.5">交付目标色域 (Output Space)</span>
            <span className="text-emerald-400 font-semibold">{activePipeline.targetSpace}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-sans mb-0.5">输出伽马标准 (Output EOTF)</span>
            <span className="text-slate-100 font-semibold">{activePipeline.targetGamma}</span>
          </div>
        </div>

        {/* Visual Node Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
          {activePipeline.nodes.map((node, index) => (
            <div
              key={node.nodeIndex}
              className="bg-slate-950/90 border border-slate-800 rounded-lg p-4 flex flex-col justify-between relative"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-semibold text-amber-400">
                    Node {node.nodeIndex}
                  </span>
                  {index < activePipeline.nodes.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 hidden md:block" />
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">{node.label}</h3>
                <p className="text-xs text-slate-400 font-mono mb-3">{node.operator}</p>
                <ul className="space-y-1 text-xs text-slate-300 mb-3">
                  {node.settings.map((s, idx) => (
                    <li key={idx} className="font-mono text-[11px] leading-relaxed text-slate-300">
                      • {s}
                    </li>
                  ))}
                </ul>
              </div>
              <p className="text-[11px] text-amber-300/90 pt-2.5 border-t border-slate-800/80">
                {node.criticalNote}
              </p>
            </div>
          ))}
        </div>

        {/* Color Pitfall Diagnostics */}
        <div className="bg-slate-950 border border-slate-800 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">
            常见色彩事故与 LUT 挂载错误排查表 (Color Science Diagnostics)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {activePipeline.commonPitfalls.map((pitfall, idx) => (
              <div key={idx} className="bg-slate-900/70 border border-slate-800/80 rounded-lg p-3.5 text-xs space-y-2">
                <div className="font-semibold text-rose-300">现象：{pitfall.symptom}</div>
                <div className="text-slate-400">
                  <span className="text-slate-200 font-medium">根因诊断：</span>
                  {pitfall.rootCause}
                </div>
                <div className="text-emerald-300 pt-1 border-t border-slate-800">
                  <span className="font-semibold">修复方案：</span>
                  {pitfall.fix}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Codec Comparison Matrix & Active Workflow Protection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 8 Cols: Codec Comparison Matrix */}
        <section className="lg:col-span-8 bg-slate-900/70 border border-slate-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <Film className="w-4 h-4 text-amber-400 shrink-0" />
              <h2 className="text-base font-semibold text-slate-100">
                02. 工业编解码器 (Intra-frame vs Long-GOP) 参数与风险对比表
              </h2>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              {(['all', 'Intra-frame', 'Long-GOP'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedCodecFilter(filter)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedCodecFilter === filter
                      ? 'bg-slate-800 text-amber-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter === 'all' ? '全部编码' : filter}
                </button>
              ))}
            </div>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <th className="py-2.5 px-3 font-medium">编码名称与容器</th>
                  <th className="py-2.5 px-3 font-medium">压缩方式</th>
                  <th className="py-2.5 px-3 font-medium">色彩位深/抽样</th>
                  <th className="py-2.5 px-3 font-medium text-right">4K@24 码率</th>
                  <th className="py-2.5 px-3 font-medium">视效/合成适用度</th>
                  <th className="py-2.5 px-3 font-medium">工业用途与风险提示</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredCodecs.map((codec) => (
                  <tr key={codec.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-100">
                      {codec.name}
                      <span className="block text-[11px] font-normal text-slate-400">{codec.container}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">{codec.compression}</td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {codec.bitDepth} · {codec.chromaSubsampling}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-right text-amber-300">
                      {codec.bitrate4k24Mbps} Mbps
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span
                        className={
                          codec.vfxSuitability === 'Recommended'
                            ? 'text-emerald-400 font-semibold'
                            : 'text-rose-400 font-semibold'
                        }
                      >
                        {codec.vfxSuitability === 'Recommended' ? '推荐 (Recommended)' : '严禁 (Prohibited)'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs">
                      <p className="mb-1">{codec.bestUseCase}</p>
                      <p className="text-amber-300/90 text-[11px]">{codec.riskAdvisory}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right 4 Cols: Proactive Protection Workflow Validator */}
        <section className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <h2 className="text-base font-semibold text-slate-100">
                03. 主动编码合规拦截器
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              选择您当前准备执行的后期环节，核查工业标准编码与严禁触碰的红线：
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { id: 'vfx_comp', label: '复杂视效 / 抠像合成' },
                { id: 'multicam_edit', label: '多机位同步粗剪' },
                { id: 'color_master', label: 'DI 调色母版交付' },
                { id: 'client_review', label: '客户审片样片导出' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTaskCheck(item.id as typeof activeTaskCheck)}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-left transition-colors cursor-pointer ${
                    activeTaskCheck === item.id
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3 text-xs">
              <h3 className="text-sm font-semibold text-slate-100">{taskRecommendation.title}</h3>
              <div className="flex items-start gap-2 text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">工业标准推荐：</span>
                  <span className="font-mono">{taskRecommendation.recommended}</span>
                </div>
              </div>
              <div className="flex items-start gap-2 text-rose-300">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">严禁违规方案：</span>
                  <span className="font-mono">{taskRecommendation.prohibited}</span>
                </div>
              </div>
              <p className="text-slate-300 pt-2 border-t border-slate-800 leading-relaxed">
                {taskRecommendation.reason}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
