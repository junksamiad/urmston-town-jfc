export default async function handler(req, res) {
  console.log('Test endpoint called');
  
  try {
    return res.status(200).json({
      success: true,
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
      env: {
        hasWidgetUrl: !!process.env.WIDGET_URL,
        hasApiUrl: !!process.env.API_URL,
        hasApiToken: !!process.env.API_TOKEN,
      }
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}