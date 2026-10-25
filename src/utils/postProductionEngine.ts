export interface NamingSpecInput {
  projectCode: string;
  scene: string;
  shot: string;
  cameraUnit: string;
  take: string;
  version: string;
  extension: string;
}

export interface NamingAuditResult {
  filename: string;
  isValid: boolean;
  riskLevel: 'nominal' | 'warning' | 'critical';
  issues: string[];
  standardizedSuggestion: string;
}

export interface FolderNode {
  code: string;
  name: string;
  description: string;
  namingRule: string;
  children: { path: string; purpose: string }[];
}

export interface CameraFormatProfile {
  id: string;
  name: string;
  sensorResolution: string;
  nativeCodec: string;
  compressionType: 'RAW' | 'Intra-frame' | 'Long-GOP';
  colorSpace: string;
  gammaCurve: string;
  nativeBitrateMbps: number;
  recommendedProxyCodec: string;
  proxyResolution: string;
  proxyBitrateMbps: number;
  workflowWarning: string;
  lutStrategy: string;
}

export interface TimecodeSyncResult {
  valid: boolean;
  error?: string;
  videoTotalFrames: number;
  audioTotalFrames: number;
  offsetFrames: number;
  offsetTimecode: string;
  direction: 'audio_ahead' | 'audio_behind' | 'in_sync';
  driftFramesPerHour: number;
  hasPullDownRisk: boolean;
  hasSampleRateMismatch: boolean;
  warnings: string[];
  syncSteps: string[];
}

export interface SmpteConversionInput {
  sourceTc: string;
  secondaryTc: string;
  operation: 'span' | 'add' | 'subtract';
  sourceFps: number;
  targetFps: number;
  handleFrames: number;
}

export interface SmpteConversionResult {
  valid: boolean;
  error?: string;
  sourceTimebase: number;
  targetTimebase: number;
  sourceTotalFrames: number;
  secondaryTotalFrames: number;
  // Converted primary timecode in Target FPS
  targetTcFrameMatch: string; // 1:1 frame count mapped to target timebase
  targetTcRealtime: string; // Constant real-time duration resampled to target FPS
  targetRealtimeFrames: number;
  // Real-world duration of sourceTc
  sourceRealSeconds: number;
  sourceRealFormatted: string; // HH:MM:SS.mmm
  targetFrameMatchRealSeconds: number;
  targetFrameMatchRealFormatted: string;
  // Span / Arithmetic result between sourceTc and secondaryTc
  resultFramesSource: number;
  resultTcSource: string;
  resultFramesTargetRealtime: number;
  resultTcTargetRealtime: string;
  resultTcTargetFrameMatch: string;
  resultRealSeconds: number;
  resultRealFormatted: string;
  // Handles for VFX / Sound turnover
  handleFramesPerSide: number;
  totalFramesWithHandlesSource: number;
  totalTcWithHandlesSource: string;
  totalFramesWithHandlesTarget: number;
  totalTcWithHandlesTarget: string;
  // Speed & Pitch metrics for frame-for-frame conform
  speedRatioPercent: number;
  speedDeltaPercent: number;
  pitchShiftSemitones: number;
  conformAdvisory: string;
}

export interface CodecSpec {
  id: string;
  name: string;
  container: string;
  compression: 'Intra-frame' | 'Long-GOP' | 'RAW';
  bitDepth: string;
  chromaSubsampling: string;
  cpuDecodeLoad: 'Low' | 'Medium' | 'Extreme';
  vfxSuitability: 'Recommended' | 'Acceptable' | 'Prohibited';
  bitrate1080p24Mbps: number;
  bitrate4k24Mbps: number;
  bestUseCase: string;
  riskAdvisory: string;
}

export interface ColorPipelineNode {
  nodeIndex: string;
  label: string;
  operator: string;
  settings: string[];
  criticalNote: string;
}

export interface ColorPipelineSpec {
  sourceId: string;
  sourceLabel: string;
  inputColorSpace: string;
  inputGamma: string;
  workingSpace: string;
  targetSpace: string;
  targetGamma: string;
  nodes: ColorPipelineNode[];
  commonPitfalls: { symptom: string; rootCause: string; fix: string }[];
}

export interface NLEDiagnosticCase {
  id: string;
  nle: 'DaVinci Resolve' | 'Premiere Pro' | 'Final Cut Pro' | 'Avid Media Composer';
  category: 'media_offline' | 'gpu_render' | 'audio_sync' | 'turnover_xml_aaf';
  title: string;
  errorCodeOrSymptom: string;
  severity: 'Critical' | 'High' | 'Medium';
  rootCauses: string[];
  stepByStepFix: string[];
  preventionChecklist: string[];
}

export interface HardwareTelemetryInput {
  gpuTempC: number;
  cpuTempC: number;
  vramUsedGb: number;
  vramTotalGb: number;
  ramUsedGb: number;
  ramTotalGb: number;
  storageReadMbps: number;
  activeStreams: number;
  activeCodecType: 'RAW' | 'Intra-frame' | 'Long-GOP';
}

export interface HardwareRiskAssessment {
  overallStatus: 'Nominal' | 'Warning' | 'Critical';
  thermalThrottleRisk: boolean;
  vramOomRisk: boolean;
  diskBottleneckRisk: boolean;
  requiredBandwidthMbps: number;
  vramUsagePercent: number;
  ramUsagePercent: number;
  alerts: { level: 'Warning' | 'Critical'; component: string; message: string; mitigation: string }[];
}

export const CAMERA_PROFILES: CameraFormatProfile[] = [
  {
    id: 'arri-alexa35',
    name: 'ARRI Alexa 35 (ARRIRAW / ProRes 4444)',
    sensorResolution: '4608 × 3164 (4.6K Open Gate)',
    nativeCodec: 'ARRIRAW (.mxf) / ProRes 4444 XQ',
    compressionType: 'RAW',
    colorSpace: 'ARRI Wide Gamut 4 (AWG4)',
    gammaCurve: 'ARRI LogC4',
    nativeBitrateMbps: 2650,
    recommendedProxyCodec: 'Apple ProRes 422 Proxy / DNxHR LB',
    proxyResolution: '2048 × 1152 (2K DCI) or 1920 × 1080',
    proxyBitrateMbps: 45,
    workflowWarning: '切勿将 LogC3 LUT 挂载于 LogC4 素材上，会导致高光严重断层与暗部死黑。必须在 DaVinci Resolve 或 ARRI Reference Tool 中使用官方 ARRI LogC4 to Rec.709 3D LUT。',
    lutStrategy: 'In-Camera ALF-4 或 CST (AWG4 / LogC4 -> Rec.709 Gamma 2.4)'
  },
  {
    id: 'red-vraptor',
    name: 'RED V-Raptor 8K VV (REDCODE RAW)',
    sensorResolution: '8192 × 4320 (8K 17:9)',
    nativeCodec: 'REDCODE RAW (.R3D) HQ/MQ',
    compressionType: 'RAW',
    colorSpace: 'REDWideGamutRGB (RWG)',
    gammaCurve: 'Log3G10',
    nativeBitrateMbps: 2240,
    recommendedProxyCodec: 'Apple ProRes 422 Proxy (MOV)',
    proxyResolution: '2048 × 1080 (2K DCI)',
    proxyBitrateMbps: 45,
    workflowWarning: 'R3D 跨卷分割文件（_001.R3D, _002.R3D）严禁脱离原 .RDC 文件夹单独移动，否则导致元数据丢失与 Premiere/Avid 媒体离线。',
    lutStrategy: 'IPP2 流程：RWG / Log3G10 + Medium Contrast + Highlight Roll-Off Soft'
  },
  {
    id: 'sony-fx9-venice',
    name: 'Sony VENICE 2 / FX9 (X-OCN XT / XAVC-I)',
    sensorResolution: '6054 × 3192 (6K) / 3840 × 2160 (UHD)',
    nativeCodec: 'X-OCN XT (.mxf) / XAVC Intra 10-bit 4:2:2',
    compressionType: 'Intra-frame',
    colorSpace: 'S-Gamut3.Cine',
    gammaCurve: 'S-Log3',
    nativeBitrateMbps: 600,
    recommendedProxyCodec: 'Apple ProRes 422 Proxy / DNxHR LB',
    proxyResolution: '1920 × 1080 (FHD)',
    proxyBitrateMbps: 45,
    workflowWarning: '严格区分 S-Gamut3 与 S-Gamut3.Cine。若将 S-Log3/S-Gamut3.Cine 错误按 S-Gamut3 解算，肤色会出现明显品红/青色偏移。',
    lutStrategy: 'Sony Official SLog3_SGamut3.Cine_To_LC-709TypeA 或 CST 节点转换'
  },
  {
    id: 'sony-fx3-a7s3',
    name: 'Sony FX3 / A7S III (XAVC S / HS Long-GOP)',
    sensorResolution: '3840 × 2160 (UHD)',
    nativeCodec: 'H.265 / HEVC 10-bit 4:2:2 Long-GOP (.mp4)',
    compressionType: 'Long-GOP',
    colorSpace: 'S-Gamut3.Cine',
    gammaCurve: 'S-Log3',
    nativeBitrateMbps: 200,
    recommendedProxyCodec: 'Apple ProRes 422 Proxy (强制转码)',
    proxyResolution: '1920 × 1080 (FHD)',
    proxyBitrateMbps: 45,
    workflowWarning: '高危预警：H.265 10-bit 4:2:2 Long-GOP 编码依赖前后帧预测，直接在时间线上做多机位剪辑或视效合成会导致严重的回放掉帧与导出崩溃。必须全量生成 Intra-frame 代理（ProRes Proxy）并保留双声道匹配。',
    lutStrategy: '代理阶段挂载查看 LUT（不烧录进母版），精剪回批（Online）使用 CST 还原'
  },
  {
    id: 'canon-c500mk2',
    name: 'Canon EOS C500 Mark II / C70 (Cinema RAW Light / XF-AVC)',
    sensorResolution: '5952 × 3140 (5.9K) / 4096 × 2160',
    nativeCodec: 'Cinema RAW Light (.CRM) / XF-AVC Intra',
    compressionType: 'RAW',
    colorSpace: 'Canon Cinema Gamut',
    gammaCurve: 'Canon Log 2 / Canon Log 3',
    nativeBitrateMbps: 1000,
    recommendedProxyCodec: 'DNxHR LB (.mxf) / ProRes 422 Proxy',
    proxyResolution: '2048 × 1080 or 1920 × 1080',
    proxyBitrateMbps: 45,
    workflowWarning: 'Canon Log 2 拥有 16+ 档动态范围但暗部噪点敏感；Canon Log 3 暗部更干净但高光宽容度略低。交接调色时必须在场记单（Camera Report）中明确标注 C-Log2 或 C-Log3。',
    lutStrategy: 'CinemaGamut_CanonLog3-to-BT709_WideDR_33_FF_Ver.2.0'
  }
];

export const CODEC_DATABASE: CodecSpec[] = [
  {
    id: 'prores-422-hq',
    name: 'Apple ProRes 422 HQ',
    container: '.mov',
    compression: 'Intra-frame',
    bitDepth: '10-bit',
    chromaSubsampling: '4:2:2',
    cpuDecodeLoad: 'Low',
    vfxSuitability: 'Recommended',
    bitrate1080p24Mbps: 176,
    bitrate4k24Mbps: 707,
    bestUseCase: '工业级调色母版交付（DI Master）、广告正片无损交接、绿幕抠像与长片精剪母带。',
    riskAdvisory: '无帧间压缩，单帧独立解码极快；注意 Windows 非授权编码器可能引发 Gamma 偏移，建议使用官方认证流程。'
  },
  {
    id: 'prores-422-proxy',
    name: 'Apple ProRes 422 Proxy',
    container: '.mov',
    compression: 'Intra-frame',
    bitDepth: '10-bit',
    chromaSubsampling: '4:2:2',
    cpuDecodeLoad: 'Low',
    vfxSuitability: 'Prohibited',
    bitrate1080p24Mbps: 36,
    bitrate4k24Mbps: 145,
    bestUseCase: '粗剪（Offline Editing）、多机位同步剪辑、审片带（Burn-in Timecode）快速流转。',
    riskAdvisory: '严禁忘记在导出正片前切换回原片（Full Res Relink）！交付前必须执行 Offline/Proxy 状态核查。'
  },
  {
    id: 'dnxhr-hqx',
    name: 'Avid DNxHR HQX',
    container: '.mxf (OP-Atom / OP1a) / .mov',
    compression: 'Intra-frame',
    bitDepth: '10-bit / 12-bit',
    chromaSubsampling: '4:2:2',
    bitrate1080p24Mbps: 175,
    bitrate4k24Mbps: 700,
    cpuDecodeLoad: 'Low',
    vfxSuitability: 'Recommended',
    bestUseCase: 'Avid Media Composer 多机房协同制作、好莱坞长片套底交接、跨平台 Windows/Linux DI 流程。',
    riskAdvisory: '生成 Avid MediaFiles/MXF/1 目录时，文件必须采用数字命名目录，否则 Avid 无法自动重建 .pmr/.mdb 数据库索引。'
  },
  {
    id: 'h265-long-gop',
    name: 'H.265 / HEVC (10-bit 4:2:2 Long-GOP)',
    container: '.mp4 / .mov',
    compression: 'Long-GOP',
    bitDepth: '10-bit',
    chromaSubsampling: '4:2:2',
    cpuDecodeLoad: 'Extreme',
    vfxSuitability: 'Prohibited',
    bitrate1080p24Mbps: 50,
    bitrate4k24Mbps: 150,
    bestUseCase: '无反相机机内录制采集、客户端样片网络审阅传输。',
    riskAdvisory: '主动防护警告：严禁直接用 Long-GOP H.265 素材进行复杂 Fusion/AE 视效合成或多轨变速！帧间预测会导致时间线回放卡死、渲染精度丢失甚至缓存崩溃。必须先转码为 ProRes 422 HQ 或 EXR 序列。'
  },
  {
    id: 'h264-delivery',
    name: 'H.264 / AVC (8-bit 4:2:0 Long-GOP)',
    container: '.mp4',
    compression: 'Long-GOP',
    bitDepth: '8-bit',
    chromaSubsampling: '4:2:0',
    cpuDecodeLoad: 'Medium',
    vfxSuitability: 'Prohibited',
    bitrate1080p24Mbps: 25,
    bitrate4k24Mbps: 65,
    bestUseCase: '最终网络流媒体发布、Frame.io 审片上传、客户微信/飞书预览。',
    riskAdvisory: '8-bit 4:2:0 极其脆弱，禁止用于二次调色（会出现严重色彩断层 Banding）。导出时建议开启 2-Pass VBR 或硬件 CBR 25-50Mbps，并在 Mac 上勾选 Rec.709-A 标签修正。'
  }
];

export const COLOR_PIPELINES: Record<string, ColorPipelineSpec> = {
  'slog3-rec709': {
    sourceId: 'slog3-rec709',
    sourceLabel: 'Sony S-Log3 → Rec.709',
    inputColorSpace: 'Sony S-Gamut3.Cine',
    inputGamma: 'Sony S-Log3',
    workingSpace: 'DaVinci Wide Gamut / Intermediate',
    targetSpace: 'Rec.709',
    targetGamma: 'Gamma 2.4 (Broadcast) / Rec.709-A (macOS QuickTime)',
    nodes: [
      {
        nodeIndex: '01',
        label: 'NR / Lens Fix',
        operator: 'Spatial & Temporal Noise Reduction',
        settings: ['Temporal NR: 2 Frames, Threshold 6.0', 'Placed BEFORE CST Input so noise is evaluated in clean sensor Log state'],
        criticalNote: '降噪节点必须置于色彩转换最前端，但建议在粗调完成后最后开启以节省 GPU 显存。'
      },
      {
        nodeIndex: '02',
        label: 'CST In (Log → DWG)',
        operator: 'Color Space Transform',
        settings: [
          'Input Color Space: Sony S-Gamut3.Cine',
          'Input Gamma: Sony S-Log3',
          'Output Color Space: DaVinci Wide Gamut',
          'Output Gamma: DaVinci Intermediate',
          'Tone Mapping: None (preserve full dynamic range)'
        ],
        criticalNote: '将数据从相机色彩空间无损映射至超大工作空间 DaVinci Wide Gamut。'
      },
      {
        nodeIndex: '03',
        label: 'Exposure & Balance',
        operator: 'HDR Wheels / Offset & Temp/Tint',
        settings: ['Use Global Offset for exposure shifts', 'Adjust Printer Lights or Temp/Tint before primary contrast'],
        criticalNote: 'S-Log3 拍摄常向右曝光 (+1.3~+1.7 EV)，必须在此节点使用 Offset 先拉回标准中间灰 (41% IRE)。'
      },
      {
        nodeIndex: '04',
        label: 'Primary Grade & Skin',
        operator: 'Lift / Gamma / Gain + Qualifier',
        settings: ['Pivot: 0.435 (DaVinci Intermediate Mid-Gray)', 'Skin Tone Line alignment on Vectorscope'],
        criticalNote: '所有二级调色、选区与曲线均在节点 03~05（CST In 与 CST Out 之间）完成。'
      },
      {
        nodeIndex: '05',
        label: 'CST Out (DWG → Rec.709)',
        operator: 'Color Space Transform',
        settings: [
          'Input Color Space: DaVinci Wide Gamut',
          'Input Gamma: DaVinci Intermediate',
          'Output Color Space: Rec.709',
          'Output Gamma: Gamma 2.4',
          'Tone Mapping: DaVinci (Luminance Mapping, Max 100 nits)',
          'Gamut Mapping: Saturation Compression'
        ],
        criticalNote: '严禁在 CST Out 之后再叠加技术还原 LUT！这会导致高光死白与对比度翻倍。'
      }
    ],
    commonPitfalls: [
      {
        symptom: '画面发灰、饱和度极低、对比度缺失',
        rootCause: '未挂载色彩空间转换（CST）或代理生成时遗漏了查看 LUT，将 Log 信号直接按 Rec.709 解释。',
        fix: '在 DaVinci Resolve 节点树首尾建立 CST 节点，或在 Premiere Pro 的“修改 -> 解释素材 -> 色彩管理”中将输入 LUT 设为无、色彩空间覆盖为 Rec.709 并使用 Lumetri 的正确技术还原。'
      },
      {
        symptom: '画面死黑、高光截断、肤色过度浓艳（像烤焦）',
        rootCause: '双重色彩转换（Double LUT）：项目已开启 ACES / RCM 自动色彩管理，又在节点或剪辑轨道上手动挂载了 709 还原 LUT。',
        fix: '检查剪辑属性（Clip Attributes）或时间线色彩管理设置，移除重复的 3D LUT，保持全流程有且仅有一次 Log 到 Rec.709 映射。'
      },
      {
        symptom: '导出后在 Mac QuickTime 播放器看明显发灰、泛白（Gamma Shift）',
        rootCause: 'macOS ColorSync 默认使用 Gamma 1.96 解析标准 Rec.709 标签，与调色监视器的 Gamma 2.4 存在约 0.44 的幂差。',
        fix: '在 DaVinci Resolve 交付页面（Deliver）的高级设置中，将色彩空间标签设为 Rec.709，Gamma 标签显式设为 Rec.709-A（NCLC 1-1-1），使 QuickTime 与调色视窗一致。'
      }
    ]
  },
  'logc4-aces': {
    sourceId: 'logc4-aces',
    sourceLabel: 'ARRI LogC4 → ACEScct',
    inputColorSpace: 'ARRI Wide Gamut 4',
    inputGamma: 'ARRI LogC4',
    workingSpace: 'ACEScct (AP1)',
    targetSpace: 'Rec.709 (100 nits)',
    targetGamma: 'BT.1886 / Gamma 2.4',
    nodes: [
      {
        nodeIndex: '01',
        label: 'ACES IDT',
        operator: 'ACES Input Transform',
        settings: ['ACES Version: 1.3', 'Input Transform: ARRI LogC4', 'Gamut Compress: Reference Gamut Compression ON'],
        criticalNote: '针对现场高饱和霓虹灯或蓝色 LED 灯光，必须勾选 ACES 1.3 Reference Gamut Compression 防止品红溢出。'
      },
      {
        nodeIndex: '02',
        label: 'Exposure Offset',
        operator: 'Master Offset Wheel',
        settings: ['Linear-like photometric exposure in ACEScct', 'Mid-gray anchored at 18% reflectance'],
        criticalNote: 'ACEScct 包含暗部 Toe 曲线，使用 Lift/Gamma/Gain 手感接近传统胶片配光。'
      },
      {
        nodeIndex: '03',
        label: 'Creative Look / LMT',
        operator: 'Look Modification Transform',
        settings: ['Film Emulation (ACES-compliant LMT only)', 'Do NOT apply Rec.709 creative LUTs directly inside ACEScct'],
        criticalNote: '若需使用传统 Rec.709 风格 LUT，必须先在复合节点内转换至 Rec.709 再转回 ACES，不可直接裸挂。'
      },
      {
        nodeIndex: '04',
        label: 'ACES ODT',
        operator: 'ACES Output Transform',
        settings: ['Output Transform: Rec.709 (100 nits) dim surround', 'D65 White Point'],
        criticalNote: '交付院线 DCP 时只需将 ODT 切换为 P3-D65 ST2084 或 DCI-P3，无需重做前面节点的调色。'
      }
    ],
    commonPitfalls: [
      {
        symptom: 'Alexa 35 素材套用老款 Alexa Mini LUT 后画面过暗、中间调塌陷',
        rootCause: 'ARRI LogC4 的中灰点（约 27.8% IRE）低于 LogC3（约 39.1% IRE），混用会导致严重曝光偏暗。',
        fix: '立即替换为 ARRI LogC4 专用 IDT 或 ALF-4 LUT，严禁混用 LogC3 转换矩阵。'
      }
    ]
  },
  'clog3-rec709': {
    sourceId: 'clog3-rec709',
    sourceLabel: 'Canon C-Log3 → Rec.709',
    inputColorSpace: 'Canon Cinema Gamut',
    inputGamma: 'Canon Log 3',
    workingSpace: 'DaVinci Wide Gamut / Intermediate',
    targetSpace: 'Rec.709',
    targetGamma: 'Gamma 2.4',
    nodes: [
      {
        nodeIndex: '01',
        label: 'CST Input',
        operator: 'Color Space Transform',
        settings: ['Input Color Space: Canon Cinema Gamut', 'Input Gamma: Canon Log 3', 'Output: DaVinci Wide Gamut / Intermediate'],
        criticalNote: '确认前期拍摄是 Cinema Gamut 还是 BT.2020 色域，选错会导致红色过度溢出。'
      },
      {
        nodeIndex: '02',
        label: 'White Balance & Exposure',
        operator: 'Chromatic Adaptation / Offset',
        settings: ['Correct green/magenta tint shift common in mixed LED lighting'],
        criticalNote: '在宽色域中间空间修正白平衡最准确。'
      },
      {
        nodeIndex: '03',
        label: 'CST Output',
        operator: 'Color Space Transform',
        settings: ['Input: DaVinci Wide Gamut / Intermediate', 'Output: Rec.709 / Gamma 2.4', 'Gamut Mapping: Saturation Compression'],
        criticalNote: '输出前开启饱和度压缩以平顺过渡高光边缘。'
      }
    ],
    commonPitfalls: [
      {
        symptom: '人物肤色偏红或橘红过饱和',
        rootCause: '机内使用了 BT.709 色域配合 C-Log3，但后期 CST 输入色域错误选择了 Canon Cinema Gamut。',
        fix: '使用 MediaInfo 或 Canon XF Utility 查看元数据中的 Color Matrix，将 CST Input Color Space 改为 Rec.709 或 Rec.2020。'
      }
    ]
  }
};

export const NLE_DIAGNOSTIC_CASES: NLEDiagnosticCase[] = [
  {
    id: 'media-offline-relink',
    nle: 'DaVinci Resolve',
    category: 'media_offline',
    title: '媒体离线 (Media Offline) 与跨盘/代理重链接失败',
    errorCodeOrSymptom: '红屏 Media Offline / 闪烁缺帧 / XML 回批链接到错误同名卡号 (如 A001_C001)',
    severity: 'Critical',
    rootCauses: [
      '盘符或挂载路径变更（如 Windows E:\\ 变为 F:\\，或 macOS /Volumes/RAID_01 盘名被改动）。',
      '索尼/佳能无反相机未改机内卷标，多张 SD 卡均从 C0001.MP4 开始命名，导致回批时同名时间戳冲突。',
      '时间码起始帧不连续或代理转码时帧率（23.976 vs 24.00）被意外改动，导致 Reel Name / Timecode 范围无法命中。',
      'H.265 Long-GOP 文件部分帧解码超时，在时间线上表现为随机单帧闪烁 Media Offline。'
    ],
    stepByStepFix: [
      'Step 1 (路径核查)：在媒体池（Media Pool）全选离线素材 → 右键选择“重新链接所选片段 (Relink Selected Clips)”，勾选“全面搜索子文件夹”，指定正确的 `01_Footage` 根目录。',
      'Step 2 (代理分离)：若代理在线但原片离线，使用“更改源文件夹 (Change Source Folder)”将原路径前缀批量替换为新 RAID 阵列路径。',
      'Step 3 (XML 回批冲突)：在导入 XML 时取消勾选“自动导入源素材”，先将正确场次的原片按分卡目录手动拖入媒体池，并在项目设置 → 常规选项中开启“使用文件名辅助卷名匹配 (Assist using reel names from the: Source clip file pathname)”。',
      'Step 4 (随机闪烁修复)：若文件本身在硬盘中存在但画面偶发红屏，进入项目设置 → 主设置 → 优化媒体和渲染缓存，将渲染缓存格式改为 ProRes 422 HQ，并执行“删除未使用的渲染缓存”。'
    ],
    preventionChecklist: [
      '严禁在拷贝卡（DIT Offload）后直接使用 C0001.MP4 进剪辑，必须保留完整相机卡目录结构或按工业规范添加卷号前缀。',
      '代理转码必须 100% 继承源片的时间码（Source Timecode）、帧率与音轨通道数。',
      '外置项目硬盘统一使用英文加下划线命名（如 `PRJ26_ORION_SHUTTLE_01`），严禁含空格、中文或斜杠。'
    ]
  },
  {
    id: 'gpu-vram-crash',
    nle: 'Premiere Pro',
    category: 'gpu_render',
    title: 'GPU 显存溢出与硬件加速渲染崩溃 (Error Code -1609629695 / CUDA / Metal)',
    errorCodeOrSymptom: '导出中断报错：Error compiling movie / GPU Render Error: Unable to process frame / Out of GPU Memory',
    severity: 'Critical',
    rootCauses: [
      '在 4K/8K 时间线上直接叠加重度特效（Warp Stabilizer 变形稳定器 + Neat Video 降噪 + 多层 Lumetri Color），超出单卡 VRAM 容量。',
      '同时在 Long-GOP H.265 素材上做时间重映射（Speed Ramp 变速）与光流补帧（Optical Flow）。',
      'NVIDIA Studio 驱动版本过旧，或硬件编码器（NVENC / VideoToolbox）在复杂时间点遭遇色彩空间转换死锁。',
      '磁盘缓存目录（Media Cache）所在系统盘剩余空间不足 15%。'
    ],
    stepByStepFix: [
      'Step 1 (定位故障帧)：查看报错弹窗中的精确时间码（如 `Around timecode 00:04:18:12`），在时间线上按 `I` 和 `O` 框选该段落前后 5 秒。',
      'Step 2 (Render & Replace)：右键点击报错位置的重度合成或 H.265 变速片段，选择“渲染并替换 (Render and Replace)”，格式设为 `QuickTime - Apple ProRes 422 HQ`，预留 24 帧把手（Handles）。',
      'Step 3 (切换渲染管线)：在导出面板 → 视频 → 编码设置中，将“性能 (Performance)”从“硬件编码 (Hardware Encoding)”切换为“软件编码 (Software Encoding)”，规避硬件编码器崩溃。',
      'Step 4 (彻底清理缓存)：按住 Shift 启动 Premiere Pro，勾选“清除媒体缓存文件 (Clear media cache files)”及“重置插件加载缓存”。'
    ],
    preventionChecklist: [
      '所有需要做变形稳定、降噪或 AE 动态链接的镜头，先转码为 Intra-frame (ProRes 422 HQ)。',
      '导出长片前，先在时间线执行 `Sequence -> Render In to Out`（全序列预渲染为 ProRes 预览文件），导出时勾选“使用预览 (Use Previews)”。',
      '显卡切换为 NVIDIA Studio 驱动（非 Game Ready 驱动），并确保 GPU 温度低于 82°C。'
    ]
  },
  {
    id: 'audio-sync-drift',
    nle: 'Avid Media Composer',
    category: 'audio_sync',
    title: '双系统音视频逐渐脱节 (Audio Drift) 与采样率爆音故障',
    errorCodeOrSymptom: '打板点（Clapper）已精准对齐，但播放 10 分钟后口型慢半秒；或音频出现周期性噼啪杂音 (Clicks/Pops)',
    severity: 'High',
    rootCauses: [
      '帧率基准冲突：摄影机拍摄为 `23.976 fps`（24000/1001），而录音机或工程时间线错误设置为整数 `24.00 fps`（每小时产生 3.6 秒 / 86.4 帧的固定累积漂移）。',
      '采样率不匹配：同期录音师交付标准为 `48,000 Hz / 24-bit`，但音乐或动效素材为 `44,100 Hz`，未重采样直接混剪导致实时重采样时钟抖动与爆音。',
      '带有可变帧率（VFR - Variable Frame Rate）的手机/录屏素材直接混入恒定帧率（CFR）工业时间线。'
    ],
    stepByStepFix: [
      'Step 1 (排查帧率比率)：打开媒体属性检查器，核对视频真实帧率是否为 `23.976` 而音频 BWF (Broadcast Wave) 元数据中的 Timecode Rate 是否被标记为 `24.00`。',
      'Step 2 (执行 0.1% Pull-down/Pull-up 修正)：在导入或工程设置中，对脱节音频应用 `99.9%` 或 `100.1%` 速度补偿（或在 Wave Agent / Shutter Encoder 中重写 BWF 帧率头部元数据后再重新对齐）。',
      'Step 3 (统一 48kHz 采样率)：筛选项目中所有 `44.1 kHz` 音频片段，批量执行转码/整合（Consolidate/Transcode），将采样率强制统一为 `48 kHz / 24-bit PCM WAV`。',
      'Step 4 (消灭 VFR 素材)：将所有手机或会议录屏素材通过 Shutter Encoder / HandBrake 强制转码为恒定帧率（CFR）的 ProRes 422，再重新替换回时间线。'
    ],
    preventionChecklist: [
      '开机前由 DIT 与同期录音师共同核对时间码器（Tentacle Sync / Ambient）的帧率与 48kHz 采样率。',
      '禁止任何 `.mp3`（有损编码且头部带空白帧 Padding）进入剪辑时间线，所有音乐必须先转为 `48kHz 24-bit WAV`。'
    ]
  },
  {
    id: 'fcp-xml-aaf-turnover',
    nle: 'Final Cut Pro',
    category: 'turnover_xml_aaf',
    title: 'XML / AAF 调色与混音交接（Turnover）失败及轨道错乱',
    errorCodeOrSymptom: 'FCPXML 导入 DaVinci Resolve 后变速错位 / Pro Tools 导入 AAF 报错缺少媒体或声道混乱',
    severity: 'High',
    rootCauses: [
      'Final Cut Pro 磁性时间线未分配音频角色（Roles: Dialogue, Music, Effects），导出 AAF/XML 后混音师无法区分对白与音效。',
      '时间线上残留复合片段（Compound Clips）、多机位片段（Multicam Clips）未展开（Flatten），以及不规则曲线变速（Speed Blade）导致跨软件解析偏差。',
      '交付给混音的 AAF 未设置至少 2 秒（48 帧）的头尾余量（Handles），混音师无法做淡入淡出过渡。'
    ],
    stepByStepFix: [
      'Step 1 (复制并建立 Turnover 专用序列)：严禁在原剪辑时间线上直接操作！复制当前锁定序列并重命名为 `PRJ_LOCK_v01_FOR_COLOR` 与 `PRJ_LOCK_v01_FOR_SOUND`。',
      'Step 2 (时间线洗底 Clean-up)：移除所有隐藏轨道、禁用片段与字幕插件；将多机位片段全部“平面化 (Flatten)”；将所有视频归并至 V1（仅保留必要叠加在 V2）。',
      'Step 3 (变速与视效固化)：对含有曲线变速、稳定器或跨软件不兼容缩放的镜头，单独烘焙导出一条无调色 ProRes 4444/422 HQ 垫片置于顶层轨道。',
      'Step 4 (混音 AAF 规范导出)：确保所有音频按角色（DX / MX / FX / Foley）分轨排列，导出嵌入式或拆分式 AAF（48kHz / 24-bit PCM，Handles 设为 48~72 帧），并随附一条带时间码烧录（BITC）和 2-Pop（00:59:58:00 一帧千周信号）的参考视频。'
    ],
    preventionChecklist: [
      '画面锁定（Picture Lock）后，在时间线 `00:59:58:00` 处放置标准 1 帧白闪 + 1kHz 正弦波（2-Pop），正片从 `01:00:00:00` 准时开始。',
      '交接包内必须同时包含：XML/EDL、参考视频（带烧录 Source TC + Record TC）、以及完整 EDL 文本核对表。'
    ]
  }
];

export function generateStandardFolderStructure(projectCode: string, shootDays = 2, cameras = ['A_CAM', 'B_CAM']): FolderNode[] {
  const cleanCode = (projectCode || 'PRJ26_UNTITLED').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
  const dayFolders: { path: string; purpose: string }[] = [];
  for (let d = 1; d <= Math.max(1, Math.min(shootDays, 10)); d++) {
    const dayTag = `DAY${String(d).padStart(2, '0')}`;
    for (const cam of cameras) {
      dayFolders.push({
        path: `01_Footage/${dayTag}/${cam}_RAW`,
        purpose: `第 ${d} 拍摄日 ${cam} 摄影机原始卡完整镜像（含 MHL 哈希校验清单）`
      });
    }
  }

  return [
    {
      code: '01_Footage',
      name: '01_Footage (原始摄影素材与代理库)',
      description: 'DIT 现场双备份校验后的只读原始母带（OCF）及对应分离存储的离线代理（Proxies）。',
      namingRule: `${cleanCode}_DAYxx_CAMx_Rollxxx`,
      children: [
        ...dayFolders,
        {
          path: `01_Footage/_PROXIES/${cleanCode}_ProResProxy_1080p`,
          purpose: '与原片目录层级 1:1 映射的 ProRes 422 Proxy 代理文件（含源时间码与音轨）'
        }
      ]
    },
    {
      code: '02_Audio',
      name: '02_Audio (同期录音、音乐与音效库)',
      description: '所有进入工程的声音资产必须统一转换为 48kHz / 24-bit 未压缩 WAV，严禁使用 MP3。',
      namingRule: `${cleanCode}_AUDIO_[TYPE]_[NAME]_48k24b.wav`,
      children: [
        { path: '02_Audio/01_Production_Sound_BWF', purpose: '同期录音师交付的多轨 Broadcast WAV 原声及 Sound Reports' },
        { path: '02_Audio/02_VO_ADR', purpose: '配音（Voiceover）与后期补录对白（ADR）48kHz WAV' },
        { path: '02_Audio/03_Music_Stems', purpose: '授权音乐及分轨（Full Mix / Instrumental / Drums / Bass Stems）' },
        { path: '02_Audio/04_SFX_Foley', purpose: '拟音、环境音（Ambience）与特效音素材' },
        { path: '02_Audio/05_Final_Mix_Deliverables', purpose: '混音棚回传的终混母带（2.0 Stereo / 5.1 Surround / M&E 国际声带）' }
      ]
    },
    {
      code: '03_Projects',
      name: '03_Projects (剪辑工程与每日归档备份)',
      description: '主剪辑工程文件与按日期递增的快照备份，防止工程损坏或版本回滚失败。',
      namingRule: `${cleanCode}_EDIT_YYYYMMDD_vxx`,
      children: [
        { path: '03_Projects/01_Active_NLE', purpose: '当前正在工作的唯一主工程文件（Premiere / Resolve DRP / FCP Library）' },
        { path: '03_Projects/02_Daily_Archive_Vault', purpose: '每日收工归档工程（只读，按日期归档避免覆盖）' },
        { path: '03_Projects/03_Documents_Scripts', purpose: '分镜脚本、场记单（Continuity Log）、DIT 报告与客户修改意见单' }
      ]
    },
    {
      code: '04_VFX_GFX',
      name: '04_VFX_GFX (视效交接、包装字卡与三维资产)',
      description: '管理视效镜头拉片（VFX Pulls）与合成回批版本，严格遵循 v001 递增规范。',
      namingRule: `${cleanCode}_SCxx_SHxxx_VFX_vxxx`,
      children: [
        { path: '04_VFX_GFX/01_VFX_Plates_Out', purpose: '发往视效团队的线性 EXR 或 ProRes 4444 无调色底片（含前后 12-24 帧 Handles）' },
        { path: '04_VFX_GFX/02_VFX_Renders_In', purpose: '视效回传合成镜头（按镜头号分文件夹管理 v01, v02）' },
        { path: '04_VFX_GFX/03_Motion_Graphics_Titles', purpose: '片头片尾字幕、角标 Logo 矢量源文件与带 Alpha 通道 ProRes 4444' }
      ]
    },
    {
      code: '05_Color_Turnover',
      name: '05_Color_Turnover (调色/混音套底交接包)',
      description: '画面锁定（Picture Lock）后发往 DI 调色房与混音棚的标准化工业交接资产。',
      namingRule: `${cleanCode}_LOCK_vxx_[DEPT]_YYYYMMDD`,
      children: [
        { path: '05_Color_Turnover/01_XML_EDL_To_Color', purpose: '清洗后的单轨 XML / CMX3600 EDL 及带烧录时间码（BITC）的离线参考片' },
        { path: '05_Color_Turnover/02_AAF_OMF_To_Sound', purpose: '含 48 帧 Handles 的分轨 AAF 及带 2-Pop 同步信号的参考视频' },
        { path: '05_Color_Turnover/03_Graded_Renders_From_DI', purpose: '调色师回传的 ProRes 422 HQ / 4444 调色成品片段或母带' }
      ]
    },
    {
      code: '06_Exports',
      name: '06_Exports (审片样片与最终母版交付)',
      description: '严格区分内部审阅样片（WIP）与最终出街母版（Final Master），严禁使用 final_final 等模糊命名。',
      namingRule: `${cleanCode}_[CUT_STAGE]_YYYYMMDD_vxx_[SPEC]`,
      children: [
        { path: '06_Exports/01_WIP_Review_Cuts', purpose: '带时间码与水印的客户/导演审阅版本（H.264 1080p MP4）' },
        { path: '06_Exports/02_Broadcast_Digital_Masters', purpose: '最终无损成片母版（ProRes 422 HQ + 高码率 H.264 发行版 + 纯净无字幕 Clean Feed）' }
      ]
    }
  ];
}

export function buildStandardFilename(input: NamingSpecInput): NamingAuditResult {
  const issues: string[] = [];

  const sanitizeToken = (val: string, fallback: string) => {
    const trimmed = (val || '').trim();
    if (!trimmed) return fallback;
    const cleaned = trimmed
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .toUpperCase();
    return cleaned || fallback;
  };

  if (/[\u4e00-\u9fa5]/.test(`${input.projectCode}${input.scene}${input.shot}${input.cameraUnit}${input.version}`)) {
    issues.push('检测到中文字符：跨平台 XML/EDL/AAF 交接（尤其是 Avid 与 Linux 调色系统）严禁在剪辑序列或文件名中使用非 ASCII 字符，已自动转写为安全英文标识。');
  }

  if (/\s/.test(`${input.projectCode}${input.scene}${input.shot}${input.cameraUnit}${input.version}`)) {
    issues.push('检测到空格字符：命令行脚本与视效渲染农场路径含空格易导致中断，已统一替换为下划线 `_`。');
  }

  if (/final|最新|定稿|打死不改/i.test(input.version)) {
    issues.push('高危版本命名警告：严禁使用 `Final`、`终版` 等主观词汇，必须使用严格递增的 `v01, v02, v03` 加上日期戳。');
  }

  const pCode = sanitizeToken(input.projectCode, 'PRJ26');
  const sc = sanitizeToken(input.scene, 'SC01');
  const sh = sanitizeToken(input.shot, 'SH001');
  const cam = sanitizeToken(input.cameraUnit, 'CAMA');
  const tk = sanitizeToken(input.take, 'T01');

  let verClean = (input.version || 'v01').trim().replace(/[^a-zA-Z0-9]/g, '');
  if (!/^v\d{2,3}$/i.test(verClean)) {
    const digits = verClean.match(/\d+/);
    const num = digits ? String(parseInt(digits[0], 10)).padStart(2, '0') : '01';
    verClean = `v${num}`;
  } else {
    verClean = verClean.toLowerCase();
  }

  const ext = (input.extension || 'mov').replace(/^\./, '').toLowerCase();
  const standardizedSuggestion = `${pCode}_${sc}_${sh}_${cam}_${tk}_${verClean}.${ext}`;

  const rawJoined = `${input.projectCode}_${input.scene}_${input.shot}_${input.cameraUnit}_${input.take}_${input.version}.${ext}`;
  const isValid = issues.length === 0 && rawJoined === standardizedSuggestion;
  const riskLevel = issues.length === 0 ? 'nominal' : issues.some((i) => i.includes('高危') || i.includes('中文')) ? 'critical' : 'warning';

  return {
    filename: rawJoined,
    isValid,
    riskLevel,
    issues,
    standardizedSuggestion
  };
}

export function auditBatchFilenames(rawList: string[], projectCode = 'ORION26'): NamingAuditResult[] {
  return rawList
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name, idx) => {
      const issues: string[] = [];
      if (/[\u4e00-\u9fa5]/.test(name)) {
        issues.push('包含中文字符：存在 XML/AAF 跨系统乱码与脱机风险');
      }
      if (/\s/.test(name)) {
        issues.push('包含空格：不符合工业 POSIX 路径无空格规范');
      }
      if (/final|终版|定稿|copy|副本/i.test(name)) {
        issues.push('包含禁用词 (Final/Copy/终版)：违反版本唯一性原则');
      }
      if (/^C\d{4}\.MP4$/i.test(name) || /^A\d{3}_C\d{3}\./i.test(name)) {
        issues.push('裸机内默认文件名：多机位或多卡拍摄极易发生同名文件覆盖与回批链接错乱');
      }
      if (!/_v\d{2,3}\./i.test(name)) {
        issues.push('缺失标准版本号后缀（如 _v01）');
      }

      const extMatch = name.match(/\.([a-zA-Z0-9]+)$/);
      const ext = extMatch ? extMatch[1].toLowerCase() : 'mov';
      const cleanProject = projectCode.toUpperCase().replace(/[^A-Z0-9]/g, '') || 'ORION26';
      const standardizedSuggestion = `${cleanProject}_SC01_SH${String(idx + 1).padStart(3, '0')}_CAMA_T01_v01.${ext}`;

      return {
        filename: name,
        isValid: issues.length === 0,
        riskLevel: issues.length === 0 ? 'nominal' : issues.length >= 2 ? 'critical' : 'warning',
        issues,
        standardizedSuggestion: issues.length === 0 ? name : standardizedSuggestion
      };
    });
}

export function parseTimecodeToFrames(tc: string, nominalFps: number): { valid: boolean; frames: number; error?: string } {
  const match = tc.trim().match(/^(\d{2}):(\d{2}):(\d{2})[:;](\d{2})$/);
  if (!match) {
    return { valid: false, frames: 0, error: '时间码格式必须为 HH:MM:SS:FF（如 01:00:12:14）' };
  }
  const hh = parseInt(match[1], 10);
  const mm = parseInt(match[2], 10);
  const ss = parseInt(match[3], 10);
  const ff = parseInt(match[4], 10);
  const timebase = Math.round(nominalFps);

  if (mm >= 60 || ss >= 60 || ff >= timebase) {
    return {
      valid: false,
      frames: 0,
      error: `无效帧数或分秒值：当前时间基为 ${timebase} fps，帧位 FF 必须小于 ${timebase}。`
    };
  }

  const totalFrames = ((hh * 3600 + mm * 60 + ss) * timebase) + ff;
  return { valid: true, frames: totalFrames };
}

export function framesToTimecode(totalFrames: number, nominalFps: number): string {
  const timebase = Math.round(nominalFps);
  const absFrames = Math.abs(Math.round(totalFrames));
  const ff = absFrames % timebase;
  const totalSeconds = Math.floor(absFrames / timebase);
  const ss = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const mm = totalMinutes % 60;
  const hh = Math.floor(totalMinutes / 60);

  const pad = (n: number) => String(n).padStart(2, '0');
  const sign = totalFrames < 0 ? '-' : '+';
  return `${sign}${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

export function calculateTimecodeSync(params: {
  videoTc: string;
  audioTc: string;
  videoFps: number;
  audioTcFps: number;
  audioSampleRateHz: number;
}): TimecodeSyncResult {
  const vParsed = parseTimecodeToFrames(params.videoTc, params.videoFps);
  if (!vParsed.valid) {
    return {
      valid: false,
      error: `视频时间码错误：${vParsed.error}`,
      videoTotalFrames: 0,
      audioTotalFrames: 0,
      offsetFrames: 0,
      offsetTimecode: '+00:00:00:00',
      direction: 'in_sync',
      driftFramesPerHour: 0,
      hasPullDownRisk: false,
      hasSampleRateMismatch: false,
      warnings: [],
      syncSteps: []
    };
  }

  const aParsed = parseTimecodeToFrames(params.audioTc, params.audioTcFps);
  if (!aParsed.valid) {
    return {
      valid: false,
      error: `音频时间码错误：${aParsed.error}`,
      videoTotalFrames: 0,
      audioTotalFrames: 0,
      offsetFrames: 0,
      offsetTimecode: '+00:00:00:00',
      direction: 'in_sync',
      driftFramesPerHour: 0,
      hasPullDownRisk: false,
      hasSampleRateMismatch: false,
      warnings: [],
      syncSteps: []
    };
  }

  const offsetFrames = aParsed.frames - vParsed.frames;
  const offsetTimecode = framesToTimecode(offsetFrames, params.videoFps);
  const direction = offsetFrames === 0 ? 'in_sync' : offsetFrames > 0 ? 'audio_ahead' : 'audio_behind';

  const warnings: string[] = [];
  const is23976Vs24 =
    (Math.abs(params.videoFps - 23.976) < 0.01 && Math.abs(params.audioTcFps - 24.0) < 0.01) ||
    (Math.abs(params.videoFps - 24.0) < 0.01 && Math.abs(params.audioTcFps - 23.976) < 0.01);

  const is2997Vs30 =
    (Math.abs(params.videoFps - 29.97) < 0.01 && Math.abs(params.audioTcFps - 30.0) < 0.01) ||
    (Math.abs(params.videoFps - 30.0) < 0.01 && Math.abs(params.audioTcFps - 29.97) < 0.01);

  const hasPullDownRisk = is23976Vs24 || is2997Vs30 || Math.abs(params.videoFps - params.audioTcFps) > 0.005;

  let driftFramesPerHour = 0;
  if (is23976Vs24) {
    driftFramesPerHour = 86.4; // 3.6 seconds * 24 fps
    warnings.push(
      '致命时钟漂移预警：检测到 23.976 fps 与 24.00 fps 混用（0.1% Pull-down 差异）。每小时将产生 3.6 秒（约 86.4 帧）的线性音画脱节！即使打板点对齐，长镜头后半段口型必定不准。'
    );
  } else if (hasPullDownRisk) {
    driftFramesPerHour = Math.round(Math.abs(params.videoFps - params.audioTcFps) * 3600 * 10) / 10;
    warnings.push(
      `帧率不匹配警告：视频帧率 (${params.videoFps} fps) 与录音时间码率 (${params.audioTcFps} fps) 不一致，无法直接通过时间码批量同步。`
    );
  }

  const hasSampleRateMismatch = params.audioSampleRateHz !== 48000;
  if (hasSampleRateMismatch) {
    warnings.push(
      `音频采样率违规：当前采样率为 ${params.audioSampleRateHz} Hz。影视工业标准要求严格锁定为 48,000 Hz (24-bit PCM)。44.1kHz 混入时间线会导致实时重采样爆音或在 AAF 交付 Pro Tools 时发生音调与时长偏移。`
    );
  }

  const syncSteps = [
    `1. 在媒体池中将视频片段与独立录音（BWF）分别置于对应场次 Bin，核对拍摄日期与场记卡号。`,
    offsetFrames === 0
      ? `2. 视频与音频起始时间码完全一致（零帧偏移），可直接全选右键执行 "Auto Sync Audio -> Based on Timecode"。`
      : `2. 检测到固定TC偏移量 ${offsetTimecode}（共 ${offsetFrames} 帧），在片段属性 (Clip Attributes -> Timecode) 中补偿 ${-offsetFrames} 帧，或以打板点（Clapper Slate）瞬态波形对齐后手动更新音频时间码。`,
    hasPullDownRisk
      ? `3. 【必须执行】在同步前使用 Wave Agent 或音频属性将 BWF 时间码基准修正为 ${params.videoFps} fps，并施加 ${params.videoFps < params.audioTcFps ? '99.9%' : '100.1%'} 速率补偿以消除每小时 ${driftFramesPerHour} 帧的累积漂移。`
      : `3. 勾选 "Append Tracks" 或保留原始多通道轨道（Boom + Lav 1/2），切勿在粗剪前将多轨原声合并为单声道混音。`
  ];

  return {
    valid: true,
    videoTotalFrames: vParsed.frames,
    audioTotalFrames: aParsed.frames,
    offsetFrames,
    offsetTimecode,
    direction,
    driftFramesPerHour,
    hasPullDownRisk,
    hasSampleRateMismatch,
    warnings,
    syncSteps
  };
}

export function getExactFps(fps: number): number {
  if (Math.abs(fps - 23.976) < 0.01) return 24000 / 1001;
  if (Math.abs(fps - 29.97) < 0.01) return 30000 / 1001;
  if (Math.abs(fps - 59.94) < 0.01) return 60000 / 1001;
  return fps;
}

export function formatUnsignedTimecode(totalFrames: number, nominalFps: number): string {
  const timebase = Math.max(1, Math.round(nominalFps));
  const absFrames = Math.abs(Math.round(totalFrames));
  const ff = absFrames % timebase;
  const totalSeconds = Math.floor(absFrames / timebase);
  const ss = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const mm = totalMinutes % 60;
  const hh = Math.floor(totalMinutes / 60);

  const pad = (n: number) => String(n).padStart(2, '0');
  const prefix = totalFrames < 0 ? '-' : '';
  return `${prefix}${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

export function formatRealSeconds(seconds: number): string {
  const absSec = Math.max(0, Math.abs(seconds));
  const totalMs = Math.round(absSec * 1000);
  const ms = totalMs % 1000;
  const totalWholeSec = Math.floor(totalMs / 1000);
  const ss = totalWholeSec % 60;
  const totalMin = Math.floor(totalWholeSec / 60);
  const mm = totalMin % 60;
  const hh = Math.floor(totalMin / 60);

  const pad2 = (n: number) => String(n).padStart(2, '0');
  const pad3 = (n: number) => String(n).padStart(3, '0');
  const prefix = seconds < 0 ? '-' : '';
  return `${prefix}${pad2(hh)}:${pad2(mm)}:${pad2(ss)}.${pad3(ms)}`;
}

export function convertSmpteTimecodeAndDuration(input: SmpteConversionInput): SmpteConversionResult {
  const sourceTimebase = Math.max(1, Math.round(input.sourceFps));
  const targetTimebase = Math.max(1, Math.round(input.targetFps));
  const exactSourceFps = getExactFps(input.sourceFps);
  const exactTargetFps = getExactFps(input.targetFps);
  const handleFramesPerSide = Math.max(0, Math.min(240, Math.round(input.handleFrames || 0)));

  const emptyInvalid = (error: string): SmpteConversionResult => ({
    valid: false,
    error,
    sourceTimebase,
    targetTimebase,
    sourceTotalFrames: 0,
    secondaryTotalFrames: 0,
    targetTcFrameMatch: '00:00:00:00',
    targetTcRealtime: '00:00:00:00',
    targetRealtimeFrames: 0,
    sourceRealSeconds: 0,
    sourceRealFormatted: '00:00:00.000',
    targetFrameMatchRealSeconds: 0,
    targetFrameMatchRealFormatted: '00:00:00.000',
    resultFramesSource: 0,
    resultTcSource: '00:00:00:00',
    resultFramesTargetRealtime: 0,
    resultTcTargetRealtime: '00:00:00:00',
    resultTcTargetFrameMatch: '00:00:00:00',
    resultRealSeconds: 0,
    resultRealFormatted: '00:00:00.000',
    handleFramesPerSide,
    totalFramesWithHandlesSource: 0,
    totalTcWithHandlesSource: '00:00:00:00',
    totalFramesWithHandlesTarget: 0,
    totalTcWithHandlesTarget: '00:00:00:00',
    speedRatioPercent: 100,
    speedDeltaPercent: 0,
    pitchShiftSemitones: 0,
    conformAdvisory: ''
  });

  const primaryParsed = parseTimecodeToFrames(input.sourceTc, input.sourceFps);
  if (!primaryParsed.valid) {
    return emptyInvalid(`主时间码（入点/源 TC）错误：${primaryParsed.error}`);
  }

  const secondaryParsed = parseTimecodeToFrames(input.secondaryTc, input.sourceFps);
  if (!secondaryParsed.valid) {
    return emptyInvalid(`次时间码（出点/运算 TC）错误：${secondaryParsed.error}`);
  }

  const sourceTotalFrames = primaryParsed.frames;
  const secondaryTotalFrames = secondaryParsed.frames;

  // 1. Primary TC frame-for-frame vs real-time resample conversion
  const targetTcFrameMatch = formatUnsignedTimecode(sourceTotalFrames, targetTimebase);
  const sourceRealSeconds = Math.round((sourceTotalFrames / exactSourceFps) * 1000) / 1000;
  const sourceRealFormatted = formatRealSeconds(sourceRealSeconds);

  const targetRealtimeFrames = Math.round((sourceTotalFrames / exactSourceFps) * exactTargetFps);
  const targetTcRealtime = formatUnsignedTimecode(targetRealtimeFrames, targetTimebase);

  const targetFrameMatchRealSeconds = Math.round((sourceTotalFrames / exactTargetFps) * 1000) / 1000;
  const targetFrameMatchRealFormatted = formatRealSeconds(targetFrameMatchRealSeconds);

  // 2. Span / Arithmetic calculation between sourceTc and secondaryTc
  let resultFramesSource = 0;
  if (input.operation === 'span') {
    resultFramesSource = Math.max(0, secondaryTotalFrames - sourceTotalFrames);
  } else if (input.operation === 'add') {
    resultFramesSource = sourceTotalFrames + secondaryTotalFrames;
  } else {
    resultFramesSource = sourceTotalFrames - secondaryTotalFrames;
  }

  const resultTcSource = formatUnsignedTimecode(resultFramesSource, sourceTimebase);
  const resultRealSeconds = Math.round((resultFramesSource / exactSourceFps) * 1000) / 1000;
  const resultRealFormatted = formatRealSeconds(resultRealSeconds);

  const resultFramesTargetRealtime = Math.round((resultFramesSource / exactSourceFps) * exactTargetFps);
  const resultTcTargetRealtime = formatUnsignedTimecode(resultFramesTargetRealtime, targetTimebase);
  const resultTcTargetFrameMatch = formatUnsignedTimecode(resultFramesSource, targetTimebase);

  // 3. VFX / Sound Turnover Handles (+2 * handleFramesPerSide)
  const absResultFramesSource = Math.abs(resultFramesSource);
  const totalFramesWithHandlesSource = absResultFramesSource + handleFramesPerSide * 2;
  const totalTcWithHandlesSource = formatUnsignedTimecode(totalFramesWithHandlesSource, sourceTimebase);

  const absResultFramesTarget = Math.abs(resultFramesTargetRealtime);
  const totalFramesWithHandlesTarget = absResultFramesTarget + handleFramesPerSide * 2;
  const totalTcWithHandlesTarget = formatUnsignedTimecode(totalFramesWithHandlesTarget, targetTimebase);

  // 4. Speed & Pitch metrics when conforming 1:1 Frame-for-Frame
  const rawRatio = exactTargetFps / exactSourceFps;
  const speedRatioPercent = Math.round(rawRatio * 100000) / 1000; // e.g. 104.271
  const speedDeltaPercent = Math.round((rawRatio - 1) * 100000) / 1000; // e.g. +4.271
  const pitchShiftSemitones = Math.round(12 * Math.log2(rawRatio) * 100) / 100;

  let conformAdvisory = '源帧率与目标帧率一致（1:1 无损对位），时间码与物理时长完全吻合，可直接执行 XML / EDL / AAF 套底交接。';
  if (Math.abs(exactSourceFps - exactTargetFps) > 0.001) {
    const isCinemaToPal =
      (Math.abs(input.sourceFps - 23.976) < 0.01 || Math.abs(input.sourceFps - 24) < 0.01) &&
      Math.abs(input.targetFps - 25) < 0.01;
    const isPalToCinema =
      Math.abs(input.sourceFps - 25) < 0.01 &&
      (Math.abs(input.targetFps - 23.976) < 0.01 || Math.abs(input.targetFps - 24) < 0.01);
    const isPullDown23976Vs24 =
      (Math.abs(input.sourceFps - 23.976) < 0.01 && Math.abs(input.targetFps - 24) < 0.01) ||
      (Math.abs(input.sourceFps - 24) < 0.01 && Math.abs(input.targetFps - 23.976) < 0.01);

    if (isCinemaToPal) {
      conformAdvisory = `电影/NTSC 转 PAL 广电交接 (${input.sourceFps} → 25 fps)：推荐采用「逐帧对位 (1:1 Frame-for-Frame / Cinema Tools Conform)」将素材直接解释为 25fps，画面零插帧伪影，总时长缩短约 ${Math.abs(speedDeltaPercent).toFixed(2)}%，必须在 Pro Tools / NLE 中开启音高锁定 (Pitch Shift Compensation ${-pitchShiftSemitones > 0 ? '+' : ''}${-pitchShiftSemitones} 半音) 防止人声变尖。`;
    } else if (isPalToCinema) {
      conformAdvisory = `PAL 转电影帧率交接 (25 → ${input.targetFps} fps)：采用逐帧降速对位 (速率 ${speedRatioPercent}%) 可避免抽帧卡顿，但画面总时长会延长且音频需做 ${-pitchShiftSemitones > 0 ? '+' : ''}${-pitchShiftSemitones} 半音音高补偿；若严禁改变成片总时长，请使用「恒定物理时长重采样」并开启 Optical Flow Enhanced 光流补帧。`;
    } else if (isPullDown23976Vs24) {
      conformAdvisory = `NTSC 23.976 与 True 24.000 跨基准转换（0.1% Pull-down/up）：两者共用 24 帧时间码进制，逐帧时间码读数相同，但物理时钟每小时相差 3.6 秒（86.4 帧）。交接混音 AAF 前必须对音频执行 ${speedRatioPercent}% 速率重采样。`;
    } else {
      conformAdvisory = `跨帧率套底 (${input.sourceFps} → ${input.targetFps} fps)：若做视效拉片（VFX Pulls）请按「逐帧对位」导出序列帧（共 ${resultFramesSource} 帧 + 双边把手后 ${totalFramesWithHandlesSource} 帧）以禁止插帧；若在目标时间线混剪，需注意恒定时长重采样将产生 ${resultFramesTargetRealtime} 帧。`;
    }
  }

  return {
    valid: true,
    sourceTimebase,
    targetTimebase,
    sourceTotalFrames,
    secondaryTotalFrames,
    targetTcFrameMatch,
    targetTcRealtime,
    targetRealtimeFrames,
    sourceRealSeconds,
    sourceRealFormatted,
    targetFrameMatchRealSeconds,
    targetFrameMatchRealFormatted,
    resultFramesSource,
    resultTcSource,
    resultFramesTargetRealtime,
    resultTcTargetRealtime,
    resultTcTargetFrameMatch,
    resultRealSeconds,
    resultRealFormatted,
    handleFramesPerSide,
    totalFramesWithHandlesSource,
    totalTcWithHandlesSource,
    totalFramesWithHandlesTarget,
    totalTcWithHandlesTarget,
    speedRatioPercent,
    speedDeltaPercent,
    pitchShiftSemitones,
    conformAdvisory
  };
}

export function calculateProxyStorageEstimate(cameraProfileId: string, shootHours: number) {
  const profile = CAMERA_PROFILES.find((p) => p.id === cameraProfileId) || CAMERA_PROFILES[0];
  const hours = Math.max(0.5, Math.min(shootHours, 500));
  // 1 Mbps = 0.45 GB per hour (3600s / 8 bits / 1000)
  const rawGb = Math.round(profile.nativeBitrateMbps * 0.45 * hours * 10) / 10;
  const proxyGb = Math.round(profile.proxyBitrateMbps * 0.45 * hours * 10) / 10;
  const savingsPercent = Math.round((1 - proxyGb / Math.max(1, rawGb)) * 1000) / 10;
  // Recommended 3-2-1 RAID buffer (+25% headroom)
  const recommendedRaidTb = Math.round(((rawGb * 2 + proxyGb) * 1.25) / 100) / 10;

  return {
    profile,
    hours,
    rawGb,
    proxyGb,
    savingsPercent,
    recommendedRaidTb
  };
}

export function evaluateHardwareTelemetry(input: HardwareTelemetryInput): HardwareRiskAssessment {
  const alerts: HardwareRiskAssessment['alerts'] = [];
  const vramUsagePercent = Math.round((input.vramUsedGb / Math.max(1, input.vramTotalGb)) * 100);
  const ramUsagePercent = Math.round((input.ramUsedGb / Math.max(1, input.ramTotalGb)) * 100);

  const perStreamMbps = input.activeCodecType === 'RAW' ? 320 : input.activeCodecType === 'Intra-frame' ? 90 : 55;
  const decodeCpuPenalty = input.activeCodecType === 'Long-GOP' ? 1.65 : 1.0;
  const requiredBandwidthMbps = Math.round(input.activeStreams * perStreamMbps);

  const thermalThrottleRisk = input.gpuTempC >= 83 || input.cpuTempC >= 88;
  const vramOomRisk = vramUsagePercent >= 88;
  const diskBottleneckRisk = input.storageReadMbps < requiredBandwidthMbps * 1.2;

  if (input.gpuTempC >= 85 || input.cpuTempC >= 90) {
    alerts.push({
      level: 'Critical',
      component: 'Thermal / 散热降频预警',
      message: `GPU (${input.gpuTempC}°C) / CPU (${input.cpuTempC}°C) 已突破工业安全阈值，即将触发硬件强制降频（Thermal Throttling）并导致长时间渲染中断。`,
      mitigation: '立即暂停全序列后台渲染缓存，将导出编码器限流或分批（Reel-by-Reel）输出，清理工作站风道并提升风扇曲线至 100%。'
    });
  } else if (input.gpuTempC >= 78 || input.cpuTempC >= 82) {
    alerts.push({
      level: 'Warning',
      component: 'Thermal / 温度偏高',
      message: `核心温度处于高负载区间 (GPU ${input.gpuTempC}°C / CPU ${input.cpuTempC}°C)，连续导出 30 分钟以上长片存在降频风险。`,
      mitigation: '建议关闭时间线实时时域降噪（Temporal NR）预览，改为导出前最后一刻开启。'
    });
  }

  if (vramUsagePercent >= 90) {
    alerts.push({
      level: 'Critical',
      component: 'GPU VRAM / 显存溢出高危',
      message: `当前显存占用达 ${vramUsagePercent}% (${input.vramUsedGb}GB / ${input.vramTotalGb}GB)，极易触发 DaVinci Resolve "GPU Memory Full" 或 Premiere "-1609629695" 崩溃。`,
      mitigation: '将时间线代理模式切换为 Half/Quarter Resolution，关闭不必要的多帧时域降噪或将重度 Fusion/AE 节点执行 Render in Place（ProRes 422 HQ）。'
    });
  } else if (vramUsagePercent >= 78) {
    alerts.push({
      level: 'Warning',
      component: 'GPU VRAM / 显存紧张',
      message: `显存占用 ${vramUsagePercent}%，若继续叠加 4K 光流补帧或 OFX 插件将触及上限。`,
      mitigation: '在 NLE 偏好设置中限制其它后台应用占用 GPU，并清理未使用的显存纹理缓存。'
    });
  }

  if (input.activeCodecType === 'Long-GOP' && input.activeStreams >= 2) {
    alerts.push({
      level: 'Critical',
      component: 'Codec Pipeline / Long-GOP 多轨解码瓶颈',
      message: `正在对 ${input.activeStreams} 条 Long-GOP (H.264/H.265) 轨道直接进行多机位或合成回放（CPU 解码负载乘数 ${decodeCpuPenalty}x）。`,
      mitigation: '主动防护拦截：立即停止在 Long-GOP 素材上做多轨合成！请全选素材生成 ProRes 422 Proxy 帧内编码代理。'
    });
  }

  if (diskBottleneckRisk) {
    alerts.push({
      level: 'Warning',
      component: 'Storage I/O / 磁盘带宽不足',
      message: `当前磁盘读取速率 (${input.storageReadMbps} MB/s) 低于 ${input.activeStreams} 路 ${input.activeCodecType} 素材所需的含冗余安全带宽 (${Math.round(requiredBandwidthMbps * 1.2)} MB/s)。`,
      mitigation: '切换至 NVMe SSD / Thunderbolt RAID 阵列，或启用 1080p ProRes Proxy 代理模式将磁盘吞吐需求降低 85%。'
    });
  }

  const hasCritical = alerts.some((a) => a.level === 'Critical');
  const hasWarning = alerts.some((a) => a.level === 'Warning');

  return {
    overallStatus: hasCritical ? 'Critical' : hasWarning ? 'Warning' : 'Nominal',
    thermalThrottleRisk,
    vramOomRisk,
    diskBottleneckRisk,
    requiredBandwidthMbps,
    vramUsagePercent,
    ramUsagePercent,
    alerts
  };
}
