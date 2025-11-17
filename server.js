server.js
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json({limit: '50mb'}));

app.post('/solve-math', async (req, res) => {
  try {
    const { image } = req.body;
    
    // Step 1: Use Claude API to read and solve the math
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: image
              }
            },
            {
              type: 'text',
              text: 'Read this math problem from the image and solve it step by step. Format your response as: Problem: [the problem], Answer: [final answer], Steps: [solution steps]'
            }
          ]
        }]
      })
    });
    
    const data = await response.json();
    const solution = data.content[0].text;
    
    // Parse the response
    res.json({
      problem: extractProblem(solution),
      answer: extractAnswer(solution),
      steps: extractSteps(solution)
    });
    
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to solve problem' });
  }
});

app.listen(process.env.PORT);