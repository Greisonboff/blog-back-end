const { tavily } = require("@tavily/core");
async function tavilyGet(prompt) {
  try {
    const client = tavily({
      apiKey: process.env.IA_TOKEN_TAVILY,
    });

    const response = await client.search(prompt, {
      includeAnswer: "basic",
      topic: "news",
      searchDepth: "basic",
      maxResults: 10,
      timeRange: "week",
      includeUsage: true,
      includeRawContent: "text",
    });

    return {
      success: true,
      provider: "tavily",
      message: "sucesso ao buscar notícias",
      data: response.results,
    };
  } catch (error) {
    console.error("erro ao buscar ia tavily:", error);
    return {
      success: false,
      provider: "tavily",
      message: "erro ao buscar notícias",
    };
  }
}

module.exports = tavilyGet;
