import { NextResponse } from 'next/server';

export async function POST(req) {
    try {
        const body = await req.json();
        const { action, content, question } = body;

        const ollamaUrl = process.env.OLLAMA_AI_URL || 'http://localhost:11434';

        let systemPrompt = '';
        let userPrompt = '';

        if (action === 'summarize') {
            systemPrompt = `You are an elite DevOps AI assistant named Aegis. Your job is to read the provided journey log or incident report markdown file AND SUMMARIZE the key findings, errors, and outcomes in a concise, conversational manner suitable for text-to-speech reading. Keep it under 3 sentences. Do not use complex markdown formatting or lists in your response, just extremely concise conversational text.`;
            userPrompt = `Please summarize this incident log:\n\n${content}`;
        } else if (action === 'ask') {
            systemPrompt = `You are an elite DevOps AI assistant named Aegis. Answer the user's question based strictly on the provided incident log context. Be concise and conversational, suitable for text-to-speech. If the answer is not in the log, state that clearly.`;
            userPrompt = `Context:\n${content}\n\nQuestion: ${question}`;
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // Call Custom Ollama Endpoint (/api/generate format)
        // Adjust this if your specific endpoint uses the /api/chat format instead
        const response = await fetch(`${ollamaUrl}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-oss:20b', // Custom Ollama model
                prompt: `${systemPrompt}\n\n${userPrompt}`,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ollama API Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();

        if (!data.response) {
            throw new Error('Invalid response format from Ollama');
        }

        const reply = data.response.trim();
        return NextResponse.json({ result: reply });

    } catch (error) {
        console.error('AI Route Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process AI request' },
            { status: 500 }
        );
    }
}
