import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { authMiddleware } from '../middleware/auth.js';
import { requirePermission } from '../middleware/permissions.js';
import logger from '../lib/logger.js';

const ai = new Hono();

ai.use('*', authMiddleware);

// ============================================
// AI Service Configuration
// ============================================
const AI_CONFIG = {
  apiUrl: process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.AI_MODEL || 'gpt-4o-mini',
  maxTokens: 4096,
};

// Helper function to call AI API
async function callAI(messages: Array<{ role: string; content: string }>, options?: { maxTokens?: number }) {
  if (!AI_CONFIG.apiKey) {
    throw new Error('AI API key not configured');
  }

  const response = await fetch(`${AI_CONFIG.apiUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages,
      max_tokens: options?.maxTokens || AI_CONFIG.maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`AI API error: ${error}`);
  }

  const data = await response.json() as { choices: Array<{ message?: { content?: string } }> };
  return data.choices[0]?.message?.content || '';
}

// Validators
const chatSchema = z.object({
  message: z.string().min(1, 'الرسالة مطلوبة').max(4000),
  conversationId: z.string().optional(),
  context: z.string().optional(),
});

const summarizeSchema = z.object({
  text: z.string().min(10, 'النص قصير جداً').max(50000),
  type: z.enum(['brief', 'detailed', 'bullets']).default('brief'),
});

const generateSchema = z.object({
  type: z.enum(['quiz', 'flashcards', 'outline', 'explanation']),
  topic: z.string().min(2, 'الموضوع مطلوب'),
  courseId: z.string().optional(),
  options: z
    .object({
      count: z.number().min(1).max(20).optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      language: z.enum(['ar', 'en']).optional(),
    })
    .optional(),
});

const translateSchema = z.object({
  text: z.string().min(1).max(10000),
  from: z.enum(['ar', 'en', 'auto']).default('auto'),
  to: z.enum(['ar', 'en']),
});

// ============================================
// POST /ai/chat - المحادثة مع AI
// ============================================
ai.post('/chat', requirePermission('use_ai_chat'), zValidator('json', chatSchema), async (c) => {
  const user = c.get('user');
  const { message, conversationId, context } = c.req.valid('json');

  try {
    // Build conversation history
    let history: Array<{ role: string; content: string }> = [];

    if (conversationId) {
      const prevMessages = await db.query.aiConversations.findMany({
        where: eq(schema.aiConversations.conversationId, conversationId),
        orderBy: [schema.aiConversations.createdAt],
        limit: 10,
      });
      history = prevMessages.map((m) => ({ role: m.role, content: m.content }));
    }

    // System prompt
    const systemPrompt = `أنت مساعد أكاديمي ذكي في نظام إدارة المحتوى الأكاديمي S-ACM.
مهمتك مساعدة الطلاب والأساتذة في:
- شرح المفاهيم الأكاديمية
- الإجابة على الأسئلة التعليمية
- تلخيص المحتوى
- إنشاء أسئلة وتمارين
- المساعدة في البحث والدراسة

${context ? `السياق: ${context}` : ''}

أجب باللغة العربية بشكل واضح ومفيد.`;

    const messages = [{ role: 'system', content: systemPrompt }, ...history, { role: 'user', content: message }];

    const aiResponse = await callAI(messages);

    // Generate conversation ID if new
    const convId = conversationId || crypto.randomUUID();

    // Save conversation
    await db.insert(schema.aiConversations).values([
      { conversationId: convId, userId: user.userId, role: 'user', content: message },
      { conversationId: convId, userId: user.userId, role: 'assistant', content: aiResponse },
    ]);

    // Log usage
    await db.insert(schema.auditLogs).values({
      userId: user.userId,
      action: 'ai_chat',
      entityType: 'ai',
      newValue: { conversationId: convId, messageLength: message.length },
    });

    return c.json({
      success: true,
      data: {
        response: aiResponse,
        conversationId: convId,
      },
    });
  } catch (error: any) {
    logger.error(`AI chat error: ${error.message}`);
    return c.json({ success: false, error: 'حدث خطأ في خدمة الذكاء الاصطناعي' }, 500);
  }
});

// ============================================
// POST /ai/summarize - تلخيص النص
// ============================================
ai.post('/summarize', requirePermission('use_ai_summarize'), zValidator('json', summarizeSchema), async (c) => {
  const user = c.get('user');
  const { text, type } = c.req.valid('json');

  try {
    const prompts = {
      brief: 'لخص النص التالي في فقرة واحدة موجزة:',
      detailed: 'قدم ملخصاً تفصيلياً للنص التالي مع الحفاظ على النقاط الرئيسية:',
      bullets: 'لخص النص التالي في نقاط رئيسية مرقمة:',
    };

    const messages = [
      { role: 'system', content: 'أنت مساعد متخصص في تلخيص النصوص الأكاديمية باللغة العربية.' },
      { role: 'user', content: `${prompts[type]}\n\n${text}` },
    ];

    const summary = await callAI(messages);

    await db.insert(schema.auditLogs).values({
      userId: user.userId,
      action: 'ai_summarize',
      entityType: 'ai',
      newValue: { type, textLength: text.length },
    });

    return c.json({ success: true, data: { summary, type } });
  } catch (error: any) {
    logger.error(`AI summarize error: ${error.message}`);
    return c.json({ success: false, error: 'حدث خطأ في خدمة التلخيص' }, 500);
  }
});

// ============================================
// POST /ai/generate - توليد محتوى تعليمي
// ============================================
ai.post('/generate', requirePermission('use_ai_generate'), zValidator('json', generateSchema), async (c) => {
  const user = c.get('user');
  const { type, topic, options } = c.req.valid('json');

  try {
    const count = options?.count || 5;
    const difficulty = options?.difficulty || 'medium';
    const language = options?.language || 'ar';

    const prompts: Record<string, string> = {
      quiz: `أنشئ ${count} أسئلة اختيار من متعدد عن "${topic}" بمستوى صعوبة ${difficulty === 'easy' ? 'سهل' : difficulty === 'medium' ? 'متوسط' : 'صعب'}.
لكل سؤال 4 خيارات مع تحديد الإجابة الصحيحة.
أعد النتيجة بصيغة JSON:
[{"question": "...", "options": ["أ", "ب", "ج", "د"], "correct": 0, "explanation": "..."}]`,

      flashcards: `أنشئ ${count} بطاقات تعليمية (Flashcards) عن "${topic}".
كل بطاقة تحتوي على سؤال/مصطلح في الوجه الأمامي والإجابة/التعريف في الوجه الخلفي.
أعد النتيجة بصيغة JSON:
[{"front": "...", "back": "..."}]`,

      outline: `أنشئ مخطط تفصيلي لموضوع "${topic}" يشمل:
- العناوين الرئيسية
- العناوين الفرعية
- النقاط الأساسية تحت كل عنوان
أعد النتيجة بصيغة JSON:
[{"title": "...", "subtopics": [{"title": "...", "points": ["..."]}]}]`,

      explanation: `اشرح موضوع "${topic}" بشكل مفصل ومبسط يناسب الطلاب.
اشمل:
- تعريف الموضوع
- المفاهيم الأساسية
- أمثلة توضيحية
- تطبيقات عملية`,
    };

    const messages = [
      {
        role: 'system',
        content: `أنت معلم خبير متخصص في إنشاء المحتوى التعليمي ${language === 'ar' ? 'باللغة العربية' : 'بالإنجليزية'}.`,
      },
      { role: 'user', content: prompts[type] },
    ];

    const result = await callAI(messages, { maxTokens: 8000 });

    // Try to parse JSON for structured types
    let parsedResult = result;
    if (['quiz', 'flashcards', 'outline'].includes(type)) {
      try {
        // Extract JSON from response
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Keep as string if parsing fails
      }
    }

    await db.insert(schema.auditLogs).values({
      userId: user.userId,
      action: 'ai_generate',
      entityType: 'ai',
      newValue: { type, topic, options },
    });

    return c.json({ success: true, data: { type, topic, result: parsedResult } });
  } catch (error: any) {
    logger.error(`AI generate error: ${error.message}`);
    return c.json({ success: false, error: 'حدث خطأ في خدمة التوليد' }, 500);
  }
});

// ============================================
// POST /ai/translate - الترجمة
// ============================================
ai.post('/translate', requirePermission('use_ai_translate'), zValidator('json', translateSchema), async (c) => {
  const user = c.get('user');
  const { text, from, to } = c.req.valid('json');

  try {
    const targetLang = to === 'ar' ? 'العربية' : 'الإنجليزية';
    const sourceLang = from === 'ar' ? 'العربية' : from === 'en' ? 'الإنجليزية' : 'اللغة المكتشفة تلقائياً';

    const messages = [
      { role: 'system', content: `أنت مترجم محترف متخصص في الترجمة الأكاديمية.` },
      { role: 'user', content: `ترجم النص التالي من ${sourceLang} إلى ${targetLang}:\n\n${text}` },
    ];

    const translation = await callAI(messages);

    await db.insert(schema.auditLogs).values({
      userId: user.userId,
      action: 'ai_translate',
      entityType: 'ai',
      newValue: { from, to, textLength: text.length },
    });

    return c.json({ success: true, data: { translation, from, to } });
  } catch (error: any) {
    logger.error(`AI translate error: ${error.message}`);
    return c.json({ success: false, error: 'حدث خطأ في خدمة الترجمة' }, 500);
  }
});

// ============================================
// GET /ai/conversations - محادثاتي
// ============================================
ai.get('/conversations', requirePermission('use_ai_chat'), async (c) => {
  const user = c.get('user');

  // Get unique conversation IDs with last message
  const conversations = await db
    .selectDistinct({ conversationId: schema.aiConversations.conversationId })
    .from(schema.aiConversations)
    .where(eq(schema.aiConversations.userId, user.userId))
    .orderBy(desc(schema.aiConversations.createdAt))
    .limit(20);

  const result = await Promise.all(
    conversations.map(async ({ conversationId }) => {
      const messages = await db.query.aiConversations.findMany({
        where: eq(schema.aiConversations.conversationId, conversationId),
        orderBy: [schema.aiConversations.createdAt],
        limit: 1,
      });
      return {
        conversationId,
        firstMessage: messages[0]?.content.substring(0, 100),
        createdAt: messages[0]?.createdAt,
      };
    })
  );

  return c.json({ success: true, data: result });
});

// ============================================
// GET /ai/conversations/:id - محادثة محددة
// ============================================
ai.get('/conversations/:id', requirePermission('use_ai_chat'), async (c) => {
  const user = c.get('user');
  const conversationId = c.req.param('id');

  const messages = await db.query.aiConversations.findMany({
    where: eq(schema.aiConversations.conversationId, conversationId),
    orderBy: [schema.aiConversations.createdAt],
  });

  // Verify ownership
  if (messages.length > 0 && messages[0].userId !== user.userId) {
    return c.json({ success: false, error: 'غير مصرح' }, 403);
  }

  return c.json({ success: true, data: messages });
});

// ============================================
// DELETE /ai/conversations/:id - حذف محادثة
// ============================================
ai.delete('/conversations/:id', requirePermission('use_ai_chat'), async (c) => {
  const conversationId = c.req.param('id');

  await db
    .delete(schema.aiConversations)
    .where(eq(schema.aiConversations.conversationId, conversationId));

  return c.json({ success: true, message: 'تم حذف المحادثة' });
});

export default ai;
