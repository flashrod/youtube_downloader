import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Youtube, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const DownloaderForm = () => {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('720p');
  const [isLoading, setIsLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('idle');
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!url.trim()) {
      toast({
        title: "Please enter a URL",
        description: "You need to paste a YouTube URL to download.",
        variant: "destructive",
      });
      return;
    }

    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setDownloadStatus('processing');

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setDownloadStatus('success');
      toast({
        title: "Download Started!",
        description: "Your video is being downloaded. Check your downloads folder.",
      });
      
      setTimeout(() => {
        setDownloadStatus('idle');
        setUrl('');
      }, 3000);
      
    } catch (error) {
      setDownloadStatus('error');
      toast({
        title: "Download Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (downloadStatus) {
      case 'processing': return 'bg-blue-500';
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'download-gradient';
    }
  };

  const getStatusIcon = () => {
    switch (downloadStatus) {
      case 'processing': return <Loader2 className="w-5 h-5 animate-spin" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      case 'error': return <AlertCircle className="w-5 h-5" />;
      default: return <Download className="w-5 h-5" />;
    }
  };

  const getStatusText = () => {
    switch (downloadStatus) {
      case 'processing': return 'Processing...';
      case 'success': return 'Downloaded!';
      case 'error': return 'Try Again';
      default: return 'Download Now';
    }
  };

  return (
    <Card className="glassmorphism border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group">
      <CardContent className="p-8 space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
            YouTube URL
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500">
              <Youtube className="w-5 h-5" />
            </div>
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="pl-12 h-14 text-lg border-2 border-white/10 bg-white/5 backdrop-blur-sm focus:border-red-400 focus:bg-white/10 transition-all duration-300"
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
              Format
            </label>
            <Select value={format} onValueChange={setFormat} disabled={isLoading}>
              <SelectTrigger className="h-12 border-2 border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mp4">
                  <div className="flex items-center space-x-2">
                    <span>MP4</span>
                    <Badge variant="secondary" className="text-xs">Video</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="mp3">
                  <div className="flex items-center space-x-2">
                    <span>MP3</span>
                    <Badge variant="secondary" className="text-xs">Audio</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="webm">
                  <div className="flex items-center space-x-2">
                    <span>WebM</span>
                    <Badge variant="secondary" className="text-xs">Video</Badge>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
              Quality
            </label>
            <Select value={quality} onValueChange={setQuality} disabled={isLoading}>
              <SelectTrigger className="h-12 border-2 border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1080p">
                  <div className="flex items-center space-x-2">
                    <span>1080p</span>
                    <Badge variant="default" className="text-xs bg-green-500">HD</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="720p">
                  <div className="flex items-center space-x-2">
                    <span>720p</span>
                    <Badge variant="secondary" className="text-xs">Standard</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="480p">480p</SelectItem>
                <SelectItem value="360p">360p</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleDownload}
          disabled={isLoading || !url.trim()}
          className={`w-full h-16 text-lg font-bold ${getStatusColor()} hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </div>
        </Button>

        {url && (
          <div className="text-center space-y-2 animate-slide-in-up">
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <span>Format: <strong className="text-foreground">{format.toUpperCase()}</strong></span>
              <span>•</span>
              <span>Quality: <strong className="text-foreground">{quality}</strong></span>
            </div>
            {downloadStatus === 'idle' && (
              <p className="text-xs text-muted-foreground">
                Ready to download • No limits • Lightning fast
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
