const axios = require('axios');

exports.compileKotlin = async (req, res) => {
    const { code } = req.body;
    
    const options = {
        method: 'POST',
        url: 'https://judge0-ce.p.rapidapi.com/submissions',
        params: { base64_encoded: 'false', fields: '*' },
        headers: {
            'X-RapidAPI-Key': process.env.JUDGE0_KEY,
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        data: {
            language_id: 78,
            source_code: code,
            stdin: '',
            expected_output: "Hello, Kotlin!\n",
            cpu_time_limit: 5,
            compiler_options: "-J-XX:+DisableAttachMechanism"
        }
    };

    try {
        const submission = await axios.request(options);
        const submissionId = submission.data.token;
      
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const result = await axios.get(
            `https://judge0-ce.p.rapidapi.com/submissions/${submissionId}`,
            { headers: options.headers }
        );

        const rawOutput = result.data.stdout || result.data.stderr || result.data.compile_output;
        const cleanOutput = rawOutput
            .replace(/OpenJDK 64-Bit Server VM warning:.*\n?/g, '') 
            .trim();

        res.json({
            output: cleanOutput,
            statusCode: result.data.status.id,
            isCorrect: cleanOutput === "Hello, Kotlin!"
        });

    } catch (error) {
        console.error('Judge0 error:', error);
        res.status(500).json({ error: 'Failed to compile code' });
    }
};