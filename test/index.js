import OpenAI from "openai";


const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: 'sk-051cba0545df4acd9578ca598b2d9552'
});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "You are a helpful assistant." }],
    model: "deepseek-chat",
  });

  console.log(completion.choices[0].message.content);
}

main();