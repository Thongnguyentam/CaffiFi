import { NextRequest, NextResponse } from "next/server";
import { ethers } from "ethers";
import BettingABI from "@/abi/Betting.json";
import { pinFileToIPFS } from "@/app/lib/pinata"; // Import your IPFS upload function
import { useTokenGeneratingService } from "@/services/TokenGeneratingService";

// Contract address from the BettingService
const contractAddress = "0xd1b6BEa5A3b3dd4836100f5C55877c59d4666569";

async function generateImage(prompt: string): Promise<string> {
  try {
    const tokenService = useTokenGeneratingService();
    const result = await tokenService.generateTokenWithAI(prompt);
    
    if (!result.imageBase64) {
      throw new Error("No image data received");
    }

    // Convert base64 to binary
    const byteCharacters = atob(result.imageBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // Create a File from the binary data
    const file = new File([byteArray], "generated-image.png", {
      type: "image/png",
    });

    // Upload the image to IPFS
    const imageURI = await pinFileToIPFS(file);
    console.log("Image URI", imageURI);
    return imageURI;
  } catch (error) {
    console.error("Error generating image:", error);
    return "/placeholder.svg";
  }
}

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const {
      twitterHandle,
      title,
      description,
      category,
      endDate,
      amount,
      initialPoolAmount,
      imageURL,
    } = body;

    // Validate required fields
    if (
      !twitterHandle ||
      !title ||
      !description ||
      !category ||
      !endDate ||
      !amount ||
      !initialPoolAmount
    ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const prompt = `${title} - ${description}`;
    const finalImageURL = await generateImage(prompt);
    console.log("Final image URL", finalImageURL);
    // Connect to the provider - use environment variable for RPC URL
    const provider = new ethers.JsonRpcProvider(
      "https://rpc.blaze.soniclabs.com"
    );

    // Use your agent private key from environment variables
    const privateKey = process.env.AGENT_PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: "Agent private key not configured" },
        { status: 500 }
      );
    }

    const wallet = new ethers.Wallet(privateKey, provider);
    const bettingContract = new ethers.Contract(
      contractAddress,
      BettingABI,
      wallet
    );

    // Check if the Twitter handle is linked to an address
    const userAddress = await bettingContract.twitterToAddress(twitterHandle);
    if (userAddress === ethers.ZeroAddress) {
      const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
      return NextResponse.json(
        {
          error: "Twitter handle not linked",
          message: `The Twitter handle is not linked to any wallet address. Please register the Twitter handle first at ${baseURL}/settings`,
        },
        { status: 400 }
      );
    }

    // Call the createBetForUser function
    const tx = await bettingContract.createBetForUser(
      twitterHandle,
      title,
      description,
      category,
      endDate,
      amount,
      initialPoolAmount,
      finalImageURL || "/placeholder.svg"
    );

    const receipt = await tx.wait();

    // Construct the redirect URL with the bet ID
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const betId = receipt.logs[0]?.topics[1]; // Assuming the first log contains the bet ID
    const redirectUrl = `${baseURL}/bets/place-bet?id=${betId}`;

    // Return success response with transaction details and generated image
    return NextResponse.json({
      success: true,
      message: "Bet created successfully",
      transactionHash: receipt.hash,
      betId: betId,
      redirectUrl: redirectUrl,
      imageURL: finalImageURL,
    });
  } catch (error: any) {
    console.error("Error creating bet:", error);

    // Check for image generation error
    if (error.message && error.message.includes("Failed to generate image")) {
      return NextResponse.json(
        {
          error: "Image generation failed",
          message:
            "Failed to generate image for the bet. Using placeholder image instead.",
        },
        { status: 500 }
      );
    }

    // Check for onlyAgent error
    if (
      error.message &&
      error.message.includes("Only agent can call this function")
    ) {
      return NextResponse.json(
        {
          error: "Agent authorization failed",
          message:
            "The wallet address is not authorized as an agent in the smart contract. Please check setup-guide.md for instructions.",
          walletAddress: new ethers.Wallet(process.env.AGENT_PRIVATE_KEY || "")
            .address,
        },
        { status: 403 }
      );
    }

    // Check for Twitter handle not registered error
    if (
      error.message &&
      error.message.includes("Twitter handle not registered")
    ) {
      return NextResponse.json(
        {
          error: "Twitter handle not registered",
          message: `The Twitter handle provided is not registered in the smart contract. Users must register their Twitter handle with their wallet address first.`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to create bet",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
