async function huggingface(prompt) {
  try {
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.IA_TOKEN_HUGGINFACE}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      },
    );

    const data = await response.json();

    const formatedData = JSON.parse(data.choices[0].message.content);

    return {
      success: true,
      provider: "huggingface",
      message: "sucesso ao buscar ia",
      data: formatedData.topic,
    };
  } catch (error) {
    console.error("erro ao buscar ia huggingface:", error);
    return {
      success: false,
      provider: "huggingface",
      message: "erro ao buscar ia",
    };
  }
}
module.exports = huggingface;
