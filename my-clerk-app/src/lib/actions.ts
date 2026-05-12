"use server";
import { clerkClient, auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function updateUserRole(role: string) {
  try {
    console.log(`[RBAC] Attempting to update role to: ${role}`);
    const { userId } = await auth();
    
    if (!userId) {
      console.error("[RBAC] No userId found in auth(). User might not be signed in.");
      throw new Error("Not authenticated");
    }

    console.log(`[RBAC] Found userId: ${userId}. Fetching clerkClient...`);
    const client = await clerkClient();
    
    console.log(`[RBAC] Updating publicMetadata for user ${userId}...`);
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: role,
      },
    });

    console.log(`[RBAC] Successfully updated role to ${role}. Revalidating...`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: any) {
    console.error("[RBAC] Error updating user role:", err);
    return { success: false, error: err.message };
  }
}
