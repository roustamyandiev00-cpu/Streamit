'use client';

import { useState, useEffect } from 'react';
import { Copy, Eye, EyeOff, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from './ui/dialog';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';

const PROTOCOLS = [
    { id: 'RTMP', name: 'RTMP', description: 'Standard RTMP protocol' },
    { id: 'RTMPS', name: 'RTMPS', description: 'Secure RTMP over TLS' },
    { id: 'SRT', name: 'SRT', description: 'Secure Reliable Transport' },
    { id: 'WHIP', name: 'WHIP', description: 'WebRTC-HTTP Ingestion Protocol', beta: true },
];

const SERVER_OPTIONS = [
    { value: 'autodetect', label: 'Autodetect' },
    { value: 'custom', label: 'Custom Server' },
];

interface PlatformData {
    id?: string;
    platform?: string;
    rtmpUrl?: string;
    streamKey?: string;
    protocol?: string;
    server?: string;
}

interface StreamSettingsModalProps {
    open: boolean;
    onClose: () => void;
    platform: PlatformData | null;
    onSave: (data: any) => Promise<void>;
}

export default function StreamSettingsModal({
    open,
    onClose,
    platform = null,
    onSave
}: StreamSettingsModalProps) {
    const [activeTab, setActiveTab] = useState('Stream');
    const [selectedProtocol, setSelectedProtocol] = useState('RTMP');
    const [serverOption, setServerOption] = useState('autodetect');
    const [customServer, setCustomServer] = useState('');
    const [streamUrl, setStreamUrl] = useState('');
    const [streamKey, setStreamKey] = useState('');
    const [showStreamKey, setShowStreamKey] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [loading, setLoading] = useState(false);

    // Load platform data when modal opens
    useEffect(() => {
        if (open && platform) {
            setStreamUrl(platform.rtmpUrl || '');
            setStreamKey(platform.streamKey || '');
            setSelectedProtocol(platform.protocol || 'RTMP');
            setServerOption(platform.server || 'autodetect');

            // Auto-detect protocol from URL
            if (platform.rtmpUrl) {
                if (platform.rtmpUrl.startsWith('rtmps://')) {
                    setSelectedProtocol('RTMPS');
                } else if (platform.rtmpUrl.startsWith('srt://')) {
                    setSelectedProtocol('SRT');
                } else if (platform.rtmpUrl.startsWith('https://') && platform.rtmpUrl.includes('whip')) {
                    setSelectedProtocol('WHIP');
                }
            }
        }
    }, [open, platform]);

    // Generate URL based on protocol
    useEffect(() => {
        if (serverOption === 'autodetect' && platform) {
            // Use platform default URL
            const defaultUrls: Record<string, string> = {
                RTMP: 'rtmp://localhost:1935/live',
                RTMPS: 'rtmps://localhost:1935/live',
                SRT: 'srt://localhost:9000',
                WHIP: 'https://localhost:8080/whip',
            };
            setStreamUrl(defaultUrls[selectedProtocol] || defaultUrls.RTMP);
        }
    }, [selectedProtocol, serverOption, platform]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add toast notification here
    };

    const handleReset = () => {
        if (platform) {
            // Generate new stream key
            const newKey = `live_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
            setStreamKey(newKey);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const data = {
                platform: platform?.platform || platform?.id,
                streamKey,
                rtmpUrl: streamUrl,
                protocol: selectedProtocol,
                server: serverOption === 'custom' ? customServer : serverOption,
            };

            if (onSave) {
                await onSave(data);
            } else {
                // Default save to API
                const response = await fetch('/api/platforms', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                });

                if (!response.ok) {
                    throw new Error('Failed to save settings');
                }
            }

            onClose();
        } catch (error) {
            console.error('Failed to save settings:', error);
            // Could add error toast here
        } finally {
            setLoading(false);
        }
    };

    const menuItems = [
        { id: 'Stream', label: 'Stream' },
        { id: 'Backup stream', label: 'Backup stream' },
        { id: 'Pull links', label: 'Pull links' },
        { id: 'Embed web player', label: 'Embed web player' },
        { id: 'Embed chat', label: 'Embed chat' },
    ];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
                <DialogHeader className="px-6 pt-6 pb-4 border-b">
                    <DialogTitle className="text-xl font-semibold">Settings</DialogTitle>
                </DialogHeader>

                <div className="flex h-[calc(90vh-80px)]">
                    {/* Left Navigation */}
                    <div className="w-64 border-r bg-gray-50 dark:bg-gray-900">
                        <nav className="p-4 space-y-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${activeTab === item.id
                                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    <span>{item.label}</span>
                                    <ChevronRight size={16} />
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'Stream' && (
                            <div className="space-y-6">
                                {/* Protocol Tabs */}
                                <div className="flex gap-2 border-b">
                                    {PROTOCOLS.map((protocol) => (
                                        <button
                                            key={protocol.id}
                                            onClick={() => setSelectedProtocol(protocol.id)}
                                            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${selectedProtocol === protocol.id
                                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                                                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                                }`}
                                        >
                                            {protocol.name}
                                            {protocol.beta && (
                                                <span className="ml-2 px-1.5 py-0.5 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded">
                                                    BETA
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Server Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="server">Server</Label>
                                    <select
                                        id="server"
                                        value={serverOption}
                                        onChange={(e) => setServerOption(e.target.value)}
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        {SERVER_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Custom Server Input (if custom selected) */}
                                {serverOption === 'custom' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="customServer">Custom Server URL</Label>
                                        <Input
                                            id="customServer"
                                            value={customServer}
                                            onChange={(e) => {
                                                setCustomServer(e.target.value);
                                                setStreamUrl(e.target.value);
                                            }}
                                            placeholder="Enter custom server URL"
                                        />
                                    </div>
                                )}

                                {/* Stream URL */}
                                <div className="space-y-2">
                                    <Label htmlFor="streamUrl">URL</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="streamUrl"
                                            value={streamUrl}
                                            onChange={(e) => setStreamUrl(e.target.value)}
                                            placeholder={`${selectedProtocol}://server/live`}
                                            className="flex-1"
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleCopy(streamUrl)}
                                            title="Copy URL"
                                        >
                                            <Copy size={16} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Stream Key */}
                                <div className="space-y-2">
                                    <Label htmlFor="streamKey">Stream key</Label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 relative">
                                            <Input
                                                id="streamKey"
                                                type={showStreamKey ? 'text' : 'password'}
                                                value={streamKey}
                                                onChange={(e) => setStreamKey(e.target.value)}
                                                placeholder="Enter stream key"
                                                className="pr-20"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowStreamKey(!showStreamKey)}
                                                    className="h-8 w-8 p-0"
                                                    title={showStreamKey ? 'Hide' : 'Show'}
                                                >
                                                    {showStreamKey ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </Button>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={handleReset}
                                            className="whitespace-nowrap"
                                        >
                                            Reset
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => handleCopy(streamKey)}
                                            title="Copy stream key"
                                        >
                                            <Copy size={16} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Advanced Settings */}
                                <div>
                                    <button
                                        onClick={() => setShowAdvanced(!showAdvanced)}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        {showAdvanced ? 'Hide' : 'Show'} advanced settings
                                    </button>

                                    {showAdvanced && (
                                        <div className="mt-4 p-4 border rounded-lg space-y-4 bg-gray-50 dark:bg-gray-900">
                                            <div className="space-y-2">
                                                <Label htmlFor="bitrate">Bitrate (kbps)</Label>
                                                <Input
                                                    id="bitrate"
                                                    type="number"
                                                    defaultValue="2500"
                                                    placeholder="2500"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="resolution">Resolution</Label>
                                                <select
                                                    id="resolution"
                                                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    defaultValue="1920x1080"
                                                >
                                                    <option value="1920x1080">1920x1080 (1080p)</option>
                                                    <option value="1280x720">1280x720 (720p)</option>
                                                    <option value="854x480">854x480 (480p)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="fps">FPS</Label>
                                                <Input
                                                    id="fps"
                                                    type="number"
                                                    defaultValue="30"
                                                    placeholder="30"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Save Button */}
                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Button variant="outline" onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={loading}>
                                        {loading ? 'Saving...' : 'Save'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Other tabs placeholder */}
                        {activeTab !== 'Stream' && (
                            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                <SettingsIcon size={48} className="mx-auto mb-4 opacity-50" />
                                <p>{activeTab} settings coming soon</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
