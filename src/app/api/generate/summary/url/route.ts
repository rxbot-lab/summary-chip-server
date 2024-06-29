import { AiSummaryService } from "@/service/ai-summary.service";
import { getWebsiteMetadata } from "@/service/metadata.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  url: z.string(),
  language: z.string().optional(),
  maxWords: z.number().optional(),
});

const service = new AiSummaryService();

export async function POST(request: NextRequest) {
  try {
    const body = BodySchema.parse(await request.json());
    const summaryPromise = service.generateAISummaryFromUrl(
      body.url,
      body.language,
      body.maxWords
    );

    const hightlightsPromise = service.generateHighlightsFromUrl(body.url);

    const [summary, hightlights] = await Promise.all([
      summaryPromise,
      hightlightsPromise,
    ]);

    return NextResponse.json(
      {
        summary,
        hightlights,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("Invalid request body:", error.errors);
      return NextResponse.json(
        {
          message: "Invalid request body",
          errors: error.errors.map((e) => ({
            message: e.message,
            path: e.path,
          })),
        },
        {
          status: 400,
        }
      );
    } else {
      console.error("Error fetching metadata:", error);
      return NextResponse.json(
        { message: "Internal server error" },
        {
          status: 500,
        }
      );
    }
  }
}
