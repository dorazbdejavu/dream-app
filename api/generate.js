import { OpenAI } from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Request body:', req.body);
        const { dream, keywords } = req.body;
        
        // 确保提示词是有效的字符串
        const cleanPrompt = String(dream).trim();
        if (!cleanPrompt) {
            throw new Error('Empty prompt');
        }
        
        // 构建更安全和艺术化的提示词
        let enhancedPrompt = `A painting of ${cleanPrompt}`;
        
        // 如果有关键词，添加到提示词中
        if (keywords) {
            const cleanKeywords = String(keywords).trim();
            if (cleanKeywords) {
                enhancedPrompt += ` with ${cleanKeywords}`;
            }
        }
        
        // 添加风格描述
        enhancedPrompt += `, dreamlike style`;
        
        // 确保提示词不包含特殊字符
        enhancedPrompt = enhancedPrompt.replace(/[^\w\s,]/g, ' ');
        enhancedPrompt = enhancedPrompt.replace(/\s+/g, ' ').trim();
        
        console.log('Final enhanced prompt:', enhancedPrompt);
        
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            n: 1,
            size: "1024x1024",
        });

        console.log('Generated image URL:', response.data[0].url);
        
        res.json({
            success: true,
            imageUrl: response.data[0].url,
            prompt: enhancedPrompt
        });
    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            type: error.type,
            code: error.code,
            param: error.param,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            error: `Image generation failed: ${error.message}. Type: ${error.type}, Code: ${error.code}`
        });
    }
} 