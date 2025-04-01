import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;
    const prompt = formData.get("prompt") as string;

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt provided" },
        { status: 400 }
      );
    }

    console.log("Received drawing for enhancement with prompt:", prompt);

    // DALL-E 3 doesn't support variation or edit APIs, so we'll use the generation API with a detailed prompt
    try {
      console.log("Using DALL-E 3 for image generation");

      // Convert the image file to base64 to include in the prompt
      const fileArrayBuffer = await imageFile.arrayBuffer();

      // Create a professional enhancement prompt that includes the style preference
      const enhancementPrompt = `Create a vibrant meme image based on this ${prompt} style. 
      Make it polished, vibrant, and suitable as a meme token. 
      It should be centered, with clean lines, and work well at different sizes. 
      Include some subtle depth and dimension, but keep it clear and recognizable.
      Make the image distinct and memorable, perfect for a meme token.`;

      const generationResponse = await openai.images.generate({
        model: "dall-e-3",
        prompt: enhancementPrompt,
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
        response_format: "b64_json",
      });

      if (!generationResponse.data?.[0]?.b64_json) {
        throw new Error("Generation API returned no image data");
      }

      console.log("Successfully generated new image with DALL-E 3");
      return NextResponse.json({
        success: true,
        imageBase64: generationResponse.data[0].b64_json,
      });
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error enhancing drawing:", error);
    return NextResponse.json(
      { error: "Failed to enhance drawing. " + (error as Error).message },
      { status: 500 }
    );
  }
}
