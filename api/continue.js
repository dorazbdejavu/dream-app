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

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "你是一个富有想象力的梦境续写者。请根据用户描述的梦境片段，以诗意的方式继续描述这个梦境可能的发展。保持神秘感和梦幻感。"
                },
                {
                    role: "user",
                    content: currentDream
                }
            ],
            temperature: 0.8,
            max_tokens: 200
        });

        const continuation = completion.choices[0].message.content;
        
        res.json({
            success: true,
            continuation
        });
    } catch (error) {
        console.error('Error continuing dream:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
}