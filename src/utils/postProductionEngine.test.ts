import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildStandardFilename,
  auditBatchFilenames,
  parseTimecodeToFrames,
  framesToTimecode,
  calculateTimecodeSync,
  calculateProxyStorageEstimate,
  evaluateHardwareTelemetry,
  generateStandardFolderStructure,
  convertSmpteTimecodeAndDuration,
  formatUnsignedTimecode,
  formatRealSeconds
} from './postProductionEngine';

test('buildStandardFilename enforces industrial naming and catches non-ASCII or Final anti-patterns', () => {
  const cleanResult = buildStandardFilename({
    projectCode: 'ORION26',
    scene: 'SC04',
    shot: 'SH012',
    cameraUnit: 'CAMA',
    take: 'T02',
    version: 'v01',
    extension: 'mov'
  });
  assert.equal(cleanResult.isValid, true);
  assert.equal(cleanResult.riskLevel, 'nominal');
  assert.equal(cleanResult.standardizedSuggestion, 'ORION26_SC04_SH012_CAMA_T02_v01.mov');

  const riskyResult = buildStandardFilename({
    projectCode: '奥猎座 26',
    scene: 'SC 04',
    shot: 'SH012',
    cameraUnit: 'CAM A',
    take: 'T02',
    version: 'Final_终版2',
    extension: '.MOV'
  });
  assert.equal(riskyResult.isValid, false);
  assert.equal(riskyResult.riskLevel, 'critical');
  assert.ok(riskyResult.issues.length >= 2);
  assert.equal(riskyResult.standardizedSuggestion, '26_SC_04_SH012_CAM_A_T02_v02.mov');
});

test('auditBatchFilenames detects camera raw default names and missing versions', () => {
  const results = auditBatchFilenames(['C0001.MP4', 'ORION26_SC01_SH001_CAMA_T01_v01.mov'], 'ORION26');
  assert.equal(results.length, 2);
  assert.equal(results[0].isValid, false);
  assert.equal(results[0].riskLevel, 'critical');
  assert.equal(results[1].isValid, true);
  assert.equal(results[1].riskLevel, 'nominal');
});

test('SMPTE timecode parsing and sync offset calculation handles 23.976 vs 24.00 pull-down drift', () => {
  const parsed = parseTimecodeToFrames('01:00:00:00', 24);
  assert.equal(parsed.valid, true);
  assert.equal(parsed.frames, 86400);

  const sync = calculateTimecodeSync({
    videoTc: '01:00:10:00',
    audioTc: '01:00:11:12',
    videoFps: 23.976,
    audioTcFps: 24.0,
    audioSampleRateHz: 44100
  });

  assert.equal(sync.valid, true);
  assert.equal(sync.offsetFrames, 36);
  assert.equal(sync.offsetTimecode, '+00:00:01:12');
  assert.equal(sync.hasPullDownRisk, true);
  assert.equal(sync.driftFramesPerHour, 86.4);
  assert.equal(sync.hasSampleRateMismatch, true);
  assert.ok(sync.warnings.length >= 2);
});

test('framesToTimecode formats negative and positive frame offsets accurately', () => {
  assert.equal(framesToTimecode(-48, 24), '-00:00:02:00');
  assert.equal(framesToTimecode(25, 25), '+00:00:01:00');
  assert.equal(formatUnsignedTimecode(240, 24), '00:00:10:00');
  assert.equal(formatRealSeconds(3603.6), '01:00:03.600');
});

test('convertSmpteTimecodeAndDuration converts 23.976 fps to 25 fps PAL and calculates duration spans with handles', () => {
  const res = convertSmpteTimecodeAndDuration({
    sourceTc: '00:01:00:00', // 1440 frames at 24 nominal timebase
    secondaryTc: '00:02:30:12', // 3612 frames at 24 nominal timebase
    operation: 'span',
    sourceFps: 23.976,
    targetFps: 25,
    handleFrames: 48
  });

  assert.equal(res.valid, true);
  assert.equal(res.sourceTotalFrames, 1440);
  // 1440 frames mapped 1:1 into 25fps timebase = 57 seconds + 15 frames = 00:00:57:15
  assert.equal(res.targetTcFrameMatch, '00:00:57:15');
  // 1440 frames at 23.976 (24000/1001) = 60.06 seconds real time
  assert.equal(res.sourceRealSeconds, 60.06);
  // Span frames = 3612 - 1440 = 2172 frames
  assert.equal(res.resultFramesSource, 2172);
  assert.equal(res.resultTcSource, '00:01:30:12');
  // With 48f handles on both head and tail (+96 frames) = 2268 frames
  assert.equal(res.totalFramesWithHandlesSource, 2268);
  // Speed ratio 25 / (24000/1001) = 104.271%
  assert.equal(res.speedRatioPercent, 104.271);
  assert.equal(res.speedDeltaPercent, 4.271);
  assert.ok(res.pitchShiftSemitones > 0.7);
});

test('calculateProxyStorageEstimate computes realistic RAW vs ProRes Proxy storage savings', () => {
  const est = calculateProxyStorageEstimate('arri-alexa35', 10);
  assert.ok(est.rawGb > 10000);
  assert.ok(est.proxyGb < 300);
  assert.ok(est.savingsPercent > 95);
});

test('evaluateHardwareTelemetry flags thermal throttling and Long-GOP multi-stream hazards', () => {
  const risk = evaluateHardwareTelemetry({
    gpuTempC: 86,
    cpuTempC: 91,
    vramUsedGb: 22,
    vramTotalGb: 24,
    ramUsedGb: 48,
    ramTotalGb: 64,
    storageReadMbps: 150,
    activeStreams: 4,
    activeCodecType: 'Long-GOP'
  });

  assert.equal(risk.overallStatus, 'Critical');
  assert.equal(risk.thermalThrottleRisk, true);
  assert.equal(risk.vramOomRisk, true);
  assert.ok(risk.alerts.length >= 3);
});

test('generateStandardFolderStructure returns 6 industrial root bins', () => {
  const folders = generateStandardFolderStructure('ORION26', 2, ['A_CAM', 'B_CAM']);
  assert.equal(folders.length, 6);
  assert.equal(folders[0].code, '01_Footage');
  assert.ok(folders[0].children.length >= 5);
});

