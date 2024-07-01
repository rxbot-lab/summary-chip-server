import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { parse } from "node-html-parser";
import { z } from "zod";

const model = openai("gpt-4o");

export class AiSummaryService {
  /**
   * Get the HTML body of a website.
   * Remove scripts and styles from the body.
   * @param url Website URL
   * @returns
   */
  private async getHtmlBody(url: string): Promise<string> {
    // Fetch the HTML body of the URL
    const response = await fetch(url);
    const html = await response.text();
    const body = parse(html).querySelector("body");
    if (!body) {
      throw new Error("Failed to parse HTML body");
    }

    // Remove scripts and styles
    body.querySelectorAll("script").forEach((script) => script.remove());
    body.querySelectorAll("style").forEach((style) => style.remove());
    // remove svg
    body.querySelectorAll("svg").forEach((svg) => svg.remove());

    // remove all attributes
    body.querySelectorAll("*").forEach((element) => {
      for (const attribute of Object.keys(element.attributes)) {
        element.removeAttribute(attribute);
      }
    });

    // remove button, form, input, select, textarea and other interactive elements
    body.querySelectorAll("button").forEach((button) => button.remove());
    body.querySelectorAll("form").forEach((form) => form.remove());
    body.querySelectorAll("input").forEach((input) => input.remove());
    body.querySelectorAll("select").forEach((select) => select.remove());
    body.querySelectorAll("textarea").forEach((textarea) => textarea.remove());
    body.querySelectorAll("canvas").forEach((canvas) => canvas.remove());
    body.querySelectorAll("audio").forEach((audio) => audio.remove());
    body.querySelectorAll("video").forEach((video) => video.remove());
    body.querySelectorAll("iframe").forEach((iframe) => iframe.remove());
    body.querySelectorAll("embed").forEach((embed) => embed.remove());
    body.querySelectorAll("object").forEach((object) => object.remove());
    body.querySelectorAll("param").forEach((param) => param.remove());
    body.querySelectorAll("track").forEach((track) => track.remove());
    body.querySelectorAll("map").forEach((map) => map.remove());
    body.querySelectorAll("area").forEach((area) => area.remove());

    // remove any element with empty text content
    body.querySelectorAll("*").forEach((element) => {
      if (!element.text.trim()) {
        element.remove();
      }
    });

    const textContent = body.textContent;

    // if empty line, remove it
    const lines = textContent.split("\n");
    const filteredLines = lines.filter((line) => line.trim());
    const filteredTextContent = filteredLines.join("\n");
    return filteredTextContent;
  }

  async generateAISummaryFromUrl(
    url: string,
    language: string = "en",
    maxWords: number = 20
  ) {
    const body = await this.getHtmlBody(url);
    return this.generateSummaryFromText(body, language, maxWords);
  }

  async generateSummaryFromText(
    body: string,
    language: string = "en",
    maxWords: number = 20
  ) {
    const { text } = await generateText({
      model,
      prompt: `Summarize the article in less than ${maxWords} words in language ${language}:\n${body}`,
    });

    return text;
  }

  async generateHighlightsFromUrl(url: string, language: string = "en") {
    const body = await this.getHtmlBody(url);
    return this.generateHighlightsFromText(body, language);
  }

  async generateHighlightsFromText(
    body: string,
    language: string
  ): Promise<string[]> {
    const { object } = await generateObject({
      model,
      prompt: `Highlight the key points of the article less than 20 words in language: ${language}:\n${body}`,
      schema: z.object({
        hightlights: z.array(z.string()),
      }),
    });

    return object.hightlights;
  }
}
