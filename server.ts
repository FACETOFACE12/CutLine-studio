import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SYSTEM_INSTRUCTION = `你是一个拥有多年好莱坞/一线广告公司经验的“影视后期总监级剪辑助理”（Senior AI Assistant Editor）。
你的核心价值是：极致的条理性、严苛的工业级标准、对视音频技术的精深理解，以及零失误的数据/流程管理能力。

# 核心能力
1. 极致的资产管理与文件治理 (Asset Organization)：
   - 工业级目录结构 (01_Footage, 02_Audio, 03_Projects, 04_VFX_GFX, 05_Color_Turnover, 06_Exports) 与命名规范 (项目名_场次_镜头号_机位_版本号)。
   - 多机位与双系统录音时间码 (SMPTE Timecode) 对齐、23.976 vs 24.000 fps 0.1% Pull-down 漂移修正、48kHz/24-bit 采样率治理。
   - 针对 ProRes RAW, REDCODE R3D, Sony XAVC, H.265 Long-GOP 的最优代理转码策略 (ProRes 422 Proxy / DNxHR LB) 与色彩空间匹配。
2. 编解码器与色彩空间专家 (Codecs & Color Science)：
   - 深入理解 H.264/H.265 Long-GOP vs Apple ProRes / Avid DNxHR Intra-frame 帧内编码及容器 (MOV, MP4, MXF)。
   - 精通 S-Log3/S-Gamut3.Cine, C-Log3, ARRI LogC3/LogC4, RED IPP2, Rec.709, DCI-P3, ACEScct 与 DaVinci Wide Gamut CST 节点排查。
3. 故障排查与报错诊断 (Error Diagnostics)：
   - 精通 Premiere Pro, DaVinci Resolve, Final Cut Pro, Avid Media Composer 的媒体离线 (Media Offline)、GPU 显存溢出/CUDA/Metal 崩溃、音画不同步与 XML/AAF/EDL 交接排错。

# 工作原则
1. 零容忍与严谨性：严丝合缝，主动提醒丢帧、掉色、Gamma 偏移或版本覆盖风险。
2. 结构化输出：必须包含【主动防护预警】、【分步执行方案 (Step-by-Step)】、【工业参数对比/规范表】与【核查清单 (Checklist)】。
3. 主动防护：发现不合规操作（如在 Long-GOP H.265 上直接做重度合成或使用 Final_v2 命名）必须第一时间严厉拦截并给出工业级替代方案。
4. 技术性预警：结合当前硬件温度、VRAM 负载与磁盘 I/O 给出防降频与防崩溃建议。`;

function buildDeterministicAssistantResponse(prompt: string, context?: Record<string, unknown>) {
  const q = prompt.toLowerCase();
  const projectCode = (context?.projectCode as string) || 'ORION26';
  const gpuTemp = (context?.gpuTempC as number) || 74;
  const vramPercent = (context?.vramUsagePercent as number) || 68;

  if (q.includes('灰') || q.includes('lut') || q.includes('slog') || q.includes('logc') || q.includes('色彩') || q.includes('gamma') || q.includes('quicktime')) {
    return {
      title: '色彩空间不匹配 / 画面发灰与 QuickTime Gamma 偏移诊断方案',
      proactiveWarning:
        '【主动防护拦截】严禁通过盲目拉高对比度和饱和度来“修复”发灰的 Log 素材！亦严禁在开启了 RCM/ACES 自动色彩管理的项目中再次手动挂载还原 LUT（Double LUT 会导致高光截断与肤色断层）。',
      hardwareAlert: `当前工作站遥测：GPU ${gpuTemp}°C | VRAM 占用 ${vramPercent}%。建议将降噪节点置于 CST Input 之前，并在调色完成交付前再开启时域降噪以防显存溢出。`,
      steps: [
        'Step 1 (核查源元数据)：使用 MediaInfo 或 NLE 片段属性确认拍摄色域与曲线（如 Sony 需严格区分 S-Gamut3.Cine 与 S-Gamut3；ARRI Alexa 35 必须使用 LogC4 而非老款 LogC3）。',
        'Step 2 (构建标准 CST 三明治节点树)：Node 01 [降噪] → Node 02 [CST In: Camera Log/Gamut 转 DaVinci Wide Gamut/Intermediate] → Node 03 [Offset 曝光与白平衡] → Node 04 [一级/二级调色] → Node 05 [CST Out: DWG 转 Rec.709 Gamma 2.4，开启 Tone Mapping: Luminance Mapping & Saturation Compression]。',
        'Step 3 (修复 macOS QuickTime 发灰)：在 DaVinci Resolve 交付（Deliver）面板展开高级设置，保持输出色彩空间为 Rec.709，将 Gamma 标签显式指定为 Rec.709-A (NCLC 1-1-1)，彻底对齐 Apple ColorSync 1.96 幂函数。'
      ],
      specTable: [
        { parameter: '工作色彩空间 (Working Space)', standard: 'DaVinci Wide Gamut / Intermediate 或 ACEScct 1.3', hazard: '直接在 Rec.709 8-bit 空间内硬拉 Log 素材导致高光裁切' },
        { parameter: '输出色彩空间与伽马', standard: 'Rec.709 / Gamma 2.4 (审片母带附带 Rec.709-A 标签)', hazard: '未标记 NCLC 标签导致客户在 Mac/iPhone 上观看泛白' },
        { parameter: 'LUT 精度要求', standard: '33x33x33 或 65x65x65 .cube (3D LUT)', hazard: '使用 17点低精度盛行网红 LUT 引发天空/渐变色带断层' }
      ],
      checklist: [
        '已确认 Clip Attributes 中未重复挂载机内 LUT',
        '波形图（Waveform）高光控制在 95-98 IRE 以内，暗部未死黑裁切（> 2 IRE）',
        '肤色在矢量示波器（Vectorscope）精准落于 Skin Tone Indicator 基准线上',
        '导出前已关闭测试用的 Bypass Color Grade 开关'
      ]
    };
  }

  if (q.includes('离线') || q.includes('offline') || q.includes('relink') || q.includes('回批') || q.includes('xml') || q.includes('aaf')) {
    return {
      title: '媒体离线 (Media Offline) 与跨软件 XML/AAF 套底回批工业排错指南',
      proactiveWarning:
        '【主动防护拦截】严禁在原始剪辑时间线上直接做套底拆分！执行任何 XML/EDL/AAF 导出前，必须先复制序列并重命名为 `' +
        projectCode +
        '_LOCK_v01_FOR_COLOR`，且严禁依赖仅靠文件名（如 C0001.MP4）而不校验源时间码（Source Timecode）的强行链接。',
      hardwareAlert: `当前工作站遥测：GPU ${gpuTemp}°C | VRAM 占用 ${vramPercent}%。回批高分辨率 RAW 原片后磁盘与显存负载将激增 4~8 倍，请确认 RAID 阵列读取速率 > 800 MB/s。`,
      steps: [
        'Step 1 (时间线洗底 Clean-up)：删除所有禁用片段（Disabled Clips）与空轨道；将所有多机位（Multicam）与嵌套/复合片段（Compound/Nested Clips）全部平面化展开（Flatten）；移除字幕轨与第三方转场插件。',
        'Step 2 (解决同名文件冲突)：在 DaVinci Resolve 项目设置 → 常规选项 → 勾选“Assist using reel names from the: Source clip file pathname”，采用 `*/%R_*` 路径模式从分卡目录提取唯一卷号（Reel Name）。',
        'Step 3 (帧率与时间码漂移修复)：若部分片段提示“时间码范围不匹配 (Timecode extents do not match)”，核查是否存在 23.976 fps 代理与 24.00 fps 原片混用，或可变帧率（VFR）素材未预先转为恒定帧率 ProRes。',
        'Step 4 (混音 AAF 交付)：将音频严格按 Dialogue (DX) / Ambience (AMB) / SFX / Music (MX) 分轨，导出 48kHz / 24-bit Broadcast WAV 拆分式 AAF，前后预留至少 48 帧 Handles，并在 00:59:58:00 打入 1 帧 2-Pop 同步信号。'
      ],
      specTable: [
        { parameter: '视频回批交接格式', standard: 'Final Cut Pro XML (v1.9+) + CMX3600 EDL 双备份', hazard: '未平面化嵌套序列导致调色房时间线大面积黑场' },
        { parameter: '参考视频 (Reference Movie)', standard: '1080p ProRes 422 Proxy (烧录源时间码 + 序列时间码 + 档名)', hazard: '无视觉时间码烧录（BITC），调色师无法核对变速与画面缩放' },
        { parameter: '混音交接格式 (Sound Turnover)', standard: 'AAF (48kHz / 24-bit PCM, 48f Handles) + 2-Pop', hazard: '混入 44.1kHz MP3 导致 Pro Tools 导入后声画错位' }
      ],
      checklist: [
        '00:59:58:00 已放置标准 1 帧白闪与 1kHz -20dBFS 2-Pop 信号，正片严格始于 01:00:00:00',
        '所有含有非线性曲线变速（Speed Ramp）的镜头已单独烘焙为 ProRes 4444 垫片',
        '已对比离线参考片（Offline Ref）逐帧抽查回批时间线，确认零错帧、零跳帧',
        '所有外置硬盘与文件夹路径不含任何中文字符、空格或特殊符号'
      ]
    };
  }

  return {
    title: '好莱坞工业级后期流程规范与主动防护诊断报告',
    proactiveWarning:
      '【主动防护拦截】检测到高强度后期制作任务：严禁在 Long-GOP (H.264/H.265) 编码素材上直接执行多机位剪辑、变形稳定或视效合成！所有进组素材必须第一时间通过 DIT 校验并转码为 Intra-frame 帧内编码代理（Apple ProRes 422 Proxy 或 Avid DNxHR LB）。',
    hardwareAlert: `当前工作站遥测：GPU ${gpuTemp}°C | VRAM 占用 ${vramPercent}%。若连续高负载渲染超过 20 分钟且 GPU > 83°C，将触发硬件热降频（Thermal Throttling）甚至 CUDA/Metal 管道崩溃。`,
    steps: [
      `Step 1 (资产入库与目录锁定)：在存储阵列根目录建立标准 6 级文件夹体系（01_Footage 至 06_Exports），所有素材与序列严格遵循 \`${projectCode}_SCxx_SHxxx_CAMx_Txx_v01\` 命名规范。`,
      'Step 2 (代理与时间码对齐)：将 RAW/Long-GOP 原始素材批量转码为 1920×1080 ProRes 422 Proxy，保持源时间码（Source TC）与音频通道数 1:1 映射；使用 48kHz/24-bit BWF 音频按时间码执行双系统同步。',
      'Step 3 (色彩管线与渲染固化)：采用 DaVinci Wide Gamut 或 ACEScct 1.3 统一多机位色彩空间；对时间线上的重负载特效段落执行 Render in Place（ProRes 422 HQ），释放实时显存压力。',
      'Step 4 (零失误母版导出)：导出前切换回原始母带（Full Resolution Online），执行全片预渲染，先输出 ProRes 422 HQ 母版（Master），再由母版压制 H.264 网络审阅版。'
    ],
    specTable: [
      { parameter: '粗剪代理编码 (Offline Proxy)', standard: 'Apple ProRes 422 Proxy / DNxHR LB (1080p Intra-frame)', hazard: '直接剪辑 4K H.265 10-bit 4:2:2 导致时间线严重卡顿掉帧' },
      { parameter: '音频工程基准 (Audio Base)', standard: '48,000 Hz / 24-bit Uncompressed PCM WAV', hazard: '混用 44.1kHz 或 MP3 引发实时重采样噼啪爆音与时长漂移' },
      { parameter: '正片交付母版 (DI / Master)', standard: 'Apple ProRes 422 HQ / ProRes 4444 (.mov)', hazard: '直接从复杂时间线一次性压缩 H.264 MP4 极易中途崩溃报错' }
    ],
    checklist: [
      'DIT 拷贝已完成双盘 MHL (Media Hash List) XXHash64 字节级校验',
      '工程帧率（23.976 / 24.00 / 25.00 fps）与同期录音机时间码率 100% 吻合',
      '时间线所有代理开关已切换回原始分辨率（Proxy Mode OFF）',
      '导出母版已通过头尾全片回放质检（QC）：无红屏离线帧、无爆音、无字幕错位'
    ]
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  app.post('/api/assistant/consult', async (req, res) => {
    const { prompt, context } = req.body || {};
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: '请输入需要诊断或咨询的后期剪辑/色彩/流程问题。' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      res.json({
        source: 'industrial_engine',
        report: buildDeterministicAssistantResponse(prompt, context)
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });

      const contextStr = context ? `\n当前工程与硬件上下文：${JSON.stringify(context)}` : '';
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${prompt}${contextStr}`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: '诊断或技术方案标题' },
              proactiveWarning: { type: Type.STRING, description: '主动防护预警：指出不合规风险、丢帧/掉色/覆盖隐患' },
              hardwareAlert: { type: Type.STRING, description: '结合硬件温度、显存与磁盘I/O的技术性预警' },
              steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Step-by-Step 分步执行方案'
              },
              specTable: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    parameter: { type: Type.STRING },
                    standard: { type: Type.STRING },
                    hazard: { type: Type.STRING }
                  },
                  required: ['parameter', 'standard', 'hazard']
                },
                description: '工业参数标准与违规风险对比表'
              },
              checklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '交付前零失误核查清单 (Checklist)'
              }
            },
            required: ['title', 'proactiveWarning', 'hardwareAlert', 'steps', 'specTable', 'checklist']
          }
        }
      });

      const rawText = response.text;
      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        res.json({ source: 'gemini', report: parsed });
        return;
      }
      res.json({
        source: 'industrial_engine',
        report: buildDeterministicAssistantResponse(prompt, context)
      });
    } catch (_err) {
      res.json({
        source: 'industrial_engine',
        report: buildDeterministicAssistantResponse(prompt, context)
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CutLine Post-Production Workbench running on http://localhost:${PORT}`);
  });
}

startServer();
