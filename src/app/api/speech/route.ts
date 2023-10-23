import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 300;

function escape(s: string): string {
  const lookup: Map<string, string> = new Map([
    ['&', '&amp;'],
    ['"', '&quot;'],
    ["'", '&apos;'],
    ['<', '&lt;'],
    ['>', '&gt;'],
  ]);
  return s.replace(/[&"'<>]/g, (c) => lookup.get(c) ?? c);
}

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  const data = {
    input: {
      text: message,
    },
    voice: {
      languageCode: 'en-gb',
      name: 'en-GB-Standard-A',
      ssmlGender: 'FEMALE'
    },
    audioConfig: {
      audioEncoding: 'MP3'
    }
  };
  
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json; charset=utf-8'
  };
  
  const url = 'https://texttospeech.googleapis.com/v1/text:synthesize';
  
  axios.post(url, data, { headers })
    .then((response) => {
      console.log('Response:', response.data);
      // Do something with the response, e.g., save the audio data
    })
    .catch((error) => {
      console.error('Error:', error);
    });

  return NextResponse.json(
    { url: Buffer.from(audioData).toString('base64') },
    { status: 200 },
  );
}
