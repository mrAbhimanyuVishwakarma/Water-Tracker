import '@supabase/functions-js/edge-runtime.d.ts';
import { withSupabase } from '@supabase/server';
import { corsHeaders, handleDeleteAccount } from './handler.ts';

const authenticatedHandler = withSupabase({ auth: 'user' }, async (request, context) =>
  handleDeleteAccount(request, {
    authenticatedUser: async () => {
      // Check with Auth as well as the JWT wrapper; deleted users must not retain access.
      const { data, error } = await context.supabase.auth.getUser();
      return error ? null : data.user?.id || null;
    },
    deleteUser: async (userId) => {
      const { error } = await context.supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
  }));

export default {
  fetch: (request: Request) => request.method === 'OPTIONS'
    ? new Response(null, { status: 204, headers: corsHeaders })
    : authenticatedHandler(request),
};
