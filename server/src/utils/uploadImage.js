import { supabase } from "../db/supabase.js"
import { HttpError } from "./httpErrorHandler.js"

export async function uploadImage(file, folder) {
    const path = `${folder}/${Date.now()}-${file.originalname}`
    const bucket = process.env.SUPABASE_BUCKET

    const {error} = await supabase.storage.from(bucket).upload(
        path,
        file.buffer,
        {contentType: file.mimetype}
    )
    if (error) {
        throw new HttpError(error.message, 502)
    }

    const {data : image} = supabase.storage.from(bucket).getPublicUrl(path)

    return image.publicUrl
}