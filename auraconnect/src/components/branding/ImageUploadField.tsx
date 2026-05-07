'use client'

import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { uploadBrandingImageAction } from '@/lib/actions/branding.actions'
import { BrandingImageType } from '@/lib/infrastructure/api/types'
import { resolveImageUrl } from '@/lib/infrastructure/api/branding.api'

interface ImageUploadFieldProps {
  siteId: string
  imageType: BrandingImageType
  label: string
  currentUrl?: string | null
  onUploaded: (url: string) => void
}

export function ImageUploadField({ siteId, imageType, label, currentUrl, onUploaded }: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPendingFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  function clearSelection() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPendingFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleUpload() {
    if (!pendingFile) return
    const fd = new FormData()
    fd.append('file', pendingFile)
    startTransition(async () => {
      try {
        const url = await uploadBrandingImageAction(siteId, imageType, fd)
        onUploaded(url)
        clearSelection()
        toast.success(`${label} uploaded`)
      } catch {
        toast.error(`Failed to upload ${label}`)
      }
    })
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>

      <div className="flex gap-4 items-start flex-wrap">
        {/* Saved / current image */}
        <div className="space-y-1 min-w-[80px]">
          <p className="text-[10px] text-muted-foreground">Saved</p>
          {currentUrl ? (
            <img
              src={resolveImageUrl(currentUrl)}
              alt={label}
              className="h-16 max-w-[120px] object-contain rounded border border-border bg-muted p-1"
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          ) : (
            <div className="h-16 w-[120px] rounded border border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground">
              None
            </div>
          )}
        </div>

        {/* New file preview */}
        {previewUrl && (
          <div className="space-y-1 min-w-[80px]">
            <p className="text-[10px] text-muted-foreground">New (pending upload)</p>
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="h-16 max-w-[120px] object-contain rounded border border-border p-1"
              />
              <button
                type="button"
                onClick={clearSelection}
                className="absolute -top-1.5 -right-1.5 rounded-full bg-destructive text-destructive-foreground w-4 h-4 flex items-center justify-center"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs"
        >
          <Upload className="w-3 h-3 mr-1.5" />
          Choose file
        </Button>
        {pendingFile && (
          <Button
            type="button"
            size="sm"
            onClick={handleUpload}
            disabled={isPending}
            className="text-xs"
          >
            {isPending ? 'Uploading…' : 'Upload'}
          </Button>
        )}
      </div>
    </div>
  )
}
