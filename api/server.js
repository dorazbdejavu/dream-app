const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

// DreamImageGenerator 类定义 - 移到文件开头
class DreamImageGenerator {
    constructor(apiKey) {
        this.openai = new OpenAI({
            apiKey: apiKey
        });
    }

    async generateImage(prompt) {
        try {
            console.log('Generating image for prompt:', prompt);
            
            const response = await this.openai.images.generate({
                model: "dall-e-3",
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                quality: "standard",
                style: "vivid"
            });

            return {
                success: true,
                url: response.data[0].url
            };
        } catch (error) {
            console.error('Error generating image:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async translateAndEnhancePrompt(chinesePrompt) {
        try {
            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: "You are a professional prompt engineer. Convert Chinese dream descriptions into detailed English prompts for DALL-E 3, focusing on artistic style, atmosphere, and visual details. Keep the translation concise but vivid."
                }, {
                    role: "user",
                    content: chinesePrompt
                }]
            });

            return completion.choices[0].message.content;
        } catch (error) {
            throw error;
        }
    }
}

const app = express();
// 修改 CORS 配置
app.use(cors({
    origin: ['https://dream-app-dorazbdejavu.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true
}));
app.use(express.json());

// 创建 DreamImageGenerator 实例
const dreamGenerator = new DreamImageGenerator(process.env.OPENAI_API_KEY);

// 处理图片生成请求
app.post('/api/generate-dream', async (req, res) => {
    try {
        const { dream, keywords } = req.body;
        console.log('Received dream request:', { dream, keywords });

        // 组合提示词
        const prompt = keywords ? `${dream} ${keywords}` : dream;
        
        // 翻译并增强提示词
        const englishPrompt = await dreamGenerator.translateAndEnhancePrompt(prompt);
        console.log('Translated prompt:', englishPrompt);
        
        // 生成图片
        const result = await dreamGenerator.generateImage(englishPrompt);
        console.log('Generation result:', result);
        
        if (result.success) {
            res.json({
                success: true,
                imageUrl: result.url,
                prompt: englishPrompt
            });
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('Error generating dream image:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 在现有代码后添加新的端点
app.post('/api/continue-dream', async (req, res) => {
    try {
        const { currentDream } = req.body;
        console.log('Continuing dream:', currentDream);

        // 使用更诗意的系统提示词
        const completion = await dreamGenerator.openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            temperature: 0.8,
            max_tokens: 400,
            messages: [{
                role: "system",
                content: `你是一位25岁的现代女性作家，性格活泼有趣。你会把任何低落的心情写出有趣的转折。

                写作特点：
                - 像闺蜜间的对话一样自然
                - 擅长写人物之间的互动
                - 喜欢创造令人会心一笑的情节
                - 总能发现生活中的小确幸

                请根据用户的心情描述，续写一个温暖的小故事，可以：
                - 添加新的人物（比如好朋友、外卖小哥等）
                - 创造意外的惊喜
                - 用对话推进情节
                - 让故事有一个治愈的转折

                注意：
                - 故事长度控制在200字以内
                - 可以多写一些对话和细节
                - 让故事更加完整和生动`
            }, {
                role: "user",
                content: `请基于这个心情，续写一个200字以内的治愈小故事（多写一些对话和细节）：${currentDream}`
            }]
        });

        const continuation = completion.choices[0].message.content;
        console.log('Dream continuation:', continuation);

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
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 