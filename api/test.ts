export default function handler(req, res) {
  res.status(200).json({ 
    success: true, 
    message: 'API 正常工作！',
    time: new Date().toISOString()
  });
}