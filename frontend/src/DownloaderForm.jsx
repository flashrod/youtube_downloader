import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Youtube, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const DownloaderForm = () => {
  const [tab, setTab] = useState('download'); // 'download' or 'clip'
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('720p');
  const [start, setStart] = useState(''); // for clip
  const [end, setEnd] = useState('');     // for clip
  const [isLoading, setIsLoading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState('idle');
  const [downloadLink, setDownloadLink] = useState(null);
  const { toast } = useToast();

  const handleDownload = async (e) => {
    if (e) e.preventDefault();
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
    setDownloadLink(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url: url,
          format,
          quality,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.error || "Unknown error");
      }
      setDownloadStatus('success');
      setDownloadLink(`${import.meta.env.VITE_API_URL}/api/download-file/${data.filename}`);
      toast({
        title: "Download Ready!",
        description: (
          <a href={`${import.meta.env.VITE_API_URL}/api/download-file/${data.filename}`} target="_blank" rel="noopener noreferrer">
            Click here to download: {data.title || data.filename}
          </a>
        ),
      });
      setTimeout(() => {
        setDownloadStatus('idle');
        setUrl('');
      }, 3000);
    } catch (error) {
      setDownloadStatus('error');
      toast({
        title: "Download Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClip = async (e) => {
    if (e) e.preventDefault();
    if (!url.trim() || !start.trim() || !end.trim()) {
      toast({
        title: "Missing Fields",
        description: "Please enter a YouTube URL, start time, and end time.",
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
    setDownloadLink(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/clip`, {
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url: url,
          start_time: start,
          end_time: end,
          format,
          quality,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.error || "Unknown error");
      }
      setDownloadStatus('success');
      setDownloadLink(`${import.meta.env.VITE_API_URL}/api/download-file/${data.filename}`);
      toast({
        title: "Clip Ready!",
        description: (
          <a href={`${import.meta.env.VITE_API_URL}/api/download-file/${data.filename}`} target="_blank" rel="noopener noreferrer">
            Click here to download your clip
          </a>
        ),
      });
      setTimeout(() => {
        setDownloadStatus('idle');
        setUrl('');
        setStart('');
        setEnd('');
      }, 3000);
    } catch (error) {
      setDownloadStatus('error');
      toast({
        title: "Clip Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glassmorphism border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 group p-4">
      {/* Tab Switcher */}
      <div className="flex space-x-2 mb-4">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-all duration-200 border-b-2 focus:outline-none shadow-sm
            ${tab === 'download'
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
              : 'bg-white/70 dark:bg-gray-800 text-blue-700 dark:text-blue-200 border-transparent hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-900'}
          `}
          onClick={() => setTab('download')}
          type="button"
        >
          Download Full Video
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold transition-all duration-200 border-b-2 focus:outline-none shadow-sm
            ${tab === 'clip'
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
              : 'bg-white/70 dark:bg-gray-800 text-blue-700 dark:text-blue-200 border-transparent hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-900'}
          `}
          onClick={() => setTab('clip')}
          type="button"
        >
          Clip Video
        </button>
      </div>
      <form onSubmit={tab === 'download' ? handleDownload : handleClip} className="space-y-4">
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
              <SelectTrigger className="h-12 rounded-lg border border-blue-200 bg-white/95 dark:bg-[#23263a] dark:border-blue-900 dark:text-white backdrop-blur-md hover:bg-blue-50 dark:hover:bg-[#2d314d] focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200 shadow text-base font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-blue-100 bg-white/100 dark:bg-[#23263a] dark:border-blue-900 dark:text-white shadow-xl mt-1 transition-all duration-200">
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
              <SelectTrigger className="h-12 rounded-lg border border-blue-200 bg-white/95 dark:bg-[#23263a] dark:border-blue-900 dark:text-white backdrop-blur-md hover:bg-blue-50 dark:hover:bg-[#2d314d] focus:ring-2 focus:ring-blue-400 focus:border-blue-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-200 shadow text-base font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-lg border border-blue-100 bg-white/100 dark:bg-[#23263a] dark:border-blue-900 dark:text-white shadow-xl mt-1 transition-all duration-200">
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
        {tab === 'clip' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                Start Time
              </label>
              <Input
                type="text"
                placeholder="e.g. 00:01:23"
                value={start}
                onChange={e => setStart(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                End Time
              </label>
              <Input
                type="text"
                placeholder="e.g. 00:02:34"
                value={end}
                onChange={e => setEnd(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        )}
        <Button
          type="submit"
          disabled={isLoading || !url.trim() || (tab === 'clip' && (!start.trim() || !end.trim()))}
          className={`w-full h-16 text-lg font-bold ${downloadStatus === 'processing' ? 'bg-blue-500' : downloadStatus === 'success' ? 'bg-green-500' : downloadStatus === 'error' ? 'bg-red-500' : 'download-gradient'} hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
        >
          <div className="flex items-center space-x-3">
            {downloadStatus === 'processing' ? <Loader2 className="w-5 h-5 animate-spin" /> : downloadStatus === 'success' ? <CheckCircle className="w-5 h-5" /> : downloadStatus === 'error' ? <AlertCircle className="w-5 h-5" /> : <Download className="w-5 h-5" />}
            <span>{downloadStatus === 'processing' ? (tab === 'clip' ? 'Clipping...' : 'Processing...') : downloadStatus === 'success' ? (tab === 'clip' ? 'Clipped!' : 'Downloaded!') : downloadStatus === 'error' ? 'Try Again' : (tab === 'clip' ? 'Clip Video' : 'Download Now')}</span>
          </div>
        </Button>
        {downloadLink && (
          <div className="text-center space-y-2 animate-slide-in-up">
            <a href={downloadLink} target="_blank" rel="noopener noreferrer" className="text-green-600 underline font-semibold">
              Click here to download your file
            </a>
          </div>
        )}
      </form>
    </div>
  );
};
