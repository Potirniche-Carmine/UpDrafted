import { NextRequest } from 'next/server';

export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    message: 'Webhook endpoint is accessible',
    timestamp: new Date().toISOString()
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    console.log('Test webhook received:', body);
    
    return new Response(JSON.stringify({ 
      received: true, 
      bodyLength: body.length,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Test webhook error:', error);
    return new Response(JSON.stringify({ error: 'Test webhook failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 