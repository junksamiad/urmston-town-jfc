// Most minimal possible function to test
export default async function handler(req, res) {
  console.log('Minimal handler called');
  
  try {
    const result = {
      success: true,
      message: 'Minimal handler working',
      method: req.method,
      timestamp: new Date().toISOString()
    };
    
    console.log('Returning result:', result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in minimal handler:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}