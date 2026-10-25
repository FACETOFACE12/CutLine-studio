import React, { useState, useMemo } from 'react';
import {
  CAMERA_PROFILES,
  generateStandardFolderStructure,
  buildStandardFilename,
  auditBatchFilenames,
  calculateTimecodeSync,
  calculateProxyStorageEstimate
} from '../utils/postProductionEngine';
import { FolderTree, FileCheck2, Clock, HardDrive, Copy, Check, AlertTriangle } from 'lucide-react';
import { SmpteTimecodeCalculator } from './SmpteTimecodeCalculator';

interface AssetGovernanceViewProps {
  projectCode: string;
  onProjectCodeChange: (code: string) => void;
}

export const AssetGovernanceView: React.FC<AssetGovernanceViewProps> = ({
  projectCode,
  onProjectCodeChange
}) => {
  // 1. Folder Structure State
  const [shootDays, setShootDays] = useState<number>(3);
  const [cameraUnitsInput, setCameraUnitsInput] = useState<string>('A_CAM, B_CAM');
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // 2. Naming Convention State
  const [scene, setScene] = useState<string>('SC04');
  const [shot, setShot] = useState<string>('SH012');
  const [cameraUnit, setCameraUnit] = useState<string>('CAMA');
  const [take, setTake] = useState<string>('T03');
  const [version, setVersion] = useState<string>('v01');
  const [extension, setExtension] = useState<string>('mov');

  // Batch Naming Auditor State
  const [batchInput, setBatchInput] = useState<string>(
    `C0001.MP4\n${projectCode}_SC04_SH012_CAMA_T01_v01.mov\n广告正片_精剪_Final_终版2.mp4\nA002_C015_20261024 Temp.mov`
  );

  // 3. Timecode Sync State
  const [videoTc, setVideoTc] = useState<string>('01:00:10:00');
  const [audioTc, setAudioTc] = useState<string>('01:00:11:12');
  const [videoFps, setVideoFps] = useState<number>(23.976);
  const [audioTcFps, setAudioTcFps] = useState<number>(24.0);
  const [audioSampleRateHz, setAudioSampleRateHz] = useState<number>(48000);

  // 4. Proxy Strategy State
  const [selectedCameraId, setSelectedCameraId] = useState<string>('sony-fx3-a7s3');
  const [shootHours, setShootHours] = useState<number>(12);

  const cameraUnits = useMemo(
    () =>
      cameraUnitsInput
        .split(',')
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean),
    [cameraUnitsInput]
  );

  const folderStructure = useMemo(
    () => generateStandardFolderStructure(projectCode, shootDays, cameraUnits.length ? cameraUnits : ['A_CAM']),
    [projectCode, shootDays, cameraUnits]
  );

  const namingResult = useMemo(
    () =>
      buildStandardFilename({
        projectCode,
        scene,
        shot,
        cameraUnit,
        take,
        version,
        extension
      }),
    [projectCode, scene, shot, cameraUnit, take, version, extension]
  );

  const batchAuditResults = useMemo(
    () => auditBatchFilenames(batchInput.split('\n'), projectCode),
    [batchInput, projectCode]
  );

  const tcSyncResult = useMemo(
    () =>
      calculateTimecodeSync({
        videoTc,
        audioTc,
        videoFps,
        audioTcFps,
        audioSampleRateHz
      }),
    [videoTc, audioTc, videoFps, audioTcFps, audioSampleRateHz]
  );

  const proxyEstimate = useMemo(
    () => calculateProxyStorageEstimate(selectedCameraId, shootHours),
    [selectedCameraId, shootHours]
  );

  const mkdirCommand = useMemo(() => {
    const allPaths = folderStructure.flatMap((node) => node.children.map((c) => `${projectCode}/${c.path}`));
    return `mkdir -p \\\n  ${allPaths.map((p) => `"${p}"`).join(' \\\n  ')}`;
  }, [folderStructure, projectCode]);

  const handleCopyScript = () => {
    navigator.clipboard?.writeText(mkdirCommand).catch(() => {});
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 1800);
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <p className="text-xs text-amber-400/90 font-mono mb-1">
            01 · 资产管理与文件治理 · Asset Governance & Proxy Pipeline
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
            好莱坞工业级工程架构、命名审计与双系统时间码对齐
          </h1>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 font-mono tabular-nums">
          <span>DIT 校验标准: XXHash64 MHL</span>
          <span aria-hidden="true">·</span>
          <span>音频基准: 48kHz / 24-bit BWF</span>
          <span aria-hidden="true">·</span>
          <span>代理基准: Intra-frame ProRes / DNxHR</span>
        </div>
      </div>

      {/* Grid Row 1: Folder Governance + Naming Convention Auditor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 6 Cols: Folder Tree Builder */}
        <section className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <FolderTree className="w-4 h-4 text-amber-400 shrink-0" />
                <h2 className="text-base font-semibold text-slate-100">
                  01. 标准工程目录树生成器 (Directory Governance)
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                6 Root Bins · POSIX Safe
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              <div>
                <label htmlFor="project-code-input" className="block text-xs text-slate-400 mb-1.5">
                  项目代号 (Project Code)
                </label>
                <input
                  id="project-code-input"
                  type="text"
                  value={projectCode}
                  onChange={(e) => onProjectCodeChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="ORION26"
                />
              </div>
              <div>
                <label htmlFor="shoot-days-input" className="block text-xs text-slate-400 mb-1.5">
                  拍摄天数 (Shoot Days)
                </label>
                <input
                  id="shoot-days-input"
                  type="number"
                  min={1}
                  max={10}
                  value={shootDays}
                  onChange={(e) => setShootDays(Number(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="camera-units-input" className="block text-xs text-slate-400 mb-1.5">
                  机位标识 (Camera Units)
                </label>
                <input
                  id="camera-units-input"
                  type="text"
                  value={cameraUnitsInput}
                  onChange={(e) => setCameraUnitsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="A_CAM, B_CAM"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {folderStructure.map((node) => (
                <div key={node.code} className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-3.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-amber-300 font-mono">
                      /{projectCode}/{node.code}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      规范: {node.namingRule}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-2.5">{node.description}</p>
                  <div className="space-y-1 border-t border-slate-800/80 pt-2">
                    {node.children.slice(0, 4).map((child) => (
                      <div key={child.path} className="flex items-start justify-between gap-3 text-xs">
                        <code className="text-slate-200 font-mono shrink-0">{child.path}</code>
                        <span className="text-slate-400 text-right">{child.purpose}</span>
                      </div>
                    ))}
                    {node.children.length > 4 && (
                      <p className="text-xs text-slate-400 font-mono pt-1">
                        + 另有 {node.children.length - 4} 个分卡子目录已按机位展开
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
            <div className="text-xs text-slate-400 font-mono truncate">
              终端一键建库命令: <span className="text-slate-200">mkdir -p &quot;{projectCode}/01_Footage/...&quot;</span>
            </div>
            <button
              type="button"
              onClick={handleCopyScript}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? '已复制建库脚本' : '复制 Shell 建库脚本'}</span>
            </button>
          </div>
        </section>

        {/* Right 6 Cols: Naming Convention Generator & Batch Auditor */}
        <section className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-4 h-4 text-amber-400 shrink-0" />
                <h2 className="text-base font-semibold text-slate-100">
                  02. 镜头/版本命名生成器与批量合规审计
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                零中文 · 零空格 · 严禁 Final
              </span>
            </div>

            {/* Interactive Single Slate Builder */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-4">
              <div>
                <label htmlFor="scene-input" className="block text-xs text-slate-400 mb-1">
                  场次 (Scene)
                </label>
                <input
                  id="scene-input"
                  type="text"
                  value={scene}
                  onChange={(e) => setScene(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="shot-input" className="block text-xs text-slate-400 mb-1">
                  镜号 (Shot)
                </label>
                <input
                  id="shot-input"
                  type="text"
                  value={shot}
                  onChange={(e) => setShot(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="cam-unit-input" className="block text-xs text-slate-400 mb-1">
                  机位 (Cam)
                </label>
                <input
                  id="cam-unit-input"
                  type="text"
                  value={cameraUnit}
                  onChange={(e) => setCameraUnit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="take-input" className="block text-xs text-slate-400 mb-1">
                  次数 (Take)
                </label>
                <input
                  id="take-input"
                  type="text"
                  value={take}
                  onChange={(e) => setTake(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label htmlFor="version-input" className="block text-xs text-slate-400 mb-1">
                  版本 (Version)
                </label>
                <input
                  id="version-input"
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 mb-5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <span className="text-xs text-slate-400">工业标准命名输出 (Standardized Slate ID)</span>
                <div className="flex items-center gap-2">
                  <select
                    aria-label="文件容器扩展名"
                    value={extension}
                    onChange={(e) => setExtension(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs font-mono text-slate-200"
                  >
                    <option value="mov">.mov (ProRes)</option>
                    <option value="mxf">.mxf (DNxHR / OP-Atom)</option>
                    <option value="exr">.exr (ACES Linear VFX)</option>
                    <option value="wav">.wav (48kHz 24-bit BWF)</option>
                  </select>
                  <span
                    className={`text-xs font-mono ${
                      namingResult.isValid ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {namingResult.isValid ? '合规通过 (PASS)' : '已自动纠偏 (SANITIZED)'}
                  </span>
                </div>
              </div>
              <div
                data-testid="standardized-filename-output"
                className="text-base font-mono font-semibold text-amber-300 break-all"
              >
                {namingResult.standardizedSuggestion}
              </div>
              {namingResult.issues.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-rose-400">
                  {namingResult.issues.map((issue, idx) => (
                    <li key={idx}>• {issue}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Batch Auditor */}
            <div>
              <label htmlFor="batch-filenames-textarea" className="block text-xs text-slate-400 mb-1.5">
                批量素材/序列文件名合规扫描（每行一个文件名，自动拦截相机裸名 C0001 与 Final 乱象）：
              </label>
              <textarea
                id="batch-filenames-textarea"
                rows={3}
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-500 mb-3"
              />
              <div className="border border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <th className="py-2 px-3 font-medium">原始文件名</th>
                      <th className="py-2 px-3 font-medium">审计状态与隐患</th>
                      <th className="py-2 px-3 font-medium">重命名建议</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 font-mono">
                    {batchAuditResults.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-800/30">
                        <td className="py-2 px-3 text-slate-200 break-all">{item.filename}</td>
                        <td className="py-2 px-3 font-sans">
                          {item.isValid ? (
                            <span className="text-emerald-400">符合工业规范</span>
                          ) : (
                            <span className="text-rose-400">{item.issues.join('；')}</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-amber-300 break-all">{item.standardizedSuggestion}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Grid Row 2: Dual-System Timecode Sync + Proxy Strategy Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 6 Cols: Timecode Sync & Drift Diagnostic */}
        <section className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <h2 className="text-base font-semibold text-slate-100">
                  03. 多机位与双系统录音时间码 (SMPTE Timecode) 同步计算器
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono tabular-nums">
                Pull-down Drift Guard
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label htmlFor="video-tc-input" className="block text-xs text-slate-400 mb-1">
                  摄影机打板时间码 (Video TC)
                </label>
                <input
                  id="video-tc-input"
                  type="text"
                  value={videoTc}
                  onChange={(e) => setVideoTc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="01:00:10:00"
                />
              </div>
              <div>
                <label htmlFor="audio-tc-input" className="block text-xs text-slate-400 mb-1">
                  独立录音打板时间码 (Audio TC)
                </label>
                <input
                  id="audio-tc-input"
                  type="text"
                  value={audioTc}
                  onChange={(e) => setAudioTc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="01:00:11:12"
                />
              </div>
              <div>
                <label htmlFor="audio-sr-select" className="block text-xs text-slate-400 mb-1">
                  录音采样率 (Sample Rate)
                </label>
                <select
                  id="audio-sr-select"
                  value={audioSampleRateHz}
                  onChange={(e) => setAudioSampleRateHz(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value={48000}>48,000 Hz (24-bit 标准)</option>
                  <option value={96000}>96,000 Hz (SFX 高采样)</option>
                  <option value={44100}>44,100 Hz (违规 CD 采样率)</option>
                </select>
              </div>
              <div>
                <label htmlFor="video-fps-select" className="block text-xs text-slate-400 mb-1">
                  画面拍摄帧率 (Video FPS)
                </label>
                <select
                  id="video-fps-select"
                  value={videoFps}
                  onChange={(e) => setVideoFps(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value={23.976}>23.976 fps (NTSC Film)</option>
                  <option value={24}>24.000 fps (True Cinema)</option>
                  <option value={25}>25.000 fps (PAL Broadcast)</option>
                  <option value={29.97}>29.970 fps (NTSC)</option>
                </select>
              </div>
              <div>
                <label htmlFor="audio-fps-select" className="block text-xs text-slate-400 mb-1">
                  录音机时间码帧率 (Audio TC FPS)
                </label>
                <select
                  id="audio-fps-select"
                  value={audioTcFps}
                  onChange={(e) => setAudioTcFps(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value={23.976}>23.976 fps</option>
                  <option value={24}>24.000 fps</option>
                  <option value={25}>25.000 fps</option>
                  <option value={29.97}>29.970 fps</option>
                </select>
              </div>
            </div>

            {!tcSyncResult.valid ? (
              <div className="bg-rose-950/40 border border-rose-800 rounded-lg p-4 text-xs text-rose-300">
                {tcSyncResult.error}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3 bg-slate-950 border border-slate-800 rounded-lg p-3.5 font-mono tabular-nums">
                  <div>
                    <span className="block text-xs text-slate-400 font-sans">时间码偏移 (TC Offset)</span>
                    <span className="text-lg font-semibold text-amber-300">{tcSyncResult.offsetTimecode}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-sans">帧偏移量 (Frame Delta)</span>
                    <span className="text-lg font-semibold text-slate-100">
                      {tcSyncResult.offsetFrames > 0 ? `+${tcSyncResult.offsetFrames}` : tcSyncResult.offsetFrames} f
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-400 font-sans">每小时累积漂移 (Drift/hr)</span>
                    <span
                      className={`text-lg font-semibold ${
                        tcSyncResult.driftFramesPerHour > 0 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {tcSyncResult.driftFramesPerHour} 帧/小时
                    </span>
                  </div>
                </div>

                {tcSyncResult.warnings.length > 0 && (
                  <div className="bg-rose-950/30 border border-rose-800/80 rounded-lg p-3.5 space-y-1.5">
                    {tcSyncResult.warnings.map((w, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-rose-300">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-slate-950/70 border border-slate-800 rounded-lg p-3.5">
                  <p className="text-xs font-semibold text-slate-200 mb-2">
                    双系统对齐执行步骤 (Step-by-Step Alignment Protocol)
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {tcSyncResult.syncSteps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right 6 Cols: Proxy & Transcode Strategy */}
        <section className="lg:col-span-6 bg-slate-900/70 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 text-amber-400 shrink-0" />
                <h2 className="text-base font-semibold text-slate-100">
                  04. 原始摄影机代理 (Proxy) 与转码容量计算矩阵
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                3-2-1 Backup Standard
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div className="sm:col-span-2">
                <label htmlFor="camera-profile-select" className="block text-xs text-slate-400 mb-1">
                  原始摄影机与编码格式 (Source Camera & Codec)
                </label>
                <select
                  id="camera-profile-select"
                  value={selectedCameraId}
                  onChange={(e) => setSelectedCameraId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {CAMERA_PROFILES.map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="shoot-hours-input" className="block text-xs text-slate-400 mb-1">
                  预计素材总时长 (小时)
                </label>
                <input
                  id="shoot-hours-input"
                  type="number"
                  min={1}
                  max={500}
                  value={shootHours}
                  onChange={(e) => setShootHours(Number(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono tabular-nums text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 border border-slate-800 rounded-lg p-3.5 mb-4 font-mono tabular-nums">
              <div>
                <span className="block text-xs text-slate-400 font-sans">原片总容量 (OCF)</span>
                <span className="text-base font-semibold text-slate-100">{proxyEstimate.rawGb} GB</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-sans">代理总容量 (Proxy)</span>
                <span className="text-base font-semibold text-emerald-400">{proxyEstimate.proxyGb} GB</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-sans">带宽体积缩减</span>
                <span className="text-base font-semibold text-amber-300">-{proxyEstimate.savingsPercent}%</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 font-sans">建议 RAID 总储备</span>
                <span className="text-base font-semibold text-slate-100">{proxyEstimate.recommendedRaidTb} TB</span>
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-800 pb-2">
                <div>
                  <span className="text-slate-400">推荐代理编码: </span>
                  <span className="text-amber-300 font-mono">{proxyEstimate.profile.recommendedProxyCodec}</span>
                </div>
                <div>
                  <span className="text-slate-400">推荐代理分辨率: </span>
                  <span className="text-slate-200 font-mono">{proxyEstimate.profile.proxyResolution}</span>
                </div>
                <div>
                  <span className="text-slate-400">原始色彩空间: </span>
                  <span className="text-slate-200 font-mono">
                    {proxyEstimate.profile.colorSpace} / {proxyEstimate.profile.gammaCurve}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">压缩架构类型: </span>
                  <span className="text-slate-200 font-mono">{proxyEstimate.profile.compressionType}</span>
                </div>
              </div>
              <div>
                <span className="font-semibold text-slate-200">色彩还原与 LUT 挂载策略：</span>
                <span className="text-slate-300">{proxyEstimate.profile.lutStrategy}</span>
              </div>
              <div className="text-amber-300/95">
                <span className="font-semibold">总监级技术预警：</span>
                {proxyEstimate.profile.workflowWarning}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Row 3: SMPTE Timecode Frame-Rate Converter & Duration Calculator */}
      <SmpteTimecodeCalculator />
    </div>
  );
};
