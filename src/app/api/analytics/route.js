import { NextResponse } from 'next/server';
import { getCurrentUserId } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/analytics - Get analytics data
export async function GET(request) {
  try {
    const _userId = await getCurrentUserId();
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';

    // Generate mock analytics data for development
    const mockData = generateMockAnalytics(timeRange);

    return NextResponse.json(mockData);
  } catch (error) {
    const { logger } = require('../../../lib/logger');
    logger.error('Error fetching analytics', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

function generateMockAnalytics(timeRange) {
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const now = new Date();

  // Generate time series data
  const viewerData = [];
  const engagementData = [];
  const watchTimeData = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    viewerData.push({
      date: date.toISOString().split('T')[0],
      viewers: Math.floor(Math.random() * 100) + 20,
      uniqueViewers: Math.floor(Math.random() * 80) + 15
    });

    engagementData.push({
      date: date.toISOString().split('T')[0],
      likes: Math.floor(Math.random() * 50) + 5,
      comments: Math.floor(Math.random() * 30) + 2,
      shares: Math.floor(Math.random() * 10) + 1
    });

    watchTimeData.push({
      date: date.toISOString().split('T')[0],
      avgWatchTime: Math.floor(Math.random() * 300) + 120, // 2-7 minutes
      totalWatchTime: Math.floor(Math.random() * 5000) + 1000 // Total minutes
    });
  }

  // Calculate totals and growth
  const totalViewers = viewerData.reduce((sum, day) => sum + day.viewers, 0);
  const totalEngagement = engagementData.reduce((sum, day) => sum + day.likes + day.comments + day.shares, 0);
  const totalWatchTime = watchTimeData.reduce((sum, day) => sum + day.totalWatchTime, 0);

  // Calculate growth (compare last period vs previous period)
  const halfPoint = Math.floor(days / 2);
  const recentViewers = viewerData.slice(halfPoint).reduce((sum, day) => sum + day.viewers, 0);
  const previousViewers = viewerData.slice(0, halfPoint).reduce((sum, day) => sum + day.viewers, 0);
  const viewerGrowth = previousViewers > 0 ? ((recentViewers - previousViewers) / previousViewers * 100) : 0;

  return {
    summary: {
      totalViewers,
      totalEngagement,
      totalWatchTime,
      avgViewerDuration: Math.floor(totalWatchTime / totalViewers),
      viewerGrowth: Math.round(viewerGrowth * 10) / 10,
      engagementRate: Math.round((totalEngagement / totalViewers) * 100 * 10) / 10
    },
    timeSeries: {
      viewers: viewerData,
      engagement: engagementData,
      watchTime: watchTimeData
    },
    demographics: {
      devices: [
        { name: 'Desktop', value: 45, color: '#5c4dff' },
        { name: 'Mobile', value: 35, color: '#00cc88' },
        { name: 'Tablet', value: 20, color: '#ffaa00' }
      ],
      countries: [
        { name: 'United States', viewers: 150, percentage: 35 },
        { name: 'United Kingdom', viewers: 80, percentage: 18 },
        { name: 'Germany', viewers: 60, percentage: 14 },
        { name: 'Canada', viewers: 45, percentage: 10 },
        { name: 'Australia', viewers: 35, percentage: 8 },
        { name: 'Others', viewers: 65, percentage: 15 }
      ],
      ageGroups: [
        { range: '18-24', percentage: 25 },
        { range: '25-34', percentage: 35 },
        { range: '35-44', percentage: 20 },
        { range: '45-54', percentage: 12 },
        { range: '55+', percentage: 8 }
      ]
    },
    topStreams: [
      {
        id: 'stream1',
        title: 'Weekly Gaming Session',
        viewers: 245,
        duration: 180,
        engagement: 85
      },
      {
        id: 'stream2',
        title: 'Tech Talk Tuesday',
        viewers: 189,
        duration: 120,
        engagement: 92
      },
      {
        id: 'stream3',
        title: 'Creative Coding Live',
        viewers: 156,
        duration: 240,
        engagement: 78
      }
    ],
    peakHours: [
      { hour: 0, viewers: 12 },
      { hour: 1, viewers: 8 },
      { hour: 2, viewers: 5 },
      { hour: 3, viewers: 3 },
      { hour: 4, viewers: 4 },
      { hour: 5, viewers: 8 },
      { hour: 6, viewers: 15 },
      { hour: 7, viewers: 25 },
      { hour: 8, viewers: 35 },
      { hour: 9, viewers: 45 },
      { hour: 10, viewers: 55 },
      { hour: 11, viewers: 65 },
      { hour: 12, viewers: 75 },
      { hour: 13, viewers: 85 },
      { hour: 14, viewers: 95 },
      { hour: 15, viewers: 105 },
      { hour: 16, viewers: 115 },
      { hour: 17, viewers: 125 },
      { hour: 18, viewers: 135 },
      { hour: 19, viewers: 145 },
      { hour: 20, viewers: 155 },
      { hour: 21, viewers: 145 },
      { hour: 22, viewers: 125 },
      { hour: 23, viewers: 85 }
    ]
  };
}