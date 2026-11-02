const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildAdminContext, buildStudentContext } = require('../services/aiContext.service');

const MAX_USER_CHARS = 8000;
const MAX_SNAPSHOT_CHARS = 900_000;
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function buildSystemInstruction(role) {
  if (role === 'Admin') {
    return `You are the CareerSync **Admin** assistant. You help placement cell administrators interpret live portal data.

Rules:
- Base every answer ONLY on the JSON snapshot attached to the user's latest message. Do not invent companies, jobs, students, or statistics.
- If the snapshot does not contain enough information, say so clearly and suggest which area of the portal might have it (e.g. Review Applications, Rounds, Analytics).
- Be concise and professional. When you cite numbers, they must match the snapshot.
- Do not suggest running SQL, shell commands, or bypassing authentication.`;
  }

  return `You are the CareerSync **Student** assistant. You help one signed-in student understand their own applications, round progress, and which drives are still open.

Rules:
- Use ONLY the JSON snapshot for this student (profile, applications, per-round rows, open job catalogue). Never disclose or infer other students' private data.
- For questions such as which round a specific company/job application is in, use company_name, role_name, app_status, current_round_name, current_round_seq, and my_applications_round_detail.
- If something is not in the snapshot, say you cannot see it from the current data.
- Be friendly and brief. Never ask for passwords or JWT tokens.`;
}

function toGeminiHistory(messages) {
  const out = [];
  for (const m of messages) {
    if (m.role === 'user') {
      out.push({ role: 'user', parts: [{ text: String(m.content ?? '') }] });
    } else if (m.role === 'assistant') {
      out.push({ role: 'model', parts: [{ text: String(m.content ?? '') }] });
    }
  }
  return out;
}

exports.chat = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({
        success: false,
        error: { message: 'AI assistant is not configured. Set GEMINI_API_KEY on the server.' },
      });
    }

    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: { message: 'Send a non-empty messages array.' } });
    }

    const last = messages[messages.length - 1];
    if (last.role !== 'user') {
      return res.status(400).json({
        success: false,
        error: { message: 'The last message must have role "user".' },
      });
    }

    let userText = String(last.content ?? '').trim();
    if (!userText) {
      return res.status(400).json({ success: false, error: { message: 'Message content is empty.' } });
    }
    if (userText.length > MAX_USER_CHARS) {
      userText = userText.slice(0, MAX_USER_CHARS);
    }

    const context =
      req.user.role === 'Admin'
        ? await buildAdminContext()
        : await buildStudentContext(req.user.student_id);

    let snapshot = JSON.stringify(context);
    if (snapshot.length > MAX_SNAPSHOT_CHARS) {
      snapshot = `${snapshot.slice(0, MAX_SNAPSHOT_CHARS)}\n…(snapshot truncated for size)`;
    }

    const block = `[Read-only placement data snapshot — ${new Date().toISOString()}]\n${snapshot}\n\n---\n\nQuestion:\n${userText}`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: buildSystemInstruction(req.user.role),
    });

    const history = toGeminiHistory(messages.slice(0, -1));
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 2048,
        temperature: 0.35,
      },
    });

    const result = await chat.sendMessage(block);
    const text = result.response.text();

    return res.status(200).json({ success: true, message: text, model: MODEL });
  } catch (err) {
    console.error('Gemini chat error:', err);
    const msg =
      err?.message ||
      err?.errorDetails?.[0]?.message ||
      'The AI service returned an error. Check GEMINI_API_KEY and GEMINI_MODEL.';
    return res.status(502).json({ success: false, error: { message: msg } });
  }
};
