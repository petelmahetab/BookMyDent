import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ✅ Call clerkClient as a function: clerkClient()
    const client = await clerkClient();
    
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        isPro: true,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Successfully upgraded to Pro!" 
    });
  } catch (error) {
    console.error("Upgrade error:", error);
    return NextResponse.json(
      { error: "Failed to upgrade" }, 
      { status: 500 }
    );
  }
}