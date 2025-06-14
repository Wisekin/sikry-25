import { createClient } from "@/utils/supabase/server"
import { logger } from "@/lib/monitoring/logger"

export class StorageManager {
  private supabase = createClient()

  async uploadFile(
    file: File,
    bucket: string,
    path: string,
    options: {
      isPublic?: boolean
      metadata?: Record<string, any>
      userId?: string
    } = {},
  ) {
    try {
      // Upload to Supabase Storage
      const { data, error } = await this.supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) throw error

      // Record in database
      const { data: fileRecord } = await this.supabase
        .from("file_uploads")
        .insert({
          user_id: options.userId,
          filename: path,
          original_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          storage_path: data.path,
          bucket,
          purpose: this.getPurposeFromBucket(bucket),
          metadata: options.metadata || {},
          is_public: options.isPublic || false,
        })
        .select()
        .single()

      logger.info("File uploaded successfully", "storage", {
        file: path,
        bucket,
        size: file.size,
      })

      return {
        path: data.path,
        url: this.getPublicUrl(bucket, data.path),
        record: fileRecord,
      }
    } catch (error) {
      logger.error("File upload failed", "storage", { error, file: file.name })
      throw error
    }
  }

  async deleteFile(bucket: string, path: string) {
    try {
      const { error } = await this.supabase.storage.from(bucket).remove([path])

      if (error) throw error

      // Remove from database
      await this.supabase.from("file_uploads").delete().eq("storage_path", path).eq("bucket", bucket)

      logger.info("File deleted successfully", "storage", { bucket, path })
    } catch (error) {
      logger.error("File deletion failed", "storage", { error, path })
      throw error
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path)

    return data.publicUrl
  }

  private getPurposeFromBucket(bucket: string): string {
    const bucketPurposeMap: Record<string, string> = {
      "company-logos": "company_logo",
      "scraper-screenshots": "scraper_screenshot",
      attachments: "attachment",
      avatars: "avatar",
    }

    return bucketPurposeMap[bucket] || "document"
  }
}

export const storageManager = new StorageManager()
