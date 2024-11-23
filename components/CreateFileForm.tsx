import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PlusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateFileFormProps {
  onCreateFile: (fileName: string) => Promise<void>
  currentDirectory: string
}

export function CreateFileForm({ onCreateFile, currentDirectory }: CreateFileFormProps) {
  const [newFileName, setNewFileName] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewFileName(e.target.value)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (newFileName) {
      const fullPath = currentDirectory ? `${currentDirectory}/${newFileName}` : newFileName
      onCreateFile(fullPath)
      setNewFileName('')
    }
  }

  const prefixWidth = currentDirectory ? `${currentDirectory}/`.length * 0.75 + 'em' : '0px'

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex relative">
        {currentDirectory && (
          <span className="inline-flex items-center absolute left-0 top-0 bottom-0 text-sm text-muted-foreground bg-muted border border-r-0 border-input rounded-l-md truncate pr-4 pl-3">
            {currentDirectory}/
          </span>
        )}
        <Input
          type="text"
          placeholder={currentDirectory ? "New file or folder" : "File/folder name"}
          value={newFileName}
          onChange={handleInputChange}
          className={cn(
            "pr-10",
            currentDirectory && "pl-[var(--prefix-width)]"
          )}
          style={{ '--prefix-width': `calc(${prefixWidth} + 1.75rem)` } as React.CSSProperties}
        />
        <Button 
          type="submit" 
          size="icon"
          className="absolute right-0 top-0 bottom-0 rounded-l-none"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  )
}

