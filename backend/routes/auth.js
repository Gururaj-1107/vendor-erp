const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../supabase/client');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, role, phone, country, additional_info } = req.body;
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name, role },
    });

    if (authError) throw authError;

    // Create profile record
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name, last_name, role: role || 'Procurement Officer',
        phone, country, additional_info,
      });

    if (profileError) throw profileError;

    // Sign in to get token
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (signInError) throw signInError;

    res.status(201).json({
      user: { ...signInData.user, first_name, last_name, role },
      token: signInData.session.access_token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Demo user shortcut
    if (email === 'demo@vendorbridge.com' && password === 'demo123') {
      return res.json({
        user: {
          id: 'demo-user', email: 'demo@vendorbridge.com',
          first_name: 'Demo', last_name: 'User', role: 'Procurement Officer',
        },
        token: 'demo-token-' + Date.now(),
      });
    }

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Get profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    res.json({
      user: { ...data.user, ...profile },
      token: data.session.access_token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(401).json({ error: 'Invalid email or password' });
  }
});

const jwt = require('jsonwebtoken');

// POST /api/auth/firebase-sync
router.post('/firebase-sync', async (req, res) => {
  try {
    const { email, uid, first_name, last_name, role, phone, country, additional_info } = req.body;
    if (!email || !uid) {
      return res.status(400).json({ error: 'Email and UID are required' });
    }

    // Check if profile exists in Supabase Profiles table
    let profileData = null;
    try {
      const { data, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      
      if (!error && data) {
        profileData = data;
      }
    } catch (err) {
      // Profile doesn't exist yet, we will create it
    }

    if (!profileData) {
      // Create new profile record
      const newProfile = {
        id: uid,
        first_name: first_name || email.split('@')[0],
        last_name: last_name || '',
        role: role || 'Procurement Officer',
        phone: phone || '',
        country: country || 'India',
        additional_info: additional_info || 'Created via Firebase Auth',
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .insert(newProfile)
        .select()
        .single();

      if (error) {
        console.warn('Failed to insert profile in Supabase, using mock fallback profile:', error.message);
        profileData = newProfile;
      } else {
        profileData = data;
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: uid, 
        email, 
        first_name: profileData.first_name, 
        last_name: profileData.last_name, 
        role: profileData.role 
      },
      process.env.JWT_SECRET || 'vendorbridge_secret_key_2026',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: uid,
        email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        role: profileData.role,
        phone: profileData.phone,
        country: profileData.country,
        additional_info: profileData.additional_info
      },
      token
    });
  } catch (err) {
    console.error('Firebase sync error:', err);
    res.status(500).json({ error: err.message || 'Firebase sync failed' });
  }
});

// GET /api/auth/profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token || token.startsWith('demo-token-')) {
      return res.json({ id: 'demo-user', email: 'demo@vendorbridge.com', first_name: 'Demo', last_name: 'User', role: 'Procurement Officer' });
    }

    // 1. Try decoding as custom JWT
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vendorbridge_secret_key_2026');
      if (decoded) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('id', decoded.id)
          .single();
        return res.json({ ...decoded, ...profile });
      }
    } catch (jwtErr) {
      // Verification failed or is expired, fall through to Supabase token verification
    }

    // 2. Fall back to Supabase token verification
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error) throw error;

    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single();
    res.json({ ...user, ...profile });
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => res.json({ success: true }));

module.exports = router;
