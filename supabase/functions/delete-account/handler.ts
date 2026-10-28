interface Dependencies {
  authenticatedUser: () => Promise<string | null>;
  deleteUser: (userId: string) => Promise<void>;
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export async function handleDeleteAccount(request: Request, dependencies: Dependencies): Promise<Response> {
  const respond = (body: object, status: number) => Response.json(body, { status, headers: corsHeaders });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== 'POST') return respond({ error: 'Method not allowed' }, 405);
  try {
    const userId = await dependencies.authenticatedUser();
    if (!userId) return respond({ error: 'Authentication required' }, 401);
    let body;
    try { body = await request.json(); }
    catch { return respond({ error: 'Invalid request' }, 400); }
    if (!body || body.confirmation !== 'DELETE') return respond({ error: 'Deletion confirmation required' }, 400);
    if (body.expectedUserId !== userId) return respond({ error: 'Account changed. Sign in again before deleting.' }, 409);
    // The caller cannot supply the target id. FK cascades remove this user's hydration data.
    await dependencies.deleteUser(userId);
    return respond({ deleted: true }, 200);
  } catch { return respond({ error: 'Account deletion failed. Please try again.' }, 500); }
}
