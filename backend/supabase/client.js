const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const isValidUrl = (url) => {
  if (!url) return false;
  try {
    return url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

let supabaseAdmin;
let supabase;

const mockQuery = {
  select: () => mockQuery,
  insert: () => mockQuery,
  update: () => mockQuery,
  delete: () => mockQuery,
  eq: () => mockQuery,
  single: () => mockQuery,
  order: () => mockQuery,
  then: (resolve) => {
    resolve({ data: [], error: new Error("Supabase is in offline/mock mode") });
  }
};

const mockAuth = {
  admin: {
    createUser: async (userData) => {
      return {
        data: { user: { id: 'mock-user-id', email: userData.email, user_metadata: userData.user_metadata } },
        error: null
      };
    }
  },
  signInWithPassword: async ({ email }) => {
    return {
      data: {
        user: { id: 'demo-user', email, first_name: 'Demo', last_name: 'User', role: 'Procurement Officer' },
        session: { access_token: 'demo-token-' + Date.now() }
      },
      error: null
    };
  },
  getUser: async (token) => {
    return {
      data: { user: { id: 'demo-user', email: 'demo@vendorbridge.com', user_metadata: { first_name: 'Demo', last_name: 'User', role: 'Procurement Officer' } } },
      error: null
    };
  }
};

const mockSupabaseClient = {
  from: () => mockQuery,
  auth: mockAuth
};

if (isValidUrl(supabaseUrl) && supabaseServiceKey && supabaseAnonKey) {
  try {
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase client initialized successfully.");
  } catch (err) {
    console.error("Error creating Supabase client, falling back to mock mode:", err.message);
    supabaseAdmin = mockSupabaseClient;
    supabase = mockSupabaseClient;
  }
} else {
  console.log("Supabase URL or keys not configured. Running in offline/mock database mode.");
  supabaseAdmin = mockSupabaseClient;
  supabase = mockSupabaseClient;
}

module.exports = { supabase, supabaseAdmin };

