import { Message, StreamingTextResponse } from 'ai';

export const maxDuration = 300;

export async function POST(req: Request) {
  const json = await req.json();
  const {
    context,
    messages,
  }: {
    context: string;
    messages: Message[];
  } = json;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${process.env.PALM_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          text: `
You are an advanced JSON text editor. Take the given JSON input, transform it as the prompt suggests, and return another JSON with the same type.

${messages.map((x) => x.content).join('\n')}

Other rows for context:
${convertToCSV(context)}

Updated JSON Data: 
`,
        },
        temperature: 0.7,
        top_k: 40,
        top_p: 0.95,
        candidate_count: 1,
        max_output_tokens: 1024,
        stop_sequences: [],
        safety_settings: [
          { category: 'HARM_CATEGORY_DEROGATORY', threshold: 1 },
          { category: 'HARM_CATEGORY_TOXICITY', threshold: 1 },
          { category: 'HARM_CATEGORY_VIOLENCE', threshold: 2 },
          { category: 'HARM_CATEGORY_SEXUAL', threshold: 2 },
          { category: 'HARM_CATEGORY_MEDICAL', threshold: 2 },
          { category: 'HARM_CATEGORY_DANGEROUS', threshold: 2 },
        ],
      }),
    },
  );

  const data = (await res.json()) as {
    candidates: {
      output: string;
    }[];
  };

  if (data.candidates.length === 0) throw new Error();

  const dataStream = createDelayedReadableStream(data.candidates[0].output, 10);

  return new StreamingTextResponse(dataStream);
}

export function createDelayedReadableStream(
  inputString: string,
  delayMs: number,
) {
  let index = 0;

  const stream = new ReadableStream({
    start(controller) {
      function pushData() {
        if (index < inputString.length) {
          controller.enqueue(inputString[index]);
          index++;
          setTimeout(pushData, delayMs);
        } else {
          controller.close();
        }
      }

      pushData();
    },
  });

  return stream;
}

function convertToCSV(jsonData: any) {
  var csv = [];
  var keys = Object.keys(jsonData[0]);

  csv.push(keys.join(','));

  for (var i = 0; i < Math.min(jsonData.length, 5); i++) {
    var row = [];
    for (var key of keys) {
      row.push(jsonData[i][key]);
    }
    csv.push(row.join(','));
  }

  return csv.join('\n');
}
