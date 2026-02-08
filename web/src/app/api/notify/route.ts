import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Forward to the backend API running on port 3003
        const response = await fetch('http://127.0.0.1:3003/v1/notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error('Proxy Error Details:', {
            message: error.message,
            code: error.code,
            address: error.address,
            port: error.port,
            cause: error.cause
        });
        return NextResponse.json(
            { error: `Connection Failed: ${error.message}` },
            { status: 500 }
        );
    }
}
