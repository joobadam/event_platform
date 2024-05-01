import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Kérlek add hozzá a WEBHOOK_SECRET-t a Clerk Dashboard-ról a .env vagy .env.local fájlhoz');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Hiba történt -- nincsenek svix fejlécek', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Hiba a webhook hitelesítésekor:', err);
    return new Response('Hiba történt', { status: 400 });
  }

  const { type, data } = evt;

  switch (type) {
    case 'user.created':
      const newUser = await createUser({
        clerkId: data.id,
        email: data.email_addresses[0]?.email_address || 'default_email@example.com',
        username: data.username || 'default_username',
        firstName: data.first_name || 'FirstName',
        lastName: data.last_name || 'LastName',
        photo: data.image_url || 'default_image_url', // Cseréld le, ha szükséges
      });
      return NextResponse.json({ message: 'OK', user: newUser });

    case 'user.updated':
      const updatedUser = await updateUser(data.id, {
        firstName: data.first_name || 'FirstName',
        lastName: data.last_name || 'LastName',
        username: data.username || 'default_username',
        photo: data.image_url || 'default_image_url', // Cseréld le, ha szükséges
      });
      return NextResponse.json({ message: 'OK', user: updatedUser });

    case 'user.deleted':
      if (data.id) {
        const deletedUser = await deleteUser(data.id);
      } else {
        console.error('Hiba: Az id értéke undefined.');
      }

    default:
      return new Response('', { status: 200 });
  }
}





