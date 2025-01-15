import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing OpenAI API Key');
}

export default class DreamAPI {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generateDream(req, res) {
        try {
            console.log('Request body:', req.body);
            console.log('Generating image for prompt:', req.body.dream);
            
            // 确保提示词是有效的字符串
            const cleanPrompt = String(req.body.dream).trim();
            console.log('Cleaned prompt:', cleanPrompt);
            
            if (!cleanPrompt) {
                throw new Error('Empty prompt');
            }
            
            // 构建更安全和艺术化的提示词
            let enhancedPrompt = `A painting of ${cleanPrompt}`;
            
            // 如果有关键词，添加到提示词中
            if (req.body.keywords) {
                const keywords = String(req.body.keywords).trim();
                if (keywords) {
                    enhancedPrompt += ` with ${keywords}`;
                }
            }
            
            // 添加风格描述
            enhancedPrompt += `, dreamlike style`;
            
            // 确保提示词不包含特殊字符
            enhancedPrompt = enhancedPrompt.replace(/[^\w\s,]/g, ' ');
            enhancedPrompt = enhancedPrompt.replace(/\s+/g, ' ').trim();
            
            console.log('Final enhanced prompt:', enhancedPrompt);
            console.log('Sending request to DALL-E with prompt length:', enhancedPrompt.length);
            
            const response = await this.openai.images.generate({
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

    async continueDream(req, res) {
        try {
            const { currentDream } = req.body;
            
            if (!currentDream) {
                throw new Error('No dream content provided');
            }

            const completion = await this.openai.chat.completions.create({
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
} 