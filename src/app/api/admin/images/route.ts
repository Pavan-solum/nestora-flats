import { staffAllows } from "@/lib/supabase/admin-auth";
import { uploadListingFile } from "@/lib/supabase/records";

export async function POST(request: Request) {
  if (!(await staffAllows("uploadImage"))) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  try {
    const url = await uploadListingFile(file);
    return Response.json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not upload image";
    return Response.json({ error: message }, { status: 400 });
  }
}
