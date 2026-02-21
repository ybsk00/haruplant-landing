import { ConvexHttpClient } from "convex/browser";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://handsome-crab-723.convex.cloud";

export const convex = new ConvexHttpClient(convexUrl);
