const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const client = new Anthropic();
const MODEL = 'claude-sonnet-4-6';
const DATA_FILE = path.join(__dirname, 'data', 'data.json');

app.use(express.json({ limit: '20mb' }));
app.use(express.static('public'));

const SYSTEM_PROMPT_TEXT = `あなたはゴルフスタジオの専属AIサポートコーチです。プロの人間コーチをサポートする立場として、生徒の上達を分析・評価し、具体的なアドバイスを提供します。

あなたの役割:
- 練習セッションの内容を分析し、改善点と良かった点を明確に伝える
- 測定データ（弾道測定器、スウィング分析）の写真を読み取り、技術的な観点から評価する
- ラウンドスコアを分析し、スコアを崩している原因を特定して練習すべき課題を提示する
- 目標達成に向けた具体的なアクションプランを提案する
- 励ましと共に、現実的かつ建設的なフィードバックを提供する

回答スタイル:
- 日本語で回答すること
- 専門用語は分かりやすく説明すること
- 箇条書きや見出しを使い、読みやすい形式にすること
- ポジティブな姿勢を保ちながら改善点を具体的に示すこと`;

const SYSTEM_PROMPT = [
  {
    type: 'text',
    text: SYSTEM_PROMPT_TEXT,
    cache_control: { type: 'ephemeral' }
  }
];

async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { goal: '', sessions: [], rounds: [] };
  }
}

async function writeData(data) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update goal
app.post('/api/goal', async (req, res) => {
  try {
    const { goal } = req.body;
    const data = await readData();
    data.goal = goal;
    await writeData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add practice session
app.post('/api/sessions', async (req, res) => {
  try {
    const session = {
      id: Date.now().toString(),
      date: req.body.date,
      theme: req.body.theme,
      duration: req.body.duration,
      notes: req.body.notes,
      rating: req.body.rating,
      createdAt: new Date().toISOString()
    };
    const data = await readData();
    data.sessions.unshift(session);
    await writeData(data);
    res.json(session);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete practice session
app.delete('/api/sessions/:id', async (req, res) => {
  try {
    const data = await readData();
    data.sessions = data.sessions.filter(s => s.id !== req.params.id);
    await writeData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add round record
app.post('/api/rounds', async (req, res) => {
  try {
    const round = {
      id: Date.now().toString(),
      date: req.body.date,
      course: req.body.course,
      score: req.body.score,
      putts: req.body.putts,
      fairways: req.body.fairways,
      greens: req.body.greens,
      notes: req.body.notes,
      analysis: req.body.analysis || null,
      createdAt: new Date().toISOString()
    };
    const data = await readData();
    data.rounds.unshift(round);
    await writeData(data);
    res.json(round);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete round record
app.delete('/api/rounds/:id', async (req, res) => {
  try {
    const data = await readData();
    data.rounds = data.rounds.filter(r => r.id !== req.params.id);
    await writeData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analyze measurement device photo
app.post('/api/analyze-photo', async (req, res) => {
  try {
    const { imageBase64, mediaType, context } = req.body;

    const contextText = context
      ? `\n\n追加コンテキスト: ${context}`
      : '';

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType || 'image/jpeg',
                data: imageBase64
              }
            },
            {
              type: 'text',
              text: `この測定データの画像を分析して、ゴルフの技術的な観点から詳しく評価してください。数値の意味、良い点、改善すべき点、そして具体的な練習アドバイスを提供してください。${contextText}`
            }
          ]
        }
      ]
    });

    res.json({ analysis: response.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analyze round score
app.post('/api/analyze-round', async (req, res) => {
  try {
    const { date, course, score, putts, fairways, greens, notes, goal } = req.body;

    const prompt = `以下のラウンド結果を分析してください。

【ラウンド情報】
- 日付: ${date}
- コース: ${course}
- スコア: ${score}打
- パット数: ${putts}パット
- フェアウェイキープ率: ${fairways}%
- パーオン率: ${greens}%
${notes ? `- メモ: ${notes}` : ''}
${goal ? `- 目標: ${goal}` : ''}

分析してほしいこと:
1. スコアの主な原因（何がスコアを崩しているか）
2. 各統計データの評価（パット、フェアウェイ、パーオンの水準）
3. 優先的に練習すべき課題（上位3つ）
4. 次回のラウンドに向けた具体的なアドバイス`;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    });

    res.json({ analysis: response.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Comprehensive coaching summary
app.post('/api/coaching-summary', async (req, res) => {
  try {
    const data = await readData();
    const { goal, sessions, rounds } = data;

    const recentSessions = sessions.slice(0, 10);
    const recentRounds = rounds.slice(0, 10);

    const sessionsText = recentSessions.length > 0
      ? recentSessions.map(s =>
          `[${s.date}] テーマ:${s.theme} / ${s.duration}分 / 評価:${s.rating}/5\n${s.notes}`
        ).join('\n\n')
      : '練習記録なし';

    const roundsText = recentRounds.length > 0
      ? recentRounds.map(r =>
          `[${r.date}] ${r.course}: ${r.score}打 / パット${r.putts} / FW${r.fairways}% / GIR${r.greens}%`
        ).join('\n')
      : 'ラウンド記録なし';

    const avgScore = recentRounds.length > 0
      ? Math.round(recentRounds.reduce((sum, r) => sum + Number(r.score), 0) / recentRounds.length)
      : null;

    const prompt = `以下のゴルフ練習・ラウンドデータを総合的に分析し、コーチングサマリーを作成してください。

【目標】
${goal || '未設定'}

【最近の練習セッション（最新10件）】
${sessionsText}

【最近のラウンド結果（最新10件）】
${roundsText}
${avgScore ? `\n平均スコア: ${avgScore}打` : ''}

以下の観点でサマリーを作成してください:
1. **現在の状況評価** - 練習とラウンド結果からの総合評価
2. **成長・改善が見られる点** - ポジティブなフィードバック
3. **重点課題** - 最も改善が必要な技術的課題
4. **目標達成に向けたアクションプラン** - 具体的な次のステップ（優先順位付き）
5. **メンタル・マインドセット面のアドバイス**`;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    });

    res.json({ summary: response.content[0].text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ゴルフAIコーチ サーバー起動中: http://localhost:${PORT}`);
});
