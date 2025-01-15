import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { currentDream } = req.body;
        
        if (!currentDream) {
            throw new Error('No dream content provided');
        }

        console.log('Processing dream:', currentDream);

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `你是一位擅长讲故事的梦境编织者。请根据用户的梦境描述，创造一个充满意外和情感的后续发展。

要求：
1. 添加新的角色或元素，让故事更丰富
2. 创造一些出人意料的转折或相遇
3. 描写人物的互动和对话
4. 加入一些细腻的情感描写
5. 保持梦境的神秘感和诗意
6. 让故事有一个令人回味的结局

风格：
- 像在讲一个温暖的童话故事
- 文字要优美但不过于晦涩
- 保持故事的连贯性和趣味性
- 长度控制在200字左右`
                },
                {
                    role: "user",
                    content: currentDream
                }
            ],
            temperature: 0.9,
            max_tokens: 200
        });

        console.log('Generated continuation:', completion.choices[0].message.content);

        const continuation = completion.choices[0].message.content;
        
        res.json({
            success: true,
            continuation
        });
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            type: error.type,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            error: `Failed to continue dream: ${error.message}`
        });
    }
} 