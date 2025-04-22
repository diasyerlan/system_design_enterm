
const getMessage = (req, res) => {
  res.json({
    message: 'API is working correctly!',
    timestamp: new Date().toISOString()
  });
};


const getResourceIntensive = (req, res) => {
  // Simulate processing delay
  const startTime = Date.now();
  
  let result = 0;
  for (let i = 0; i < 10000000; i++) {
    result += Math.random();
  }
  
  const processingTime = Date.now() - startTime;
  
  res.json({
    message: 'Resource intensive operation completed',
    processingTime: `${processingTime}ms`,
    timestamp: new Date().toISOString()
  });
};


const getUserData = (req, res) => {
  const apiKey = req.headers['x-api-key'];
  
  let data = {
    id: 1,
    name: 'Test User',
    email: 'user@example.com'
  };
  
  if (apiKey === 'test-key-premium' || apiKey === 'test-key-enterprise') {
    data.details = {
      subscription: apiKey === 'test-key-enterprise' ? 'Enterprise' : 'Premium',
      accessLevel: apiKey === 'test-key-enterprise' ? 'Full' : 'Standard',
      features: apiKey === 'test-key-enterprise' ? ['basic', 'premium', 'advanced'] : ['basic', 'premium']
    };
  }
  
  res.json({
    data,
    timestamp: new Date().toISOString()
  });
};


const healthCheck = (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
};

module.exports = {
  getMessage,
  getResourceIntensive,
  getUserData,
  healthCheck
}; 