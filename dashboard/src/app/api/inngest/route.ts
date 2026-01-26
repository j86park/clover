import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { collectionStart } from "@/lib/inngest/functions/collection";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        collectionStart, // We will create this next
    ],
});
