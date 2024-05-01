import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';

// Importáljuk a createClerkClient függvényt a Clerk SDK-ból
import { createClerkClient } from '@clerk/clerk-sdk-node';

export async function POST(req: Request) {
  
  // Webhook titkos kulcsának beállítása
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Fejlécek lekérése
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // Ha nincsenek fejlécek, adjunk vissza hibát
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    })
  }

  // Test lekérése
  const body = await req.text();
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Az adatok ellenőrzése a fejlécekkel
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400
    })
  }

  // Az esemény típusa és az azonosító lekérése
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', body);

  // Clerk kliens inicializálása a createClerkClient függvénnyel
  const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

  // Ide írhatod a további feldolgozási logikát

  return new Response('', { status: 200 });
}



