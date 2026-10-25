# CutLine Studio — Post-Production Assistant Workbench

好莱坞与商业广告级影视后期剪辑助理工作台（Post-Production Assistant Editor Workbench），集成工业级资产与代理治理、SMPTE 时间码同步计算、视频编码与 ACES/CST 色彩科学管线、NLE 报错排错与工作站热遥测，以及 AI 总监级剪辑助理。

## 核心功能模块

1. **资产与代理治理 (Asset & Proxy Governance)**
   - 自动生成符合好莱坞与商业制作规范的 7 层标准工程目录树（`01_PROJECT` 至 `07_EXPORTS`）
   - 摄影机原始素材命名规范校验器（Reel / Camera / Date / Clip / Hash）
   - 离线代理编码配置建议（ProRes 422 Proxy / DNxHR LB）与 SMPTE 时间码及声画同步诊断

2. **编码与色彩科学 (Codec & Color Science)**
   - 帧内编码（Intra-frame）与帧间编码（Long-GOP）硬件解码负载与剪辑性能对比
   - DaVinci Wide Gamut / ACEScct 1.3 色彩管理管线（IDT → Working Space → ODT）
   - macOS QuickTime Gamma 漂移（Rec.709-A / NCLC `1-1-1` 标签）成因与工业解决方案

3. **故障排错与热监控 (Diagnostics & Thermal Monitoring)**
   - Premiere Pro / DaVinci Resolve / Avid Media Composer 常见底层崩溃、离线媒体与显存溢出诊断知识库
   - 实时工作站 GPU / CPU 温度、VRAM / RAM 占用及存储带宽瓶颈评估

4. **AI 总监级剪辑助理 (AI Senior Assistant Editor)**
   - 基于服务端 Gemini API 构建的后期技术顾问，结合当前工程代号与实时工作站遥测状态提供排错方案与交接规范指导

## 本地运行与构建

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并填入你的 `GEMINI_API_KEY`：

```bash
cp .env.example .env
```

### 3. 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动（包含 Express API 服务端与 Vite 前端）。

### 4. 运行单元测试与类型检查

```bash
npx tsx --test src/utils/postProductionEngine.test.ts
npm run lint
npm run build
```
