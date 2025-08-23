import { useState, useEffect } from 'react';
import { Loader2, ExternalLink, RefreshCw, Terminal } from 'lucide-react';

interface SandboxPreviewProps {
  sandboxId: string;
  port: number;
  type: 'vite' | 'nextjs' | 'console';
  output?: string;
  isLoading?: boolean;
}

export default function SandboxPreview({ 
  sandboxId, 
  port, 
  type, 
  output,
  isLoading = false 
}: SandboxPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [showConsole, setShowConsole] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    if (sandboxId && type !== 'console') {
      // In production, this would be the actual E2B sandbox URL
      // Format: https://{sandboxId}-{port}.e2b.dev
      setPreviewUrl(`https://${sandboxId}-${port}.e2b.dev`);
    }
  }, [sandboxId, port, type]);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
  };

  if (type === 'console') {
    return (
      <div className="bg-card rounded-lg p-4 border border-text">
        <div className="font-mono text-sm whitespace-pre-wrap text-text">
            {output || 'Вывода пока нет...'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Preview Controls */}
      <div className="flex items-center justify-between bg-card rounded-lg p-3 border border-text">
        <div className="flex items-center gap-3">
            <span className="text-sm text-text">
              {type === 'vite' ? '⚡ Vite' : '▲ Next.js'} Предпросмотр
            </span>
          <code className="text-xs bg-background px-2 py-1 rounded text-accent">
            {previewUrl}
          </code>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="p-2 hover:bg-background rounded transition-colors"
              title="Переключить консоль"
          >
            <Terminal className="w-4 h-4" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-background rounded transition-colors"
              title="Обновить предпросмотр"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-background rounded transition-colors"
              title="Открыть в новой вкладке"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* Main Preview */}
      <div className="relative bg-background rounded-lg overflow-hidden border border-text">
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-text">
                  {type === 'vite' ? 'Запуск dev-сервера Vite...' : 'Запуск dev-сервера Next.js...'}
                </p>
            </div>
          </div>
        )}
        
        <iframe
          key={iframeKey}
          src={previewUrl}
          className="w-full h-[600px] bg-background"
            title={`предпросмотр ${type}`}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>

      {/* Console Output (Toggle) */}
      {showConsole && output && (
        <div className="bg-card rounded-lg p-4 border border-text">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text">Вывод консоли</span>
          </div>
          <div className="font-mono text-xs whitespace-pre-wrap text-text max-h-48 overflow-y-auto">
            {output}
          </div>
        </div>
      )}
    </div>
  );
}