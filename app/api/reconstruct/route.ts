import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        console.log('Received in API:', body)
        const response = await fetch('https://gws.gplates.org/reconstruct/reconstruct_feature_collection/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('GPlates error:', errorText)
            throw new Error('Failed to fetch from GPlates')
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        console.error('Error in reconstruct API route:', error)
        return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
    }
}