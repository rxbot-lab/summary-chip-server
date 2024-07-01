import { getWebsiteMetadata } from "@/service/metadata.service";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  url: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== process.env.ADMIN_API_KEY) {
      return NextResponse.json(
        { message: "Unauthorized" },
        {
          status: 401,
        }
      );
    }
    const body = BodySchema.parse(await request.json());

    const metadata = await getWebsiteMetadata(body.url);

    return NextResponse.json(metadata, {
      status: 200,
    });
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
