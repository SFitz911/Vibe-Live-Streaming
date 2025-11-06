import { supabase } from './supabase'

const STORAGE_BUCKET = 'stream-recordings'
const MAX_STORAGE_BYTES = 100 * 1024 * 1024 * 1024 // 100GB in bytes (Supabase Pro)

/**
 * Calculate total storage used in the recordings bucket
 */
export async function getTotalStorageUsed(): Promise<number> {
  try {
    const { data: files, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list()

    if (error) {
      console.error('Error listing files:', error)
      return 0
    }

    // Sum up all file sizes
    const totalBytes = files.reduce((total, file) => {
      return total + (file.metadata?.size || 0)
    }, 0)

    return totalBytes
  } catch (error) {
    console.error('Error calculating storage:', error)
    return 0
  }
}

/**
 * Get all recordings sorted by creation date (oldest first)
 */
export async function getRecordingsSortedByAge() {
  try {
    const { data: files, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list('', {
        sortBy: { column: 'created_at', order: 'asc' }
      })

    if (error) throw error
    return files
  } catch (error) {
    console.error('Error getting recordings:', error)
    return []
  }
}

/**
 * Delete a recording file and its database record
 */
export async function deleteRecording(fileName: string, streamId?: string) {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([fileName])

    if (storageError) throw storageError

    // Delete from database (mark as deleted, update playback_url)
    if (streamId) {
      await supabase
        .from('streams')
        .update({
          playback_url: null,
          thumbnail_url: null,
        })
        .eq('id', streamId)
    }

    console.log(`Deleted recording: ${fileName}`)
    return { success: true }
  } catch (error) {
    console.error('Error deleting recording:', error)
    return { success: false, error }
  }
}

/**
 * Clean up old recordings to stay under storage limit
 * Deletes oldest files first until under the limit
 */
export async function cleanupOldRecordings(newFileSize: number = 0): Promise<void> {
  try {
    const currentUsage = await getTotalStorageUsed()
    const projectedUsage = currentUsage + newFileSize

    // If we're under the limit, no cleanup needed
    if (projectedUsage <= MAX_STORAGE_BYTES) {
      console.log(`Storage OK: ${(projectedUsage / 1024 / 1024 / 1024).toFixed(2)}GB / 5GB`)
      return
    }

    console.log(`Storage limit exceeded! Current: ${(currentUsage / 1024 / 1024 / 1024).toFixed(2)}GB, New file: ${(newFileSize / 1024 / 1024).toFixed(2)}MB`)

    // Get all recordings sorted by age (oldest first)
    const recordings = await getRecordingsSortedByAge()
    
    let bytesFreed = 0
    let bytesNeeded = projectedUsage - MAX_STORAGE_BYTES

    // Delete oldest files until we're under the limit
    for (const file of recordings) {
      if (bytesFreed >= bytesNeeded) break

      const fileSize = file.metadata?.size || 0
      
      // Extract stream ID from filename (format: streamId_timestamp.webm)
      const streamId = file.name.split('_')[0]
      
      await deleteRecording(file.name, streamId)
      bytesFreed += fileSize
      
      console.log(`Freed ${(fileSize / 1024 / 1024).toFixed(2)}MB by deleting ${file.name}`)
    }

    const newTotal = currentUsage - bytesFreed + newFileSize
    console.log(`Cleanup complete! New total: ${(newTotal / 1024 / 1024 / 1024).toFixed(2)}GB / 5GB`)
  } catch (error) {
    console.error('Error during cleanup:', error)
  }
}

/**
 * Upload a recording to Supabase Storage
 * Automatically triggers cleanup if needed
 */
export async function uploadRecording(
  file: File | Blob,
  streamId: string,
  fileName?: string
): Promise<{ url: string | null; error: any }> {
  try {
    // Check if cleanup is needed before uploading
    await cleanupOldRecordings(file.size)

    const recordingFileName = fileName || `${streamId}_${Date.now()}.webm`
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(recordingFileName, file, {
        contentType: 'video/webm',
        cacheControl: '3600',
        upsert: false
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(recordingFileName)

    return { url: urlData.publicUrl, error: null }
  } catch (error) {
    console.error('Error uploading recording:', error)
    return { url: null, error }
  }
}

/**
 * Get storage stats for admin dashboard
 */
export async function getStorageStats() {
  const totalUsed = await getTotalStorageUsed()
  const totalGB = totalUsed / 1024 / 1024 / 1024
  const maxGB = MAX_STORAGE_BYTES / 1024 / 1024 / 1024
  const percentUsed = (totalUsed / MAX_STORAGE_BYTES) * 100

  return {
    totalUsedBytes: totalUsed,
    totalUsedGB: parseFloat(totalGB.toFixed(2)),
    maxGB,
    percentUsed: parseFloat(percentUsed.toFixed(1)),
    available: MAX_STORAGE_BYTES - totalUsed,
  }
}

