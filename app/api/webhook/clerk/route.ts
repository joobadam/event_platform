/* import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions'
import { clerkClient } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
 
export async function POST(req: Request) {
 
  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
 
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }
 
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");
 
  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }
 
  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);
 
  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);
 
  let evt: WebhookEvent
 
  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }
 
  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;
 
  if(eventType === 'user.created') {
    const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      username: username!,
      firstName: first_name,
      lastName: last_name,
      photo: image_url,
    }

    const newUser = await createUser(user);

    if(newUser) {
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser._id
        }
      })
    }

    return NextResponse.json({ message: 'OK', user: newUser })
  }

  if (eventType === 'user.updated') {
    const {id, image_url, first_name, last_name, username } = evt.data

    const user = {
      firstName: first_name,
      lastName: last_name,
      username: username!,
      photo: image_url,
    }

    const updatedUser = await updateUser(id, user)

    return NextResponse.json({ message: 'OK', user: updatedUser })
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data

    const deletedUser = await deleteUser(id!)

    return NextResponse.json({ message: 'OK', user: deletedUser })
  }
 
  return new Response('', { status: 200 })
}
 */

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

  
/* 
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createUser, deleteUser, updateUser } from '@/lib/actions/user.actions';
import { clerkClient } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {

  // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    if (err instanceof Error) {
        console.error('Error verifying webhook:', err);
        return new Response(err.message, {
            status: 400
        });
    } else {
        return new Response('Unknown error during verification', {
            status: 400
        });
    }
  }

  // Handle events based on type
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, image_url, first_name, last_name, username } = evt.data;

    const user = {
        clerkId: id,
        email: email_addresses[0].email_address,
        username: username!,
        firstName: first_name,
        lastName: last_name,
        photo: image_url,
    };

    let newUser;
    try {
        newUser = await createUser(user);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error creating new user:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            console.error('Error creating new user:', error);
            return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
        }
    }

    if (newUser) {
        try {
            await clerkClient.users.updateUserMetadata(id, {
                publicMetadata: {
                    userId: newUser._id
                }
            });
        } catch (error) {
            if (error instanceof Error) {
                console.error('Failed to update user metadata:', error);
                return NextResponse.json({ error: error.message }, { status: 500 });
            } else {
                console.error('Failed to update user metadata:', error);
                return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
            }
        }
    }

    return NextResponse.json({ message: 'OK', user: newUser });
  }

  // Handle user updated
  if (eventType === 'user.updated') {
    const { id, image_url, first_name, last_name, username } = evt.data;

    const user = {
        firstName: first_name,
        lastName: last_name,
        username: username!,
        photo: image_url,
    };

    let updatedUser;
    try {
        updatedUser = await updateUser(id, user);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error updating user:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            console.error('Error updating user:', error);
            return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'OK', user: updatedUser });
  }

  // Handle user deleted
  if (eventType === 'user.deleted') {
    const { id } = evt.data;

    if (typeof id === 'undefined') {
        console.error('Error: User ID is undefined.');
        return NextResponse.json({ error: 'User ID is undefined' }, { status: 400 });
    }

    let deletedUser;
    try {
        deletedUser = await deleteUser(id);
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error deleting user:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        } else {
            console.error('Error deleting user:', error);
            return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'OK', user: deletedUser });
  }

  // If no event type matches, return a successful empty response
  return new Response('', { status: 200 });
}

 */


