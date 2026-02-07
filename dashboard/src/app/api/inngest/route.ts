import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { collectionStart } from "@/lib/inngest/functions/collection";
import { scheduledCollectionChecker } from "@/lib/inngest/functions/scheduled-collection";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        collectionStart,
        scheduledCollectionChecker,
    ],
});
